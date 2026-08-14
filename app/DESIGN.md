# Controle de Aluguéis — Contrato de design

## Intenção da experiência

O produto é uma ferramenta privada de operação familiar, não uma página de marketing nem um dashboard técnico. A interface deve ajudar Mercês, mãe e irmão a entender o próximo passo com calma, legibilidade e segurança.

- Deve parecer uma pasta familiar organizada: acolhedora, confiável e direta.
- Deve deixar claro quando o dado é real, mockado, incompleto ou não salvo.
- Deve priorizar decisões operacionais sobre novidade visual.
- Não deve parecer terminal, painel SaaS genérico ou experiência imersiva.

## Registro e fluxo-assinatura

- **Registro:** `product` — aplicação operacional de uso recorrente.
- **Fluxo-assinatura:** entrar, identificar a pendência mais importante no dashboard, abrir um imóvel e concluir a próxima ação segura.
- **Critério de diferenciação:** a pessoa entende o estado do imóvel e o que fazer sem conhecer Supabase, tabelas ou termos de desenvolvimento.
- **Fora de escopo:** WebGL, scroll cinematográfico, efeitos decorativos e animação que atrase a operação.

## Princípios e anti-referências

### Fazer

1. Usar hierarquia clara para ação, contexto e consequência.
2. Exibir estados com texto, forma/borda e cor — nunca só com matiz.
3. Manter ações destrutivas visualmente distintas e confirmar seu impacto.
4. Explicar fallback/mock e dados desatualizados em linguagem humana.
5. Preservar comportamento e contraste nos temas claro e escuro.

### Não fazer

- Azul/ciano frio como identidade global de dashboard SaaS.
- Verde como sinônimo universal de marca ou estado seguro.
- Gradientes e sombras competindo com dados e ações.
- Cards decorativos sem função operacional.
- Termos técnicos como `RLS`, `bucket`, `signed URL` ou `fallback` na copy principal.

## Fonte executável dos tokens

- **Fonte canônica:** [`src/app/globals.css`](src/app/globals.css).
- **Modelo:** CSS é executável e canônico; este documento registra intenção, semântica e restrições.
- **Regra de drift:** cores, radius, sombras, fonte e estados são alterados no CSS/componentes; este documento só muda quando a intenção ou semântica muda.

| Papel semântico | Uso permitido | Fonte executável |
|---|---|---|
| Primary | ação principal, seleção e foco | `--primary` / `--primary-foreground` |
| Accent | ênfase secundária sem competir com CTA | `--accent` / `--accent-foreground` |
| Destructive | exclusão, erro crítico e ação irreversível | `--destructive` |
| Surfaces | canvas, cards e agrupamento | `--background`, `--card`, `--muted` |
| Status | informação, alerta, sucesso ou perigo | classes/tokens semânticos do componente |

Não duplicar valores OKLCH manualmente neste arquivo.

## Tipografia, densidade e movimento

- Usar Geist para UI e textos operacionais.
- Densidade moderada: listas escaneáveis, formulários agrupados e espaço suficiente para toque.
- Radius organiza superfícies; não é decoração.
- Motion é curto e funcional para feedback, abertura e transição de estado.
- Respeitar redução de movimento e nunca esconder informação atrás de animação.

## Componentes e estados críticos

| Superfície | Estados obrigatórios | Regra |
|---|---|---|
| Autenticação | idle, loading, erro, confirmação, link expirado | explicar próxima ação sem revelar internals |
| Dashboard | loading, vazio, mock/fallback, atenção, sucesso | destacar prioridade e origem do dado |
| Lista/formulário de imóveis | vazio, filtrado sem resultado, edição, salvando, erro, rascunho local | preservar dados e deixar persistência explícita |
| Anexo de contrato | sem arquivo, selecionado, inválido, enviando, sucesso, erro, removendo | revisão humana antes do upload; usar somente arquivo fake em QA |
| Ações destrutivas | disponível, disabled, confirmando, erro, concluído | nomear o imóvel/objeto afetado e oferecer saída segura |
| Tema | claro, escuro, preferência persistida | contraste e hierarquia equivalentes |

## Responsividade e acessibilidade

- **Mobile:** uma coluna, alvos de toque confortáveis, ações críticas visíveis sem scroll horizontal.
- **Tablet:** preservar hierarquia e evitar tabelas comprimidas sem alternativa legível.
- **Desktop:** usar largura para comparação e contexto, não para aumentar densidade sem necessidade.
- Navegação completa por teclado, foco visível e ordem previsível.
- Labels e erros associados aos campos; placeholders não substituem labels.
- Contraste compatível com WCAG AA para texto e controles essenciais.
- Estado nunca depende somente de cor; ícone precisa de texto/label quando o significado não for óbvio.

## Gate visual

Superfícies mínimas:

- `/login`;
- `/dashboard`;
- `/imoveis`;
- `/imoveis/novo`;
- `/imoveis/[id]`;
- fluxo de anexo com arquivo fake.

Evidência esperada quando houver mudança visual:

- temas claro e escuro;
- mobile e desktop; tablet quando o layout intermediário mudar;
- estados loading, vazio, erro, sucesso, disabled e foco aplicáveis;
- screenshots ou trace da jornada alterada;
- resultado dos checks de `VALIDATION.md`;
- decisão visual humana de Mercês antes de merge/deploy.

## Protocolo de mudança

Atualizar este contrato somente quando mudar intenção, semântica, regra reutilizável, fluxo-assinatura ou gate visual. Ajustes literais de token pertencem ao CSS. Decisões de produto pertencem a `PRODUCT.md`; decisões estruturais, ao mecanismo canônico de ADR/decisões do repositório.
