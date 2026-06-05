import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { getAuthModeCopy, validateAuthForm } from "./auth-form";

describe("validateAuthForm", () => {
  it("aceita email válido e senha com 8+ caracteres", () => {
    const result = validateAuthForm({ email: "  merces@example.com ", password: "senha123" });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.email, "merces@example.com");
    }
  });

  it("rejeita email inválido", () => {
    const result = validateAuthForm({ email: "sem-email", password: "senha123" });

    assert.equal(result.ok, false);
  });

  it("rejeita senha curta", () => {
    const result = validateAuthForm({ email: "merces@example.com", password: "123" });

    assert.equal(result.ok, false);
  });
});

describe("getAuthModeCopy", () => {
  it("explica login como etapa posterior à confirmação de e-mail", () => {
    assert.match(getAuthModeCopy("login").description, /confirmar o e-mail/);
  });

  it("explica signup como criação de acesso privado", () => {
    assert.match(getAuthModeCopy("signup").title, /Criar acesso privado/);
    assert.match(getAuthModeCopy("signup").description, /confirme o e-mail/);
  });
});
