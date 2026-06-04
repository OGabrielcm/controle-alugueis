import type { SupabaseClient } from "@supabase/supabase-js";

export const CONTRACT_ATTACHMENTS_BUCKET = "property-contracts";
export const CONTRACT_ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

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
  publicUrl: string;
};

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
  const withoutExtension = fileName.replace(/\.pdf$/i, "");
  const safeName = slugify(withoutExtension);

  return `${safeName || "contrato"}.pdf`;
}

export function buildContractStoragePath({ propertyId, fileName, timestamp = Date.now() }: BuildContractStoragePathInput) {
  const safePropertyId = slugify(propertyId) || "imovel";
  const safeFileName = normalizeContractFileName(fileName);

  return `${safePropertyId}/${timestamp}-${safeFileName}`;
}

export function getContractFileValidationError(file: ContractFileLike) {
  const isPdfByMime = file.type === "application/pdf";
  const isPdfByName = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfByMime || !isPdfByName) {
    return "Envie um arquivo PDF do contrato.";
  }

  if (file.size > CONTRACT_ATTACHMENT_MAX_SIZE_BYTES) {
    return "O PDF precisa ter até 10MB.";
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
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseClient.storage.from(CONTRACT_ATTACHMENTS_BUCKET).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}
