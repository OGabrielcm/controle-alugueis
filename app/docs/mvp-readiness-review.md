# MVP Readiness Review — Gerenciador de Imóveis

Data: 2026-07-10
Branch local: `chore/mvp-readiness-review`

## Veredito curto

O MVP técnico está próximo de uso familiar, mas ainda não deve ser tratado como pronto para dados sensíveis reais sem validação manual de Auth/RLS/Storage e um dogfood familiar guiado.

## Evidência já disponível no código

- Next.js 16, React 19, TypeScript, Tailwind e Supabase configurados no app.
- Entrada principal em `/login`; dashboard operacional em `/dashboard`.
- Rotas operacionais protegidas no client: `/dashboard`, `/imoveis`, `/imoveis/novo` e `/importar`.
- Supabase Auth com login, cadastro, recuperação de senha e redefinição.
- `properties.owner_id` e policies RLS por usuário autenticado documentadas em SQL.
- Cadastro e edição de imóveis tentam persistir no Supabase quando há sessão ativa.
- Fallback local/mock permanece disponível para desenvolvimento sem sessão/Supabase.
- Detalhe de imóvel existe em `/imoveis/[id]`.
- Exclusão de imóvel existe no detalhe.
- Anexos de contrato usam bucket privado, path interno e signed URL temporária para abertura.
- Remoção de contrato existe no painel de anexo.
- Tema claro/escuro já foi integrado.
- Scripts locais disponíveis: `npm run lint`, `npm test`, `npm run build`, `npm run smoke:supabase`, `npm run audit:multiconta`.

## Gaps P0 — antes de liberar uso familiar real

1. **Validar Auth/RLS/Storage em ambiente real**
   - Confirmar que conta A não vê/edita/exclui imóveis da conta B.
   - Confirmar que contrato/anexo privado não abre sem sessão autorizada.
   - Confirmar que signed URLs expiram e não são salvas em docs/logs.

2. **Dogfood com dados fake-realistas**
   - Criar 2–3 imóveis de teste.
   - Editar dados principais.
   - Anexar arquivo PDF/DOCX fake.
   - Remover anexo.
   - Excluir imóvel teste.
   - Sair e entrar novamente.

3. **Validação familiar guiada**
   - Mercês, mãe e irmão precisam conseguir executar tarefas básicas sem entender Supabase, mock, RLS ou Storage.
   - Registrar onde houve dúvida de linguagem, fluxo ou botão.

4. **Não usar contrato real ainda**
   - Usar arquivos fake até confirmar privacidade de Storage e acesso por conta.

## Gaps P1 — para polir antes de deploy/PR final

1. **Alinhar documentação viva**
   - README/SDD/ROADMAP tinham trechos antigos sobre rascunho local, bucket público e ausência de autenticação/persistência real.
   - Esta branch corrige esses pontos principais.

2. **Revisar linguagem operacional**
   - Garantir que tela vazia, erro de sessão, anexos, exclusão e fallback falem em português simples para família.

3. **Reavaliar dependências antes de deploy**
   - `npm audit` deve ser reavaliado antes de Vercel/produção.
   - Não usar `npm audit fix --force` sem review.

4. **Preparar checklist de handoff familiar**
   - Criar um roteiro curto para Mercês testar e passar para família.

## Gaps P2 — depois do MVP familiar inicial

1. Importação CSV/XLSX com prévia e mapeamento de colunas.
2. Histórico de pagamentos/contratos mais robusto.
3. Avisos automáticos por e-mail para vencimento/reajuste.
4. Deploy Vercel com variáveis revisadas e dados sensíveis protegidos.
5. Melhorias avançadas de dashboard após feedback familiar.

## Checklist para Mercês executar manualmente

Use dados fake ou fake-realistas primeiro.

- [ ] Entrar com conta do Mercês.
- [ ] Criar imóvel teste.
- [ ] Editar aluguel, banco, inquilino e vencimento.
- [ ] Abrir detalhe do imóvel.
- [ ] Anexar PDF/DOCX fake.
- [ ] Abrir contrato anexado por link temporário.
- [ ] Remover contrato.
- [ ] Excluir imóvel teste.
- [ ] Sair e entrar novamente.
- [ ] Criar/usar segunda conta teste e confirmar que ela não vê os dados da primeira.
- [ ] Pedir para mãe/irmão tentarem encontrar: cadastrar imóvel, ver pendência, abrir detalhe e sair da conta.

## Próximas 3 tarefas recomendadas

1. Rodar validação segura Supabase/RLS/Storage com dados fake.
2. Fazer dogfood familiar guiado com checklist acima.
3. Só depois preparar preview/deploy ou PR final, com nova rodada de `lint`, `test`, `build`, smoke Supabase e audit multiconta.

## Guardrails

- Não usar documentos reais antes da validação de Storage privado.
- Não expor `.env*`, anon key, tokens, signed URLs válidas ou dados familiares em docs/logs.
- Não abrir escrita para `anon`.
- Não fazer deploy/PR/merge sem aprovação explícita.
