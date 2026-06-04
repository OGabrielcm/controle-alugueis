import type { PropertyRecord } from "./rentals";

export type PropertyDraft = {
  id?: string;
  buildingName: string;
  propertyAddress: string;
  tenantName: string;
  tenantContact: string;
  paymentDueDate: string;
  rentAmount: string;
  receivingBank: string;
  isRented: boolean;
  isRentPaid: boolean;
  contractStartDate: string;
  contractEndDate: string;
  hasAnnualAdjustment: boolean;
  rentAdjustmentBaseDate: string;
  rentAdjustmentIndex: string;
  contractNotes: string;
};

export const emptyPropertyDraft: PropertyDraft = {
  buildingName: "",
  propertyAddress: "",
  tenantName: "",
  tenantContact: "",
  paymentDueDate: "",
  rentAmount: "0",
  receivingBank: "",
  isRented: true,
  isRentPaid: false,
  contractStartDate: "",
  contractEndDate: "",
  hasAnnualAdjustment: false,
  rentAdjustmentBaseDate: "",
  rentAdjustmentIndex: "",
  contractNotes: "",
};

function optionalTrim(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function draftFromProperty(property: PropertyRecord): PropertyDraft {
  return {
    id: property.id,
    buildingName: property.buildingName,
    propertyAddress: property.propertyAddress ?? "",
    tenantName: property.tenantName ?? "",
    tenantContact: property.tenantContact ?? "",
    paymentDueDate: property.paymentDueDate ?? "",
    rentAmount: property.rentAmount.toString(),
    receivingBank: property.receivingBank ?? "",
    isRented: property.isRented,
    isRentPaid: property.isRentPaid,
    contractStartDate: property.contractStartDate ?? "",
    contractEndDate: property.contractEndDate ?? "",
    hasAnnualAdjustment: property.hasAnnualAdjustment ?? false,
    rentAdjustmentBaseDate: property.rentAdjustmentBaseDate ?? "",
    rentAdjustmentIndex: property.rentAdjustmentIndex ?? "",
    contractNotes: property.contractNotes ?? "",
  };
}

export function propertyFromDraft(draft: PropertyDraft, current?: PropertyRecord): PropertyRecord {
  const rentAmount = Number(draft.rentAmount.replace(",", "."));
  const hasAnnualAdjustment = draft.hasAnnualAdjustment;

  return {
    id: current?.id ?? draft.id ?? `local-${Date.now()}`,
    buildingName: draft.buildingName.trim(),
    propertyAddress: optionalTrim(draft.propertyAddress),
    isRented: draft.isRented,
    tenantName: optionalTrim(draft.tenantName),
    tenantContact: optionalTrim(draft.tenantContact),
    contractStartDate: optionalTrim(draft.contractStartDate),
    contractEndDate: optionalTrim(draft.contractEndDate),
    hasAnnualAdjustment,
    rentAdjustmentBaseDate: hasAnnualAdjustment ? optionalTrim(draft.rentAdjustmentBaseDate) : undefined,
    rentAdjustmentIndex: hasAnnualAdjustment ? optionalTrim(draft.rentAdjustmentIndex) : undefined,
    contractNotes: optionalTrim(draft.contractNotes),
    paymentDueDate: draft.paymentDueDate || undefined,
    isRentPaid: draft.isRentPaid,
    rentAmount,
    condoAmount: current?.condoAmount ?? 0,
    condoPaymentDate: current?.condoPaymentDate,
    condoPaidByTenant: current?.condoPaidByTenant ?? false,
    extraFeeAmount: current?.extraFeeAmount,
    extraFeePaidByTenant: current?.extraFeePaidByTenant ?? false,
    unexpectedCostsAmount: current?.unexpectedCostsAmount,
    unexpectedCostsNotes: current?.unexpectedCostsNotes,
    maintenanceAmount: current?.maintenanceAmount,
    maintenancePaidByTenant: current?.maintenancePaidByTenant ?? false,
    iptuAmount: current?.iptuAmount,
    iptuPaidByTenant: current?.iptuPaidByTenant ?? false,
    garbageFeeAmount: current?.garbageFeeAmount,
    laudemioAmount: current?.laudemioAmount,
    contractUrl: current?.contractUrl,
    receivingBank: optionalTrim(draft.receivingBank),
    hasRentDeposit: current?.hasRentDeposit ?? false,
  };
}
