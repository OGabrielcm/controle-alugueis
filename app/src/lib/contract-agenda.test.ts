import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import type { PropertyRecord } from "./rentals";
import {
  buildContractAgenda,
  getNextAnnualAdjustmentDate,
  sortAgendaItemsByPriority,
} from "./contract-agenda";

const baseProperty: PropertyRecord = {
  id: "apt-demo-101",
  buildingName: "Apt. Demo 101",
  isRented: true,
  tenantName: "Inquilino Demo",
  paymentDueDate: "2026-06-10",
  isRentPaid: true,
  rentAmount: 2000,
  condoAmount: 500,
  condoPaidByTenant: false,
  extraFeePaidByTenant: false,
  maintenancePaidByTenant: false,
  iptuPaidByTenant: false,
  receivingBank: "Nubank",
  hasRentDeposit: false,
};

describe("getNextAnnualAdjustmentDate", () => {
  it("calcula o próximo aniversário de reajuste no ano atual quando ainda não passou", () => {
    assert.equal(getNextAnnualAdjustmentDate("2025-08-15", "2026-06-04"), "2026-08-15");
  });

  it("move o reajuste para o ano seguinte quando a data base já passou", () => {
    assert.equal(getNextAnnualAdjustmentDate("2025-03-15", "2026-06-04"), "2027-03-15");
  });
});

describe("buildContractAgenda", () => {
  it("gera alerta de contrato vencido com prioridade crítica", () => {
    const agenda = buildContractAgenda([
      { ...baseProperty, contractEndDate: "2026-05-20", hasAnnualAdjustment: false },
    ], "2026-06-04");

    assert.deepEqual(agenda.summary, {
      total: 2,
      overdue: 1,
      dueSoon: 0,
      missingData: 1,
      info: 0,
    });
    assert.equal(agenda.items[0]?.kind, "contract-expiration");
    assert.equal(agenda.items[0]?.severity, "danger");
    assert.equal(agenda.items[0]?.daysUntil, -15);
  });

  it("gera alerta de reajuste próximo usando aniversário anual da data base", () => {
    const agenda = buildContractAgenda([
      {
        ...baseProperty,
        contractEndDate: "2027-02-01",
        hasAnnualAdjustment: true,
        rentAdjustmentBaseDate: "2025-06-20",
        rentAdjustmentIndex: "IPCA",
      },
    ], "2026-06-04");

    assert.equal(agenda.items[0]?.kind, "rent-adjustment");
    assert.equal(agenda.items[0]?.severity, "warning");
    assert.equal(agenda.items[0]?.date, "2026-06-20");
    assert.equal(agenda.items[0]?.daysUntil, 16);
    assert.match(agenda.items[0]?.description ?? "", /IPCA/);
  });

  it("marca imóveis alugados sem vencimento e sem regra de reajuste como dados pendentes", () => {
    const agenda = buildContractAgenda([{ ...baseProperty, hasAnnualAdjustment: false }], "2026-06-04");

    assert.equal(agenda.summary.missingData, 2);
    assert.deepEqual(
      agenda.items.map((item) => item.kind),
      ["missing-contract-end", "missing-adjustment-rule"],
    );
  });

  it("ignora imóveis desocupados na agenda contratual", () => {
    const agenda = buildContractAgenda([
      { ...baseProperty, isRented: false, contractEndDate: "2026-06-10", hasAnnualAdjustment: false },
    ], "2026-06-04");

    assert.equal(agenda.summary.total, 0);
    assert.equal(agenda.items.length, 0);
  });
});

describe("sortAgendaItemsByPriority", () => {
  it("ordena risco crítico antes de pendência e informação", () => {
    const sorted = sortAgendaItemsByPriority([
      {
        id: "info:contract-expiration",
        propertyId: "info",
        propertyName: "Info",
        kind: "contract-expiration",
        severity: "info",
        title: "Contrato mapeado",
        description: "Contrato futuro sem ação imediata.",
        date: "2026-12-20",
        daysUntil: 199,
      },
      {
        id: "missing:missing-contract-end",
        propertyId: "missing",
        propertyName: "Missing",
        kind: "missing-contract-end",
        severity: "warning",
        title: "Contrato sem vencimento",
        description: "Falta data final.",
      },
      {
        id: "danger:contract-expiration",
        propertyId: "danger",
        propertyName: "Danger",
        kind: "contract-expiration",
        severity: "danger",
        title: "Contrato vencido",
        description: "Contrato já venceu.",
        date: "2026-05-20",
        daysUntil: -15,
      },
    ]);

    assert.equal(sorted[0]?.propertyId, "danger");
    assert.equal(sorted[1]?.propertyId, "missing");
    assert.equal(sorted[2]?.propertyId, "info");
  });
});
