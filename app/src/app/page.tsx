import {
  formatCurrency,
  formatDate,
  getPropertyAlerts,
  primaryPropertyStatus,
  properties,
  propertyExpenseTotal,
  sourceData,
  summarizePortfolio,
} from "@/lib/rentals";
import { hasSupabaseConfig } from "@/lib/supabase";

const summary = summarizePortfolio(properties);

const stats = [
  { label: "Receita prevista", value: formatCurrency(summary.grossRent), hint: `${summary.propertyCount} imóveis mapeados` },
  { label: "Receita recebida", value: formatCurrency(summary.receivedRent), hint: `${summary.paidRentCount}/${summary.propertyCount} aluguéis pagos` },
  { label: "Receita pendente", value: formatCurrency(summary.pendingRent), hint: `${summary.pendingRentCount} aluguéis pendentes` },
  { label: "Saldo estimado", value: formatCurrency(summary.estimatedBalance), hint: "Recebido - despesas do proprietário" },
  { label: "Despesas totais", value: formatCurrency(summary.expensesTotal), hint: "Condomínio, taxas, imprevistos e manutenção" },
  { label: "Condomínio dono", value: formatCurrency(summary.ownerPaidCondoTotal), hint: "Parte não paga pelo cliente" },
  { label: "Revisar dados", value: summary.pendingReviewCount.toString(), hint: "Campos essenciais incompletos" },
  { label: "Alertas críticos", value: summary.dangerAlertCount.toString(), hint: `${summary.alertCount} alertas totais` },
];

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

export default function Home() {
  const supabaseReady = hasSupabaseConfig();

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
              Dashboard inicial baseado no CSV da planilha: imóveis, datas de pagamento,
              aluguel, condomínio, taxas, manutenção e banco de recebimento.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            Supabase: {supabaseReady ? "configurado" : "aguardando .env.local"}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-50">
          <p className="font-semibold">Base de dados: {sourceData.label}</p>
          <p className="mt-1 text-sm text-amber-100/80">
            Referência {sourceData.referenceMonth} — {sourceData.status}. {sourceData.note}
          </p>
          <p className="mt-2 text-sm text-amber-100/80">
            Esta etapa adicionou cálculo de receita recebida/pendente, despesas estimadas e alertas por imóvel.
          </p>
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

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Resumo financeiro</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Condomínio total</span>
                <span>{formatCurrency(summary.condoTotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Condomínio pago por cliente</span>
                <span>{formatCurrency(summary.tenantPaidCondoTotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Taxas extras</span>
                <span>{formatCurrency(summary.extraFeeTotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Imprevistos</span>
                <span>{formatCurrency(summary.unexpectedCostsTotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Manutenção</span>
                <span>{formatCurrency(summary.maintenanceTotal)}</span>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:col-span-2">
            <p className="text-sm text-slate-400">Leitura rápida</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-slate-900/80 p-4">
                <p className="text-2xl font-semibold">{summary.pendingRentCount}</p>
                <p className="text-sm text-slate-400">aluguéis pendentes na base</p>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-4">
                <p className="text-2xl font-semibold">{summary.pendingReviewCount}</p>
                <p className="text-sm text-slate-400">imóveis sem inquilino ou contrato</p>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-4">
                <p className="text-2xl font-semibold">{summary.alertCount}</p>
                <p className="text-sm text-slate-400">alertas gerados automaticamente</p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex flex-col gap-2 px-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Carteira de imóveis</h2>
              <p className="text-sm text-slate-400">
                Dados importados do CSV de fevereiro; use como estrutura inicial, não como situação atual.
              </p>
            </div>
            <button className="rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-200">
              Novo imóvel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-separate border-spacing-y-2 text-left text-sm">
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
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => {
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
                      <td className="rounded-r-2xl px-4 py-4">
                        <span className={`rounded-full px-3 py-1 ring-1 ${statusStyles[status]}`}>
                          {status}
                        </span>
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
