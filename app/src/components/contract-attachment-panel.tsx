"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function ContractAttachmentPanel({ propertyId, initialContractUrl, supabaseReady }: ContractAttachmentPanelProps) {
  const [contractPath, setContractPath] = useState(() => normalizeContractStoragePath(initialContractUrl ?? readLocalAttachment(propertyId)));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      const result = await uploadContractAttachment({
        file: selectedFile,
        propertyId,
        supabaseClient: supabase,
      });
      const { error: updateError } = await supabase.from("properties").update({ contract_url: result.path }).eq("id", propertyId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      saveLocalAttachment(propertyId, result.path);
      setContractPath(result.path);
      setSelectedFile(null);
      setStatusMessage("Contrato enviado e registrado no imóvel. O acesso será feito por link temporário.");
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
    setStatusMessage("Gerando link temporário do contrato...");

    try {
      const signedUrl = await createContractSignedUrl({ path: contractPath, supabaseClient: supabase });
      window.open(signedUrl, "_blank", "noopener,noreferrer");
      setStatusMessage("Link temporário gerado. Se não abriu, confira o bloqueador de pop-up do navegador.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível abrir o contrato.");
      setStatusMessage(null);
    } finally {
      setIsOpening(false);
    }
  }

  async function handleRemoveContract() {
    if (!contractPath) return;

    const confirmed = window.confirm("Remover o contrato anexado deste imóvel? O vínculo será apagado e o arquivo privado será removido quando permitido pelo Storage.");
    if (!confirmed) return;

    if (!supabaseReady || !supabase) {
      removeLocalAttachment(propertyId);
      setContractPath(undefined);
      setStatusMessage("Contrato removido do rascunho local.");
      setErrorMessage(null);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage("Removendo contrato do imóvel...");

    try {
      const { error: updateError } = await supabase.from("properties").update({ contract_url: null }).eq("id", propertyId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      await supabase.storage.from(CONTRACT_ATTACHMENTS_BUCKET).remove([contractPath]);
      removeLocalAttachment(propertyId);
      setContractPath(undefined);
      setSelectedFile(null);
      setStatusMessage("Contrato removido do imóvel.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível remover o contrato.");
      setStatusMessage(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
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
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={handleOpenContract} disabled={isOpening || isUploading}>
              {isOpening ? "Gerando link..." : "Abrir contrato anexado"}
            </Button>
            <Button type="button" variant="danger" onClick={handleRemoveContract} disabled={isOpening || isUploading}>
              {isUploading ? "Removendo..." : "Remover contrato"}
            </Button>
          </div>
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
            className="mt-3 block w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
            disabled={isUploading}
            onChange={(event) => {
              selectFile(event.target.files?.[0] ?? null);
            }}
          />
        </label>

        {statusMessage ? <p className="text-sm text-cyan-100">{statusMessage}</p> : null}
        {errorMessage ? <p className="text-sm text-red-200">{errorMessage}</p> : null}

        <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
          {isUploading ? "Enviando..." : "Enviar contrato"}
        </Button>
      </CardContent>
    </Card>
  );
}
