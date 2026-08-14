import type { SupabaseClient } from "@supabase/supabase-js";

export const CONTRACT_ATTACHMENTS_BUCKET = "property-contracts";
export const CONTRACT_ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const CONTRACT_ATTACHMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type ContractFileLike = {
  name: string;
  type: string;
  size: number;
};

export type BuildContractStoragePathInput = {
  propertyId: string;
  fileName: string;
  timestamp?: number;
};

export type ContractUploadResult = {
  path: string;
};

const PUBLIC_STORAGE_MARKER = `/storage/v1/object/public/${CONTRACT_ATTACHMENTS_BUCKET}/`;

export function normalizeContractStoragePath(value?: string | null) {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const markerIndex = trimmed.indexOf(PUBLIC_STORAGE_MARKER);
  if (markerIndex >= 0) {
    return decodeURIComponent(trimmed.slice(markerIndex + PUBLIC_STORAGE_MARKER.length));
  }

  return trimmed.replace(/^\/+/, "");
}

export async function createContractSignedUrl({
  path,
  supabaseClient,
  expiresInSeconds = 5 * 60,
}: {
  path: string;
  supabaseClient: SupabaseClient;
  expiresInSeconds?: number;
}) {
  const normalizedPath = normalizeContractStoragePath(path);
  if (!normalizedPath) {
    throw new Error("Contrato sem caminho de arquivo válido.");
  }

  const { data, error } = await supabaseClient.storage
    .from(CONTRACT_ATTACHMENTS_BUCKET)
    .createSignedUrl(normalizedPath, expiresInSeconds);

  if (error) {
    throw new Error(error.message);
  }

  const validationError = getSignedUrlValidationError(data?.signedUrl);
  if (validationError) {
    throw new Error(validationError);
  }

  return data.signedUrl;
}

export function getSignedUrlValidationError(value?: string | null) {
  if (!value) {
    return "O Storage não retornou um link válido para o contrato.";
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? undefined : "O Storage retornou um link inválido para o contrato.";
  } catch {
    return "O Storage retornou um link inválido para o contrato.";
  }
}

function slugify(value: string) {
  return value
    .replace(/n[º°]/gi, "no")
    .replace(/ª/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeContractFileName(fileName: string) {
  const extension = fileName.toLowerCase().endsWith(".docx") ? "docx" : "pdf";
  const withoutExtension = fileName.replace(/\.(pdf|docx)$/i, "");
  const safeName = slugify(withoutExtension);

  return `${safeName || "contrato"}.${extension}`;
}

export function buildContractStoragePath({ propertyId, fileName, timestamp = Date.now() }: BuildContractStoragePathInput) {
  const safePropertyId = slugify(propertyId) || "imovel";
  const safeFileName = normalizeContractFileName(fileName);

  return `${safePropertyId}/${timestamp}-${safeFileName}`;
}

export function getContractFileValidationError(file: ContractFileLike) {
  const isPdfByMime = file.type === "application/pdf";
  const isPdfByName = file.name.toLowerCase().endsWith(".pdf");
  const isDocxByMime = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isDocxByName = file.name.toLowerCase().endsWith(".docx");

  if (!(isPdfByMime && isPdfByName) && !(isDocxByMime && isDocxByName)) {
    return "Envie um arquivo PDF ou DOCX do contrato.";
  }

  if (file.size > CONTRACT_ATTACHMENT_MAX_SIZE_BYTES) {
    return "O documento precisa ter até 10MB.";
  }

  return undefined;
}

export async function uploadContractAttachment({
  file,
  propertyId,
  supabaseClient,
}: {
  file: File;
  propertyId: string;
  supabaseClient: SupabaseClient;
}): Promise<ContractUploadResult> {
  const validationError = getContractFileValidationError(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const path = buildContractStoragePath({ propertyId, fileName: file.name });
  const { error } = await supabaseClient.storage
    .from(CONTRACT_ATTACHMENTS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    path,
  };
}
