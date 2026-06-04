import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import type { PropertyRecord } from "./rentals";
import { findPropertyById } from "./property-detail";

const sampleProperties: PropertyRecord[] = [
  {
    id: "apt-101",
    buildingName: "Apt. 101",
    isRented: true,
    tenantName: "Maria",
    paymentDueDate: "2026-06-10",
    isRentPaid: false,
    rentAmount: 2500,
    condoAmount: 600,
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    hasRentDeposit: false,
  },
  {
    id: "sala-202",
    buildingName: "Sala 202",
    isRented: false,
    isRentPaid: false,
    rentAmount: 0,
    condoAmount: 0,
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    hasRentDeposit: false,
  },
];

describe("findPropertyById", () => {
  it("retorna o imóvel pelo id exato", () => {
    const property = findPropertyById(sampleProperties, "apt-101");

    assert.equal(property?.buildingName, "Apt. 101");
  });

  it("decodifica ids recebidos da rota dinâmica", () => {
    const property = findPropertyById(sampleProperties, encodeURIComponent("sala-202"));

    assert.equal(property?.buildingName, "Sala 202");
  });

  it("retorna undefined quando o imóvel não existe", () => {
    const property = findPropertyById(sampleProperties, "nao-existe");

    assert.equal(property, undefined);
  });
});
