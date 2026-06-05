import Link from "next/link";
import { ResetPasswordPanel } from "@/components/reset-password-panel";

export default function RedefinirSenhaPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-5 py-10">
      <header className="max-w-3xl">
        <Link href="/login" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          Voltar para login
        </Link>
        <p className="mt-8 text-sm font-medium text-emerald-300">Recuperação de acesso</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">Criar uma nova senha</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          Esta tela é usada depois do link de recuperação enviado pelo Supabase. Ela fica fora do dashboard para manter autenticação separada da operação.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <ResetPasswordPanel />

        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-6 text-slate-400">
          <p className="font-semibold text-white">Quando usar</p>
          <p className="mt-2">
            Peça a recuperação em `/recuperar-senha`. Depois abra o e-mail recebido e defina uma nova senha aqui. Ao salvar, o app volta automaticamente para o login.
          </p>
          <p className="mt-3">
            Se a conta não existir, o app não revela isso por segurança; confira se digitou o e-mail correto.
          </p>
        </aside>
      </div>
    </div>
  );
}
