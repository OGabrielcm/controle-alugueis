import { readFileSync, existsSync } from "node:fs";
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

loadDotEnv(resolve(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase smoke: .env.local sem NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const endpoint = new URL("/rest/v1/properties", supabaseUrl);
endpoint.searchParams.set(
  "select",
  [
    "id",
    "building_name",
    "property_address",
    "tenant_contact",
    "contract_start_date",
    "has_annual_adjustment",
    "rent_adjustment_base_date",
    "rent_adjustment_index",
    "contract_notes",
    "owner_id",
    "source_is_outdated",
  ].join(","),
);
endpoint.searchParams.set("source_is_outdated", "is.true");
endpoint.searchParams.set("limit", "3");

const response = await fetch(endpoint, {
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
});

const bodyText = await response.text();
let body;
try {
  body = JSON.parse(bodyText);
} catch {
  body = bodyText;
}

if (!response.ok) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        status: response.status,
        statusText: response.statusText,
        body,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

if (!Array.isArray(body) || body.length === 0) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        status: response.status,
        reason: "A consulta anon ao Supabase retornou zero imóveis demo.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      status: response.status,
      rows: body.length,
      sampleNames: body.map((row) => row.building_name),
      schemaHasContractFields: body.every((row) =>
        Object.prototype.hasOwnProperty.call(row, "tenant_contact") &&
        Object.prototype.hasOwnProperty.call(row, "contract_start_date") &&
        Object.prototype.hasOwnProperty.call(row, "has_annual_adjustment")
      ),
      schemaHasOwnerId: body.every((row) => Object.prototype.hasOwnProperty.call(row, "owner_id")),
      demoRowsHaveNoOwner: body.every((row) => row.owner_id === null),
    },
    null,
    2,
  ),
);
