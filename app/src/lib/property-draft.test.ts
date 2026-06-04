import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { emptyPropertyDraft, propertyFromDraft } from "./property-draft";

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
