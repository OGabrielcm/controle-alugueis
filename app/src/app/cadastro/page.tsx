import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";

export default function CadastroPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-5 py-10">
      <header className="max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          ← Voltar ao dashboard demo
        </Link>
        <p className="mt-8 text-sm font-medium text-emerald-300">Novo acesso</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">Criar conta do proprietário</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          Cadastro fica em uma página própria e não libera a área privada antes da confirmação do e-mail e login explícito.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <AuthPanel mode="signup" />

        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-6 text-slate-400">
          <p className="font-semibold text-white">Como funciona</p>
          <p className="mt-2">
            Depois de criar a conta, o app força a saída da sessão pendente. Isso evita tratar cadastro como login verificado.
          </p>
          <p className="mt-3">
            Confirme o e-mail recebido e depois use a página de login para entrar.
          </p>
        </aside>
      </div>
    </div>
  );
}
