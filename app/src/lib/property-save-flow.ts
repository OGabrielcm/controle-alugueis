export type PropertySaveMode = "create" | "edit";

export function shouldRedirectAfterPropertySave(mode: PropertySaveMode, options: { savedToSupabase: boolean; attachmentUploadFailed?: boolean }) {
  return mode === "create" && options.savedToSupabase && !options.attachmentUploadFailed;
}
