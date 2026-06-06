import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { LoginRedirectNotice } from "./redirect-notice";

type ConfirmEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
  const { email } = await searchParams;

  return (
    <Card className="border-emerald-300/20 bg-emerald-300/[0.04]">
      <CardHeader>
        <CardTitle>Confirme seu e-mail para entrar</CardTitle>
        <CardDescription>
          A conta foi registrada, mas o acesso ao dashboard só deve acontecer depois da confirmação enviada pelo Supabase Auth.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm leading-6 text-slate-300">
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-50">
          <p className="font-semibold">Verifique sua caixa de entrada.</p>
          <p className="mt-1">
            {email ? (
              <>
                Enviamos as instruções para <span className="font-semibold">{email}</span>. Abra o e-mail e confirme a conta antes de tentar login.
              </>
            ) : (
              "Enviamos as instruções para o e-mail usado no cadastro. Abra o e-mail e confirme a conta antes de tentar login."
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p className="font-semibold text-slate-100">Se você já tinha tentado se cadastrar antes</p>
          <p className="mt-1 text-slate-400">
            O Supabase pode não reenviar um novo e-mail em toda tentativa. Nesse caso, tente entrar pela tela de login ou use recuperação de senha.
          </p>
        </div>

        <Suspense fallback={<p className="text-slate-400">Preparando redirecionamento...</p>}>
          <LoginRedirectNotice />
        </Suspense>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/login">Ir para login agora</ButtonLink>
          <Link href="/recuperar-senha" className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">
            Recuperar senha
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
