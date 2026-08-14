"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  CONTRACT_ATTACHMENT_ALLOWED_MIME_TYPES,
  CONTRACT_ATTACHMENTS_BUCKET,
  createContractSignedUrl,
  getContractFileValidationError,
  normalizeContractStoragePath,
  uploadContractAttachment,
} from "@/lib/contract-attachment";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "controle-alugueis.contract-attachments.v1";

type ContractAttachmentPanelProps = {
  propertyId: string;
  initialContractUrl?: string;
  supabaseReady: boolean;
  onContractChange?: (contractPath?: string) => void;
};

function readLocalAttachment(propertyId: string) {
  if (typeof window === "undefined") return undefined;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as Record<string, string>;
    return parsed[propertyId];
  } catch {
    return undefined;
  }
}

function saveLocalAttachment(propertyId: string, storagePath: string) {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? (JSON.parse(stored) as Record<string, string>) : {};
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, [propertyId]: storagePath }));
}

function removeLocalAttachment(propertyId: string) {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? (JSON.parse(stored) as Record<string, string>) : {};
  delete parsed[propertyId];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
}

export function ContractAttachmentPanel({ propertyId, initialContractUrl, supabaseReady, onContractChange }: ContractAttachmentPanelProps) {
  const [contractPath, setContractPath] = useState(() => normalizeContractStoragePath(initialContractUrl ?? readLocalAttachment(propertyId)));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const signedLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (signedUrl) signedLinkRef.current?.focus();
  }, [signedUrl]);

  function selectFile(file: File | null) {
    setSelectedFile(file);
    setErrorMessage(file ? getContractFileValidationError(file) ?? null : null);
    setStatusMessage(file ? `Arquivo selecionado: ${file.name}` : null);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage("Selecione um PDF ou DOCX antes de enviar.");
      return;
    }

    const validationError = getContractFileValidationError(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!supabaseReady || !supabase) {
      setErrorMessage("Configure o Supabase e o bucket de contratos antes de enviar documentos.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage("Enviando contrato para o Supabase Storage...");

    try {
      const previousPath = contractPath;
      const result = await uploadContractAttachment({
        file: selectedFile,
        propertyId,
        supabaseClient: supabase,
      });
      const { data: updatedProperty, error: updateError } = await supabase
        .from("properties")
        .update({ contract_url: result.path })
        .eq("id", propertyId)
        .select("id, contract_url")
        .single();

      if (updateError || !updatedProperty) {
        await supabase.storage.from(CONTRACT_ATTACHMENTS_BUCKET).remove([result.path]);
        throw new Error(updateError?.message ?? "O imóvel não foi encontrado para registrar o contrato.");
      }

      const cleanupResult = previousPath && previousPath !== result.path
        ? await supabase.storage.from(CONTRACT_ATTACHMENTS_BUCKET).remove([previousPath])
        : { error: null };

      saveLocalAttachment(propertyId, result.path);
      setContractPath(result.path);
      onContractChange?.(result.path);
      setSelectedFile(null);
      setSignedUrl(null);
      setStatusMessage(
        cleanupResult.error
          ? `Novo contrato registrado, mas o arquivo anterior não pôde ser limpo do Storage (${cleanupResult.error.message}).`
          : "Contrato enviado e registrado no imóvel. O acesso será feito por link temporário.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível enviar o contrato.");
      setStatusMessage(null);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleOpenContract() {
    if (!contractPath) return;

    if (!supabaseReady || !supabase) {
      setErrorMessage("Entre com o usuário correto para gerar um link temporário do contrato.");
      return;
    }

    setIsOpening(true);
    setErrorMessage(null);
    setSignedUrl(null);
    setStatusMessage("Gerando link temporário do contrato...");

    try {
      const generatedUrl = await createContractSignedUrl({ path: contractPath, supabaseClient: supabase });
      setSignedUrl(generatedUrl);
      setStatusMessage("Link temporário pronto. Use o botão abaixo para abrir o documento.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível abrir o contrato.");
      setStatusMessage(null);
    } finally {
      setIsOpening(false);
    }
  }

  async function handleRemoveContract() {
    if (!contractPath) return;

    if (!supabaseReady || !supabase) {
      removeLocalAttachment(propertyId);
      setContractPath(undefined);
      onContractChange?.(undefined);
      setSignedUrl(null);
      setStatusMessage("Contrato removido do rascunho local.");
      setErrorMessage(null);
      setConfirmRemoval(false);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage("Removendo contrato do imóvel...");

    try {
      const { data: updatedProperty, error: updateError } = await supabase
        .from("properties")
        .update({ contract_url: null })
        .eq("id", propertyId)
        .select("id, contract_url")
        .single();

      if (updateError || !updatedProperty) {
        throw new Error(updateError?.message ?? "O imóvel não foi encontrado para remover o contrato.");
      }

      const { error: storageError } = await supabase.storage.from(CONTRACT_ATTACHMENTS_BUCKET).remove([contractPath]);
      removeLocalAttachment(propertyId);
      setContractPath(undefined);
      onContractChange?.(undefined);
      setSelectedFile(null);
      setSignedUrl(null);
      setStatusMessage(
        storageError
          ? `Vínculo removido do imóvel, mas o arquivo não pôde ser limpo do Storage (${storageError.message}).`
          : "Contrato removido do imóvel.",
      );
      setConfirmRemoval(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível remover o contrato.");
      setStatusMessage(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Anexo do contrato</CardTitle>
            <CardDescription>Upload de PDF ou DOCX por imóvel usando Supabase Storage.</CardDescription>
          </div>
          <Badge variant={contractPath ? "success" : "warning"}>{contractPath ? "com anexo" : "sem anexo"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-400 ring-1 ring-white/10">
          <p>
            Bucket esperado: <span className="font-mono text-slate-200">{CONTRACT_ATTACHMENTS_BUCKET}</span>
          </p>
          <p className="mt-2">
            Limite atual: PDF ou DOCX de até 10MB. O envio registra o caminho privado no imóvel e gera link temporário só na abertura.
          </p>
        </div>

        {contractPath ? (
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Button type="button" variant="secondary" onClick={handleOpenContract} disabled={isOpening || isUploading}>
              {isOpening ? "Gerando link..." : "Preparar abertura do contrato"}
            </Button>
            <Button type="button" variant="danger" onClick={() => setConfirmRemoval(true)} disabled={isOpening || isUploading}>
              {isUploading ? "Removendo..." : "Remover contrato"}
            </Button>
          </div>
        ) : null}

        {signedUrl ? (
          <a
            ref={signedLinkRef}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir documento em nova aba
          </a>
        ) : null}

        <label
          className={`block rounded-2xl border border-dashed p-4 text-sm text-slate-300 transition ${
            isDragging ? "border-emerald-300/70 bg-emerald-300/[0.08]" : "border-white/15 bg-slate-950 hover:border-emerald-300/40"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <span className="block font-medium text-slate-100">Arraste o contrato aqui ou selecione um arquivo</span>
          <span className="mt-1 block text-xs text-slate-500">PDF ou DOCX será enviado para o Storage quando o Supabase estiver configurado.</span>
          <input
            type="file"
            accept={`${CONTRACT_ATTACHMENT_ALLOWED_MIME_TYPES.join(",")},.pdf,.docx`}
            className="mt-3 block min-w-0 w-full max-w-full overflow-hidden text-ellipsis text-sm text-ink-muted file:mb-2 file:block file:max-w-full file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground sm:file:mb-0 sm:file:mr-4 sm:file:inline-block"
            disabled={isUploading}
            onChange={(event) => {
              selectFile(event.target.files?.[0] ?? null);
            }}
          />
        </label>

        {statusMessage ? <p className="text-sm text-cyan-100" role="status" aria-live="polite">{statusMessage}</p> : null}
        {errorMessage ? <p className="text-sm text-red-200" role="alert">{errorMessage}</p> : null}

        <Button className="w-full sm:w-auto" onClick={handleUpload} disabled={isUploading || !selectedFile}>
          {isUploading ? "Enviando..." : "Enviar contrato"}
        </Button>
      </CardContent>
      <ConfirmationDialog
        open={confirmRemoval}
        title="Remover contrato anexado?"
        description="O vínculo será apagado do imóvel e o arquivo privado será removido do Storage quando permitido. Esta ação não pode ser desfeita."
        confirmLabel="Remover contrato"
        busy={isUploading}
        onCancel={() => setConfirmRemoval(false)}
        onConfirm={handleRemoveContract}
      />
    </Card>
  );
}
