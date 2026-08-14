"use client";

import type { User } from "@supabase/supabase-js";
import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { LOGIN_PATH, SIGNUP_PATH } from "@/lib/session-routes";
import { supabase } from "@/lib/supabase";

export function SessionControl() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(supabase));
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    getAuthenticatedUser(supabase.auth).then(({ user: authenticatedUser, error }) => {
      if (!mounted) return;
      setUser(authenticatedUser);
      setSessionError(error);
      setIsCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionError(null);
      setIsCheckingSession(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (!supabase) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsSigningOut(false);
    router.replace(LOGIN_PATH);
  }

  if (isCheckingSession || sessionError) {
    return (
      <div className="mt-4 rounded-2xl border border-line bg-surface-muted p-3 text-sm text-ink lg:mt-3 lg:p-4">
        <p className="font-semibold">{sessionError ? "Sessão indisponível" : "Carregando sessão"}</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          {sessionError ? "A conexão falhou, mas seus dados não foram tratados como ausentes." : "Confirmando seu acesso privado."}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-50 lg:mt-3 lg:p-4">
        <p className="font-semibold">MVP privado</p>
        <p className="mt-1 text-xs leading-5 text-emerald-100/75">
          Login e cadastro ficam fora do dashboard operacional.
        </p>
        <div className="mt-3 flex gap-2">
          <Link className="text-xs font-semibold text-emerald-100 hover:text-white" href={LOGIN_PATH}>Entrar</Link>
          <span className="text-emerald-100/40">•</span>
          <Link className="text-xs font-semibold text-emerald-100 hover:text-white" href={SIGNUP_PATH}>Cadastrar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-50 lg:mt-3 lg:p-4">
      <div className="flex items-start gap-2">
        <UserCircle className="mt-0.5 shrink-0" size={17} />
        <div className="min-w-0">
          <p className="font-semibold">Sessão ativa</p>
          <p className="mt-1 truncate text-xs text-emerald-100/75">{user.email}</p>
        </div>
      </div>
      <button
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200/15 px-3 text-xs font-medium text-emerald-100/75 transition hover:bg-emerald-200/10 hover:text-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 lg:min-h-0 lg:w-auto lg:justify-start lg:border-0 lg:px-0"
        type="button"
        onClick={signOut}
        disabled={isSigningOut}
      >
        <LogOut size={13} /> {isSigningOut ? "Saindo..." : "Sair"}
      </button>
    </div>
  );
}
