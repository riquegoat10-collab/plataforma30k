import type { SiteContent } from "./schema";
import { getNiche } from "./niches";

export type BusinessInput = {
  name: string;
  nicheId: string;
  city: string;
  phone: string | null;
  address: string | null;
  notes?: string | null;
};

/** Site montado a partir de textos-modelo, usado quando não há chave da API do Claude. */
export function fallbackContent(b: BusinessInput): SiteContent {
  const niche = getNiche(b.nicheId);
  return {
    businessName: b.name,
    niche: niche.label,
    city: b.city,
    theme: { primary: niche.primary, mode: niche.style === "ousado" ? "escuro" : "claro", style: niche.style, font: niche.font },
    sections: ["about", "services", "highlights", "proof", "faq", "contact"],
    hero: {
      eyebrow: `${niche.label} em ${b.city}`,
      headline: `${b.name}: atendimento de confiança perto de você`,
      subheadline: `Conheça nossos serviços e fale com a gente pelo WhatsApp. Atendemos ${b.city} e região.`,
      ctaLabel: niche.cta,
    },
    about: {
      title: "Sobre nós",
      body: `A ${b.name} atende ${b.city} com cuidado em cada detalhe. Nosso objetivo é que você saia satisfeito e volte sempre.`,
    },
    services: {
      title: "Serviços",
      items: niche.services.map((s) => ({ name: s, description: "Fale com a gente para saber detalhes e disponibilidade.", price: null })),
    },
    highlights: {
      title: "Por que escolher a gente",
      items: [
        { title: "Atendimento próximo", description: "Você fala direto com quem resolve." },
        { title: "Agendamento fácil", description: "Marque pelo WhatsApp em poucos minutos." },
        { title: "Na sua região", description: `Fácil de chegar, aqui em ${b.city}.` },
      ],
    },
    faq: {
      title: "Perguntas frequentes",
      items: [
        { question: "Como faço para agendar?", answer: "É só clicar no botão de WhatsApp e mandar uma mensagem." },
        { question: "Quais formas de pagamento vocês aceitam?", answer: "Fale com a gente pelo WhatsApp para confirmar as opções." },
      ],
    },
    contact: { title: "Fale com a gente", whatsapp: b.phone, phone: b.phone, address: b.address, hours: null, instagram: null },
    seo: { title: `${b.name} | ${niche.label} em ${b.city}`, description: `${b.name}: ${niche.label.toLowerCase()} em ${b.city}. Fale pelo WhatsApp.` },
  };
}
