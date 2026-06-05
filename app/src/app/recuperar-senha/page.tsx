import Link from "next/link";
import { PasswordRecoveryPanel } from "@/components/password-recovery-panel";
import { LOGIN_PATH } from "@/lib/session-routes";

export default function RecuperarSenhaPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-5 py-10">
      <header className="max-w-3xl">
        <Link href={LOGIN_PATH} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          Voltar para login
        </Link>
        <p className="mt-8 text-sm font-medium text-emerald-300">Recuperação de acesso</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">Recuperar senha</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          Informe seu e-mail cadastrado em uma tela dedicada. Enviaremos um link para criar uma nova senha sem revelar se a conta existe.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <PasswordRecoveryPanel />

        <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm leading-6 text-slate-400">
          <p className="font-semibold text-white">O que acontece depois</p>
          <p className="mt-2">
            Se houver uma conta para esse e-mail, o Supabase envia um link de recuperação. Abra o link para acessar a tela de nova senha.
          </p>
          <p className="mt-3">
            Confira também a caixa de spam. A mensagem do app é sempre neutra para não expor contas cadastradas.
          </p>
        </aside>
      </div>
    </div>
  );
}
