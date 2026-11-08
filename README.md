# Vitrino (nome provisório)

Plataforma para quem vende sites a pequenos negócios: encontra quem ainda não tem site,
gera o site com IA em cerca de 1 minuto, permite editar conversando e publica com um clique.

## Fluxo central (o que já funciona)

1. **Radar** (`/app/radar`): busca negócios por ramo e cidade pela API oficial do Google Places,
   filtra quem não tem site próprio (perfil só em rede social conta como "sem site") e dá uma
   nota de oportunidade de 0 a 100 (avaliação, número de avaliações, telefone).
2. **Gerar site**: o Claude escreve o conteúdo do negócio em um formato estruturado e o nosso
   renderizador monta a página. Regras do prompt: não inventar prêmios, anos de experiência,
   depoimentos ou preços. A nota do Google entra como dado real, nunca gerado.
3. **Editar conversando** (`/app/sites/[id]`): pedidos em português ("troca a cor para verde",
   "tira as perguntas frequentes"), com histórico para desfazer e prévia em computador ou celular.
4. **Publicar** em `/s/[slug]` e **abordar**: mensagem de WhatsApp pronta, com elogio real e
   opção de não receber mais mensagens (reduz denúncias e respeita a LGPD).
5. **CRM simples** no painel (`/app`): novo, contatado, negociando, fechado, perdido.

Sem chaves configuradas o app roda em **modo de teste**: o radar mostra negócios de demonstração
e os sites usam textos-modelo.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev                  # http://localhost:3000
```

| Variável | Para quê |
|---|---|
| `ANTHROPIC_API_KEY` | Gerar e editar sites com o Claude |
| `GOOGLE_PLACES_API_KEY` | Radar com negócios reais (Places API "New", Text Search) |
| `NEXT_PUBLIC_APP_URL` | Endereço público usado nos links enviados aos clientes |

## Estrutura

- `lib/schema.ts`: formato do site (Zod), usado pela IA e pelo renderizador
- `lib/ai.ts`: chamadas ao Claude (geração e edição com saída estruturada)
- `lib/places.ts`: radar, filtro "sem site" e nota de oportunidade
- `lib/store.ts`: armazenamento em `.data/db.json` (trocar por Postgres/Supabase em produção)
- `components/SiteRenderer.tsx`: design dos sites (4 estilos, claro/escuro, container queries)
- `lib/brand.ts`: nome da marca (trocar aqui)

## Próximos passos

- Login e contas (Supabase Auth) e banco de dados de produção
- Domínio próprio do cliente e hospedagem
- Planos e cobrança (Pix/cartão), incluindo a mensalidade de manutenção do cliente final
- Precificação, proposta e contrato
- Fotos do negócio (Google Places Photos) e mais templates por ramo
