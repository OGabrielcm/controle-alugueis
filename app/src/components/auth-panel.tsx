"use client";

import type { User } from "@supabase/supabase-js";
import { Lock, LogOut, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type AuthMode, getAuthModeCopy, validateAuthForm } from "@/lib/auth-form";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type AuthStatus = "idle" | "submitting";

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const copy = getAuthModeCopy(mode);
  const configured = hasSupabaseConfig();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY antes de usar login.");
      return;
    }

    const validated = validateAuthForm({ email, password });
    if (!validated.ok) {
      setError(validated.error);
      return;
    }

    setStatus("submitting");

    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword(validated.data)
        : await supabase.auth.signUp(validated.data);

    setStatus("idle");

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setPassword("");
    setUser(response.data.user ?? null);
    setMessage(
      mode === "signup"
        ? "Conta criada. Se o Supabase pedir confirmação por e-mail, confirme antes de entrar."
        : "Login ativo. Próximo passo: gravar imóveis usando owner_id do usuário.",
    );
  }

  async function signOut() {
    if (!supabase) return;
    setStatus("submitting");
    const { error: signOutError } = await supabase.auth.signOut();
    setStatus("idle");

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    setUser(null);
    setMessage("Sessão encerrada.");
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
        {user ? (
          <div className="rounded-2xl border border-emerald-300/20 bg-slate-950/60 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Sessão autenticada</p>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Esse usuário será a base para preencher `owner_id = auth.uid()` quando o formulário gravar no Supabase.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={signOut} disabled={status === "submitting"}>
                <LogOut size={16} /> Sair
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitAuth} className="grid gap-4">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" disabled={status !== "idle" || !configured}>
                {mode === "signup" ? <UserPlus size={16} /> : <Lock size={16} />}
                {status === "submitting" ? "Enviando..." : copy.submitLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                  setMessage(null);
                }}
              >
                {copy.alternateLabel}
              </Button>
            </div>
          </form>
        )}

        {error ? <p className="rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
        {message ? <p className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">{message}</p> : null}

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-400">
          <p className="font-semibold text-slate-200">Escopo deste PR</p>
          <p className="mt-1">
            Este fluxo prepara autenticação e sessão no navegador. Ele ainda não grava imóveis reais; isso vem no próximo PR, usando o usuário autenticado para preencher `owner_id`.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
