import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
  filterProperties,
  getPropertyAlerts,
  monthlyRevenue,
  paidRentCount,
  pendingRentCount,
  pendingRevenue,
  propertyOccupancyStatus,
  propertySchema,
  receivedRevenue,
  summarizePortfolio,
  type PropertyRecord,
} from "./rentals";

const baseProperty = {
  id: "apt-101",
  buildingName: "Apartamento 101",
  isRented: true,
  isRentPaid: false,
  rentAmount: 1500,
  condoAmount: 350,
  condoPaidByTenant: false,
  extraFeePaidByTenant: false,
  maintenancePaidByTenant: false,
  iptuPaidByTenant: false,
  hasRentDeposit: false,
};

const rentedProperty: PropertyRecord = {
  ...baseProperty,
  tenantName: "Inquilino teste",
  contractEndDate: "2026-12-31",
  receivingBank: "Nubank",
};

const unrentedProperty: PropertyRecord = {
  ...baseProperty,
  id: "apt-102",
  buildingName: "Apartamento 102",
  isRented: false,
  isRentPaid: false,
  rentAmount: 2200,
  receivingBank: undefined,
  tenantName: undefined,
  contractEndDate: undefined,
};

describe("propertySchema", () => {
  it("aceita path privado de contrato salvo no Supabase Storage", () => {
    const parsed = propertySchema.parse({
      ...baseProperty,
      contractUrl: "48b73660-0682-4e5d-8d05-edcdba7e9c2c/1782220139735-lista-unidade-i.pdf",
    });

    assert.equal(parsed.contractUrl, "48b73660-0682-4e5d-8d05-edcdba7e9c2c/1782220139735-lista-unidade-i.pdf");
  });

  it("continua aceitando URL pública legada para migração/compatibilidade", () => {
    const parsed = propertySchema.parse({
      ...baseProperty,
      contractUrl:
        "https://wmdsbwpqqpkmsowqpssj.supabase.co/storage/v1/object/public/property-contracts/48b73660-0682-4e5d-8d05-edcdba7e9c2c/1782220139735-lista-unidade-i.pdf",
    });

    assert.ok(parsed.contractUrl?.startsWith("https://"));
  });
});

describe("occupancy status", () => {
  it("separa situação do imóvel entre alugado e desalugado", () => {
    assert.equal(propertyOccupancyStatus(rentedProperty), "Alugado");
    assert.equal(propertyOccupancyStatus(unrentedProperty), "Desalugado");
  });

  it("não considera imóvel desalugado em receita contratada, recebida ou pendente", () => {
    const paidRentedProperty = { ...rentedProperty, id: "apt-103", isRentPaid: true, rentAmount: 1800 } satisfies PropertyRecord;
    const portfolio = [paidRentedProperty, unrentedProperty];

    assert.equal(monthlyRevenue(portfolio), 1800);
    assert.equal(receivedRevenue(portfolio), 1800);
    assert.equal(pendingRevenue(portfolio), 0);
    assert.equal(paidRentCount(portfolio), 1);
    assert.equal(pendingRentCount(portfolio), 0);
  });

  it("filtra imóveis alugados e desalugados sem depender de contrato vigente", () => {
    const portfolio = [rentedProperty, unrentedProperty];

    assert.deepEqual(filterProperties(portfolio, "rented").map((item) => item.id), ["apt-101"]);
    assert.deepEqual(filterProperties(portfolio, "unrented").map((item) => item.id), ["apt-102"]);
  });

  it("não gera alertas de contrato, inquilino, banco ou aluguel pendente para imóvel desalugado", () => {
    const alerts = getPropertyAlerts(unrentedProperty);

    assert.deepEqual(alerts, []);
  });

  it("resume carteira separando alugados de desalugados", () => {
    const summary = summarizePortfolio([rentedProperty, unrentedProperty]);

    assert.equal(summary.propertyCount, 2);
    assert.equal(summary.rentedCount, 1);
    assert.equal(summary.grossRent, rentedProperty.rentAmount);
    assert.equal(summary.pendingRent, rentedProperty.rentAmount);
  });

  it("explica datas invertidas como alerta crítico", () => {
    const alerts = getPropertyAlerts(
      {
        ...rentedProperty,
        contractStartDate: "2030-01-01",
        contractEndDate: "2020-01-01",
      },
      "2026-07-13",
    );

    assert.ok(alerts.some((alert) => alert.severity === "danger" && /inconsistentes/i.test(alert.label)));
  });

  it("explica contrato vencido como alerta crítico", () => {
    const alerts = getPropertyAlerts(
      { ...rentedProperty, contractEndDate: "2020-01-01" },
      "2026-07-13",
    );

    assert.ok(alerts.some((alert) => alert.severity === "danger" && /vencido/i.test(alert.label)));
  });
});
