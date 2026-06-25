import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=").trim().replace(/^['\"]|['\"]$/g, "");
    process.env[key.trim()] ??= value;
  }
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function addCheck(checks, name, ok, details = {}) {
  checks.push({ name, ok, ...details });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { response, body };
}

async function signIn({ supabaseUrl, anonKey, email, password }) {
  const url = new URL("/auth/v1/token", supabaseUrl);
  url.searchParams.set("grant_type", "password");

  const { response, body } = await fetchJson(url, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok || !body?.access_token) {
    throw new Error(`sign in failed with status ${response.status}`);
  }

  return body.access_token;
}

async function selectProperty({ supabaseUrl, anonKey, bearer, propertyId }) {
  const url = new URL("/rest/v1/properties", supabaseUrl);
  url.searchParams.set("id", `eq.${propertyId}`);
  url.searchParams.set("select", "id,building_name,owner_id,contract_url,source_is_outdated");

  const { response, body } = await fetchJson(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${bearer}`,
    },
  });

  return { status: response.status, rows: Array.isArray(body) ? body.length : undefined, bodyIsArray: Array.isArray(body) };
}

loadDotEnv(resolve(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const propertyId = argValue("--property-id") ?? process.env.SECURITY_AUDIT_PROPERTY_ID;
const contractPath = argValue("--contract-path") ?? process.env.SECURITY_AUDIT_CONTRACT_PATH;
const ownerEmail = process.env.SECURITY_AUDIT_OWNER_EMAIL;
const ownerPassword = process.env.SECURITY_AUDIT_OWNER_PASSWORD;
const otherEmail = process.env.SECURITY_AUDIT_OTHER_EMAIL;
const otherPassword = process.env.SECURITY_AUDIT_OTHER_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Security audit: .env.local sem NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const checks = [];
const schemaSql = readText(resolve(process.cwd(), "supabase/schema.sql"));
const storageSql = readText(resolve(process.cwd(), "supabase/storage.sql"));

addCheck(checks, "properties RLS enabled in schema.sql", /alter table public\.properties enable row level security/i.test(schemaSql));
addCheck(checks, "properties select restricted to owner_id = auth.uid()", /properties_owner_select[\s\S]*owner_id\s*=\s*\(?select auth\.uid\(\)\)?/i.test(schemaSql));
addCheck(checks, "properties insert restricted to owner_id = auth.uid()", /properties_owner_insert[\s\S]*with check \(owner_id\s*=\s*\(?select auth\.uid\(\)\)?\)/i.test(schemaSql));
addCheck(checks, "properties update restricted by using and with_check owner_id", /properties_owner_update[\s\S]*using \(owner_id\s*=\s*\(?select auth\.uid\(\)\)?\)[\s\S]*with check \(owner_id\s*=\s*\(?select auth\.uid\(\)\)?\)/i.test(schemaSql));
addCheck(checks, "property-contracts bucket declared private", /'property-contracts'[\s\S]*false[\s\S]*10485760/i.test(storageSql));
addCheck(checks, "storage read policy tied to parent property owner", /property contracts are readable by owners[\s\S]*properties\.owner_id\s*=\s*auth\.uid\(\)/i.test(storageSql));
addCheck(checks, "storage write policies tied to parent property owner", /property contract owners can upload[\s\S]*properties\.owner_id\s*=\s*auth\.uid\(\)/i.test(storageSql) && /property contract owners can update[\s\S]*properties\.owner_id\s*=\s*auth\.uid\(\)/i.test(storageSql));

if (propertyId) {
  const anonResult = await selectProperty({
    supabaseUrl,
    anonKey: supabaseAnonKey,
    bearer: supabaseAnonKey,
    propertyId,
  });
  addCheck(checks, "anon cannot read tested private property", anonResult.status === 200 && anonResult.rows === 0, anonResult);
} else {
  addCheck(checks, "anon private property probe skipped", true, { skipped: true, reason: "pass --property-id or SECURITY_AUDIT_PROPERTY_ID" });
}

if (contractPath) {
  const publicUrl = new URL(`/storage/v1/object/public/${contractPath.replace(/^\/+/, "")}`, supabaseUrl);
  const response = await fetch(publicUrl);
  const bytes = (await response.arrayBuffer()).byteLength;
  addCheck(checks, "direct public Storage URL does not expose contract", response.status >= 400, { status: response.status, bytes });
} else {
  addCheck(checks, "direct public Storage probe skipped", true, { skipped: true, reason: "pass --contract-path or SECURITY_AUDIT_CONTRACT_PATH" });
}

if (propertyId && ownerEmail && ownerPassword && otherEmail && otherPassword) {
  const ownerToken = await signIn({ supabaseUrl, anonKey: supabaseAnonKey, email: ownerEmail, password: ownerPassword });
  const otherToken = await signIn({ supabaseUrl, anonKey: supabaseAnonKey, email: otherEmail, password: otherPassword });
  const ownerResult = await selectProperty({ supabaseUrl, anonKey: supabaseAnonKey, bearer: ownerToken, propertyId });
  const otherResult = await selectProperty({ supabaseUrl, anonKey: supabaseAnonKey, bearer: otherToken, propertyId });

  addCheck(checks, "owner account can read tested property", ownerResult.status === 200 && ownerResult.rows === 1, ownerResult);
  addCheck(checks, "different account cannot read tested property", otherResult.status === 200 && otherResult.rows === 0, otherResult);
} else {
  addCheck(checks, "authenticated cross-account probe skipped", true, {
    skipped: true,
    reason: "set SECURITY_AUDIT_OWNER_EMAIL/PASSWORD and SECURITY_AUDIT_OTHER_EMAIL/PASSWORD to run real two-account RLS probe",
  });
}

const failed = checks.filter((check) => !check.ok);
console.log(JSON.stringify({ ok: failed.length === 0, checks }, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
