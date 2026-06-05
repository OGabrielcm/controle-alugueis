"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGIN_PATH } from "@/lib/session-routes";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export function ResetPasswordPanel() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const configured = hasSupabaseConfig();

  async function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY antes de redefinir senha.");
      return;
    }

    if (password.length < 8) {
      setError("Use pelo menos 8 caracteres.");
      return;
    }

    setStatus("submitting");
    const response = await supabase.auth.updateUser({ password });
    setStatus("idle");

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setPassword("");
    setMessage("Senha redefinida. Redirecionando para o login...");
    window.setTimeout(() => router.replace(LOGIN_PATH), 1200);
  }

  return (
    <Card className="border-emerald-300/20 bg-emerald-300/[0.04]">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>Use esta tela depois de abrir o link de recuperação enviado pelo Supabase.</CardDescription>
          </div>
          <Badge variant={configured ? "success" : "warning"}>{configured ? "Supabase Auth pronto" : "Supabase sem env"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={submitNewPassword} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={status !== "idle" || !configured}>
              <KeyRound size={16} />
              {status === "submitting" ? "Salvando..." : "Salvar nova senha"}
            </Button>
            <Link
              href={LOGIN_PATH}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
            >
              Voltar para login
            </Link>
          </div>
        </form>

        {error ? <p className="rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
        {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">{message}</p> : null}

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-400">
          <p className="font-semibold text-slate-200">Acesso pelo link de recuperação</p>
          <p className="mt-1">
            Se você abriu esta página direto sem usar o link do e-mail, peça uma nova recuperação na tela dedicada de recuperação.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
