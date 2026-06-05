import { AuthPanel } from "@/components/auth-panel";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm font-medium text-emerald-300">Acesso privado</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">Login do proprietário</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          Primeiro passo da persistência real: autenticar o usuário antes de salvar imóveis, contratos e anexos no Supabase.
        </p>
      </header>

      <AuthPanel />

      <Card>
        <CardHeader>
          <CardTitle>Por que login antes de CRUD?</CardTitle>
          <CardDescription>O banco já tem RLS por dono; a UI precisa respeitar esse contrato.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-slate-400">
          <p>
            A tabela `properties` agora aceita escrita apenas para usuários autenticados quando `owner_id = auth.uid()`. Isso evita abrir cadastro, edição ou exclusão para visitantes anônimos.
          </p>
          <p>
            Depois de validar esta tela, o próximo PR pode trocar os rascunhos locais por insert/update reais no Supabase.
          </p>
          <ButtonLink href="/imoveis/novo" variant="secondary">Voltar ao cadastro local</ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
