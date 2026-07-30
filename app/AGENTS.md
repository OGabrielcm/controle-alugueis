<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Contratos do projeto

Leia somente o contexto necessário para a tarefa:

- toda tarefa não trivial: objetivo/critérios da tarefa + este arquivo;
- produto, copy ou UX: [`PRODUCT.md`](PRODUCT.md);
- frontend, UI ou acessibilidade: `PRODUCT.md` + [`DESIGN.md`](DESIGN.md);
- auth, dados, Storage, integração ou estrutura: [`ARCHITECTURE.md`](ARCHITECTURE.md) + ADR/SDD relevante;
- conclusão/review: [`VALIDATION.md`](VALIDATION.md) + checks específicos da tarefa.

Regras:

1. Não carregar todos os contratos por padrão nem copiar seu conteúdo para prompts.
2. `src/app/globals.css` é a fonte executável dos tokens; `DESIGN.md` registra intenção e semântica.
3. Não criar `PROGRESS.md`, `KNOWLEDGE.md` ou tracker paralelo sem identificar audiência, lifecycle e SSOT.
4. Para edição concorrente, usar ownership exclusivo e worktrees/branches; prompts não são sandbox.
5. Auth, RLS, Storage, migrations, dados reais, secrets e deploy exigem checks específicos e gate humano.
6. Nenhum trabalho está concluído sem comando/evidência real ou estado explícito `bloqueado`/`não aplicável`.
