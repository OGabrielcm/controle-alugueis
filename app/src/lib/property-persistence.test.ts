import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { emptyPropertyDraft } from "./property-draft";
import { buildPropertyMutationPayload } from "./property-persistence";

const userId = "11111111-1111-4111-8111-111111111111";

const draft = {
  ...emptyPropertyDraft,
  buildingName: "  Sala Mercês  ",
  propertyAddress: "  Av. Principal, 100  ",
  tenantName: "  Maria  ",
  tenantContact: "  91 98888-7777  ",
  paymentDueDate: "2026-06-10",
  rentAmount: "3200,75",
  receivingBank: "  Sicredi  ",
  isRented: true,
  isRentPaid: false,
  contractStartDate: "2026-06-01",
  contractEndDate: "2027-05-31",
  hasAnnualAdjustment: true,
  rentAdjustmentBaseDate: "2027-06-01",
  rentAdjustmentIndex: "  IPCA  ",
  contractNotes: "  Contrato revisado  ",
};

describe("buildPropertyMutationPayload", () => {
  it("monta insert autenticado com owner_id e campos normalizados", () => {
    const payload = buildPropertyMutationPayload(draft, { userId, mode: "create" });

    assert.equal(payload.owner_id, userId);
    assert.equal(payload.building_name, "Sala Mercês");
    assert.equal(payload.property_address, "Av. Principal, 100");
    assert.equal(payload.tenant_name, "Maria");
    assert.equal(payload.tenant_contact, "91 98888-7777");
    assert.equal(payload.rent_amount, 3200.75);
    assert.equal(payload.receiving_bank, "Sicredi");
    assert.equal(payload.rent_adjustment_index, "IPCA");
    assert.equal(payload.source_is_outdated, false);
    assert.equal("id" in payload, false);
  });

  it("monta update sem trocar id e mantendo owner_id do usuário autenticado", () => {
    const payload = buildPropertyMutationPayload(
      { ...draft, id: "22222222-2222-4222-8222-222222222222", rentAmount: "3400" },
      { userId, mode: "edit" },
    );

    assert.equal(payload.owner_id, userId);
    assert.equal(payload.rent_amount, 3400);
    assert.equal("id" in payload, false);
  });

  it("envia null para opcionais vazios e remove reajuste quando desativado", () => {
    const payload = buildPropertyMutationPayload(
      {
        ...emptyPropertyDraft,
        buildingName: "Vago",
        rentAmount: "0",
        isRented: false,
        hasAnnualAdjustment: false,
        rentAdjustmentBaseDate: "2027-01-01",
        rentAdjustmentIndex: "IGP-M",
      },
      { userId, mode: "create" },
    );

    assert.equal(payload.tenant_name, null);
    assert.equal(payload.contract_start_date, null);
    assert.equal(payload.has_annual_adjustment, false);
    assert.equal(payload.rent_adjustment_base_date, null);
    assert.equal(payload.rent_adjustment_index, null);
  });
});
