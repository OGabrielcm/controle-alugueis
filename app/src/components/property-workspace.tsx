"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthenticatedUser } from "@/lib/auth-session";
import {
  type PortfolioFilter,
  type PropertyRecord,
  filterProperties,
  formatCurrency,
  getFilterOptions,
  getPriorityGroups,
  getPropertyAlerts,
  primaryPropertyStatus,
  propertyExpenseTotal,
  propertyOccupancyStatus,
  summarizePortfolio,
} from "@/lib/rentals";
import { type ContractAgenda, buildContractAgenda, getTodayDateString } from "@/lib/contract-agenda";
import {
  CONTRACT_ATTACHMENT_ALLOWED_MIME_TYPES,
  CONTRACT_ATTACHMENTS_BUCKET,
  getContractFileValidationError,
  normalizeContractStoragePath,
  uploadContractAttachment,
} from "@/lib/contract-attachment";
import { buildMonthlyDueDate, formatMonthlyDueDay, getMonthlyDueDay } from "@/lib/monthly-due-date";
import {
  PROPERTY_TEXT_LIMITS,
  type PropertyDraft,
  draftFromProperty,
  emptyPropertyDraft,
  getPropertyDraftValidationError,
  hasExpiredActiveContract,
  propertyFromDraft,
} from "@/lib/property-draft";
import { buildPropertyMutationPayload } from "@/lib/property-persistence";
import { deletePropertyAndAttachments } from "@/lib/property-deletion";
import { shouldRedirectAfterPropertySave } from "@/lib/property-save-flow";
import { mapSupabaseRow, propertyColumns, type PropertyDataSource, type SupabasePropertyRow } from "@/lib/property-repository";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "controle-alugueis.local-properties.v1";

type WorkspaceMode = "overview" | "list" | "new";
type ContractSaveOptions = { removeExistingContract?: boolean; confirmExpiredContract?: boolean };

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

