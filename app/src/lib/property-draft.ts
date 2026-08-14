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

export const PROPERTY_TEXT_LIMITS = {
  buildingName: 120,
  propertyAddress: 240,
  tenantName: 120,
  tenantContact: 120,
  receivingBank: 120,
  rentAdjustmentIndex: 120,
  contractNotes: 2000,
} as const;

const textFields = [
  ["buildingName", "Nome do imóvel"],
  ["propertyAddress", "Endereço/identificação"],
  ["tenantName", "Nome do inquilino"],
  ["tenantContact", "Contato do inquilino"],
  ["receivingBank", "Banco de recebimento"],
  ["rentAdjustmentIndex", "Índice/cláusula"],
  ["contractNotes", "Observações contratuais"],
] as const;

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

export function getPropertyDraftValidationError(draft: PropertyDraft) {
  if (!draft.buildingName.trim()) {
    return "Informe o nome do imóvel.";
  }

  const rentAmount = Number(draft.rentAmount.replace(",", "."));
  if (!Number.isFinite(rentAmount) || rentAmount < 0) {
    return "Informe um aluguel válido maior ou igual a zero.";
  }

  if (draft.contractStartDate && draft.contractEndDate && draft.contractEndDate < draft.contractStartDate) {
    return "O vencimento do contrato não pode ser anterior ao início.";
  }

  for (const [field, label] of textFields) {
    const limit = PROPERTY_TEXT_LIMITS[field];
    if (draft[field].trim().length > limit) {
      return `O campo ${label.toLowerCase()} deve ter no máximo ${limit} caracteres.`;
    }
  }

  return undefined;
}

export function hasExpiredActiveContract(draft: PropertyDraft, referenceDate: string) {
  return Boolean(draft.isRented && draft.contractEndDate && draft.contractEndDate < referenceDate);
}

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
