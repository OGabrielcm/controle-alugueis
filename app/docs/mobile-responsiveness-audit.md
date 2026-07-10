# Auditoria de responsividade mobile

Data: 2026-07-10
Branch: `feat/mobile-responsiveness-audit`

## Objetivo

Revisar a experiência mobile do Gerenciador de Imóveis sem alterar autenticação, persistência, Supabase, RLS, Storage ou regras de negócio.

## Escopo revisado

- Shell autenticado e navegação principal.
- Login e cadastro.
- Dashboard e cartões de métricas.
- Lista de imóveis e cards mobile.
- Formulário de cadastro/edição.
- Detalhe do imóvel.
- Anexo e remoção de contrato.
- Controle de sessão e logout.
- Tema claro/escuro.

## Resultado

Nenhum bloqueio P1 foi identificado na inspeção de código e no preview público disponível. A lista já usa cards em telas abaixo de `lg`, mantendo a tabela larga apenas no desktop.

Foram encontrados e corrigidos pontos P2 de ergonomia e prevenção de overflow.

## Correções P2 implementadas

### Shell e navegação

- Adicionado `min-w-0` aos filhos principais do grid para impedir que conteúdo largo force overflow horizontal.
- Reduzido o padding lateral do conteúdo em telas pequenas.
- Navegação horizontal recebeu área de rolagem alinhada às bordas e nome acessível.
- Logout recebeu alvo de toque maior e largura total no mobile.

### Lista de imóveis

- CTA de novo imóvel passa a ocupar largura total no mobile.
- Ações do estado vazio ficam empilhadas em telas estreitas.
- Cabeçalho dos cards mobile deixa badges abaixo do nome antes do breakpoint `sm`.
- Ações `Detalhes` e `Editar` usam duas colunas; `Excluir` ocupa uma linha própria para reduzir toque acidental.

### Cadastro e edição

- Botão de remoção do contrato atual ocupa largura total no mobile.
- Ações do seletor de anexo usam grade responsiva.
- Ações finais de salvar/cancelar ficam empilhadas no mobile.

### Detalhe e contratos

- Ações do cabeçalho de detalhe ficam empilhadas em telas estreitas.
- Ações de abrir/remover contrato ficam empilhadas no mobile.
- Input de arquivo limita overflow para nomes longos e reorganiza o botão do seletor.
- CTA de envio do contrato ocupa largura total no mobile.

## Trabalho local anterior preservado

A auditoria preservou e incorporou o estado local encontrado no início:

- ajustes de contraste/tokens em tema claro e escuro;
- toggle de tema compacto e reposicionado;
- redirect de confirmação do cadastro para a origem pública atual;
- nota futura de galeria privada no roadmap.

Nenhum reset ou descarte foi executado.

## Validação executada

- `git diff --check`: passou.
- `npm run lint`: passou.
- `npm test`: 61/61 testes passaram.
- `npm run build`: passou com Next.js 16.2.7.
- Preview público `/login`: carregou sem overflow horizontal em 1280 px.
- Tema claro: validado visualmente.
- Tema escuro: validado visualmente.
- Persistência do tema: confirmada por recarregamento; o toggle continuou oferecendo `Mudar para tema claro` após selecionar escuro.

## Limitação e validação humana restante

O browser automatizado disponível nesta execução usou viewport de 1280 px e não havia uma sessão de teste autenticada fornecida. Portanto, dashboard, lista, formulário e detalhe foram auditados por código responsivo e build, mas ainda precisam de uma passagem visual em dispositivo/viewport mobile real com login.

Essa passagem deve confirmar:

1. navegação horizontal confortável;
2. cards de imóveis sem overflow;
3. ações de detalhe e exclusão com tamanho adequado;
4. upload de arquivo com nome longo;
5. temas claro e escuro nas rotas autenticadas.

## Fora de escopo

- Alterações em Auth, RLS, Storage ou banco.
- Mudanças de regras de negócio.
- Dependências novas.
- Push, PR, merge ou deploy.
