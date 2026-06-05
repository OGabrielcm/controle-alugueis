import { notFound } from "next/navigation";
import { ContractAttachmentPanel } from "@/components/contract-attachment-panel";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { findPropertyById } from "@/lib/property-detail";
import { getProperties } from "@/lib/property-repository";
import { hasSupabaseConfig } from "@/lib/supabase";
import {
  formatCurrency,
  formatDate,
  getPropertyAlerts,
  primaryPropertyStatus,
  propertyExpenseTotal,
  type PropertyRecord,
} from "@/lib/rentals";

export const dynamic = "force-dynamic";

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

const badgeVariantByStatus = {
  Ok: "success",
  Revisar: "warning",
  Atenção: "danger",
} as const;

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const { properties, dataSource } = await getProperties();
  const property = findPropertyById(properties, id);

  if (!property) {
    notFound();
  }

  const status = primaryPropertyStatus(property);
  const alerts = getPropertyAlerts(property);
  const ownerExpenses = propertyExpenseTotal(property);

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-300">Detalhe do imóvel</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">{property.buildingName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              Visão individual para separar dados do imóvel, aluguel, contrato e próximos pontos de atenção.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={badgeVariantByStatus[status]}>{status}</Badge>
            <Badge variant={dataSource.status === "supabase" ? "success" : "warning"}>{dataSource.status}</Badge>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/imoveis" variant="secondary">Voltar para imóveis</ButtonLink>
          <ButtonLink href="/imoveis/novo" variant="ghost">Cadastrar outro imóvel</ButtonLink>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Aluguel" value={formatCurrency(property.rentAmount)} hint={property.isRentPaid ? "Pago na base atual" : "Pendente na base atual"} />
        <MetricCard label="Despesas do dono" value={formatCurrency(ownerExpenses)} hint="Condomínio, taxas, manutenção e imprevistos" />
        <MetricCard label="Saldo estimado" value={formatCurrency((property.isRentPaid ? property.rentAmount : 0) - ownerExpenses)} hint="Recebido menos despesas do proprietário" />
        <MetricCard label="Próximo vencimento" value={formatDate(property.paymentDueDate)} hint="Data mensal registrada para o aluguel" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dados principais</CardTitle>
            <CardDescription>Informações operacionais que identificam o imóvel e o aluguel.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Imóvel" value={property.buildingName} />
            <InfoItem label="Endereço/identificação" value={property.propertyAddress} />
            <InfoItem label="Inquilino" value={property.tenantName} />
            <InfoItem label="Contato do inquilino" value={property.tenantContact} />
            <InfoItem label="Banco de recebimento" value={property.receivingBank} />
            <InfoItem label="Está alugado?" value={property.isRented ? "Sim" : "Não"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Pontos que merecem revisão neste imóvel.</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li key={alert.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/70 p-3 ring-1 ring-white/10">
                    <span className="text-sm text-slate-300">{alert.label}</span>
                    <Badge variant={alert.severity}>{alert.severity}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-400 ring-1 ring-white/10">Nenhum alerta para este imóvel.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contrato</CardTitle>
            <CardDescription>Base para vencimento, reajuste anual e futuro anexo do contrato.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Início do contrato" value={formatDate(property.contractStartDate)} />
            <InfoItem label="Vencimento do contrato" value={formatDate(property.contractEndDate)} />
            <InfoItem label="Reajuste anual?" value={property.hasAnnualAdjustment ? "Sim" : "Não informado/não"} />
            <InfoItem label="Data base do reajuste" value={formatDate(property.rentAdjustmentBaseDate)} />
            <InfoItem label="Índice/cláusula" value={property.rentAdjustmentIndex} />
            <InfoItem label="Anexo do contrato" value={property.contractUrl ? "Contrato registrado" : "Ainda sem anexo"} />
            <div className="md:col-span-2">
              <InfoItem label="Observações contratuais" value={property.contractNotes} />
            </div>
          </CardContent>
        </Card>

        <ContractAttachmentPanel
          propertyId={property.id}
          initialContractUrl={property.contractUrl}
          supabaseReady={hasSupabaseConfig()}
        />

        <Card>
          <CardHeader>
            <CardTitle>Despesas e responsabilidades</CardTitle>
            <CardDescription>Separação inicial entre valores do aluguel e custos do proprietário.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Condomínio" value={formatCurrency(property.condoAmount)} />
            <InfoItem label="Condomínio pago pelo inquilino?" value={property.condoPaidByTenant ? "Sim" : "Não"} />
            <InfoItem label="Taxa extra" value={formatCurrency(property.extraFeeAmount)} />
            <InfoItem label="Taxa extra paga pelo inquilino?" value={property.extraFeePaidByTenant ? "Sim" : "Não"} />
            <InfoItem label="Manutenção" value={formatCurrency(property.maintenanceAmount)} />
            <InfoItem label="IPTU" value={formatCurrency(property.iptuAmount)} />
            <InfoItem label="Imprevistos" value={formatCurrency(property.unexpectedCostsAmount)} />
            <InfoItem label="Caução/calção registrado?" value={property.hasRentDeposit ? "Sim" : "Não"} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{hint}</p>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value?: PropertyRecord[keyof PropertyRecord] | string }) {
  const display = value === undefined || value === null || value === "" ? "—" : String(value);

  return (
    <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{display}</p>
    </div>
  );
}
