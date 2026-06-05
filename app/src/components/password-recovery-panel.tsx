"use client";

import Link from "next/link";
import { MailQuestion } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPasswordRecoveryPageCopy, validatePasswordResetEmail } from "@/lib/auth-form";
import { LOGIN_PATH, PASSWORD_RESET_PATH } from "@/lib/session-routes";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export function PasswordRecoveryPanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const configured = hasSupabaseConfig();
  const copy = getPasswordRecoveryPageCopy();

  async function submitPasswordRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY antes de usar recuperação de senha.");
      return;
    }

    const validated = validatePasswordResetEmail(email);
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setStatus("submitting");
    const response = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: `${window.location.origin}${PASSWORD_RESET_PATH}`,
    });
    setStatus("idle");

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setMessage(copy.successMessage);
  }

  return (
    <Card className="border-emerald-300/20 bg-emerald-300/[0.04]">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
          <Badge variant={configured ? "success" : "warning"}>{configured ? "Supabase Auth pronto" : "Supabase sem env"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={submitPasswordRecovery} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="recovery-email">E-mail</Label>
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={status !== "idle" || !configured}>
              <MailQuestion size={16} />
              {status === "submitting" ? "Enviando..." : copy.submitLabel}
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
          <p className="font-semibold text-slate-200">Sem depender do login</p>
          <p className="mt-1">
            Esta tela tem campo próprio de e-mail. Por segurança, a resposta não confirma se a conta existe; confira entrada e spam.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
