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
  isCurrent: z.boolean(),
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

export const properties: PropertyRecord[] = [
  {
    id: "l-kadoshi-108",
    buildingName: "L. KADOSHI 108",
    isRented: true,
    paymentDueDate: "2023-02-02",
    isCurrent: true,
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
    isCurrent: true,
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
    isCurrent: true,
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
    isCurrent: true,
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
    isCurrent: true,
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
    isCurrent: true,
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
    isCurrent: true,
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
    isCurrent: false,
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
    isCurrent: true,
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
    isCurrent: false,
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
    isCurrent: false,
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

export function monthlyRevenue(items: PropertyRecord[]) {
  return items.reduce((sum, item) => sum + item.rentAmount, 0);
}

export function monthlyCondoTotal(items: PropertyRecord[]) {
  return items.reduce((sum, item) => sum + item.condoAmount, 0);
}

export function paidRentCount(items: PropertyRecord[]) {
  return items.filter((item) => item.isCurrent).length;
}

export function pendingReviewCount(items: PropertyRecord[]) {
  return items.filter((item) => !item.contractEndDate || !item.tenantName).length;
}