const badgeVariantByOccupancy = {
  Alugado: "success",
  Desalugado: "info",
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
  const router = useRouter();
  const [managedProperties, setManagedProperties] = useState<PropertyRecord[]>(() => (supabaseReady ? [] : properties));
  const [currentDataSource, setCurrentDataSource] = useState<PropertyDataSource>(() =>
    supabaseReady
      ? {
          label: "Carregando sessão",
          referenceMonth: "Aguardando autenticação",
          status: "supabase",
          note: "Validando sessão antes de mostrar imóveis para evitar piscar dados demo/mockados.",
        }
      : dataSource,
  );
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("all");
  const [editingDraft, setEditingDraft] = useState<PropertyDraft | null>(null);
  const [newDraft, setNewDraft] = useState<PropertyDraft>(emptyPropertyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [propertyPendingDeletion, setPropertyPendingDeletion] = useState<PropertyRecord | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrateProperties() {
      if (supabase) {
        const { user, error: authError } = await getAuthenticatedUser(supabase.auth);

        if (!mounted) return;

        if (authError) {
          setFormError(`Não consegui validar sua sessão privada (${authError}). Tente novamente recarregando a página.`);
          setManagedProperties([]);
          setCurrentDataSource({
            label: "Supabase: erro ao validar sessão",
            referenceMonth: "Dados privados não consultados",
            status: "fallback",
            note: "Não tratei falha de autenticação como carteira vazia e não mostrei dados demo/mockados.",
          });
          setHydrated(true);
          return;
        }

        if (user) {
          setSessionUserId(user.id);
          const { data, error } = await supabase
            .from("properties")
            .select(propertyColumns)
            .order("building_name", { ascending: true });

          if (!mounted) return;

          if (error) {
            setFormError(`Não consegui carregar seus imóveis privados (${error.message}).`);
            setManagedProperties([]);
            setCurrentDataSource({
              label: "Supabase: erro ao carregar imóveis privados",
              referenceMonth: "Dados privados autenticados",
              status: "fallback",
              note: "Não mostrei dados demo/mockados para uma sessão autenticada com erro de leitura.",
            });
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
      setCurrentDataSource(dataSource);
      setHydrated(true);
    }

    hydrateProperties();

    return () => {
      mounted = false;
    };
  }, [dataSource, properties]);

  useEffect(() => {
    if (!hydrated) return;
    if (sessionUserId) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(managedProperties));
  }, [hydrated, managedProperties, sessionUserId]);

  const summary = useMemo(() => summarizePortfolio(managedProperties), [managedProperties]);
  const agendaReferenceDate = getTodayDateString();
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

  async function saveDraft(draft: PropertyDraft, mode: "create" | "edit", contractFile?: File | null, options: ContractSaveOptions = {}) {
    const saveReferenceDate = getTodayDateString();
    const validationError = getPropertyDraftValidationError(draft);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (hasExpiredActiveContract(draft, saveReferenceDate) && !options.confirmExpiredContract) {
      setFormError("Confirme que deseja salvar este imóvel como alugado com um contrato já vencido.");
      return;
    }

    if (supabase && sessionUserId) {
      setIsSaving(true);
      setFormError(null);
      setFormMessage(null);

      const fileValidationError = contractFile ? getContractFileValidationError(contractFile) : undefined;
      if (fileValidationError) {
        setIsSaving(false);
        setFormError(fileValidationError);
        return;
      }

      const current = draft.id ? managedProperties.find((property) => property.id === draft.id) : undefined;
      const payload = buildPropertyMutationPayload(draft, {
        userId: sessionUserId,
        mode,
        current,
        removeContract: options.removeExistingContract && !contractFile,
        confirmExpiredContract: options.confirmExpiredContract,
        referenceDate: saveReferenceDate,
      });
      const request = mode === "create"
        ? supabase.from("properties").insert(payload).select(propertyColumns).single()
        : supabase.from("properties").update(payload).eq("id", draft.id ?? "").select(propertyColumns).single();
      const { data, error } = await request;

      if (error) {
        setIsSaving(false);
        setFormError(`Não foi possível salvar no Supabase (${error.message}).`);
        return;
      }

      let saved = mapSupabaseRow(data as unknown as SupabasePropertyRow);
      let storageCleanupWarning: string | null = null;
      const previousContractPath = normalizeContractStoragePath(current?.contractUrl);

      if (contractFile) {
        try {
          const uploadResult = await uploadContractAttachment({ file: contractFile, propertyId: saved.id, supabaseClient: supabase });
          const { data: updatedData, error: updateError } = await supabase
            .from("properties")
            .update({ contract_url: uploadResult.path })
            .eq("id", saved.id)
            .select(propertyColumns)
            .single();

          if (updateError) {
            await supabase.storage.from(CONTRACT_ATTACHMENTS_BUCKET).remove([uploadResult.path]);
            throw new Error(updateError.message);
          }

          saved = mapSupabaseRow(updatedData as unknown as SupabasePropertyRow);

          if (previousContractPath && previousContractPath !== uploadResult.path) {
            const { error: cleanupError } = await supabase.storage
              .from(CONTRACT_ATTACHMENTS_BUCKET)
              .remove([previousContractPath]);
            if (cleanupError) {
              storageCleanupWarning = `Imóvel e novo contrato salvos, mas o arquivo anterior não pôde ser limpo do Storage (${cleanupError.message}).`;
            }
          }
        } catch (uploadError) {
          setIsSaving(false);
          setManagedProperties((currentProperties) => {
            if (mode === "create") {
              return [saved, ...currentProperties];
            }

            return currentProperties.map((property) => (property.id === saved.id ? saved : property));
          });
          setFormError(
            uploadError instanceof Error
              ? `Imóvel salvo, mas o anexo não foi enviado (${uploadError.message}).`
              : "Imóvel salvo, mas o anexo não foi enviado.",
          );
          setFormMessage("Você pode tentar anexar novamente na edição ou no detalhe do imóvel.");
          return;
        }
      } else if (options.removeExistingContract && previousContractPath) {
        const { error: cleanupError } = await supabase.storage
          .from(CONTRACT_ATTACHMENTS_BUCKET)
          .remove([previousContractPath]);
        if (cleanupError) {
          storageCleanupWarning = `Edição salva e vínculo removido, mas o arquivo não pôde ser limpo do Storage (${cleanupError.message}).`;
        }
      }

      setIsSaving(false);
      setManagedProperties((currentProperties) => {
        if (mode === "create") {
          return [saved, ...currentProperties];
        }

        return currentProperties.map((property) => (property.id === saved.id ? saved : property));
      });
      setEditingDraft(null);
      setNewDraft(emptyPropertyDraft);
      setFormError(null);
      setFormMessage(
        storageCleanupWarning ?? (contractFile
          ? "Imóvel e contrato salvos no Supabase."
          : options.removeExistingContract
            ? "Edição salva e contrato removido do imóvel."
            : mode === "create"
            ? "Imóvel salvo no Supabase com seu usuário como dono."
            : "Edição salva no Supabase."),
      );
      if (shouldRedirectAfterPropertySave(mode, { savedToSupabase: true })) {
        router.push("/imoveis");
      }
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

  async function deleteProperty(property: PropertyRecord) {
    if (supabase && sessionUserId) {
      setIsSaving(true);
      setFormError(null);
      setFormMessage(null);

      try {
        await deletePropertyAndAttachments({ property, supabaseClient: supabase });
      } catch (error) {
        setIsSaving(false);
        setPropertyPendingDeletion(null);
        setFormError(
          error instanceof Error
            ? `Não foi possível excluir o imóvel (${error.message}).`
            : "Não foi possível excluir o imóvel.",
        );
        return;
      }

      setIsSaving(false);
      setManagedProperties((currentProperties) => currentProperties.filter((item) => item.id !== property.id));
      setEditingDraft((currentDraft) => (currentDraft?.id === property.id ? null : currentDraft));
      setPropertyPendingDeletion(null);
      setFormMessage("Imóvel excluído da sua carteira privada.");
      return;
    }

    setManagedProperties((currentProperties) => currentProperties.filter((item) => item.id !== property.id));
    setEditingDraft((currentDraft) => (currentDraft?.id === property.id ? null : currentDraft));
    setPropertyPendingDeletion(null);
    setFormError(null);
    setFormMessage("Rascunho local removido deste navegador.");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader mode={mode} supabaseReady={supabaseReady} dataSource={currentDataSource} hasLocalChanges={hasLocalChanges} sessionUserId={sessionUserId} />

      <ConfirmationDialog
        open={Boolean(propertyPendingDeletion)}
        title={propertyPendingDeletion ? `Excluir ${propertyPendingDeletion.buildingName}?` : "Excluir imóvel?"}
        description="O cadastro e os anexos privados deste imóvel serão removidos. Esta ação não pode ser desfeita."
        confirmLabel="Excluir imóvel"
        busy={isSaving}
        onCancel={() => setPropertyPendingDeletion(null)}
        onConfirm={() => {
          if (propertyPendingDeletion) void deleteProperty(propertyPendingDeletion);
        }}
      />

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
        hydrated
          ? <Overview summary={summary} priorities={priorities} contractAgenda={contractAgenda} />
          : <WorkspaceLoading label="Carregando resumo da carteira" />
      ) : null}

      {mode === "list" ? (
        hydrated ? <PropertyList
          activeFilter={activeFilter}
          filterOptions={filterOptions}
          filteredProperties={filteredProperties}
          editingDraft={editingDraft}
          formError={formError}
          formMessage={formMessage}
          isSaving={isSaving}
          onDelete={setPropertyPendingDeletion}
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
          onSave={(draft, contractFile, options) => saveDraft(draft, "edit", contractFile, options)}
        /> : <WorkspaceLoading label="Carregando seus imóveis" />
      ) : null}

      {mode === "new" ? (
        hydrated ? <Card>
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
              onSave={(draft, contractFile, options) => saveDraft(draft, "create", contractFile, options)}
              saveLabel={sessionUserId ? "Salvar no Supabase" : "Salvar rascunho"}
            />
          </CardContent>
        </Card> : <WorkspaceLoading label="Preparando o cadastro" />
      ) : null}
    </div>
  );
}

function WorkspaceLoading({ label }: { label: string }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label={label}>
      {[0, 1, 2, 3].map((item) => (
        <Card key={item}>
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-28 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-8 w-40 animate-pulse rounded-xl bg-surface-muted" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-surface-muted" />
          </CardContent>
        </Card>
      ))}
      <p className="sr-only">{label}</p>
    </section>
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
      description: "Comece pelo resumo do mês e siga pelos atalhos. A ideia é qualquer pessoa da família entender o próximo passo sem explicação técnica.",
    },
    list: {
      eyebrow: "Carteira",
      title: "Imóveis e pagamentos",
      description: "Consulte, edite, abra detalhes ou exclua imóveis da sua conta privada.",
    },
    new: {
      eyebrow: "Cadastro",
      title: "Adicionar imóvel",
      description: "Cadastre primeiro o essencial; contrato, reajuste e observações podem ser completados depois.",
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
    { label: "Receita contratada", value: formatCurrency(summary.grossRent), hint: `${summary.rentedCount}/${summary.propertyCount} imóveis alugados` },
    { label: "Receita recebida", value: formatCurrency(summary.receivedRent), hint: `${summary.paidRentCount}/${summary.rentedCount} aluguéis pagos` },
    { label: "Receita pendente", value: formatCurrency(summary.pendingRent), hint: `${summary.pendingRentCount} aluguéis pendentes` },
    { label: "Desalugados", value: String(summary.propertyCount - summary.rentedCount), hint: "Cadastrados sem contrato vigente" },
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
  onDelete,
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
  onDelete: (property: PropertyRecord) => void;
  onEdit: (property: PropertyRecord) => void;
  onFilterChange: (filter: PortfolioFilter) => void;
  onSave: (draft: PropertyDraft, contractFile?: File | null, options?: ContractSaveOptions) => void;
}) {
  const hasProperties = filteredProperties.length > 0;

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <CardTitle>Carteira de imóveis</CardTitle>
            <CardDescription>
              {filteredProperties.length} imóvel(is) neste filtro. Use os filtros para priorizar cobranças, dados faltantes e contratos que precisam de atenção.
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-sm leading-6 text-slate-400">
            <span className="font-semibold text-slate-200">Fluxo sugerido:</span> abra Detalhes para revisar contrato e histórico, use Editar para corrigir dados rápidos e cadastre um novo imóvel pelo botão ao lado.
          </div>
        </div>
        <ButtonLink href="/imoveis/novo" className="w-full whitespace-nowrap sm:w-auto">Novo imóvel</ButtonLink>
      </CardHeader>
      <CardContent>
        {editingDraft ? (
          <div className="mb-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
            <div className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-100">Editando imóvel</p>
                <p className="text-sm text-slate-400">Revise os dados e salve. Para anexos, use Detalhes se preferir uma tela dedicada.</p>
              </div>
              <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Fechar edição</Button>
            </div>
            <PropertyForm
              key={editingDraft.id ?? "editing-property"}
              draft={editingDraft}
              formError={formError}
              formMessage={formMessage}
              isSaving={isSaving}
              onCancel={onCancel}
              onChange={onDraftChange}
              onSave={onSave}
              saveLabel="Salvar edição"
              currentContractUrl={filteredProperties.find((property) => property.id === editingDraft.id)?.contractUrl}
            />
          </div>
        ) : null}
        <div className="mb-4 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === activeFilter}
              onClick={() => onFilterChange(option.id)}
              className={
                option.id === activeFilter
                  ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  : "rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10 outline-none transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              }
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        {!hasProperties ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/60 p-6 text-sm text-slate-300">
            <p className="font-semibold text-white">{activeFilter === "all" ? "Sua carteira ainda está vazia" : "Nenhum imóvel neste filtro"}</p>
            <p className="mt-2 max-w-2xl leading-6 text-slate-400">
              {activeFilter === "all"
                ? "Comece cadastrando o primeiro imóvel. Depois você poderá acompanhar pagamentos, contratos e pontos de atenção neste mesmo lugar."
                : "Troque o filtro para revisar a carteira completa ou cadastre um novo imóvel quando o cadastro ainda não existir."}
            </p>
            <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
              {activeFilter !== "all" ? <Button type="button" variant="secondary" onClick={() => onFilterChange("all")}>Ver todos os imóveis</Button> : null}
              <ButtonLink href="/imoveis/novo">Cadastrar imóvel</ButtonLink>
            </div>
          </div>
        ) : null}

        {hasProperties ? (
          <div className="grid gap-3 2xl:hidden">
            {filteredProperties.map((property) => (
              <PropertyMobileCard key={property.id} property={property} isSaving={isSaving} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </div>
        ) : null}

        {hasProperties ? (
        <div className="hidden 2xl:block">
          <table className="w-full table-fixed border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-2">Imóvel</th>
                <th className="px-4 py-2">Inquilino</th>
                <th className="px-4 py-2">Situação</th>
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
                const occupancy = propertyOccupancyStatus(property);
                const alerts = getPropertyAlerts(property);
                const statusReason = alerts.find((alert) => alert.severity === "danger") ?? alerts.find((alert) => alert.severity === "warning");
                return (
                  <tr key={property.id} className="bg-slate-900/80 shadow-lg shadow-black/10">
                    <td className="rounded-l-2xl px-4 py-4 font-medium text-white">
                      <Link href={`/imoveis/${encodeURIComponent(property.id)}`} className="transition hover:text-emerald-300">
                        {property.buildingName}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {alerts.slice(0, 2).map((alert) => (
                          <Badge key={alert.label} variant={alert.severity}>{alert.label}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{property.tenantName ?? "Não informado"}</td>
                    <td className="px-4 py-4"><Badge variant={badgeVariantByOccupancy[occupancy]}>{occupancy}</Badge></td>
                    <td className="px-4 py-4 text-slate-300">
                      <div>{property.isRented ? formatMonthlyDueDay(property.paymentDueDate) : "Sem cobrança ativa"}</div>
                      <div className="text-xs text-slate-500">{property.isRented ? (property.isRentPaid ? "Pago" : "Pendente") : "Desalugado"}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-100">{formatCurrency(property.rentAmount)}</td>
                    <td className="px-4 py-4 text-slate-100">{formatCurrency(propertyExpenseTotal(property))}</td>
                    <td className="px-4 py-4 text-slate-300">{property.receivingBank ?? "—"}</td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={badgeVariantByStatus[status]}
                        title={statusReason?.label}
                        aria-label={statusReason ? `${status}: ${statusReason.label}` : status}
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <ButtonLink href={`/imoveis/${encodeURIComponent(property.id)}`} variant="secondary">Detalhes</ButtonLink>
                        <Button variant="secondary" onClick={() => onEdit(property)} disabled={isSaving}>Editar</Button>
                        <Button type="button" variant="danger" onClick={() => onDelete(property)} disabled={isSaving} title="Excluir somente imóveis de teste ou cadastros duplicados">Excluir</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PropertyMobileCard({ property, isSaving, onDelete, onEdit }: { property: PropertyRecord; isSaving: boolean; onDelete: (property: PropertyRecord) => void; onEdit: (property: PropertyRecord) => void }) {
  const status = primaryPropertyStatus(property);
  const occupancy = propertyOccupancyStatus(property);
  const propertyAlerts = getPropertyAlerts(property);
  const alerts = propertyAlerts.slice(0, 2);
  const statusReason = propertyAlerts.find((alert) => alert.severity === "danger") ?? propertyAlerts.find((alert) => alert.severity === "warning");

  return (
    <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href={`/imoveis/${encodeURIComponent(property.id)}`} className="text-base font-semibold text-white hover:text-emerald-300">
            {property.buildingName}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{property.tenantName || "Sem inquilino informado"}</p>
        </div>
        <div className="flex flex-wrap gap-1 sm:flex-col sm:items-end sm:text-right">
          <Badge variant={badgeVariantByOccupancy[occupancy]}>{occupancy}</Badge>
          <Badge
            variant={badgeVariantByStatus[status]}
            title={statusReason?.label}
            aria-label={statusReason ? `${status}: ${statusReason.label}` : status}
          >
            {status}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <CompactInfo label="Aluguel" value={formatCurrency(property.rentAmount)} />
        <CompactInfo label="Pagamento" value={property.isRented ? (property.isRentPaid ? "Pago" : "Pendente") : "Sem cobrança"} />
        <CompactInfo label="Vencimento" value={property.isRented ? formatMonthlyDueDay(property.paymentDueDate) : "—"} />
        <CompactInfo label="Banco" value={property.receivingBank || "—"} />
      </div>

      {alerts.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1">
          {alerts.map((alert) => (
            <Badge key={alert.label} variant={alert.severity}>{alert.label}</Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ButtonLink href={`/imoveis/${encodeURIComponent(property.id)}`} variant="secondary">Detalhes</ButtonLink>
        <Button type="button" variant="secondary" onClick={() => onEdit(property)} disabled={isSaving}>Editar</Button>
        <Button className="col-span-2" type="button" variant="danger" onClick={() => onDelete(property)} disabled={isSaving} title="Excluir somente imóveis de teste ou cadastros duplicados">Excluir</Button>
      </div>
    </div>
  );
}

function CompactInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-950/60 p-3 ring-1 ring-white/10">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
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
  currentContractUrl,
}: {
  draft: PropertyDraft;
  formError: string | null;
  formMessage: string | null;
  isSaving: boolean;
  onCancel: () => void;
  onChange: (draft: PropertyDraft) => void;
  onSave: (draft: PropertyDraft, contractFile?: File | null, options?: ContractSaveOptions) => void;
  saveLabel: string;
  currentContractUrl?: string;
}) {
  const paymentDueDay = getMonthlyDueDay(draft.paymentDueDate);
  const dateInputClassName = "text-ink [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:bg-primary [&::-webkit-calendar-picker-indicator]:p-1 [&::-webkit-calendar-picker-indicator]:opacity-100";
  const selectClassName = "min-h-10 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [adjustmentRule, setAdjustmentRule] = useState<"none" | "contract-start-year" | "contract-end" | "custom-period" | "custom-date">(
    draft.hasAnnualAdjustment ? "custom-date" : "none",
  );
  const [customAdjustmentMonths, setCustomAdjustmentMonths] = useState("12");
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractFileError, setContractFileError] = useState<string | null>(null);
  const [removeExistingContract, setRemoveExistingContract] = useState(false);
  const [isDraggingContract, setIsDraggingContract] = useState(false);
  const [confirmExpiredContract, setConfirmExpiredContract] = useState(false);

  const adjustmentEnabled = adjustmentRule !== "none" && draft.hasAnnualAdjustment;
  const expiredActiveContract = hasExpiredActiveContract(draft, getTodayDateString());

  function updateMonthlyDueDay(value: string) {
    onChange({ ...draft, paymentDueDate: buildMonthlyDueDate(value, draft.contractStartDate) });
  }

  function addMonthsToContractStart(monthsValue: string) {
    if (!draft.contractStartDate) return "";

    const parsedMonths = Number.parseInt(monthsValue, 10);
    if (!Number.isFinite(parsedMonths) || parsedMonths < 1) return "";

    const start = new Date(`${draft.contractStartDate}T00:00:00`);
    start.setMonth(start.getMonth() + parsedMonths);
    return getTodayDateString(start);
  }

  function updateAdjustmentRule(option: "none" | "contract-start-year" | "contract-end" | "custom-period" | "custom-date") {
    setAdjustmentRule(option);

    if (option === "none") {
      onChange({ ...draft, hasAnnualAdjustment: false, rentAdjustmentBaseDate: "", rentAdjustmentIndex: "" });
      return;
    }

    if (option === "contract-start-year") {
      const baseDate = addMonthsToContractStart("12");
      onChange({ ...draft, hasAnnualAdjustment: true, rentAdjustmentBaseDate: baseDate });
      return;
    }

    if (option === "contract-end") {
      onChange({ ...draft, hasAnnualAdjustment: true, rentAdjustmentBaseDate: draft.contractEndDate });
      return;
    }

    if (option === "custom-period") {
      const baseDate = addMonthsToContractStart(customAdjustmentMonths);
      onChange({ ...draft, hasAnnualAdjustment: true, rentAdjustmentBaseDate: baseDate });
      return;
    }

    onChange({ ...draft, hasAnnualAdjustment: true });
  }

  function updateCustomAdjustmentMonths(value: string) {
    setCustomAdjustmentMonths(value);
    onChange({ ...draft, hasAnnualAdjustment: true, rentAdjustmentBaseDate: addMonthsToContractStart(value) });
  }

  function selectContractFile(file: File | null) {
    setContractFile(file);
    setContractFileError(file ? getContractFileValidationError(file) ?? null : null);
    if (file) {
      setRemoveExistingContract(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft, contractFile, { removeExistingContract, confirmExpiredContract });
      }}
    >
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-cyan-50">
        <p className="font-semibold">Preencha primeiro o essencial</p>
        <p className="mt-1 leading-6 text-cyan-100/75">
          Campos com * são o mínimo para salvar. Para uso familiar, comece com imóvel e aluguel; vencimento, banco, contrato e reajuste podem ser completados depois.
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">Dados do imóvel</p>
          <p className="text-xs text-slate-500">Identificação básica para separar carteira, pagamento e contrato.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Label>
            <span>Imóvel <span className="text-emerald-300">*</span></span>
            <Input maxLength={PROPERTY_TEXT_LIMITS.buildingName} value={draft.buildingName} onChange={(event) => onChange({ ...draft, buildingName: event.target.value })} placeholder="Ex.: Apt. Demo 101" />
          </Label>
          <Label className="xl:col-span-2">
            Endereço/identificação
            <Input maxLength={PROPERTY_TEXT_LIMITS.propertyAddress} value={draft.propertyAddress} onChange={(event) => onChange({ ...draft, propertyAddress: event.target.value })} placeholder="Rua, prédio, bloco ou referência" />
          </Label>
          <Label>
            Banco de recebimento
            <Input maxLength={PROPERTY_TEXT_LIMITS.receivingBank} value={draft.receivingBank} onChange={(event) => onChange({ ...draft, receivingBank: event.target.value })} placeholder="Ex.: Nubank" />
          </Label>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-white">Situação do imóvel</p>
          <p className="mt-1 text-xs text-slate-500">Cadastre imóveis alugados ou desalugados. Contrato e cobrança só ficam ativos quando o imóvel está alugado.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2" role="group" aria-label="Situação do imóvel">
            <button
              type="button"
              aria-pressed={draft.isRented}
              onClick={() => {
                setConfirmExpiredContract(false);
                onChange({ ...draft, isRented: true });
              }}
              className={draft.isRented ? "rounded-xl bg-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas" : "rounded-xl bg-surface-muted px-4 py-3 text-left text-sm font-semibold text-ink ring-1 ring-line outline-none transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"}
            >
              Alugado
              <span className="block text-xs font-normal opacity-75">Tem cobrança ativa, inquilino e contrato vigente ou em revisão.</span>
            </button>
            <button
              type="button"
              aria-pressed={!draft.isRented}
              onClick={() => {
                setConfirmExpiredContract(false);
                onChange({ ...draft, isRented: false, isRentPaid: false });
              }}
              className={!draft.isRented ? "rounded-xl bg-surface-muted px-4 py-3 text-left text-sm font-semibold text-ink outline-none ring-1 ring-line focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas" : "rounded-xl bg-surface-muted px-4 py-3 text-left text-sm font-semibold text-ink ring-1 ring-line outline-none transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"}
            >
              Desalugado
              <span className="block text-xs font-normal opacity-75">Fica na carteira sem cobrança ativa nem contrato obrigatório.</span>
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-white">Inquilino e aluguel</p>
          <p className="text-xs text-slate-500">{draft.isRented ? "Campos para acompanhar cobrança e contato." : "Opcional enquanto o imóvel estiver desalugado."}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Label>
            Inquilino
            <Input maxLength={PROPERTY_TEXT_LIMITS.tenantName} value={draft.tenantName} onChange={(event) => onChange({ ...draft, tenantName: event.target.value })} placeholder="Opcional" />
          </Label>
          <Label>
            Contato do inquilino
            <Input maxLength={PROPERTY_TEXT_LIMITS.tenantContact} value={draft.tenantContact} onChange={(event) => onChange({ ...draft, tenantContact: event.target.value })} placeholder="Telefone, e-mail ou WhatsApp" />
          </Label>
          <Label>
            Dia do vencimento mensal
            <Input
              inputMode="numeric"
              min="1"
              max="31"
              type="number"
              value={paymentDueDay}
              onChange={(event) => updateMonthlyDueDay(event.target.value)}
              placeholder="Ex.: 10"
            />
            <span className="text-xs font-normal text-slate-500">Use só o dia do mês; o contrato define o período.</span>
          </Label>
          <Label>
            <span>Aluguel <span className="text-emerald-300">*</span></span>
            <Input inputMode="decimal" value={draft.rentAmount} onChange={(event) => onChange({ ...draft, rentAmount: event.target.value })} placeholder="0,00" />
          </Label>
          <label className="flex min-h-10 items-center gap-3 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300">
            <input type="checkbox" checked={draft.isRentPaid} disabled={!draft.isRented} onChange={(event) => onChange({ ...draft, isRentPaid: event.target.checked })} className="size-4 accent-emerald-300 disabled:opacity-50" />
            Aluguel pago
          </label>
          {!draft.isRented ? (
            <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-sm text-cyan-50">
              Imóvel desalugado não entra em receita pendente nem exige contrato vigente.
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
        <div>
          <p className="text-sm font-semibold text-white">Base contratual</p>
          <p className="text-xs text-slate-500">{draft.isRented ? "Registre datas, regra de reajuste e anexo opcional após revisão manual." : "Opcional: use apenas quando existir contrato vigente ou histórico que você queira guardar."}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Label>
            Início do contrato
            <Input
              className={dateInputClassName}
              type="date"
              value={draft.contractStartDate}
              onChange={(event) => {
                setConfirmExpiredContract(false);
                onChange({ ...draft, contractStartDate: event.target.value });
              }}
            />
          </Label>
          <Label>
            Vencimento do contrato
            <Input
              className={dateInputClassName}
              type="date"
              min={draft.contractStartDate || undefined}
              value={draft.contractEndDate}
              onChange={(event) => {
                setConfirmExpiredContract(false);
                onChange({ ...draft, contractEndDate: event.target.value });
              }}
            />
          </Label>
          {expiredActiveContract ? (
            <label className="flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/10 px-3 py-3 text-sm text-ink md:col-span-2 xl:col-span-4">
              <input
                className="mt-0.5 size-4 accent-primary"
                type="checkbox"
                checked={confirmExpiredContract}
                onChange={(event) => setConfirmExpiredContract(event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-danger">Este contrato já está vencido</span>
                <span className="mt-1 block text-xs font-normal text-ink-muted">
                  Confirme para manter o imóvel como alugado mesmo com o vencimento no passado.
                </span>
              </span>
            </label>
          ) : null}
          <Label className="md:col-span-2">
            Regra da data base do reajuste
            <select
              className={selectClassName}
              value={adjustmentRule}
              onChange={(event) =>
                updateAdjustmentRule(
                  event.target.value as "none" | "contract-start-year" | "contract-end" | "custom-period" | "custom-date",
                )
              }
            >
              <option value="none">Sem cláusula de reajuste</option>
              <option value="contract-start-year" disabled={!draft.contractStartDate}>1 ano do início do contrato</option>
              <option value="contract-end" disabled={!draft.contractEndDate}>Ao fim do contrato</option>
              <option value="custom-period" disabled={!draft.contractStartDate}>Período personalizado após o início</option>
              <option value="custom-date">Data personalizada</option>
            </select>
          </Label>
          {adjustmentRule === "custom-period" ? (
            <Label>
              Período personalizado
              <Input
                inputMode="numeric"
                min="1"
                type="number"
                value={customAdjustmentMonths}
                onChange={(event) => updateCustomAdjustmentMonths(event.target.value)}
                placeholder="Ex.: 18"
              />
              <span className="text-xs font-normal text-slate-500">Quantidade de meses após o início do contrato.</span>
            </Label>
          ) : null}
          <Label>
            Data base do reajuste
            <Input
              className={dateInputClassName}
              type="date"
              value={draft.rentAdjustmentBaseDate}
              disabled={!adjustmentEnabled || adjustmentRule !== "custom-date"}
              onChange={(event) => onChange({ ...draft, hasAnnualAdjustment: true, rentAdjustmentBaseDate: event.target.value })}
            />
            {adjustmentRule !== "custom-date" && adjustmentEnabled ? (
              <span className="text-xs font-normal text-slate-500">Calculada pela regra escolhida.</span>
            ) : null}
          </Label>
          <Label className="md:col-span-2">
            Índice/cláusula
            <Input
              maxLength={PROPERTY_TEXT_LIMITS.rentAdjustmentIndex}
              value={draft.rentAdjustmentIndex}
              disabled={!adjustmentEnabled}
              onChange={(event) => onChange({ ...draft, hasAnnualAdjustment: true, rentAdjustmentIndex: event.target.value })}
              placeholder="Ex.: IPCA, IGP-M ou regra escrita no contrato"
            />
          </Label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-300 md:col-span-2 xl:col-span-4">
            Observações contratuais
            <textarea
              maxLength={PROPERTY_TEXT_LIMITS.contractNotes}
              value={draft.contractNotes}
              onChange={(event) => onChange({ ...draft, contractNotes: event.target.value })}
              placeholder="Ex.: cláusula de reajuste, prazo de renovação, condições especiais"
              className="min-h-24 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/60"
            />
          </label>
          {currentContractUrl ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300 md:col-span-2 xl:col-span-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-100">Contrato atual registrado</p>
                  <p className="mt-1 text-slate-500">Você pode manter o anexo atual, substituir anexando outro arquivo, ou remover o vínculo do imóvel.</p>
                  {removeExistingContract ? <p className="mt-2 text-red-100">O contrato atual será removido ao salvar a edição.</p> : null}
                </div>
                <Button
                  className="w-full sm:w-auto"
                  type="button"
                  variant={removeExistingContract ? "secondary" : "danger"}
                  onClick={() => {
                    setRemoveExistingContract((current) => !current);
                    selectContractFile(null);
                  }}
                  disabled={isSaving}
                >
                  {removeExistingContract ? "Manter contrato" : "Remover contrato atual"}
                </Button>
              </div>
            </div>
          ) : null}
          <div
            className={`rounded-2xl border border-dashed p-4 text-sm text-slate-400 transition md:col-span-2 xl:col-span-4 ${
              isDraggingContract ? "border-emerald-300/70 bg-emerald-300/[0.08]" : "border-white/15 bg-slate-950/60 hover:border-emerald-300/40"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDraggingContract(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingContract(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDraggingContract(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDraggingContract(false);
              selectContractFile(event.dataTransfer.files?.[0] ?? null);
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-200">Anexo do contrato opcional</p>
                <p className="mt-1 leading-6">
                  Arraste um PDF/DOCX para esta área ou use o botão. Se selecionado, o contrato será enviado junto ao imóvel.
                </p>
                {contractFile ? <p className="mt-2 text-cyan-100">Selecionado: {contractFile.name}</p> : null}
                {contractFileError ? <p className="mt-2 text-red-200">{contractFileError}</p> : null}
              </div>
              <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                  Anexar arquivo
                </Button>
                {contractFile ? (
                  <Button type="button" variant="secondary" onClick={() => selectContractFile(null)} disabled={isSaving}>
                    Remover
                  </Button>
                ) : null}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={`${CONTRACT_ATTACHMENT_ALLOWED_MIME_TYPES.join(",")},.pdf,.docx`}
              className="sr-only"
              disabled={isSaving}
              onChange={(event) => selectContractFile(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </section>

      {formError ? <p className="rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100" role="alert">{formError}</p> : null}
      {formMessage ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100" role="status">{formMessage}</p> : null}

      <div className="grid gap-3 sm:flex sm:flex-wrap">
        <Button type="submit" disabled={isSaving || Boolean(contractFileError)}>{isSaving ? "Salvando..." : saveLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancelar</Button>
      </div>
    </form>
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

