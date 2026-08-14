# PRD — Controle de Aluguéis

## Problema
Gabriel hoje acompanha imóveis alugados em uma planilha horizontal, onde cada coluna representa um imóvel/unidade e as linhas guardam dados do contrato, valores e status de pagamento. Isso dificulta consulta rápida, filtros, histórico, alertas e evolução para automações.

## Usuário
Uso inicialmente solo: proprietário/gestor dos imóveis. Pode evoluir para colaboração com contador, imobiliária ou assistente.

## MVP
Transformar a planilha em um app web simples que permita:
- Cadastrar e visualizar imóveis/unidades.
- Registrar locador/inquilino, datas de contrato e vencimento.
- Acompanhar aluguel, condomínio, IPTU e taxas extras.
- Ver status de pagamento e pendências.
- Guardar link do contrato/documentos.

## Fonte de dados inicial
Imagem/planilha enviada pelo usuário. Estrutura observada:
- Cada coluna após a primeira representa um imóvel/unidade.
- Linhas representam campos do imóvel/contrato.

CSV real recebido em 2026-06-04: `Aluguéis Prédios - Fevereiro.csv`.
- Referência: Fevereiro/2023.
- Status: desatualizado por aviso do usuário.
- Uso correto: base estrutural e mock inicial, não fonte de verdade operacional atual.
- A planilha não inclui nomes de inquilinos nem datas finais de contrato preenchidas para os imóveis desta versão.

Campos observados:
- Nome do prédio/unidade.
- Alugado? booleano.
- Nome do locador/inquilino.
- Data final do contrato.
- Data de pagamento/vencimento.
- Em dia.
- Aluguel.
- Condomínio.
- Data do pagamento do condomínio.
- Condomínio pago pelo cliente?
- Taxa extra.
- Taxa extra paga pelo cliente?
- Imprevistos.
- Manutenção.
- Manutenção paga pelo cliente?
- IPTU.
- IPTU pago pelo cliente?
- Laudêmio.
- Link para contrato nos docs.

## Fora do escopo por enquanto
- Login multiusuário completo.
- Cobrança automática/pix/boleto.
- Integração real com Google Sheets.
- OCR/importação automática da planilha.
- Relatórios contábeis avançados.
- App mobile nativo.

## Evoluções condicionadas ao pós-MVP

Estas funcionalidades só entram em planejamento/implementação depois de o MVP familiar ser validado com Auth, RLS, Storage privado, dados fake-realistas e dogfood guiado:

- **Modelos de documentos por imóvel:** template padrão de contrato/documento com variáveis preenchidas a partir dos dados do imóvel, locador, inquilino e condições contratuais. A geração deve preservar revisão manual antes de qualquer uso ou assinatura.
- **Galeria privada de imagens por imóvel:** múltiplas imagens, miniaturas e upload no Storage privado, com acesso protegido por `owner_id`; não usar URLs públicas para fotos do imóvel.

## Restrições técnicas
Stack pedida: Node.js + Supabase + Vercel. Implementação inicial em Next.js com TypeScript, pronto para deploy na Vercel e persistência futura no Supabase.

## Dependências externas
- Supabase para banco/Postgres e autenticação futura.
- Vercel para deploy.
- Possível integração futura com Google Sheets/Drive para importar dados e links de contratos.
