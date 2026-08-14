import type { SupabaseClient } from "@supabase/supabase-js";
import { CONTRACT_ATTACHMENTS_BUCKET } from "./contract-attachment";

export type PropertyForDeletion = {
  id: string;
};

export async function deletePropertyWhenNoAttachments({
  property,
  supabaseClient,
}: {
  property: PropertyForDeletion;
  supabaseClient: SupabaseClient;
}) {
  const { data: files, error: listError } = await supabaseClient.storage
    .from(CONTRACT_ATTACHMENTS_BUCKET)
    .list(property.id, { limit: 1000 });

  if (listError) {
    throw new Error(`Não foi possível verificar os anexos antes da exclusão (${listError.message}).`);
  }

  const attachmentCount = (files ?? []).filter(
    (file) => file.name && file.name !== ".emptyFolderPlaceholder",
  ).length;

  if (attachmentCount > 0) {
    throw new Error("Remova os contratos anexados antes de excluir o imóvel. Nenhum arquivo foi apagado.");
  }

  const { data: deletedProperty, error: deleteError } = await supabaseClient
    .from("properties")
    .delete()
    .eq("id", property.id)
    .select("id")
    .single();

  if (deleteError || !deletedProperty) {
    throw new Error(deleteError?.message ?? "O imóvel não foi encontrado para exclusão.");
  }
}
