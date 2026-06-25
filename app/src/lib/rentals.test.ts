import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { propertySchema } from "./rentals";

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
