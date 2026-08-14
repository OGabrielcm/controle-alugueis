import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
  PROPERTY_TEXT_LIMITS,
  emptyPropertyDraft,
  getPropertyDraftValidationError,
  hasExpiredActiveContract,
  propertyFromDraft,
} from "./property-draft";

const baseDraft = {
  ...emptyPropertyDraft,
  buildingName: "  Apt. Mercês 101  ",
  propertyAddress: "  Rua das Flores, 123  ",
  tenantName: "  João Silva  ",
  tenantContact: "  91 99999-9999  ",
  paymentDueDate: "2026-06-10",
  rentAmount: "2500,50",
  receivingBank: "  Nubank  ",
  isRented: true,
  isRentPaid: false,
  contractStartDate: "2026-01-15",
  contractEndDate: "2027-01-14",
  hasAnnualAdjustment: true,
  rentAdjustmentBaseDate: "2027-01-15",
  rentAdjustmentIndex: "  IPCA  ",
  contractNotes: "  Reajuste anual conforme cláusula 8  ",
};

describe("propertyFromDraft", () => {
  it("normaliza cadastro de imóvel com dados contratuais base", () => {
    const property = propertyFromDraft(baseDraft);

    assert.equal(property.buildingName, "Apt. Mercês 101");
    assert.equal(property.propertyAddress, "Rua das Flores, 123");
    assert.equal(property.tenantName, "João Silva");
    assert.equal(property.tenantContact, "91 99999-9999");
    assert.equal(property.rentAmount, 2500.5);
    assert.equal(property.receivingBank, "Nubank");
    assert.equal(property.contractStartDate, "2026-01-15");
    assert.equal(property.contractEndDate, "2027-01-14");
    assert.equal(property.hasAnnualAdjustment, true);
    assert.equal(property.rentAdjustmentBaseDate, "2027-01-15");
    assert.equal(property.rentAdjustmentIndex, "IPCA");
    assert.equal(property.contractNotes, "Reajuste anual conforme cláusula 8");
  });

  it("preserva dados existentes que ainda não fazem parte do formulário", () => {
    const property = propertyFromDraft(
      { ...baseDraft, rentAmount: "2600" },
      {
        id: "imovel-existente",
        buildingName: "Antigo",
        isRented: true,
        isRentPaid: true,
        rentAmount: 2500,
        condoAmount: 600,
        condoPaidByTenant: true,
        extraFeeAmount: 20,
        extraFeePaidByTenant: true,
        maintenancePaidByTenant: false,
        iptuPaidByTenant: false,
        contractUrl: "https://example.com/contrato.pdf",
        hasRentDeposit: true,
      },
    );

    assert.equal(property.id, "imovel-existente");
    assert.equal(property.rentAmount, 2600);
    assert.equal(property.condoAmount, 600);
    assert.equal(property.condoPaidByTenant, true);
    assert.equal(property.extraFeeAmount, 20);
    assert.equal(property.contractUrl, "https://example.com/contrato.pdf");
    assert.equal(property.hasRentDeposit, true);
  });

  it("remove campos opcionais vazios e dados de reajuste quando não há cláusula anual", () => {
    const property = propertyFromDraft({
      ...emptyPropertyDraft,
      buildingName: "Sala Comercial",
      rentAmount: "0",
      isRented: false,
      isRentPaid: false,
      hasAnnualAdjustment: false,
      rentAdjustmentBaseDate: "2027-05-01",
      rentAdjustmentIndex: "IGP-M",
      contractNotes: "",
    });

    assert.equal(property.tenantName, undefined);
    assert.equal(property.tenantContact, undefined);
    assert.equal(property.contractStartDate, undefined);
    assert.equal(property.contractEndDate, undefined);
    assert.equal(property.hasAnnualAdjustment, false);
    assert.equal(property.rentAdjustmentBaseDate, undefined);
    assert.equal(property.rentAdjustmentIndex, undefined);
    assert.equal(property.contractNotes, undefined);
  });
});

describe("getPropertyDraftValidationError", () => {
  it("rejeita vencimento anterior ao início do contrato", () => {
    assert.equal(
      getPropertyDraftValidationError({
        ...baseDraft,
        contractStartDate: "2030-01-01",
        contractEndDate: "2020-01-01",
      }),
      "O vencimento do contrato não pode ser anterior ao início.",
    );
  });

  it("aceita datas no mesmo dia ou em ordem crescente", () => {
    assert.equal(
      getPropertyDraftValidationError({
        ...baseDraft,
        contractStartDate: "2026-01-15",
        contractEndDate: "2026-01-15",
      }),
      undefined,
    );
    assert.equal(getPropertyDraftValidationError(baseDraft), undefined);
  });

  it("rejeita texto acima do limite definido para observações", () => {
    assert.equal(
      getPropertyDraftValidationError({
        ...baseDraft,
        contractNotes: "a".repeat(PROPERTY_TEXT_LIMITS.contractNotes + 1),
      }),
      `O campo observações contratuais deve ter no máximo ${PROPERTY_TEXT_LIMITS.contractNotes} caracteres.`,
    );
  });
});

describe("hasExpiredActiveContract", () => {
  it("exige confirmação quando imóvel alugado tem contrato encerrado", () => {
    assert.equal(
      hasExpiredActiveContract(
        { ...baseDraft, contractEndDate: "2026-06-01", isRented: true },
        "2026-07-13",
      ),
      true,
    );
  });

  it("não exige confirmação para imóvel desalugado ou contrato vigente", () => {
    assert.equal(
      hasExpiredActiveContract(
        { ...baseDraft, contractEndDate: "2026-06-01", isRented: false },
        "2026-07-13",
      ),
      false,
    );
    assert.equal(
      hasExpiredActiveContract(
        { ...baseDraft, contractEndDate: "2027-06-01", isRented: true },
        "2026-07-13",
      ),
      false,
    );
  });
});
