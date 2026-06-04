import { FileSpreadsheet } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <p className="text-sm font-medium text-emerald-300">Importação</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Importar planilha
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          Área reservada para o próximo fluxo: upload de CSV/XLSX, prévia dos dados e mapeamento de colunas antes de gravar no Supabase.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="grid size-12 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20">
            <FileSpreadsheet size={22} />
          </div>
          <CardTitle>Próxima fase</CardTitle>
          <CardDescription>
            Ainda não vamos importar dados reais aqui para evitar misturar base desatualizada, campos não validados e persistência sem policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <ButtonLink href="/">Voltar ao resumo</ButtonLink>
          <ButtonLink href="/imoveis" variant="secondary">Ver carteira</ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
