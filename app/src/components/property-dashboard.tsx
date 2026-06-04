"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  type PortfolioFilter,
  type PropertyRecord,
  filterProperties,
  formatCurrency,
  formatDate,
  getFilterOptions,
  getPropertyAlerts,
  getPriorityGroups,
  primaryPropertyStatus,
  propertyExpenseTotal,
  summarizePortfolio,
} from "@/lib/rentals";
import type { PropertyDataSource } from "@/lib/property-repository";

const alertStyles = {
  info: "bg-cyan-400/10 text-cyan-100 ring-cyan-300/20",
  warning: "bg-amber-400/10 text-amber-100 ring-amber-300/20",
  danger: "bg-red-400/10 text-red-100 ring-red-300/20",
};

const statusStyles = {
  Ok: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
  Revisar: "bg-amber-400/10 text-amber-100 ring-amber-300/20",
  Atenção: "bg-red-400/10 text-red-100 ring-red-300/20",
};

type PropertyDashboardProps = {
  properties: PropertyRecord[];
  dataSource: PropertyDataSource;
  supabaseReady: boolean;
};

type PropertyDraft = {
  id?: string;
  buildingName: string;
  tenantName: string;
  paymentDueDate: string;
  rentAmount: string;
  receivingBank: string;
  isRented: boolean;
  isRentPaid: boolean;
};

const emptyDraft: PropertyDraft = {
  buildingName: "",
  tenantName: "",
  paymentDueDate: "",
  rentAmount: "0",
  receivingBank: "",
  isRented: true,
  isRentPaid: false,
};

function draftFromProperty(property: PropertyRecord): PropertyDraft {
  return {
    id: property.id,
    buildingName: property.buildingName,
    tenantName: property.tenantName ?? "",
    paymentDueDate: property.paymentDueDate ?? "",
    rentAmount: property.rentAmount.toString(),
    receivingBank: property.receivingBank ?? "",
    isRented: property.isRented,
    isRentPaid: property.isRentPaid,
  };
}

function propertyFromDraft(draft: PropertyDraft, current?: PropertyRecord): PropertyRecord {
  const rentAmount = Number(draft.rentAmount.replace(",", "."));

  return {
    id: current?.id ?? draft.id ?? `local-${Date.now()}`,
    buildingName: draft.buildingName.trim(),
    isRented: draft.isRented,
    tenantName: draft.tenantName.trim() || undefined,
    contractEndDate: current?.contractEndDate,
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
    receivingBank: draft.receivingBank.trim() || undefined,
    hasRentDeposit: current?.hasRentDeposit ?? false,
  };
}

