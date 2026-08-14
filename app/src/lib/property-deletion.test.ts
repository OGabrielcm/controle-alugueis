import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deletePropertyAndAttachments } from "./property-deletion";

type FakeOptions = {
  files?: Array<{ name: string }>;
  updatedProperty?: { id: string } | null;
  removeError?: { message: string } | null;
};

function createFakeClient({ files = [], updatedProperty = { id: "property-1" }, removeError = null }: FakeOptions = {}) {
  const events: string[] = [];
  const removedPaths: string[][] = [];

  const queryResult = (kind: "update" | "delete") => ({
    eq: () => ({
      select: () => ({
        single: async () => {
          events.push(kind);
          return kind === "update"
            ? { data: updatedProperty, error: null }
            : { data: { id: "property-1" }, error: null };
        },
      }),
    }),
  });

  const client = {
    from: () => ({
      update: () => queryResult("update"),
      delete: () => queryResult("delete"),
    }),
    storage: {
      from: () => ({
        list: async () => {
          events.push("list");
          return { data: files, error: null };
        },
        remove: async (paths: string[]) => {
          events.push("remove");
          removedPaths.push(paths);
          return { data: null, error: removeError };
        },
      }),
    },
  } as unknown as SupabaseClient;

  return { client, events, removedPaths };
}

describe("deletePropertyAndAttachments", () => {
  it("remove todos os arquivos da pasta antes de excluir o imóvel", async () => {
    const { client, events, removedPaths } = createFakeClient({
      files: [{ name: "contrato.pdf" }, { name: "contrato-antigo.docx" }],
    });

    await deletePropertyAndAttachments({
      property: { id: "property-1", contractUrl: "property-1/contrato.pdf" },
      supabaseClient: client,
    });

    assert.deepEqual(events, ["list", "update", "remove", "delete"]);
    assert.deepEqual(removedPaths, [[
      "property-1/contrato.pdf",
      "property-1/contrato-antigo.docx",
    ]]);
  });

  it("não remove arquivos nem confirma exclusão quando o update afeta zero linhas", async () => {
    const { client, events } = createFakeClient({
      files: [{ name: "contrato.pdf" }],
      updatedProperty: null,
    });

    await assert.rejects(
      deletePropertyAndAttachments({ property: { id: "property-1" }, supabaseClient: client }),
      /não foi encontrado/i,
    );
    assert.deepEqual(events, ["list", "update"]);
  });

  it("não exclui o imóvel quando o Storage falha", async () => {
    const { client, events } = createFakeClient({
      files: [{ name: "contrato.pdf" }],
      removeError: { message: "Storage unavailable" },
    });

    await assert.rejects(
      deletePropertyAndAttachments({ property: { id: "property-1" }, supabaseClient: client }),
      /arquivos impediram a exclusão/i,
    );
    assert.deepEqual(events, ["list", "update", "remove"]);
  });
});
