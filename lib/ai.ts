import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { SiteContentSchema, type SiteContent } from "./schema";
import { fallbackContent, type BusinessInput } from "./fallback";
import { getNiche } from "./niches";

const MODEL = "claude-opus-5-5";

export function aiEnabled(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic();
  return client;
}

const SYSTEM = `Você é redator e diretor de arte de sites para pequenos negócios brasileiros.
Escreva em português do Brasil, com tom natural e direto, como o próprio dono falaria com o cliente.

Regras que não podem ser quebradas:
- Não invente fatos: nada de anos de experiência, prêmios, número de clientes, certificações, nomes de profissionais ou depoimentos que não foram informados.
- Preços: só preencha "price" se o preço foi informado; caso contrário use null.
- Contato: use exatamente os dados informados; o que não foi informado fica null.
- Textos curtos e específicos do ramo. Evite clichês vazios como "excelência" e "qualidade incomparável".
- A cor principal deve combinar com o ramo e ter bom contraste com texto branco.`;

async function callStructured(userContent: string): Promise<SiteContent> {
  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(SiteContentSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: userContent }],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("A IA não pôde atender este pedido. Tente reformular.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new Error("A IA não devolveu um site válido. Tente de novo.");
  }
  return response.parsed_output;
}

/** Gera o site de um negócio. Sem chave de API, usa textos-modelo. */
export async function generateSite(b: BusinessInput): Promise<{ content: SiteContent; by: "ia" | "modelo" }> {
  if (!aiEnabled()) return { content: fallbackContent(b), by: "modelo" };
  const niche = getNiche(b.nicheId);
  const prompt = `Crie o conteúdo do site deste negócio.

Nome: ${b.name}
Ramo: ${niche.label}
Cidade: ${b.city}
Telefone/WhatsApp: ${b.phone ?? "não informado"}
Endereço: ${b.address ?? "não informado"}
Serviços típicos do ramo (use como ponto de partida, ajuste se fizer sentido): ${niche.services.join(", ")}
Texto do botão sugerido: ${niche.cta}
Estilo sugerido: ${niche.style}, fonte ${niche.font}, cor ${niche.primary}
${b.notes ? `Observações do vendedor: ${b.notes}` : ""}

Inclua 4 a 6 serviços, 3 diferenciais e 3 a 5 perguntas frequentes.
Use as seções: about, services, highlights, proof, faq, contact.`;
  return { content: await callStructured(prompt), by: "ia" };
}

/** Aplica um pedido de edição em linguagem natural e devolve o site inteiro atualizado. */
export async function editSite(current: SiteContent, instruction: string): Promise<SiteContent> {
  if (!aiEnabled()) {
    throw new Error("Edição por IA desativada: configure ANTHROPIC_API_KEY no arquivo .env.local.");
  }
  const prompt = `Este é o conteúdo atual do site, em JSON:

${JSON.stringify(current, null, 2)}

Pedido de alteração do usuário:
"""${instruction}"""

Devolva o site completo já com a alteração. Mude só o que foi pedido e mantenha o resto igual.
Para esconder ou reordenar seções, altere a lista "sections". A seção "proof" mostra a nota real do Google.`;
  return callStructured(prompt);
}
