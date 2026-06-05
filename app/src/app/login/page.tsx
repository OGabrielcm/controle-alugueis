import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-5 py-10">
      <header className="max-w-3xl">
        <Link href="/cadastro" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          Criar conta separada
        </Link>
        <p className="mt-8 text-sm font-medium text-emerald-300">Acesso privado</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">Entrar no MVP privado</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          Use esta página só para autenticação. O dashboard continua separado para evitar misturar login/cadastro com a operação dos imóveis.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <AuthPanel mode="login" />

        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-6 text-slate-400">
          <p className="font-semibold text-white">Importante</p>
          <p className="mt-2">
            Se você acabou de criar conta, confirme primeiro o e-mail de autorização do Supabase. Só depois volte aqui e entre com senha.
          </p>
          <p className="mt-3">
            O logout aparece dentro do dashboard quando existe sessão ativa.
          </p>
        </aside>
      </div>
    </div>
  );
}
