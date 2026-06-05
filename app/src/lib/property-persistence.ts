import type { PropertyDraft } from "./property-draft";
import { propertyFromDraft } from "./property-draft";
import type { PropertyRecord } from "./rentals";

export type PropertyMutationMode = "create" | "edit";

export type SupabasePropertyMutationPayload = {
  building_name: string;
  property_address: string | null;
  is_rented: boolean;
  tenant_name: string | null;
  tenant_contact: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  has_annual_adjustment: boolean;
  rent_adjustment_base_date: string | null;
  rent_adjustment_index: string | null;
  contract_notes: string | null;
  payment_due_date: string | null;
  is_rent_paid: boolean;
  rent_amount: number;
  condo_amount: number;
  condo_payment_date: string | null;
  condo_paid_by_tenant: boolean;
  extra_fee_amount: number | null;
  extra_fee_paid_by_tenant: boolean;
  unexpected_costs_amount: number | null;
  unexpected_costs_notes: string | null;
  maintenance_amount: number | null;
  maintenance_paid_by_tenant: boolean;
  iptu_amount: number | null;
  iptu_paid_by_tenant: boolean;
  garbage_fee_amount: number | null;
  laudemio_amount: number | null;
  contract_url: string | null;
  owner_id: string;
  receiving_bank: string | null;
  has_rent_deposit: boolean;
  source_label: string | null;
  source_reference_month: string | null;
  source_is_outdated: boolean;
};

type BuildPayloadOptions = {
  userId: string;
  mode: PropertyMutationMode;
  current?: PropertyRecord;
};

function nullable(value: string | undefined) {
  return value ?? null;
}

function nullableNumber(value: number | undefined) {
  return value ?? null;
}

export function buildPropertyMutationPayload(
  draft: PropertyDraft,
  { userId, current }: BuildPayloadOptions,
): SupabasePropertyMutationPayload {
  const property = propertyFromDraft(draft, current);

  return {
    building_name: property.buildingName,
    property_address: nullable(property.propertyAddress),
    is_rented: property.isRented,
    tenant_name: nullable(property.tenantName),
    tenant_contact: nullable(property.tenantContact),
    contract_start_date: nullable(property.contractStartDate),
    contract_end_date: nullable(property.contractEndDate),
    has_annual_adjustment: property.hasAnnualAdjustment ?? false,
    rent_adjustment_base_date: nullable(property.rentAdjustmentBaseDate),
    rent_adjustment_index: nullable(property.rentAdjustmentIndex),
    contract_notes: nullable(property.contractNotes),
    payment_due_date: nullable(property.paymentDueDate),
    is_rent_paid: property.isRentPaid,
    rent_amount: property.rentAmount,
    condo_amount: property.condoAmount,
    condo_payment_date: nullable(property.condoPaymentDate),
    condo_paid_by_tenant: property.condoPaidByTenant,
    extra_fee_amount: nullableNumber(property.extraFeeAmount),
    extra_fee_paid_by_tenant: property.extraFeePaidByTenant,
    unexpected_costs_amount: nullableNumber(property.unexpectedCostsAmount),
    unexpected_costs_notes: nullable(property.unexpectedCostsNotes),
    maintenance_amount: nullableNumber(property.maintenanceAmount),
    maintenance_paid_by_tenant: property.maintenancePaidByTenant,
    iptu_amount: nullableNumber(property.iptuAmount),
    iptu_paid_by_tenant: property.iptuPaidByTenant,
    garbage_fee_amount: nullableNumber(property.garbageFeeAmount),
    laudemio_amount: nullableNumber(property.laudemioAmount),
    contract_url: nullable(property.contractUrl),
    owner_id: userId,
    receiving_bank: nullable(property.receivingBank),
    has_rent_deposit: property.hasRentDeposit,
    source_label: null,
    source_reference_month: null,
    source_is_outdated: false,
  };
}
