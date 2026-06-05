"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileText, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type PortfolioFilter,
  type PropertyRecord,
  filterProperties,
  formatCurrency,
  formatDate,
  getFilterOptions,
  getPriorityGroups,
  getPropertyAlerts,
  primaryPropertyStatus,
  propertyExpenseTotal,
  summarizePortfolio,
} from "@/lib/rentals";
import { type ContractAgenda, buildContractAgenda, getTodayDateString } from "@/lib/contract-agenda";
import {
  type PropertyDraft,
  draftFromProperty,
  emptyPropertyDraft,
  propertyFromDraft,
} from "@/lib/property-draft";
import { buildPropertyMutationPayload } from "@/lib/property-persistence";
import { mapSupabaseRow, propertyColumns, type PropertyDataSource, type SupabasePropertyRow } from "@/lib/property-repository";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "controle-alugueis.local-properties.v1";

type WorkspaceMode = "overview" | "list" | "new";

type PropertyWorkspaceProps = {
  mode: WorkspaceMode;
  properties: PropertyRecord[];
  dataSource: PropertyDataSource;
  supabaseReady: boolean;
};

const badgeVariantByStatus = {
  Ok: "success",
  Revisar: "warning",
  Atenção: "danger",
} as const;

function loadLocalProperties(fallback: PropertyRecord[]) {
  if (typeof window === "undefined") return fallback;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return fallback;

  try {
    const parsed = JSON.parse(stored) as PropertyRecord[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function PropertyWorkspace({ mode, properties, dataSource, supabaseReady }: PropertyWorkspaceProps) {
  const [managedProperties, setManagedProperties] = useState<PropertyRecord[]>(() => properties);
  const [currentDataSource, setCurrentDataSource] = useState<PropertyDataSource>(() => dataSource);
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("all");
  const [editingDraft, setEditingDraft] = useState<PropertyDraft | null>(null);
  const [newDraft, setNewDraft] = useState<PropertyDraft>(emptyPropertyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrateProperties() {
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userData.user) {
          setSessionUserId(userData.user.id);
          const { data, error } = await supabase
            .from("properties")
            .select(propertyColumns)
            .order("building_name", { ascending: true });

          if (!mounted) return;

          if (error) {
            setFormError(`Não consegui carregar seus imóveis privados (${error.message}).`);
            setManagedProperties(loadLocalProperties(properties));
          } else {
            setManagedProperties(((data ?? []) as unknown as SupabasePropertyRow[]).map(mapSupabaseRow));
            setCurrentDataSource({
              label: "Supabase: imóveis do usuário",
              referenceMonth: "Dados privados autenticados",
              status: "supabase",
              note: "Dados carregados com a sessão Supabase; inserts/updates preenchem owner_id = auth.uid().",
            });
            window.localStorage.removeItem(STORAGE_KEY);
          }

          setHydrated(true);
          return;
        }
      }

      setManagedProperties(loadLocalProperties(properties));
      setHydrated(true);
    }

    hydrateProperties();

    return () => {
      mounted = false;
    };
  }, [properties]);

  useEffect(() => {
    if (!hydrated) return;
    if (sessionUserId) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(managedProperties));
  }, [hydrated, managedProperties, sessionUserId]);

  const summary = useMemo(() => summarizePortfolio(managedProperties), [managedProperties]);
  const agendaReferenceDate = useMemo(() => getTodayDateString(), []);
  const contractAgenda = useMemo(
    () => buildContractAgenda(managedProperties, agendaReferenceDate),
    [managedProperties, agendaReferenceDate],
  );
  const filterOptions = useMemo(() => getFilterOptions(managedProperties), [managedProperties]);
  const filteredProperties = useMemo(
    () => filterProperties(managedProperties, activeFilter),
    [managedProperties, activeFilter],
  );
  const priorities = useMemo(() => getPriorityGroups(managedProperties), [managedProperties]);
  const hasLocalChanges = !sessionUserId && hydrated && JSON.stringify(managedProperties) !== JSON.stringify(properties);

  function resetLocalChanges() {
    setManagedProperties(properties);
    setEditingDraft(null);
    setNewDraft(emptyPropertyDraft);
    setFormError(null);
    setFormMessage(null);
    setActiveFilter("all");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  async function saveDraft(draft: PropertyDraft, mode: "create" | "edit") {
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

    if (supabase && sessionUserId) {
      setIsSaving(true);
      setFormError(null);
      setFormMessage(null);

      const current = draft.id ? managedProperties.find((property) => property.id === draft.id) : undefined;
      const payload = buildPropertyMutationPayload(draft, { userId: sessionUserId, mode, current });
      const request = mode === "create"
        ? supabase.from("properties").insert(payload).select(propertyColumns).single()
        : supabase.from("properties").update(payload).eq("id", draft.id ?? "").select(propertyColumns).single();
      const { data, error } = await request;

      setIsSaving(false);

      if (error) {
        setFormError(`Não foi possível salvar no Supabase (${error.message}).`);
        return;
      }

      const saved = mapSupabaseRow(data as unknown as SupabasePropertyRow);
      setManagedProperties((currentProperties) => {
        if (mode === "create") {
          return [saved, ...currentProperties];
        }

        return currentProperties.map((property) => (property.id === saved.id ? saved : property));
      });
      setEditingDraft(null);
      setNewDraft(emptyPropertyDraft);
      setFormError(null);
      setFormMessage(mode === "create" ? "Imóvel salvo no Supabase com seu usuário como dono." : "Edição salva no Supabase.");
      return;
    }

    setManagedProperties((currentProperties) => {
      const current = draft.id ? currentProperties.find((property) => property.id === draft.id) : undefined;
      const saved = propertyFromDraft(draft, current);

      if (mode === "create") {
        return [saved, ...currentProperties];
      }

      return currentProperties.map((property) => (property.id === saved.id ? saved : property));
    });

    setEditingDraft(null);
    setNewDraft(emptyPropertyDraft);
    setFormError(null);
    setFormMessage("Rascunho local salvo neste navegador.");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader mode={mode} supabaseReady={supabaseReady} dataSource={currentDataSource} hasLocalChanges={hasLocalChanges} sessionUserId={sessionUserId} />

      {hasLocalChanges ? (
        <Card className="border-cyan-300/20 bg-cyan-300/10">
          <CardContent className="flex flex-col gap-3 p-4 text-cyan-50 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Rascunhos locais ativos</p>
              <p className="text-sm text-cyan-100/75">As alterações estão salvas no navegador e ainda não foram persistidas no Supabase.</p>
            </div>
            <Button variant="secondary" onClick={resetLocalChanges}>
              <RotateCcw size={16} /> Descartar rascunhos
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {mode === "overview" ? (
        <Overview summary={summary} priorities={priorities} contractAgenda={contractAgenda} />
      ) : null}

      {mode === "list" ? (
        <PropertyList
          activeFilter={activeFilter}
          filterOptions={filterOptions}
          filteredProperties={filteredProperties}
          editingDraft={editingDraft}
          formError={formError}
          formMessage={formMessage}
          isSaving={isSaving}
          onEdit={(property) => {
            setEditingDraft(draftFromProperty(property));
            setFormError(null);
            setFormMessage(null);
          }}
          onCancel={() => {
            setEditingDraft(null);
            setFormError(null);
            setFormMessage(null);
          }}
          onDraftChange={setEditingDraft}
          onFilterChange={setActiveFilter}
          onSave={(draft) => saveDraft(draft, "edit")}
        />
      ) : null}

      {mode === "new" ? (
        <Card>
          <CardHeader>
            <CardTitle>Novo imóvel</CardTitle>
            <CardDescription>
              Cadastre um imóvel privado. Com sessão ativa, o app salva no Supabase preenchendo owner_id com seu usuário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyForm
              draft={newDraft}
              formError={formError}
              formMessage={formMessage}
              isSaving={isSaving}
              onCancel={() => {
                setNewDraft(emptyPropertyDraft);
                setFormError(null);
                setFormMessage(null);
              }}
              onChange={setNewDraft}
              onSave={(draft) => saveDraft(draft, "create")}
              saveLabel={sessionUserId ? "Salvar no Supabase" : "Salvar rascunho"}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function PageHeader({
  mode,
  supabaseReady,
  dataSource,
  hasLocalChanges,
  sessionUserId,
}: {
  mode: WorkspaceMode;
  supabaseReady: boolean;
  dataSource: PropertyDataSource;
  hasLocalChanges: boolean;
  sessionUserId: string | null;
}) {
  const copy = {
    overview: {
      eyebrow: "Resumo operacional",
      title: "Visão geral da carteira",
      description: "Indicadores, prioridades e próximos pontos de atenção sem misturar cadastro e tabela na mesma tela.",
    },
    list: {
      eyebrow: "Carteira",
      title: "Imóveis e pagamentos",
      description: "Lista completa com filtros, status e edição em rascunho local.",
    },
    new: {
      eyebrow: "Cadastro",
      title: "Adicionar imóvel",
      description: "Fluxo separado para cadastro manual, evitando a sensação de tudo em uma página só.",
    },
  }[mode];

  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-300">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">{copy.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={supabaseReady ? "success" : "warning"}>Supabase: {supabaseReady ? "configurado" : "sem .env"}</Badge>
        <Badge variant={dataSource.status === "supabase" ? "success" : "warning"}>{dataSource.status}</Badge>
        {sessionUserId ? <Badge variant="success">escrita privada</Badge> : null}
        {hasLocalChanges ? <Badge variant="info">rascunho local</Badge> : null}
      </div>
    </header>
  );
}

function Overview({
  summary,
  priorities,
  contractAgenda,
}: {
  summary: ReturnType<typeof summarizePortfolio>;
  priorities: ReturnType<typeof getPriorityGroups>;
  contractAgenda: ContractAgenda;
}) {
  const stats = [
    { label: "Receita prevista", value: formatCurrency(summary.grossRent), hint: `${summary.propertyCount} imóveis mapeados` },
    { label: "Receita recebida", value: formatCurrency(summary.receivedRent), hint: `${summary.paidRentCount}/${summary.propertyCount} aluguéis pagos` },
    { label: "Receita pendente", value: formatCurrency(summary.pendingRent), hint: `${summary.pendingRentCount} aluguéis pendentes` },
    { label: "Saldo estimado", value: formatCurrency(summary.estimatedBalance), hint: "Recebido - despesas do proprietário" },
  ];

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Prioridades do mês</CardTitle>
            <CardDescription>O que merece ação antes de mexer em persistência ou deploy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <PriorityBlock label="Aluguéis pendentes" items={priorities.pendingRent} variant="danger" />
            <PriorityBlock label="Dados incompletos" items={priorities.incompleteData} variant="warning" />
            <PriorityBlock label="Despesas altas" items={priorities.highExpenses} variant="danger" />
            <PriorityBlock label="Sem banco" items={priorities.missingBank} variant="info" />
          </CardContent>
        </Card>

        <ContractAgendaCard agenda={contractAgenda} />
      </section>
    </>
  );
}

function ContractAgendaCard({ agenda }: { agenda: ContractAgenda }) {
  const featuredItems = agenda.items.slice(0, 5);
  const hasItems = featuredItems.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda contratual ativa</CardTitle>
        <CardDescription>Vencimentos, reajustes e dados faltantes calculados a partir dos contratos cadastrados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <AgendaMetric label="Vencidos" value={agenda.summary.overdue} variant="danger" />
          <AgendaMetric label="Próximos" value={agenda.summary.dueSoon} variant="warning" />
          <AgendaMetric label="Dados faltantes" value={agenda.summary.missingData} variant="info" />
        </div>

        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-300/15 text-emerald-200">
              <FileText size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Próximas ações contratuais</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                A agenda já cruza vencimento de contrato, data base anual de reajuste e cadastros incompletos.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {featuredItems.map((item) => (
            <Link
              key={item.id}
              href={`/imoveis/${encodeURIComponent(item.propertyId)}`}
              className="block rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10 transition hover:bg-slate-900 hover:ring-emerald-300/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{item.propertyName}</p>
                <Badge variant={item.severity}>{item.title}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              {item.daysUntil !== undefined ? (
                <p className="mt-2 text-xs text-slate-500">
                  {item.daysUntil < 0 ? `${Math.abs(item.daysUntil)} dias em atraso` : `Faltam ${item.daysUntil} dias`}
                </p>
              ) : null}
            </Link>
          ))}

          {!hasItems ? (
            <div className="rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-400 ring-1 ring-white/10">
              Nenhuma ação contratual imediata. Cadastre datas de vencimento e reajuste para alimentar a agenda.
            </div>
          ) : null}

          {agenda.items.length > featuredItems.length ? (
            <p className="text-xs text-slate-500">+{agenda.items.length - featuredItems.length} outros pontos na carteira.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaMetric({ label, value, variant }: { label: string; value: number; variant: "danger" | "warning" | "info" }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <Badge variant={variant}>{value}</Badge>
      </div>
    </div>
  );
}

function PropertyList({
  activeFilter,
  filterOptions,
  filteredProperties,
  editingDraft,
  formError,
  formMessage,
  isSaving,
  onCancel,
  onDraftChange,
  onEdit,
  onFilterChange,
  onSave,
}: {
  activeFilter: PortfolioFilter;
  filterOptions: Array<{ id: PortfolioFilter; label: string; count: number }>;
  filteredProperties: PropertyRecord[];
  editingDraft: PropertyDraft | null;
  formError: string | null;
  formMessage: string | null;
  isSaving: boolean;
  onCancel: () => void;
  onDraftChange: (draft: PropertyDraft) => void;
  onEdit: (property: PropertyRecord) => void;
  onFilterChange: (filter: PortfolioFilter) => void;
  onSave: (draft: PropertyDraft) => void;
}) {
  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Carteira de imóveis</CardTitle>
          <CardDescription>Filtros e edição ficam aqui; a home agora só resume o que importa.</CardDescription>
        </div>
        <ButtonLink href="/imoveis/novo">Novo imóvel</ButtonLink>
      </CardHeader>
      <CardContent>
        {editingDraft ? (
          <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
            <PropertyForm
              draft={editingDraft}
              formError={formError}
              formMessage={formMessage}
              isSaving={isSaving}
              onCancel={onCancel}
              onChange={onDraftChange}
              onSave={onSave}
              saveLabel="Salvar edição"
            />
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onFilterChange(option.id)}
              className={
                option.id === activeFilter
                  ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                  : "rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10 transition hover:bg-slate-800"
              }
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-2">Imóvel</th>
                <th className="px-4 py-2">Inquilino</th>
                <th className="px-4 py-2">Pagamento</th>
                <th className="px-4 py-2">Aluguel</th>
                <th className="px-4 py-2">Despesas dono</th>
                <th className="px-4 py-2">Banco</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => {
                const status = primaryPropertyStatus(property);
                return (
                  <tr key={property.id} className="bg-slate-900/80 shadow-lg shadow-black/10">
                    <td className="rounded-l-2xl px-4 py-4 font-medium text-white">
                      <Link href={`/imoveis/${encodeURIComponent(property.id)}`} className="transition hover:text-emerald-300">
                        {property.buildingName}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {getPropertyAlerts(property).slice(0, 2).map((alert) => (
                          <Badge key={alert.label} variant={alert.severity}>{alert.label}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{property.tenantName ?? "Não informado"}</td>
                    <td className="px-4 py-4 text-slate-300">
                      <div>{formatDate(property.paymentDueDate)}</div>
                      <div className="text-xs text-slate-500">{property.isRentPaid ? "Pago" : "Pendente"}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-100">{formatCurrency(property.rentAmount)}</td>
                    <td className="px-4 py-4 text-slate-100">{formatCurrency(propertyExpenseTotal(property))}</td>
                    <td className="px-4 py-4 text-slate-300">{property.receivingBank ?? "—"}</td>
                    <td className="px-4 py-4"><Badge variant={badgeVariantByStatus[status]}>{status}</Badge></td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <ButtonLink href={`/imoveis/${encodeURIComponent(property.id)}`} variant="secondary">Detalhes</ButtonLink>
                        <Button variant="secondary" onClick={() => onEdit(property)}>Editar</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PropertyForm({
  draft,
  formError,
  formMessage,
  isSaving,
  onCancel,
  onChange,
  onSave,
  saveLabel,
}: {
  draft: PropertyDraft;
  formError: string | null;
  formMessage: string | null;
  isSaving: boolean;
  onCancel: () => void;
  onChange: (draft: PropertyDraft) => void;
  onSave: (draft: PropertyDraft) => void;
  saveLabel: string;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">Dados do imóvel</p>
          <p className="text-xs text-slate-500">Identificação básica para separar carteira, pagamento e contrato.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Label>
            Imóvel
            <Input value={draft.buildingName} onChange={(event) => onChange({ ...draft, buildingName: event.target.value })} placeholder="Ex.: Apt. Demo 101" />
          </Label>
          <Label className="xl:col-span-2">
            Endereço/identificação
            <Input value={draft.propertyAddress} onChange={(event) => onChange({ ...draft, propertyAddress: event.target.value })} placeholder="Rua, prédio, bloco ou referência" />
          </Label>
          <Label>
            Banco de recebimento
            <Input value={draft.receivingBank} onChange={(event) => onChange({ ...draft, receivingBank: event.target.value })} placeholder="Ex.: Nubank" />
          </Label>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">Inquilino e aluguel</p>
          <p className="text-xs text-slate-500">Campos mínimos para acompanhar cobrança e contato.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Label>
            Inquilino
            <Input value={draft.tenantName} onChange={(event) => onChange({ ...draft, tenantName: event.target.value })} placeholder="Opcional" />
          </Label>
          <Label>
            Contato do inquilino
            <Input value={draft.tenantContact} onChange={(event) => onChange({ ...draft, tenantContact: event.target.value })} placeholder="Telefone, e-mail ou WhatsApp" />
          </Label>
          <Label>
            Vencimento mensal
            <Input type="date" value={draft.paymentDueDate} onChange={(event) => onChange({ ...draft, paymentDueDate: event.target.value })} />
          </Label>
          <Label>
            Aluguel
            <Input inputMode="decimal" value={draft.rentAmount} onChange={(event) => onChange({ ...draft, rentAmount: event.target.value })} placeholder="0,00" />
          </Label>
          <label className="flex min-h-10 items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300">
            <input type="checkbox" checked={draft.isRented} onChange={(event) => onChange({ ...draft, isRented: event.target.checked })} className="size-4 accent-emerald-300" />
            Está alugado
          </label>
          <label className="flex min-h-10 items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300">
            <input type="checkbox" checked={draft.isRentPaid} onChange={(event) => onChange({ ...draft, isRentPaid: event.target.checked })} className="size-4 accent-emerald-300" />
            Aluguel pago
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
        <div>
          <p className="text-sm font-semibold text-white">Base contratual</p>
          <p className="text-xs text-slate-500">Ainda sem upload de contrato; primeiro vamos registrar os dados que geram alertas.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Label>
            Início do contrato
            <Input type="date" value={draft.contractStartDate} onChange={(event) => onChange({ ...draft, contractStartDate: event.target.value })} />
          </Label>
          <Label>
            Vencimento do contrato
            <Input type="date" value={draft.contractEndDate} onChange={(event) => onChange({ ...draft, contractEndDate: event.target.value })} />
          </Label>
          <Label>
            Data base do reajuste
            <Input type="date" value={draft.rentAdjustmentBaseDate} disabled={!draft.hasAnnualAdjustment} onChange={(event) => onChange({ ...draft, rentAdjustmentBaseDate: event.target.value })} />
          </Label>
          <Label>
            Índice/cláusula
            <Input value={draft.rentAdjustmentIndex} disabled={!draft.hasAnnualAdjustment} onChange={(event) => onChange({ ...draft, rentAdjustmentIndex: event.target.value })} placeholder="Ex.: IPCA, IGP-M" />
          </Label>
          <label className="flex min-h-10 items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300 md:col-span-2">
            <input type="checkbox" checked={draft.hasAnnualAdjustment} onChange={(event) => onChange({ ...draft, hasAnnualAdjustment: event.target.checked })} className="size-4 accent-emerald-300" />
            Contrato tem cláusula anual de reajuste
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-300 md:col-span-2 xl:col-span-4">
            Observações contratuais
            <textarea
              value={draft.contractNotes}
              onChange={(event) => onChange({ ...draft, contractNotes: event.target.value })}
              placeholder="Ex.: cláusula de reajuste, prazo de renovação, condições especiais"
              className="min-h-24 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60"
            />
          </label>
        </div>
      </section>

      {formError ? <p className="text-sm text-red-200">{formError}</p> : null}
      {formMessage ? <p className="text-sm text-emerald-200">{formMessage}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => onSave(draft)} disabled={isSaving}>{isSaving ? "Salvando..." : saveLabel}</Button>
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>Cancelar</Button>
      </div>
    </div>
  );
}

function PriorityBlock({ label, items, variant }: { label: string; items: PropertyRecord[]; variant: "danger" | "warning" | "info" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <Badge variant={variant}>{items.length}</Badge>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-400">
        {items.slice(0, 3).map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span className="truncate">{item.buildingName}</span>
            <span className="shrink-0 text-slate-500">{formatCurrency(item.rentAmount)}</span>
          </li>
        ))}
        {items.length === 0 ? <li>Nenhum item.</li> : null}
        {items.length > 3 ? <li className="text-xs text-slate-500">+{items.length - 3} outros</li> : null}
      </ul>
    </div>
  );
}

