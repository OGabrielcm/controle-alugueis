import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { shouldRedirectAfterPropertySave } from "./property-save-flow";

describe("shouldRedirectAfterPropertySave", () => {
  it("redireciona cadastro Supabase bem-sucedido para a lista de imóveis", () => {
    assert.equal(shouldRedirectAfterPropertySave("create", { savedToSupabase: true }), true);
  });

  it("mantém edição na tela atual", () => {
    assert.equal(shouldRedirectAfterPropertySave("edit", { savedToSupabase: true }), false);
  });

  it("não redireciona quando o anexo falhou para preservar a mensagem de correção", () => {
    assert.equal(shouldRedirectAfterPropertySave("create", { savedToSupabase: true, attachmentUploadFailed: true }), false);
  });

  it("não redireciona rascunho local sem Supabase", () => {
    assert.equal(shouldRedirectAfterPropertySave("create", { savedToSupabase: false }), false);
  });
});
