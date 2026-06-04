import {
  formatCurrency,
  formatDate,
  monthlyCondoTotal,
  monthlyRevenue,
  pendingReviewCount,
  properties,
} from "@/lib/rentals";
import { hasSupabaseConfig } from "@/lib/supabase";

const stats = [
  { label: "Imóveis mapeados", value: properties.length.toString() },
  { label: "Receita mensal", value: formatCurrency(monthlyRevenue(properties)) },
  { label: "Condomínio mensal", value: formatCurrency(monthlyCondoTotal(properties)) },
  { label: "Revisar dados", value: pendingReviewCount(properties).toString() },
];

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
              Início do app baseado na sua planilha: imóveis, locadores, contratos,
              vencimentos, aluguel, condomínio, IPTU e links de documentos.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            Supabase: {supabaseReady ? "configurado" : "aguardando .env.local"}
          </div>
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
                Dados iniciais extraídos visualmente da planilha — revisar nomes truncados e datas.
              </p>
            </div>
            <button className="rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-200">
              Novo imóvel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-4 py-2">Imóvel</th>
                  <th className="px-4 py-2">Locador/Inquilino</th>
                  <th className="px-4 py-2">Contrato</th>
                  <th className="px-4 py-2">Pagamento</th>
                  <th className="px-4 py-2">Aluguel</th>
                  <th className="px-4 py-2">Condomínio</th>
                  <th className="px-4 py-2">IPTU</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="bg-slate-900/90 shadow-lg shadow-black/10">
                    <td className="rounded-l-2xl px-4 py-4 font-medium text-white">{property.buildingName}</td>
                    <td className="px-4 py-4 text-slate-300">{property.tenantName ?? "Revisar"}</td>
                    <td className="px-4 py-4 text-slate-300">{formatDate(property.contractEndDate)}</td>
                    <td className="px-4 py-4 text-slate-300">{formatDate(property.paymentDueDate)}</td>
                    <td className="px-4 py-4 text-slate-100">{formatCurrency(property.rentAmount)}</td>
                    <td className="px-4 py-4 text-slate-100">{formatCurrency(property.condoAmount)}</td>
                    <td className="px-4 py-4 text-slate-100">{property.iptuAmount ? formatCurrency(property.iptuAmount) : "—"}</td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <span className={property.isCurrent ? "rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-200 ring-1 ring-emerald-300/20" : "rounded-full bg-red-400/10 px-3 py-1 text-red-200 ring-1 ring-red-300/20"}>
                        {property.isCurrent ? "Em dia" : "Pendência"}
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
