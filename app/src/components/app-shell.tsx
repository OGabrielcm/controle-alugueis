"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Building2, FileSpreadsheet, Home, Plus, TableProperties } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Resumo", icon: Home },
  { href: "/imoveis", label: "Imóveis", icon: TableProperties },
  { href: "/imoveis/novo", label: "Novo imóvel", icon: Plus },
  { href: "/importar", label: "Importar", icon: FileSpreadsheet },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-slate-950/85 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/20">
              <Building2 size={20} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">Controle de aluguéis</span>
              <span className="block text-xs text-slate-500">Carteira imobiliária</span>
            </span>
          </Link>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50 lg:block">
            <p className="font-semibold">Dados em validação</p>
            <p className="mt-1 text-xs leading-5 text-amber-100/75">
              A base atual vem do CSV de fevereiro/2023 e serve como estrutura/demo, não como verdade operacional.
            </p>
          </div>
        </aside>

        <main className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
