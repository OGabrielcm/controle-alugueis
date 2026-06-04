import type { AlertSeverity, PropertyRecord } from "./rentals";
import { formatDate } from "./rentals";

export type ContractAgendaKind =
  | "contract-expiration"
  | "rent-adjustment"
  | "missing-contract-end"
  | "missing-adjustment-rule";

export type ContractAgendaItem = {
  id: string;
  propertyId: string;
  propertyName: string;
  kind: ContractAgendaKind;
  severity: AlertSeverity;
  title: string;
  description: string;
  date?: string;
  daysUntil?: number;
};

export type ContractAgendaSummary = {
  total: number;
  overdue: number;
  dueSoon: number;
  missingData: number;
  info: number;
};

export type ContractAgenda = {
  items: ContractAgendaItem[];
  summary: ContractAgendaSummary;
};

const CONTRACT_EXPIRATION_WINDOW_DAYS = 90;
const RENT_ADJUSTMENT_WINDOW_DAYS = 45;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function normalizeDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(Date.UTC(year, month - 1, day));
}

function toDateOnlyString(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function daysBetween(referenceDate: string, targetDate: string) {
  const reference = normalizeDateOnly(referenceDate);
  const target = normalizeDateOnly(targetDate);

  if (!reference || !target) return undefined;

  return Math.round((target.getTime() - reference.getTime()) / DAY_IN_MS);
}

export function getTodayDateString(now = new Date()) {
  return toDateOnlyString(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function getNextAnnualAdjustmentDate(baseDate: string, referenceDate: string) {
  const base = normalizeDateOnly(baseDate);
  const reference = normalizeDateOnly(referenceDate);

  if (!base || !reference) return undefined;

  const baseMonth = base.getUTCMonth();
  const baseDay = base.getUTCDate();
  let next = new Date(Date.UTC(reference.getUTCFullYear(), baseMonth, baseDay));

  if (next.getTime() < reference.getTime()) {
    next = new Date(Date.UTC(reference.getUTCFullYear() + 1, baseMonth, baseDay));
  }

  return toDateOnlyString(next);
}

function severityForDaysUntil(daysUntil: number, warningWindowDays: number): AlertSeverity | undefined {
  if (daysUntil < 0) return "danger";
  if (daysUntil <= warningWindowDays) return "warning";
  return undefined;
}

function buildContractExpirationItem(property: PropertyRecord, referenceDate: string): ContractAgendaItem | undefined {
  if (!property.contractEndDate) {
    return {
      id: `${property.id}:missing-contract-end`,
      propertyId: property.id,
      propertyName: property.buildingName,
      kind: "missing-contract-end",
      severity: "warning",
      title: "Contrato sem vencimento",
      description: "Cadastre a data final para conseguir antecipar renovação ou encerramento.",
    };
  }

  const daysUntil = daysBetween(referenceDate, property.contractEndDate);
  if (daysUntil === undefined) return undefined;

  const severity = severityForDaysUntil(daysUntil, CONTRACT_EXPIRATION_WINDOW_DAYS);
  if (!severity) return undefined;

  const title = daysUntil < 0 ? "Contrato vencido" : "Contrato próximo do vencimento";
  const description =
    daysUntil < 0
      ? `Venceu em ${formatDate(property.contractEndDate)}. Priorize renovação ou regularização.`
      : `Vence em ${formatDate(property.contractEndDate)}. Antecipe contato com o inquilino.`;

  return {
    id: `${property.id}:contract-expiration`,
    propertyId: property.id,
    propertyName: property.buildingName,
    kind: "contract-expiration",
    severity,
    title,
    description,
    date: property.contractEndDate,
    daysUntil,
  };
}

function buildRentAdjustmentItem(property: PropertyRecord, referenceDate: string): ContractAgendaItem | undefined {
  if (!property.hasAnnualAdjustment) {
    return {
      id: `${property.id}:missing-adjustment-rule`,
      propertyId: property.id,
      propertyName: property.buildingName,
      kind: "missing-adjustment-rule",
      severity: "warning",
      title: "Sem regra de reajuste",
      description: "Informe se o contrato tem reajuste anual, índice e data base.",
    };
  }

  if (!property.rentAdjustmentBaseDate) {
    return {
      id: `${property.id}:missing-adjustment-rule`,
      propertyId: property.id,
      propertyName: property.buildingName,
      kind: "missing-adjustment-rule",
      severity: "warning",
      title: "Reajuste sem data base",
      description: "A cláusula anual está ativa, mas falta a data base do reajuste.",
    };
  }

  const nextAdjustmentDate = getNextAnnualAdjustmentDate(property.rentAdjustmentBaseDate, referenceDate);
  if (!nextAdjustmentDate) return undefined;

  const daysUntil = daysBetween(referenceDate, nextAdjustmentDate);
  if (daysUntil === undefined) return undefined;

  const severity = severityForDaysUntil(daysUntil, RENT_ADJUSTMENT_WINDOW_DAYS);
  if (!severity) return undefined;

  const index = property.rentAdjustmentIndex ? ` pelo ${property.rentAdjustmentIndex}` : "";

  return {
    id: `${property.id}:rent-adjustment`,
    propertyId: property.id,
    propertyName: property.buildingName,
    kind: "rent-adjustment",
    severity,
    title: daysUntil < 0 ? "Reajuste atrasado" : "Reajuste próximo",
    description: `Reajuste previsto para ${formatDate(nextAdjustmentDate)}${index}.`,
    date: nextAdjustmentDate,
    daysUntil,
  };
}

export function sortAgendaItemsByPriority(items: ContractAgendaItem[]) {
  const severityWeight: Record<AlertSeverity, number> = {
    danger: 0,
    warning: 1,
    info: 2,
  };

  return [...items].sort((a, b) => {
    const severityDiff = severityWeight[a.severity] - severityWeight[b.severity];
    if (severityDiff !== 0) return severityDiff;

    const aDays = a.daysUntil ?? Number.POSITIVE_INFINITY;
    const bDays = b.daysUntil ?? Number.POSITIVE_INFINITY;
    if (aDays !== bDays) return aDays - bDays;

    return a.propertyName.localeCompare(b.propertyName, "pt-BR");
  });
}

export function buildContractAgenda(items: PropertyRecord[], referenceDate = getTodayDateString()): ContractAgenda {
  const agendaItems = items
    .filter((property) => property.isRented)
    .flatMap((property) => [
      buildContractExpirationItem(property, referenceDate),
      buildRentAdjustmentItem(property, referenceDate),
    ])
    .filter((item): item is ContractAgendaItem => Boolean(item));

  const sortedItems = sortAgendaItemsByPriority(agendaItems);

  return {
    items: sortedItems,
    summary: {
      total: sortedItems.length,
      overdue: sortedItems.filter((item) => item.daysUntil !== undefined && item.daysUntil < 0).length,
      dueSoon: sortedItems.filter((item) => item.daysUntil !== undefined && item.daysUntil >= 0 && item.severity === "warning").length,
      missingData: sortedItems.filter((item) => item.kind === "missing-contract-end" || item.kind === "missing-adjustment-rule").length,
      info: sortedItems.filter((item) => item.severity === "info").length,
    },
  };
}
