import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { getAuthenticatedUser } from "./auth-session";

describe("getAuthenticatedUser", () => {
  it("retorna o usuário autenticado", async () => {
    const result = await getAuthenticatedUser(
      {
        getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }),
      },
      { retryDelayMs: 0 },
    );

    assert.deepEqual(result, { user: { id: "user-1" }, error: null });
  });

  it("diferencia ausência de sessão de falha de rede", async () => {
    const unauthenticated = await getAuthenticatedUser(
      {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      { retryDelayMs: 0 },
    );
    const failed = await getAuthenticatedUser(
      {
        getUser: async () => ({ data: { user: null }, error: { message: "Failed to fetch" } }),
      },
      { attempts: 1, retryDelayMs: 0 },
    );

    assert.deepEqual(unauthenticated, { user: null, error: null });
    assert.deepEqual(failed, { user: null, error: "Failed to fetch" });
  });

  it("trata AuthSessionMissingError como usuário deslogado", async () => {
    const result = await getAuthenticatedUser(
      {
        getUser: async () => ({
          data: { user: null },
          error: { name: "AuthSessionMissingError", message: "Auth session missing!" },
        }),
      },
      { retryDelayMs: 0 },
    );

    assert.deepEqual(result, { user: null, error: null });
  });

  it("trata JWT expirado como sessão encerrada, não como falha de rede", async () => {
    const result = await getAuthenticatedUser(
      {
        getUser: async () => ({
          data: { user: null },
          error: { name: "AuthApiError", message: "JWT expired" },
        }),
      },
      { retryDelayMs: 0 },
    );

    assert.deepEqual(result, { user: null, error: null });
  });

  it("repete uma falha transitória antes de desistir", async () => {
    let calls = 0;
    const result = await getAuthenticatedUser(
      {
        getUser: async () => {
          calls += 1;
          return calls === 1
            ? { data: { user: null }, error: { message: "Failed to fetch" } }
            : { data: { user: { id: "user-1" } }, error: null };
        },
      },
      { attempts: 2, retryDelayMs: 0 },
    );

    assert.equal(calls, 2);
    assert.deepEqual(result, { user: { id: "user-1" }, error: null });
  });
});
