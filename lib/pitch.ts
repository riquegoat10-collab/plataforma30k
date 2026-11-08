import type { Lead } from "./schema";

export function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

/** Link wa.me com DDI do Brasil quando o número vier sem ele. */
export function whatsappLink(phone: string | null, text?: string): string | null {
  if (!phone) return null;
  let digits = onlyDigits(phone);
  if (digits.length < 10) return null;
  if (!digits.startsWith("55") || digits.length <= 11) digits = `55${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/**
 * Primeira mensagem: elogio real (nota do Google), prévia pronta e saída fácil.
 * A opção de não receber mais mensagens reduz denúncias e respeita a LGPD.
 */
export function pitchMessage(lead: Pick<Lead, "name" | "rating" | "reviewCount">, siteUrl: string): string {
  const praise =
    lead.rating && lead.reviewCount
      ? ` Vi que vocês têm nota ${lead.rating.toString().replace(".", ",")} com ${lead.reviewCount} avaliações no Google, parabéns!`
      : "";
  return `Oi, tudo bem?${praise} Montei uma prévia de site para a ${lead.name}, sem compromisso: ${siteUrl}

Se gostar, eu publico com o domínio de vocês. Se não tiver interesse, é só me avisar que não mando mais mensagens.`;
}
