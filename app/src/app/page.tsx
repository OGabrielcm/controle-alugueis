import {
  formatCurrency,
  formatDate,
  monthlyCondoTotal,
  monthlyRevenue,
  paidRentCount,
  pendingReviewCount,
  properties,
  sourceData,
} from "@/lib/rentals";
import { hasSupabaseConfig } from "@/lib/supabase";

const stats = [
  { label: "Imóveis mapeados", value: properties.length.toString() },
  { label: "Receita mensal", value: formatCurrency(monthlyRevenue(properties)) },
  { label: "Condomínio mensal", value: formatCurrency(monthlyCondoTotal(properties)) },
  { label: "Aluguéis pagos", value: `${paidRentCount(properties)}/${properties.length}` },
];

export default function Home() {
  const supabaseReady = hasSupabaseConfig();
  const reviewCount = pendingReviewCount(properties);

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
            {reviewCount} registros precisam de revisão porque a planilha não trouxe nomes de inquilinos ou datas finais de contrato.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            </article>
          ))}
        </div>

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
            <table className="w-full min-w-[1180px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-4 py-2">Imóvel</th>
                  <th className="px-4 py-2">Inquilino</th>
                  <th className="px-4 py-2">Pagamento</th>
                  <th className="px-4 py-2">Aluguel</th>
                  <th className="px-4 py-2">Condomínio</th>
                  <th className="px-4 py-2">Taxas/Manutenção</th>
                  <th className="px-4 py-2">Banco</th>
                  <th className="px-4 py-2">Calção</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="bg-slate-900/90 shadow-lg shadow-black/10">
                    <td className="rounded-l-2xl px-4 py-4 font-medium text-white">{property.buildingName}</td>
                    <td className="px-4 py-4 text-slate-300">{property.tenantName ?? "Não informado"}</td>
                    <td className="px-4 py-4 text-slate-300">{formatDate(property.paymentDueDate)}</td>
                    <td className="px-4 py-4 text-slate-100">{formatCurrency(property.rentAmount)}</td>
                    <td className="px-4 py-4 text-slate-100">
                      <div>{formatCurrency(property.condoAmount)}</div>
                      <div className="text-xs text-slate-500">{property.condoPaidByTenant ? "Cliente paga" : "Proprietário paga"}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-100">
                      <div>Extra: {formatCurrency(property.extraFeeAmount)}</div>
                      <div className="text-xs text-slate-500">Manut.: {formatCurrency(property.maintenanceAmount)}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{property.receivingBank ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-300">{property.hasRentDeposit ? "Sim" : "Não"}</td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <span className={property.isCurrent ? "rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-200 ring-1 ring-emerald-300/20" : "rounded-full bg-red-400/10 px-3 py-1 text-red-200 ring-1 ring-red-300/20"}>
                        {property.isCurrent ? "Pago" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
