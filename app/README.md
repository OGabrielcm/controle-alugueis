# Controle de Aluguéis

App inicial para transformar uma planilha de controle de imóveis/aluguéis em um dashboard web.

## Stack

- Next.js + TypeScript
- Node.js
- Supabase
- Vercel
- Tailwind CSS

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Supabase

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql`.
3. Copie `.env.example` para `.env.local`.
4. Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

A primeira versão funciona com dados mockados mesmo sem Supabase configurado.

## Deploy Vercel

- Importar este projeto na Vercel.
- Configurar as mesmas variáveis de ambiente.
- Deploy automático via Git quando o repositório for conectado.
