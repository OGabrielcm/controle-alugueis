"use client";

import type { User } from "@supabase/supabase-js";
import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LOGIN_PATH, SIGNUP_PATH } from "@/lib/session-routes";
import { supabase } from "@/lib/supabase";

export function SessionControl() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!supabase) return;

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

  async function signOut() {
    if (!supabase) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsSigningOut(false);
    router.replace(LOGIN_PATH);
  }

  if (!user) {
    return (
      <div className="mt-3 hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50 lg:block">
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
    <div className="mt-3 hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50 lg:block">
      <div className="flex items-start gap-2">
        <UserCircle className="mt-0.5 shrink-0" size={17} />
        <div className="min-w-0">
          <p className="font-semibold">Sessão ativa</p>
          <p className="mt-1 truncate text-xs text-emerald-100/75">{user.email}</p>
        </div>
      </div>
      <button
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-100/60 transition hover:text-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={signOut}
        disabled={isSigningOut}
      >
        <LogOut size={13} /> {isSigningOut ? "Saindo..." : "Sair"}
      </button>
    </div>
  );
}
