import { z } from "zod";

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
  unexpectedCostsNotes: z.string().optional(),
  maintenanceAmount: z.number().min(0).optional(),
  maintenancePaidByTenant: z.boolean(),
  iptuAmount: z.number().min(0).optional(),
  iptuPaidByTenant: z.boolean(),
  laudemioAmount: z.number().min(0).optional(),
  contractUrl: z.string().url().optional(),
});

export type PropertyRecord = z.infer<typeof propertySchema>;

export const properties: PropertyRecord[] = [
  {
    id: "marcella-sala-101",
    buildingName: "Marcella sala 101",
    isRented: true,
    tenantName: "Erik",
    contractEndDate: "2023-10-15",
    paymentDueDate: "2027-10-15",
    isCurrent: true,
    rentAmount: 1900,
    condoAmount: 350,
    condoPaidByTenant: true,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
  },
  {
    id: "marcella-sala-102",
    buildingName: "Marcella sala 102",
    isRented: true,
    tenantName: "Ricardo",
    contractEndDate: "2026-02-01",
    paymentDueDate: "2026-02-01",
    isCurrent: true,
    rentAmount: 5000,
    condoAmount: 350,
    condoPaidByTenant: true,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
  },
  {
    id: "marcella-102",
    buildingName: "Marcella 102",
    isRented: true,
    tenantName: "Edilma",
    contractEndDate: "2026-02-01",
    paymentDueDate: "2026-02-01",
    isCurrent: true,
    rentAmount: 1650,
    condoAmount: 350,
    condoPaidByTenant: true,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
  },
  {
    id: "marcella-103",
    buildingName: "Marcella 103",
    isRented: true,
    tenantName: "Rosa",
    contractEndDate: "2026-03-01",
    paymentDueDate: "2025-03-01",
    isCurrent: true,
    rentAmount: 1100,
    condoAmount: 350,
    condoPaidByTenant: true,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
  },
  {
    id: "home-service",
    buildingName: "Home service",
    isRented: true,
    tenantName: "Gustavo Fer...",
    contractEndDate: "2025-04-01",
    paymentDueDate: "2026-04-01",
    isCurrent: true,
    rentAmount: 2200,
    condoAmount: 769,
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
  },
  {
    id: "monti-fuji-403",
    buildingName: "Monti Fuji 403",
    isRented: true,
    tenantName: "Jardielson Soares",
    isCurrent: true,
    rentAmount: 2600,
    condoAmount: 638.88,
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuPaidByTenant: false,
  },
  {
    id: "monti-fuji-502",
    buildingName: "Monti Fuji 502",
    isRented: true,
    tenantName: "Jaciara Kellen",
    contractEndDate: "2025-07-25",
    paymentDueDate: "2024-07-25",
    isCurrent: true,
    rentAmount: 2620,
    condoAmount: 642.89,
    condoPaymentDate: "2024-07-10",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuAmount: 652.54,
    iptuPaidByTenant: true,
  },
  {
    id: "antonino-cavalcanti-1002",
    buildingName: "Antonino Cavalcanti 1002",
    isRented: true,
    tenantName: "Johnson Jonas de Oliveira",
    contractEndDate: "2026-02-01",
    paymentDueDate: "2025-02-01",
    isCurrent: true,
    rentAmount: 2800,
    condoAmount: 557.17,
    condoPaymentDate: "2025-02-10",
    condoPaidByTenant: false,
    extraFeePaidByTenant: false,
    maintenancePaidByTenant: false,
    iptuAmount: 746.82,
    iptuPaidByTenant: true,
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

export function pendingReviewCount(items: PropertyRecord[]) {
  return items.filter((item) => !item.contractEndDate || !item.tenantName).length;
}
