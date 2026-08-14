"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Building2, FileSpreadsheet, Home, Plus, TableProperties } from "lucide-react";
import { SessionControl } from "@/components/session-control";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/lib/auth-session";
import { DASHBOARD_HOME, LOGIN_PATH, isAuthRoute, isOperationalRoute } from "@/lib/session-routes";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: DASHBOARD_HOME, label: "Resumo", icon: Home },
  { href: "/imoveis", label: "Imóveis", icon: TableProperties },
  { href: "/imoveis/novo", label: "Novo imóvel", icon: Plus },
  { href: "/importar", label: "Importação (em breve)", icon: FileSpreadsheet },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionStatus, setSessionStatus] = useState<"checking" | "authenticated" | "error">("checking");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionCheckAttempt, setSessionCheckAttempt] = useState(0);
  const authRoute = isAuthRoute(pathname);
  const operationalRoute = isOperationalRoute(pathname);

  useEffect(() => {
    if (authRoute || !operationalRoute) {
      return;
    }

    if (!supabase) {
      router.replace(LOGIN_PATH);
      return;
    }

    let mounted = true;

    getAuthenticatedUser(supabase.auth).then(({ user, error }) => {
      if (!mounted) return;

      if (error) {
        setSessionStatus("error");
        setSessionError(error);
        return;
      }

      if (!user) {
        router.replace(LOGIN_PATH);
        return;
      }

      setSessionStatus("authenticated");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSessionError(null);
        setSessionStatus("checking");
        router.replace(LOGIN_PATH);
        return;
      }

      if (session?.user) {
        setSessionError(null);
        setSessionStatus("authenticated");
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [authRoute, operationalRoute, router, sessionCheckAttempt]);

  if (authRoute) {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,var(--app-glow-primary),transparent_30%),radial-gradient(circle_at_top_right,var(--app-glow-secondary),transparent_32%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-5">
          <div className="absolute right-5 top-5 sm:right-24 sm:top-36">
            <ThemeToggle />
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    );
  }

  if (operationalRoute && sessionStatus === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-5 text-center text-ink">
        <div>
          <p className="text-sm font-medium text-emerald-300">Validando sessão</p>
          <p className="mt-2 text-sm text-slate-400">Se não houver login ativo, você volta para a entrada privada.</p>
        </div>
      </div>
    );
  }

  if (operationalRoute && sessionStatus === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-5 text-center text-ink">
        <div className="max-w-md rounded-3xl border border-danger/25 bg-surface p-6 shadow-lg">
          <p className="font-semibold text-danger">Não foi possível validar sua sessão</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            A conexão com o Supabase falhou. Seus dados não foram tratados como ausentes.
          </p>
          {sessionError ? <p className="mt-3 text-xs text-ink-muted" role="alert">{sessionError}</p> : null}
          <Button
            className="mt-5"
            type="button"
            onClick={() => {
              setSessionStatus("checking");
              setSessionError(null);
              setSessionCheckAttempt((attempt) => attempt + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,var(--app-glow-primary),transparent_30%),radial-gradient(circle_at_top_right,var(--app-glow-secondary),transparent_32%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[280px_1fr]">
        <aside className="min-w-0 border-b border-line bg-surface/90 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-3">
            <Link href={DASHBOARD_HOME} className="flex items-center gap-3 rounded-2xl px-2 py-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/15">
                <Building2 size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">Controle de aluguéis</span>
                <span className="block text-xs text-ink-muted">Carteira imobiliária</span>
              </span>
            </Link>
            <ThemeToggle />
          </div>

          <nav aria-label="Navegação principal" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href === "/imoveis" && pathname.startsWith("/imoveis/") && pathname !== "/imoveis/novo");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                    active
                      ? "border border-primary/25 bg-primary-soft text-primary shadow-sm shadow-primary/10"
                      : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-warning/25 bg-warning/10 p-4 text-sm text-ink lg:block">
            <p className="font-semibold">Dados em validação</p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              A base atual vem do CSV de fevereiro/2023 e serve como estrutura/demo, não como verdade operacional.
            </p>
          </div>

          <SessionControl />
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
