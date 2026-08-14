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

  it("remove o contrato existente quando solicitado na edição", () => {
    const payload = buildPropertyMutationPayload(
      { ...draft, id: "22222222-2222-4222-8222-222222222222" },
      {
        userId,
        mode: "edit",
        current: {
          id: "22222222-2222-4222-8222-222222222222",
          buildingName: "Sala Mercês",
          isRented: true,
          isRentPaid: false,
          rentAmount: 3200.75,
          condoAmount: 0,
          condoPaidByTenant: false,
          extraFeePaidByTenant: false,
          maintenancePaidByTenant: false,
          iptuPaidByTenant: false,
          hasRentDeposit: false,
          contractUrl: "contracts/22222222-2222-4222-8222-222222222222/contrato.pdf",
        },
        removeContract: true,
      },
    );

    assert.equal(payload.contract_url, null);
  });

  it("rejeita datas invertidas mesmo quando a persistência é chamada sem formulário", () => {
    assert.throws(
      () => buildPropertyMutationPayload(
        { ...draft, contractStartDate: "2030-01-01", contractEndDate: "2020-01-01" },
        { userId, mode: "create", referenceDate: "2026-07-13" },
      ),
      /vencimento do contrato não pode ser anterior/i,
    );
  });

  it("exige confirmação explícita para persistir contrato vencido como alugado", () => {
    const expiredDraft = { ...draft, contractEndDate: "2026-06-01" };

    assert.throws(
      () => buildPropertyMutationPayload(expiredDraft, { userId, mode: "create", referenceDate: "2026-07-13" }),
      /confirme o contrato vencido/i,
    );
    assert.doesNotThrow(() => buildPropertyMutationPayload(expiredDraft, {
      userId,
      mode: "create",
      referenceDate: "2026-07-13",
      confirmExpiredContract: true,
    }));
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
