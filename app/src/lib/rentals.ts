import { z } from "zod";

export const sourceData = {
  label: "Aluguéis Prédios - Fevereiro.csv",
  referenceMonth: "Fevereiro/2023",
  status: "desatualizado",
  note: "Dados importados da planilha enviada por Mercês em CSV; servem como base estrutural e mock inicial, não como estado atual dos imóveis.",
} as const;

export const propertySchema = z.object({
  id: z.string(),
  buildingName: z.string().min(1),
  isRented: z.boolean(),
  tenantName: z.string().optional(),
  contractEndDate: z.string().optional(),
  paymentDueDate: z.string().optional(),
  isRentPaid: z.boolean(),
  rentAmount: z.number().min(0),
  condoAmount: z.number().min(0),
  condoPaymentDate: z.string().optional(),
  condoPaidByTenant: z.boolean(),
  extraFeeAmount: z.number().min(0).optional(),
  extraFeePaidByTenant: z.boolean(),
  unexpectedCostsAmount: z.number().min(0).optional(),
  unexpectedCostsNotes: z.string().optional(),
  maintenanceAmount: z.number().min(0).optional(),
  maintenancePaidByTenant: z.boolean(),
  iptuAmount: z.number().min(0).optional(),
  iptuPaidByTenant: z.boolean(),
  garbageFeeAmount: z.number().min(0).optional(),
  laudemioAmount: z.number().min(0).optional(),
  contractUrl: z.string().url().optional(),
  receivingBank: z.string().optional(),
  hasRentDeposit: z.boolean(),
});

export type PropertyRecord = z.infer<typeof propertySchema>;

export type AlertSeverity = "info" | "warning" | "danger";

export type PropertyAlert = {
  label: string;
  severity: AlertSeverity;
};

export type PortfolioSummary = {
  propertyCount: number;
  rentedCount: number;
  paidRentCount: number;
  pendingRentCount: number;
  grossRent: number;
  receivedRent: number;
  pendingRent: number;
  condoTotal: number;
  tenantPaidCondoTotal: number;
  ownerPaidCondoTotal: number;
  extraFeeTotal: number;
  unexpectedCostsTotal: number;
  maintenanceTotal: number;
  expensesTotal: number;
  estimatedBalance: number;
  pendingReviewCount: number;
  alertCount: number;
  dangerAlertCount: number;
};

