import type { SupabaseClient } from "@supabase/supabase-js";
import { CONTRACT_ATTACHMENTS_BUCKET } from "./contract-attachment";

export type PropertyForDeletion = {
  id: string;
  contractUrl?: string;
};

export async function deletePropertyAndAttachments({
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

  const { data: updatedProperty, error: unlinkError } = await supabaseClient
    .from("properties")
    .update({ contract_url: null })
    .eq("id", property.id)
    .select("id")
    .single();

  if (unlinkError || !updatedProperty) {
    throw new Error(unlinkError?.message ?? "O imóvel não foi encontrado para exclusão.");
  }

  const attachmentPaths = (files ?? [])
    .filter((file) => file.name && file.name !== ".emptyFolderPlaceholder")
    .map((file) => `${property.id}/${file.name}`);

  if (attachmentPaths.length > 0) {
    const { error: removeError } = await supabaseClient.storage
      .from(CONTRACT_ATTACHMENTS_BUCKET)
      .remove(attachmentPaths);

    if (removeError) {
      throw new Error(`O vínculo foi removido, mas os arquivos impediram a exclusão (${removeError.message}).`);
    }
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
