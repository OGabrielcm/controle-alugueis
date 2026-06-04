import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
  CONTRACT_ATTACHMENTS_BUCKET,
  buildContractStoragePath,
  getContractFileValidationError,
  normalizeContractFileName,
} from "./contract-attachment";

describe("normalizeContractFileName", () => {
  it("remove acentos, espaços e caracteres inseguros mantendo extensão pdf", () => {
    assert.equal(normalizeContractFileName("Contrato Marcella 102 - Revisão Nº 1.PDF"), "contrato-marcella-102-revisao-no-1.pdf");
  });

  it("aplica nome padrão quando o arquivo não tem nome útil", () => {
    assert.equal(normalizeContractFileName("???.pdf"), "contrato.pdf");
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

  it("rejeita arquivos que não são PDF", () => {
    assert.equal(
      getContractFileValidationError({ name: "contrato.png", type: "image/png", size: 500 }),
      "Envie um arquivo PDF do contrato.",
    );
  });

  it("rejeita PDFs acima de 10MB", () => {
    assert.equal(
      getContractFileValidationError({ name: "contrato.pdf", type: "application/pdf", size: 10 * 1024 * 1024 + 1 }),
      "O PDF precisa ter até 10MB.",
    );
  });
});
