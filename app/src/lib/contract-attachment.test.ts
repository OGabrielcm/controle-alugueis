import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
  CONTRACT_ATTACHMENTS_BUCKET,
  buildContractStoragePath,
  getContractFileValidationError,
  normalizeContractFileName,
  normalizeContractStoragePath,
} from "./contract-attachment";

describe("normalizeContractFileName", () => {
  it("remove acentos, espaços e caracteres inseguros mantendo extensão pdf", () => {
    assert.equal(normalizeContractFileName("Contrato Marcella 102 - Revisão Nº 1.PDF"), "contrato-marcella-102-revisao-no-1.pdf");
  });

  it("preserva extensão docx em nome seguro", () => {
    assert.equal(normalizeContractFileName("Contrato Marcella 102 - Revisão Nº 1.DOCX"), "contrato-marcella-102-revisao-no-1.docx");
  });

  it("aplica nome padrão quando o arquivo não tem nome útil", () => {
    assert.equal(normalizeContractFileName("???.pdf"), "contrato.pdf");
  });
});

describe("normalizeContractStoragePath", () => {
  it("mantém path privado já normalizado", () => {
    assert.equal(
      normalizeContractStoragePath("1eab06ca-f0d6-42e6-ae6b-4c5db07673d1/1782221544157-contrato.pdf"),
      "1eab06ca-f0d6-42e6-ae6b-4c5db07673d1/1782221544157-contrato.pdf",
    );
  });

  it("converte URL pública antiga para path interno", () => {
    assert.equal(
      normalizeContractStoragePath(
        "https://wmdsbwpqqpkmsowqpssj.supabase.co/storage/v1/object/public/property-contracts/48b73660-0682-4e5d-8d05-edcdba7e9c2c/1782220139735-lista-unidade-i.pdf",
      ),
      "48b73660-0682-4e5d-8d05-edcdba7e9c2c/1782220139735-lista-unidade-i.pdf",
    );
  });
});

describe("buildContractStoragePath", () => {
  it("gera caminho estável por imóvel com timestamp e nome seguro", () => {
    assert.equal(
      buildContractStoragePath({ propertyId: "Apt. Marcella 102", fileName: "Contrato Final.PDF", timestamp: 1780590000000 }),
      "apt-marcella-102/1780590000000-contrato-final.pdf",
    );
  });

  it("usa bucket dedicado para contratos de imóveis", () => {
    assert.equal(CONTRACT_ATTACHMENTS_BUCKET, "property-contracts");
  });
});

describe("getContractFileValidationError", () => {
  it("aceita PDFs de até 10MB", () => {
    assert.equal(getContractFileValidationError({ name: "contrato.pdf", type: "application/pdf", size: 10 * 1024 * 1024 }), undefined);
  });

  it("aceita DOCX de até 10MB", () => {
    assert.equal(
      getContractFileValidationError({
        name: "contrato.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 10 * 1024 * 1024,
      }),
      undefined,
    );
  });

  it("rejeita arquivos que não são PDF ou DOCX", () => {
    assert.equal(
      getContractFileValidationError({ name: "contrato.png", type: "image/png", size: 500 }),
      "Envie um arquivo PDF ou DOCX do contrato.",
    );
  });

  it("rejeita documentos acima de 10MB", () => {
    assert.equal(
      getContractFileValidationError({ name: "contrato.pdf", type: "application/pdf", size: 10 * 1024 * 1024 + 1 }),
      "O documento precisa ter até 10MB.",
    );
  });
});