export function PropertyDashboard({ properties, dataSource, supabaseReady }: PropertyDashboardProps) {
  const [managedProperties, setManagedProperties] = useState<PropertyRecord[]>(() => properties);
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("all");
  const [draft, setDraft] = useState<PropertyDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const hasLocalChanges = managedProperties !== properties;
  const summary = useMemo(() => summarizePortfolio(managedProperties), [managedProperties]);
  const filterOptions = useMemo(() => getFilterOptions(managedProperties), [managedProperties]);
  const filteredProperties = useMemo(
    () => filterProperties(managedProperties, activeFilter),
    [managedProperties, activeFilter],
  );
  const filteredSummary = useMemo(() => summarizePortfolio(filteredProperties), [filteredProperties]);
  const priorities = useMemo(() => getPriorityGroups(managedProperties), [managedProperties]);

  function openNewPropertyForm() {
    setDraft(emptyDraft);
    setFormError(null);
  }

  function openEditPropertyForm(property: PropertyRecord) {
    setDraft(draftFromProperty(property));
    setFormError(null);
  }

  function cancelDraft() {
    setDraft(null);
    setFormError(null);
  }

  function resetLocalChanges() {
    setManagedProperties(properties);
    setDraft(null);
    setFormError(null);
    setActiveFilter("all");
  }

  function saveDraft() {
    if (!draft) return;

    const buildingName = draft.buildingName.trim();
    const rentAmount = Number(draft.rentAmount.replace(",", "."));

    if (!buildingName) {
      setFormError("Informe o nome do imóvel.");
      return;
    }

    if (!Number.isFinite(rentAmount) || rentAmount < 0) {
      setFormError("Informe um aluguel válido maior ou igual a zero.");
      return;
    }

    setManagedProperties((currentProperties) => {
      const current = draft.id ? currentProperties.find((property) => property.id === draft.id) : undefined;
      const saved = propertyFromDraft(draft, current);

      if (!current) {
        return [saved, ...currentProperties];
      }

      return currentProperties.map((property) => (property.id === saved.id ? saved : property));
    });

    setDraft(null);
    setFormError(null);
    setActiveFilter("all");
  }

  const stats = [
    {
      label: "Receita prevista",
      value: formatCurrency(summary.grossRent),
      hint: `${summary.propertyCount} imóveis mapeados`,
    },
    {
      label: "Receita recebida",
      value: formatCurrency(summary.receivedRent),
      hint: `${summary.paidRentCount}/${summary.propertyCount} aluguéis pagos`,
    },
    {
      label: "Receita pendente",
      value: formatCurrency(summary.pendingRent),
      hint: `${summary.pendingRentCount} aluguéis pendentes`,
    },
    {
      label: "Saldo estimado",
      value: formatCurrency(summary.estimatedBalance),
      hint: "Recebido - despesas do proprietário",
    },
    {
      label: "Despesas totais",
      value: formatCurrency(summary.expensesTotal),
      hint: "Condomínio, taxas, imprevistos e manutenção",
    },
    {
      label: "Condomínio dono",
      value: formatCurrency(summary.ownerPaidCondoTotal),
      hint: "Parte não paga pelo cliente",
    },
    {
      label: "Revisar dados",
      value: summary.pendingReviewCount.toString(),
      hint: "Campos essenciais incompletos",
    },
    {
      label: "Alertas críticos",
      value: summary.dangerAlertCount.toString(),
      hint: `${summary.alertCount} alertas totais`,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/30 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200 ring-1 ring-cyan-300/20">
              Node.js + Supabase + Vercel
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Controle de aluguéis
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Dashboard operacional baseado no CSV da planilha: filtros, prioridades,
              receita, despesas e alertas para orientar o próximo passo.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            Supabase: {supabaseReady ? "configurado" : "aguardando .env.local"}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-50">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-semibold">Base de dados: {dataSource.label}</p>
              <p className="mt-1 text-sm text-amber-100/80">
                Referência {dataSource.referenceMonth} — {dataSource.status}. {dataSource.note}
              </p>
              <p className="mt-2 text-sm text-amber-100/80">
                Esta etapa adicionou cadastro e edição local para validar o fluxo antes de persistir no Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="w-fit rounded-full bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 ring-1 ring-amber-100/20">
                {dataSource.status}
              </span>
              {hasLocalChanges ? (
                <span className="w-fit rounded-full bg-cyan-300/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-50 ring-1 ring-cyan-100/20">
                  rascunho local
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.hint}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-4 xl:grid-cols-4">
          <article className="rounded-2xl border border-red-300/20 bg-red-400/[0.06] p-5">
            <p className="text-sm font-semibold text-red-100">Aluguéis pendentes</p>
            <p className="mt-2 text-3xl font-bold">{priorities.pendingRent.length}</p>
            <PriorityList items={priorities.pendingRent} empty="Nenhum aluguel pendente na base." />
          </article>

          <article className="rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] p-5">
            <p className="text-sm font-semibold text-amber-100">Dados incompletos</p>
            <p className="mt-2 text-3xl font-bold">{priorities.incompleteData.length}</p>
            <PriorityList items={priorities.incompleteData} empty="Nenhum imóvel com dados incompletos." />
          </article>

          <article className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/[0.06] p-5">
            <p className="text-sm font-semibold text-fuchsia-100">Despesas altas</p>
            <p className="mt-2 text-3xl font-bold">{priorities.highExpenses.length}</p>
            <PriorityList items={priorities.highExpenses} empty="Nenhuma despesa alta identificada." />
          </article>

          <article className="rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.06] p-5">
            <p className="text-sm font-semibold text-cyan-100">Sem banco</p>
            <p className="mt-2 text-3xl font-bold">{priorities.missingBank.length}</p>
            <PriorityList items={priorities.missingBank} empty="Todos têm banco informado." />
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Resumo financeiro</p>
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Condomínio total" value={formatCurrency(summary.condoTotal)} />
              <SummaryRow label="Condomínio pago por cliente" value={formatCurrency(summary.tenantPaidCondoTotal)} />
              <SummaryRow label="Taxas extras" value={formatCurrency(summary.extraFeeTotal)} />
              <SummaryRow label="Imprevistos" value={formatCurrency(summary.unexpectedCostsTotal)} />
              <SummaryRow label="Manutenção" value={formatCurrency(summary.maintenanceTotal)} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:col-span-2">
            <p className="text-sm text-slate-400">Leitura rápida do filtro ativo</p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <QuickRead value={filteredProperties.length} label="imóveis no filtro" />
              <QuickRead value={filteredSummary.pendingRentCount} label="aluguéis pendentes" />
              <QuickRead value={filteredSummary.pendingReviewCount} label="precisam revisão" />
              <QuickRead value={filteredSummary.alertCount} label="alertas no filtro" />
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex flex-col gap-4 px-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Carteira de imóveis</h2>
              <p className="text-sm text-slate-400">
                Use os filtros para separar pagos, pendentes e imóveis que precisam atenção.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasLocalChanges ? (
                <button
                  type="button"
                  onClick={resetLocalChanges}
                  className="w-fit rounded-xl bg-slate-800 px-4 py-2 font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-slate-700"
                >
                  Descartar rascunhos
                </button>
              ) : null}
              <button
                type="button"
                onClick={openNewPropertyForm}
                className="w-fit rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Novo imóvel
              </button>
            </div>
          </div>

          {draft ? (
            <PropertyForm
              draft={draft}
              formError={formError}
              onCancel={cancelDraft}
              onChange={setDraft}
              onSave={saveDraft}
            />
          ) : null}

          <div className="mb-4 flex flex-wrap gap-2 px-2">
            {filterOptions.map((option) => {
              const active = option.id === activeFilter;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveFilter(option.id)}
                  className={
                    active
                      ? "rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                      : "rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10 transition hover:bg-slate-800"
                  }
                >
                  {option.label} ({option.count})
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1380px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-4 py-2">Imóvel</th>
                  <th className="px-4 py-2">Inquilino</th>
                  <th className="px-4 py-2">Pagamento</th>
                  <th className="px-4 py-2">Aluguel</th>
                  <th className="px-4 py-2">Despesas dono</th>
                  <th className="px-4 py-2">Banco</th>
                  <th className="px-4 py-2">Alertas</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => {
                  const alerts = getPropertyAlerts(property);
                  const status = primaryPropertyStatus(property);

                  return (
                    <tr key={property.id} className="bg-slate-900/90 shadow-lg shadow-black/10">
                      <td className="rounded-l-2xl px-4 py-4 font-medium text-white">{property.buildingName}</td>
                      <td className="px-4 py-4 text-slate-300">{property.tenantName ?? "Não informado"}</td>
                      <td className="px-4 py-4 text-slate-300">
                        <div>{formatDate(property.paymentDueDate)}</div>
                        <div className="text-xs text-slate-500">{property.isRentPaid ? "Pago" : "Pendente"}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-100">{formatCurrency(property.rentAmount)}</td>
                      <td className="px-4 py-4 text-slate-100">
                        <div>{formatCurrency(propertyExpenseTotal(property))}</div>
                        <div className="text-xs text-slate-500">
                          Cond.: {property.condoPaidByTenant ? "cliente" : "dono"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{property.receivingBank ?? "—"}</td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-md flex-wrap gap-2">
                          {alerts.slice(0, 3).map((alert) => (
                            <span
                              key={alert.label}
                              className={`rounded-full px-2 py-1 text-xs ring-1 ${alertStyles[alert.severity]}`}
                            >
                              {alert.label}
                            </span>
                          ))}
                          {alerts.length > 3 ? (
                            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 ring-1 ring-white/10">
                              +{alerts.length - 3}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 ring-1 ${statusStyles[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="rounded-r-2xl px-4 py-4">
                        <button
                          type="button"
                          onClick={() => openEditPropertyForm(property)}
                          className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-cyan-100 ring-1 ring-white/10 transition hover:bg-white/15"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function PropertyForm({
  draft,
  formError,
  onCancel,
  onChange,
  onSave,
}: {
  draft: PropertyDraft;
  formError: string | null;
  onCancel: () => void;
  onChange: (draft: PropertyDraft) => void;
  onSave: () => void;
}) {
  const mode = draft.id ? "Editar imóvel" : "Novo imóvel";

  return (
    <div className="mb-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-cyan-50">{mode}</h3>
        <p className="text-sm text-cyan-100/70">
          Alterações ficam em rascunho local nesta etapa; persistência Supabase entra depois da validação do fluxo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Imóvel">
          <input
            value={draft.buildingName}
            onChange={(event) => onChange({ ...draft, buildingName: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-300/30 focus:ring-2"
            placeholder="Ex.: Apt. Demo 101"
          />
        </FormField>

        <FormField label="Inquilino">
          <input
            value={draft.tenantName}
            onChange={(event) => onChange({ ...draft, tenantName: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-300/30 focus:ring-2"
            placeholder="Opcional"
          />
        </FormField>

        <FormField label="Vencimento">
          <input
            type="date"
            value={draft.paymentDueDate}
            onChange={(event) => onChange({ ...draft, paymentDueDate: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-300/30 focus:ring-2"
          />
        </FormField>

        <FormField label="Aluguel">
          <input
            inputMode="decimal"
            value={draft.rentAmount}
            onChange={(event) => onChange({ ...draft, rentAmount: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-300/30 focus:ring-2"
            placeholder="0,00"
          />
        </FormField>

        <FormField label="Banco de recebimento">
          <input
            value={draft.receivingBank}
            onChange={(event) => onChange({ ...draft, receivingBank: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-cyan-300/30 focus:ring-2"
            placeholder="Ex.: Nubank"
          />
        </FormField>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={draft.isRented}
            onChange={(event) => onChange({ ...draft, isRented: event.target.checked })}
            className="size-4 accent-cyan-300"
          />
          Está alugado
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={draft.isRentPaid}
            onChange={(event) => onChange({ ...draft, isRentPaid: event.target.checked })}
            className="size-4 accent-cyan-300"
          />
          Aluguel pago
        </label>
      </div>

      {formError ? <p className="mt-4 text-sm text-red-200">{formError}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSave}
          className="rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Salvar rascunho
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-slate-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PriorityList({ items, empty }: { items: PropertyRecord[]; empty: string }) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-slate-400">{empty}</p>;
  }

  return (
    <ul className="mt-4 space-y-2 text-sm text-slate-300">
      {items.slice(0, 3).map((item) => (
        <li key={item.id} className="flex justify-between gap-3 rounded-xl bg-slate-950/40 px-3 py-2">
          <span className="truncate">{item.buildingName}</span>
          <span className="shrink-0 text-slate-500">{formatCurrency(item.rentAmount)}</span>
        </li>
      ))}
      {items.length > 3 ? <li className="text-xs text-slate-500">+{items.length - 3} outros</li> : null}
    </ul>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function QuickRead({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-slate-900/80 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
