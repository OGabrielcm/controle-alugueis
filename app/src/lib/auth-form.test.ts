import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
  getAuthModeCopy,
  getPasswordResetSuccessMessage,
  getSignupSuccessMessage,
  validateAuthForm,
  validatePasswordResetEmail,
} from "./auth-form";

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

describe("validatePasswordResetEmail", () => {
  it("aceita email válido para recuperação", () => {
    const result = validatePasswordResetEmail("  merces@example.com ");

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.email, "merces@example.com");
    }
  });

  it("rejeita email inválido na recuperação", () => {
    const result = validatePasswordResetEmail("sem-email");

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /e-mail válido/);
    }
  });
});

describe("auth flow messages", () => {
  it("explica que signup pode ser conta existente sem novo email", () => {
    const message = getSignupSuccessMessage();

    assert.match(message, /Se essa conta já existia/);
    assert.match(message, /nenhum novo e-mail/);
    assert.match(message, /login/);
  });

  it("explica recuperação de senha sem revelar se conta existe", () => {
    const message = getPasswordResetSuccessMessage();

    assert.match(message, /Se existir uma conta/);
    assert.match(message, /recuperação/);
    assert.match(message, /caixa de entrada/);
  });
});
