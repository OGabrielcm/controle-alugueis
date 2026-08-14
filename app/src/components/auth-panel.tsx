"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AuthMode,
  getAuthModeCopy,
  validateAuthForm,
  validateSignupForm,
} from "@/lib/auth-form";
import { DASHBOARD_HOME, PASSWORD_RECOVERY_PATH, SIGNUP_CONFIRMATION_PATH } from "@/lib/session-routes";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type AuthStatus = "idle" | "submitting";

type AuthPanelProps = {
  mode: AuthMode;
};

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const copy = getAuthModeCopy(mode);
  const configured = hasSupabaseConfig();
  const alternateHref = mode === "login" ? "/cadastro" : "/login";

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY antes de usar autenticação.");
      return;
    }

    if (mode === "signup") {
      const validated = validateSignupForm({ fullName, email, emailConfirmation, password, passwordConfirmation });
      if (!validated.ok) {
        setError(validated.error);
        return;
      }

      setStatus("submitting");
      const response = await supabase.auth.signUp({
        email: validated.data.email,
        password: validated.data.password,
        options: {
          data: {
            full_name: validated.data.fullName,
          },
          // The link returns to the same public origin where the person started signup.
          // Supabase must allow this exact origin in Authentication → URL Configuration.
          emailRedirectTo: `${window.location.origin}${SIGNUP_CONFIRMATION_PATH}`,
        },
      });
      setStatus("idle");

      if (response.error) {
        setError(response.error.message);
        return;
      }

      await supabase.auth.signOut();
      setFullName("");
      setEmail("");
      setEmailConfirmation("");
      setPassword("");
      setPasswordConfirmation("");
      router.replace(`${SIGNUP_CONFIRMATION_PATH}?email=${encodeURIComponent(validated.data.email)}`);
      return;
    }

    const validated = validateAuthForm({ email, password });
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setStatus("submitting");

    const response = await supabase.auth.signInWithPassword(validated.data);
    setStatus("idle");

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setPassword("");
    setMessage("Login validado. Redirecionando para o dashboard privado...");
    router.replace(DASHBOARD_HOME);
  }

  return (
    <Card className="border-line bg-surface shadow-md shadow-primary/5">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
          <Badge variant={configured ? "success" : "warning"}>{configured ? "Acesso disponível" : "Acesso indisponível"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={submitAuth} className="grid gap-4">
          {mode === "signup" ? (
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nome</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                minLength={2}
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {mode === "signup" ? (
            <div className="grid gap-2">
              <Label htmlFor="emailConfirmation">Confirmar e-mail</Label>
              <Input
                id="emailConfirmation"
                type="email"
                autoComplete="email"
                placeholder="repita seu e-mail"
                value={emailConfirmation}
                onChange={(event) => setEmailConfirmation(event.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          {mode === "signup" ? (
            <div className="grid gap-2">
              <Label htmlFor="passwordConfirmation">Confirmar senha</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                placeholder="repita sua senha"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                required
                minLength={8}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={status !== "idle" || !configured}>
              {mode === "signup" ? <UserPlus size={16} /> : <Lock size={16} />}
              {status === "submitting" ? "Enviando..." : copy.submitLabel}
            </Button>
            <Link
              href={alternateHref}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {copy.alternateLabel}
            </Link>
          </div>

          {mode === "login" ? (
            <Link
              href={PASSWORD_RECOVERY_PATH}
              className="w-fit text-left text-xs font-medium text-ink-muted underline-offset-4 transition hover:text-primary hover:underline"
            >
              Esqueci minha senha: recuperar por e-mail
            </Link>
          ) : null}
        </form>

        {error ? <p className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p> : null}
        {message ? <p className="rounded-xl border border-primary/20 bg-primary-soft p-3 text-sm text-primary" role="status" aria-live="polite">{message}</p> : null}

        <div className="rounded-2xl border border-line bg-surface-muted p-4 text-sm leading-6 text-ink-muted">
          <p className="font-semibold text-ink">Fluxo separado e protegido</p>
          <p className="mt-1">
            Login e cadastro ficam fora da área operacional. Cadastro não conta como login verificado: confirme o e-mail, entre pela página de login e só então acesse o dashboard privado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
