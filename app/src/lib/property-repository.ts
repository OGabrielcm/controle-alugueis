import { properties as mockProperties, propertySchema, sourceData, type PropertyRecord } from "@/lib/rentals";
import { supabase } from "@/lib/supabase";

export type PropertyDataSource = {
  label: string;
  referenceMonth: string;
  status: "mock" | "supabase" | "fallback";
  note: string;
};

export type PropertyRepositoryResult = {
  properties: PropertyRecord[];
  dataSource: PropertyDataSource;
};

export type SupabasePropertyRow = {
  id: string;
  building_name: string;
  property_address: string | null;
  is_rented: boolean | null;
  tenant_name: string | null;
  tenant_contact: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  has_annual_adjustment: boolean | null;
  rent_adjustment_base_date: string | null;
  rent_adjustment_index: string | null;
  contract_notes: string | null;
  payment_due_date: string | null;
  is_rent_paid: boolean | null;
  rent_amount: number | string | null;
  condo_amount: number | string | null;
  condo_payment_date: string | null;
  condo_paid_by_tenant: boolean | null;
  extra_fee_amount: number | string | null;
  extra_fee_paid_by_tenant: boolean | null;
  unexpected_costs_amount: number | string | null;
  unexpected_costs_notes: string | null;
  maintenance_amount: number | string | null;
  maintenance_paid_by_tenant: boolean | null;
  iptu_amount: number | string | null;
  iptu_paid_by_tenant: boolean | null;
  garbage_fee_amount: number | string | null;
  laudemio_amount: number | string | null;
  contract_url: string | null;
  owner_id: string | null;
  receiving_bank: string | null;
  has_rent_deposit: boolean | null;
  source_label: string | null;
  source_reference_month: string | null;
  source_is_outdated: boolean | null;
};

export const propertyColumns = [
  "id",
  "building_name",
  "property_address",
  "is_rented",
  "tenant_name",
  "tenant_contact",
  "contract_start_date",
  "contract_end_date",
  "has_annual_adjustment",
  "rent_adjustment_base_date",
  "rent_adjustment_index",
  "contract_notes",
  "payment_due_date",
  "is_rent_paid",
  "rent_amount",
  "condo_amount",
  "condo_payment_date",
  "condo_paid_by_tenant",
  "extra_fee_amount",
  "extra_fee_paid_by_tenant",
  "unexpected_costs_amount",
  "unexpected_costs_notes",
  "maintenance_amount",
  "maintenance_paid_by_tenant",
  "iptu_amount",
  "iptu_paid_by_tenant",
  "garbage_fee_amount",
  "laudemio_amount",
  "contract_url",
  "owner_id",
  "receiving_bank",
  "has_rent_deposit",
  "source_label",
  "source_reference_month",
  "source_is_outdated",
].join(",");

const mockDataSource: PropertyDataSource = {
  label: sourceData.label,
  referenceMonth: sourceData.referenceMonth,
  status: "mock",
  note: `${sourceData.note} Supabase ainda não está configurado; usando fallback local.`,
};

function fallbackDataSource(reason: string): PropertyDataSource {
  return {
    label: sourceData.label,
    referenceMonth: sourceData.referenceMonth,
    status: "fallback",
    note: `${sourceData.note} Supabase não pôde ser lido (${reason}); usando fallback local.`,
  };
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined;
  return Number(value);
}

function optionalString(value: string | null | undefined) {
  return value || undefined;
}

export function mapSupabaseRow(row: SupabasePropertyRow): PropertyRecord {
  const mapped = {
    id: row.id,
    buildingName: row.building_name,
    propertyAddress: optionalString(row.property_address),
    isRented: row.is_rented ?? false,
    tenantName: optionalString(row.tenant_name),
    tenantContact: optionalString(row.tenant_contact),
    contractStartDate: optionalString(row.contract_start_date),
    contractEndDate: optionalString(row.contract_end_date),
    hasAnnualAdjustment: row.has_annual_adjustment ?? false,
    rentAdjustmentBaseDate: optionalString(row.rent_adjustment_base_date),
    rentAdjustmentIndex: optionalString(row.rent_adjustment_index),
    contractNotes: optionalString(row.contract_notes),
    paymentDueDate: optionalString(row.payment_due_date),
    isRentPaid: row.is_rent_paid ?? false,
    rentAmount: toNumber(row.rent_amount) ?? 0,
    condoAmount: toNumber(row.condo_amount) ?? 0,
    condoPaymentDate: optionalString(row.condo_payment_date),
    condoPaidByTenant: row.condo_paid_by_tenant ?? false,
    extraFeeAmount: toNumber(row.extra_fee_amount),
    extraFeePaidByTenant: row.extra_fee_paid_by_tenant ?? false,
    unexpectedCostsAmount: toNumber(row.unexpected_costs_amount),
    unexpectedCostsNotes: optionalString(row.unexpected_costs_notes),
    maintenanceAmount: toNumber(row.maintenance_amount),
    maintenancePaidByTenant: row.maintenance_paid_by_tenant ?? false,
    iptuAmount: toNumber(row.iptu_amount),
    iptuPaidByTenant: row.iptu_paid_by_tenant ?? false,
    garbageFeeAmount: toNumber(row.garbage_fee_amount),
    laudemioAmount: toNumber(row.laudemio_amount),
    contractUrl: optionalString(row.contract_url),
    receivingBank: optionalString(row.receiving_bank),
    hasRentDeposit: row.has_rent_deposit ?? false,
  };

  return propertySchema.parse(mapped);
}

function supabaseDataSource(row?: SupabasePropertyRow): PropertyDataSource {
  const sourceLabel = row?.source_label || "Supabase: public.properties";
  const referenceMonth = row?.source_reference_month || "Dados persistidos";
  const outdatedNote = row?.source_is_outdated ? " A fonte marcada no banco ainda está desatualizada." : "";

  return {
    label: sourceLabel,
    referenceMonth,
    status: "supabase",
    note: `Dados carregados do Supabase em tempo de execução.${outdatedNote}`,
  };
}

export async function getProperties(): Promise<PropertyRepositoryResult> {
  if (!supabase) {
    return {
      properties: mockProperties,
      dataSource: mockDataSource,
    };
  }

  const { data, error } = await supabase
    .from("properties")
    .select(propertyColumns)
    .order("building_name", { ascending: true });

  if (error) {
    return {
      properties: mockProperties,
      dataSource: fallbackDataSource(error.message),
    };
  }

  if (!data || data.length === 0) {
    return {
      properties: mockProperties,
      dataSource: fallbackDataSource("tabela properties vazia"),
    };
  }

  try {
    const rows = data as unknown as SupabasePropertyRow[];
    return {
      properties: rows.map(mapSupabaseRow),
      dataSource: supabaseDataSource(rows[0]),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro de validação desconhecido";

    return {
      properties: mockProperties,
      dataSource: fallbackDataSource(message),
    };
  }
}
