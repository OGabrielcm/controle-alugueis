# Controle de Aluguéis

App para transformar uma planilha de controle de imóveis e aluguéis em um produto web para o proprietário acompanhar carteira, contratos, pagamentos, vencimentos e reajustes.

O objetivo do projeto é evoluir primeiro o fluxo de produto e domínio, com funcionalidades validadas localmente, antes de priorizar deploy, portfólio visual ou abertura pública do repositório.

## Status atual

- Base em Next.js com App Router, TypeScript e Tailwind CSS.
- Layout segmentado em múltiplas páginas, evitando um fluxo concentrado em uma única tela.
- Shell visual com navegação principal.
- Páginas iniciais para dashboard, imóveis, novo imóvel e importação.
- Componentes base de UI inspirados em shadcn/ui.
- Dados mockados disponíveis para desenvolvimento local.
- Supabase previsto como persistência, mas o app ainda funciona sem configuração real.

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Zod
- Componentes base de UI inspirados em shadcn/ui

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Scripts úteis

```bash
npm run lint
npm run build
```

## Supabase

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql`.
3. Rode o SQL em `supabase/storage.sql` para criar o bucket público `property-contracts` usado pelos documentos de contrato.
4. Copie `.env.example` para `.env.local`.
5. Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

A primeira versão funciona com dados mockados mesmo sem Supabase configurado.

### Anexos de contrato

- A tela de detalhe do imóvel permite selecionar ou arrastar/soltar PDF/DOCX de contrato para o Supabase Storage.
- Bucket esperado: `property-contracts`.
- Limite atual: PDF ou DOCX de até 10MB.
- Enquanto a escrita real da tabela `properties` não estiver implementada, o link gerado pelo upload fica salvo como rascunho local no navegador.
- Antes de produção, revisar policies do Storage e trocar bucket público por acesso privado/signed URL se houver dados sensíveis.

## Observações técnicas

### Auditoria de dependências

Durante a instalação das dependências do design system, o `npm audit` reportou vulnerabilidades moderadas relacionadas à cadeia de dependências do Next/PostCSS.

A correção automática sugerida com `npm audit fix --force` não deve ser aplicada agora, porque ela tenta resolver o alerta com uma troca arriscada de versão do Next e pode quebrar o projeto.

Decisão atual:

- Não rodar `npm audit fix --force`.
- Manter o desenvolvimento local normalmente.
- Reavaliar o audit antes de qualquer deploy real.
- Atualizar Next/PostCSS apenas por caminho seguro, seguido de `npm run lint` e `npm run build`.

## Próximos PRs sugeridos

A sequência abaixo prioriza produto e validação de domínio antes de deploy/polimento:

1. **PR de documentação viva**
   - Atualizar README com status real, decisões técnicas e roadmap curto.
   - Registrar alertas conhecidos sem bloquear desenvolvimento.

2. **PR de cadastro de imóvel funcional**
   - Evoluir `/imoveis/novo` para capturar dados principais do imóvel.
   - Validar campos com Zod.
   - Salvar inicialmente no repositório local/mock ou preparar contrato para Supabase.

3. **PR de listagem de imóveis mais útil**
   - Melhorar `/imoveis` com cards ou tabela mais clara.
   - Adicionar estados vazios, totais básicos e links de ação.
   - Separar melhor visualização de lista e detalhe.

4. **PR de detalhe do imóvel e contratos**
   - Criar rota de detalhe por imóvel.
   - Mostrar dados principais, aluguel, status e histórico básico.
   - Preparar espaço para contratos, pagamentos, anexos e observações.

5. **PR de agenda contratual**
   - Registrar data de início, vencimento e regra de reajuste anual do contrato.
   - Identificar contratos próximos do vencimento.
   - Identificar quando o aluguel deve aumentar por cláusula anual de reajuste.

6. **PR de importação da planilha**
   - Evoluir `/importar` para mapear colunas e validar dados.
   - Transformar dados importados no formato interno do app.
   - Exibir prévia antes de salvar.

7. **PR de integração real com Supabase**
   - Conectar leitura e escrita reais.
   - Armazenar anexos de contrato de forma vinculada ao imóvel.
   - Manter fallback/mock se fizer sentido para desenvolvimento.
   - Validar schema, variáveis de ambiente e fluxo completo.

8. **PR de preparação para deploy**
   - Reavaliar `npm audit`.
   - Rodar lint/build.
   - Revisar variáveis de ambiente.
   - Só então preparar Vercel.

9. **PR futuro de avisos automáticos**
   - Planejar envio de e-mails antes do vencimento do contrato.
   - Planejar envio de e-mails antes da data de reajuste anual.
   - Definir frequência, destinatários e templates dos lembretes.

## Deploy Vercel

O deploy ainda não é prioridade do projeto.

Quando chegar a hora:

- Importar este projeto na Vercel.
- Configurar as mesmas variáveis de ambiente.
- Rodar `npm run lint` e `npm run build` antes do deploy.
- Reavaliar vulnerabilidades com `npm audit`.
- Conectar deploy automático via Git quando o repositório estiver pronto.
