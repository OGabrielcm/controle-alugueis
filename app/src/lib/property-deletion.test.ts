import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deletePropertyWhenNoAttachments } from "./property-deletion";

type FakeOptions = {
  files?: Array<{ name: string }>;
  listError?: { message: string } | null;
  deletedProperty?: { id: string } | null;
  deleteError?: { message: string } | null;
};

function createFakeClient({
  files = [],
  listError = null,
  deletedProperty = { id: "property-1" },
  deleteError = null,
}: FakeOptions = {}) {
  const events: string[] = [];

  const client = {
    from: () => ({
      delete: () => ({
        eq: () => ({
          select: () => ({
            single: async () => {
              events.push("delete");
              return { data: deletedProperty, error: deleteError };
            },
          }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        list: async () => {
          events.push("list");
          return { data: files, error: listError };
        },
      }),
    },
  } as unknown as SupabaseClient;

  return { client, events };
}

describe("deletePropertyWhenNoAttachments", () => {
  it("exclui o imóvel somente quando a pasta de anexos está vazia", async () => {
    const { client, events } = createFakeClient();

    await deletePropertyWhenNoAttachments({
      property: { id: "property-1" },
      supabaseClient: client,
    });

    assert.deepEqual(events, ["list", "delete"]);
  });

  it("bloqueia a exclusão sem apagar arquivos quando há anexos", async () => {
    const { client, events } = createFakeClient({ files: [{ name: "contrato.pdf" }] });

    await assert.rejects(
      deletePropertyWhenNoAttachments({ property: { id: "property-1" }, supabaseClient: client }),
      /remova os contratos anexados/i,
    );
    assert.deepEqual(events, ["list"]);
  });

  it("ignora somente o marcador de pasta vazia", async () => {
    const { client, events } = createFakeClient({ files: [{ name: ".emptyFolderPlaceholder" }] });

    await deletePropertyWhenNoAttachments({ property: { id: "property-1" }, supabaseClient: client });

    assert.deepEqual(events, ["list", "delete"]);
  });

  it("não tenta excluir quando não consegue verificar os anexos", async () => {
    const { client, events } = createFakeClient({ listError: { message: "Storage unavailable" } });

    await assert.rejects(
      deletePropertyWhenNoAttachments({ property: { id: "property-1" }, supabaseClient: client }),
      /não foi possível verificar os anexos/i,
    );
    assert.deepEqual(events, ["list"]);
  });

  it("propaga falha do banco sem tocar no Storage", async () => {
    const { client, events } = createFakeClient({
      deletedProperty: null,
      deleteError: { message: "Database unavailable" },
    });

    await assert.rejects(
      deletePropertyWhenNoAttachments({ property: { id: "property-1" }, supabaseClient: client }),
      /database unavailable/i,
    );
    assert.deepEqual(events, ["list", "delete"]);
  });
});
