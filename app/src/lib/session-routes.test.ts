import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { DASHBOARD_HOME, PASSWORD_RECOVERY_PATH, SIGNUP_CONFIRMATION_PATH, isAuthRoute, isOperationalRoute } from "./session-routes";

describe("session route boundaries", () => {
  it("usa /dashboard como tela operacional principal", () => {
    assert.equal(DASHBOARD_HOME, "/dashboard");
  });

  it("trata login, cadastro, recuperação e redefinição como rotas públicas de autenticação", () => {
    assert.equal(isAuthRoute("/login"), true);
    assert.equal(isAuthRoute("/cadastro"), true);
    assert.equal(PASSWORD_RECOVERY_PATH, "/recuperar-senha");
    assert.equal(isAuthRoute("/recuperar-senha"), true);
    assert.equal(isAuthRoute("/redefinir-senha"), true);
    assert.equal(SIGNUP_CONFIRMATION_PATH, "/cadastro/confirmar-email");
    assert.equal(isAuthRoute("/cadastro/confirmar-email"), true);
  });

  it("não trata a raiz como rota operacional para evitar dashboard direto", () => {
    assert.equal(isOperationalRoute("/"), false);
  });

  it("protege dashboard e rotas operacionais segmentadas", () => {
    assert.equal(isOperationalRoute("/dashboard"), true);
    assert.equal(isOperationalRoute("/imoveis"), true);
    assert.equal(isOperationalRoute("/imoveis/novo"), true);
    assert.equal(isOperationalRoute("/importar"), true);
  });
});