export const properties: PropertyRecord[] = [
  {
    id: "l-kadoshi-108",
    buildingName: "L. KADOSHI 108",
    isRented: true,
    paymentDueDate: "2023-02-02",
    isRentPaid: true,
    rentAmount: 2521,
    condoAmount: 521.15,
    condoPaymentDate: "2023-02-20",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Sicredi",
    hasRentDeposit: false,
  },
  {
    id: "l-business-106",
    buildingName: "L.BUSINESS 106",
    isRented: true,
    paymentDueDate: "2023-02-01",
    isRentPaid: true,
    rentAmount: 1300,
    condoAmount: 600,
    condoPaymentDate: "2023-02-10",
    condoPaidByTenant: true,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Sicredi",
    hasRentDeposit: false,
  },
  {
    id: "l-marcella-02",
    buildingName: "L.Marcella 02",
    isRented: true,
    paymentDueDate: "2023-02-05",
    isRentPaid: true,
    rentAmount: 5000,
    condoAmount: 175,
    condoPaymentDate: "2023-02-28",
    condoPaidByTenant: true,
    extraFeeAmount: 33.5,
    extraFeePaidByTenant: true,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Caixa Econômica",
    hasRentDeposit: false,
  },
  {
    id: "apt-marcella-102",
    buildingName: "Apt. Marcella 102",
    isRented: true,
    paymentDueDate: "2023-02-01",
    isRentPaid: true,
    rentAmount: 1600,
    condoAmount: 350,
    condoPaymentDate: "2023-02-28",
    condoPaidByTenant: false,
    extraFeeAmount: 67,
    extraFeePaidByTenant: true,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Bradesco",
    hasRentDeposit: false,
  },
  {
    id: "apt-marcella-103",
    buildingName: "Apt. Marcella 103",
    isRented: true,
    paymentDueDate: "2023-02-01",
    isRentPaid: true,
    rentAmount: 1000,
    condoAmount: 350,
    condoPaymentDate: "2023-02-28",
    condoPaidByTenant: false,
    extraFeeAmount: 67,
    extraFeePaidByTenant: true,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Bradesco",
    hasRentDeposit: false,
  },
  {
    id: "apt-imp-hs-503",
    buildingName: "Apt. Imp H.S 503",
    isRented: true,
    paymentDueDate: "2023-02-05",
    isRentPaid: true,
    rentAmount: 1550,
    condoAmount: 634,
    condoPaymentDate: "2023-02-05",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Caixa Econômica",
    hasRentDeposit: false,
  },
  {
    id: "apt-m-fuji-403",
    buildingName: "Apt. M.Fuji 403",
    isRented: true,
    paymentDueDate: "2023-02-10",
    isRentPaid: true,
    rentAmount: 2260,
    condoAmount: 586.96,
    condoPaymentDate: "2023-02-10",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    unexpectedCostsAmount: 1691,
    unexpectedCostsNotes: "Energia",
    maintenanceAmount: 980,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Nubank",
    hasRentDeposit: true,
  },
  {
    id: "apt-m-fuji-502",
    buildingName: "Apt.M. Fuji 502",
    isRented: true,
    paymentDueDate: "2023-02-25",
    isRentPaid: false,
    rentAmount: 1800,
    condoAmount: 482.72,
    condoPaymentDate: "2023-02-10",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Bradesco",
    hasRentDeposit: false,
  },
  {
    id: "apt-a-sul-119",
    buildingName: "Apt. A.Sul 119",
    isRented: true,
    paymentDueDate: "2023-02-10",
    isRentPaid: true,
    rentAmount: 2000,
    condoAmount: 519.18,
    condoPaymentDate: "2023-02-05",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenanceAmount: 3335,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    receivingBank: "Bradesco",
    hasRentDeposit: true,
  },
  {
    id: "l-marcella-01",
    buildingName: "L. Marcella 01",
    isRented: true,
    paymentDueDate: "2023-02-16",
    isRentPaid: false,
    rentAmount: 1650,
    condoAmount: 175,
    condoPaymentDate: "2023-02-28",
    condoPaidByTenant: true,
    extraFeeAmount: 33.5,
    extraFeePaidByTenant: true,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    hasRentDeposit: false,
  },
  {
    id: "r-antonino-caval-1002",
    buildingName: "R. Antonino Caval 1002",
    isRented: true,
    paymentDueDate: "2023-02-17",
    isRentPaid: false,
    rentAmount: 1500,
    condoAmount: 480.64,
    condoPaymentDate: "2023-02-10",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
    hasRentDeposit: false,
  },
];

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value?: number) {
  return brl.format(value ?? 0);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function money(value?: number) {
  return value ?? 0;
}

export function propertyExpenseTotal(item: PropertyRecord) {
  const ownerPaidCondo = item.condoPaidByTenant ? 0 : item.condoAmount;
  const ownerPaidExtraFee = item.extraFeePaidByTenant ? 0 : money(item.extraFeeAmount);
  const ownerPaidMaintenance = item.maintenancePaidByTenant ? 0 : money(item.maintenanceAmount);
  const ownerPaidIptu = item.iptuPaidByTenant ? 0 : money(item.iptuAmount);

  return (
    ownerPaidCondo +
    ownerPaidExtraFee +
    money(item.unexpectedCostsAmount) +
    ownerPaidMaintenance +
    ownerPaidIptu +
    money(item.garbageFeeAmount) +
    money(item.laudemioAmount)
  );
}

export function monthlyRevenue(items: PropertyRecord[]) {
  return items.reduce((sum, item) => sum + item.rentAmount, 0);
}

export function receivedRevenue(items: PropertyRecord[]) {
  return items.reduce((sum, item) => sum + (item.isRentPaid ? item.rentAmount : 0), 0);
}

export function pendingRevenue(items: PropertyRecord[]) {
  return items.reduce((sum, item) => sum + (item.isRentPaid ? 0 : item.rentAmount), 0);
}

export function monthlyCondoTotal(items: PropertyRecord[]) {
  return items.reduce((sum, item) => sum + item.condoAmount, 0);
}

export function ownerPaidCondoTotal(items: PropertyRecord[]) {
  return items.reduce((sum, item) => sum + (item.condoPaidByTenant ? 0 : item.condoAmount), 0);
}

export function paidRentCount(items: PropertyRecord[]) {
  return items.filter((item) => item.isRentPaid).length;
}

export function pendingRentCount(items: PropertyRecord[]) {
  return items.filter((item) => !item.isRentPaid).length;
}

export function pendingReviewCount(items: PropertyRecord[]) {
  return items.filter((item) => !item.contractEndDate || !item.tenantName).length;
}

export function getPropertyAlerts(item: PropertyRecord): PropertyAlert[] {
  const alerts: PropertyAlert[] = [];

  if (item.isRented && !item.tenantName) {
    alerts.push({ label: "Sem inquilino informado", severity: "warning" });
  }

  if (item.isRented && !item.contractEndDate) {
    alerts.push({ label: "Sem data final de contrato", severity: "warning" });
  }

  if (item.isRented && !item.isRentPaid) {
    alerts.push({ label: "Aluguel pendente na base", severity: "danger" });
  }

  if (!item.receivingBank) {
    alerts.push({ label: "Banco de recebimento não informado", severity: "warning" });
  }

  if (money(item.maintenanceAmount) >= 1000) {
    alerts.push({ label: `Manutenção alta: ${formatCurrency(item.maintenanceAmount)}`, severity: "danger" });
  }

  if (money(item.unexpectedCostsAmount) > 0) {
    const note = item.unexpectedCostsNotes ? ` (${item.unexpectedCostsNotes})` : "";
    alerts.push({ label: `Imprevisto: ${formatCurrency(item.unexpectedCostsAmount)}${note}`, severity: "warning" });
  }

  if (item.hasRentDeposit) {
    alerts.push({ label: "Tem calção/caução registrado", severity: "info" });
  }

  return alerts;
}

export function primaryPropertyStatus(item: PropertyRecord) {
  const alerts = getPropertyAlerts(item);
  if (alerts.some((alert) => alert.severity === "danger")) return "Atenção";
  if (alerts.some((alert) => alert.severity === "warning")) return "Revisar";
  return "Ok";
}

export function summarizePortfolio(items: PropertyRecord[]): PortfolioSummary {
  const alerts = items.flatMap(getPropertyAlerts);
  const grossRent = monthlyRevenue(items);
  const expensesTotal = items.reduce((sum, item) => sum + propertyExpenseTotal(item), 0);
  const condoTotal = monthlyCondoTotal(items);
  const ownerCondoTotal = ownerPaidCondoTotal(items);
  const extraFeeTotal = items.reduce((sum, item) => sum + money(item.extraFeeAmount), 0);
  const unexpectedCostsTotal = items.reduce((sum, item) => sum + money(item.unexpectedCostsAmount), 0);
  const maintenanceTotal = items.reduce((sum, item) => sum + money(item.maintenanceAmount), 0);

  return {
    propertyCount: items.length,
    rentedCount: items.filter((item) => item.isRented).length,
    paidRentCount: paidRentCount(items),
    pendingRentCount: pendingRentCount(items),
    grossRent,
    receivedRent: receivedRevenue(items),
    pendingRent: pendingRevenue(items),
    condoTotal,
    tenantPaidCondoTotal: condoTotal - ownerCondoTotal,
    ownerPaidCondoTotal: ownerCondoTotal,
    extraFeeTotal,
    unexpectedCostsTotal,
    maintenanceTotal,
    expensesTotal,
    estimatedBalance: receivedRevenue(items) - expensesTotal,
    pendingReviewCount: pendingReviewCount(items),
    alertCount: alerts.length,
    dangerAlertCount: alerts.filter((alert) => alert.severity === "danger").length,
  };
}
