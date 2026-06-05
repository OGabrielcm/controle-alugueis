import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
  getAuthModeCopy,
  getPasswordRecoveryPageCopy,
  getPasswordResetSuccessMessage,
  getSignupSuccessMessage,
  validateAuthForm,
  validatePasswordResetEmail,
  validateSignupForm,
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

describe("validateSignupForm", () => {
  it("aceita nome, email confirmado e senha confirmada", () => {
    const result = validateSignupForm({
      fullName: "  Gabriel Mercês  ",
      email: "  merces@example.com ",
      emailConfirmation: "merces@example.com",
      password: "senha123",
      passwordConfirmation: "senha123",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.fullName, "Gabriel Mercês");
      assert.equal(result.data.email, "merces@example.com");
      assert.equal(result.data.password, "senha123");
    }
  });

  it("rejeita nome vazio", () => {
    const result = validateSignupForm({
      fullName: " ",
      email: "merces@example.com",
      emailConfirmation: "merces@example.com",
      password: "senha123",
      passwordConfirmation: "senha123",
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /nome/i);
  });

  it("rejeita confirmação de email diferente", () => {
    const result = validateSignupForm({
      fullName: "Gabriel Mercês",
      email: "merces@example.com",
      emailConfirmation: "outro@example.com",
      password: "senha123",
      passwordConfirmation: "senha123",
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /e-mail não confere/i);
  });

  it("rejeita confirmação de senha diferente", () => {
    const result = validateSignupForm({
      fullName: "Gabriel Mercês",
      email: "merces@example.com",
      emailConfirmation: "merces@example.com",
      password: "senha123",
      passwordConfirmation: "outra123",
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /senha não confere/i);
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

  it("explica a página dedicada de solicitação de recuperação", () => {
    const copy = getPasswordRecoveryPageCopy();

    assert.match(copy.title, /Recuperar senha/);
    assert.match(copy.description, /e-mail cadastrado/);
    assert.match(copy.submitLabel, /Enviar link/);
    assert.match(copy.successMessage, /spam/);
  });
});
