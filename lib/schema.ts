import { z } from "zod";

export const SECTION_IDS = ["about", "services", "highlights", "proof", "faq", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SITE_STYLES = ["elegante", "moderno", "acolhedor", "ousado"] as const;
export type SiteStyle = (typeof SITE_STYLES)[number];

/**
 * Conteúdo do site. A IA devolve exatamente este formato, e o nosso renderizador
 * transforma em página. Assim o design fica sempre consistente e editável.
 */
export const SiteContentSchema = z.object({
  businessName: z.string(),
  niche: z.string(),
  city: z.string(),
  theme: z.object({
    primary: z.string().describe("Cor principal em hexadecimal, ex.: #0e7490"),
    mode: z.enum(["claro", "escuro"]),
    style: z.enum(SITE_STYLES),
    font: z.enum(["serif", "sans"]),
  }),
  sections: z
    .array(z.enum(SECTION_IDS))
    .describe("Seções visíveis, na ordem em que aparecem depois do topo"),
  hero: z.object({
    eyebrow: z.string().describe("Texto curto acima do título, ex.: ramo e cidade"),
    headline: z.string(),
    subheadline: z.string(),
    ctaLabel: z.string(),
  }),
  about: z.object({ title: z.string(), body: z.string() }),
  services: z.object({
    title: z.string(),
    items: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.string().nullable().describe("Só preencha se o dono informou o preço; senão null"),
      }),
    ),
  }),
  highlights: z.object({
    title: z.string(),
    items: z.array(z.object({ title: z.string(), description: z.string() })),
  }),
  faq: z.object({
    title: z.string(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  contact: z.object({
    title: z.string(),
    whatsapp: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    hours: z.string().nullable(),
    instagram: z.string().nullable(),
  }),
  seo: z.object({ title: z.string(), description: z.string() }),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;

/** Dados reais vindos do Google. Nunca são gerados pela IA. */
export type Proof = { rating: number | null; reviewCount: number | null; mapsUrl: string | null };

export type LeadStatus = "novo" | "contatado" | "negociando" | "fechado" | "perdido";

export type Lead = {
  id: string;
  placeId: string | null;
  name: string;
  nicheId: string;
  city: string;
  address: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  mapsUrl: string | null;
  score: number;
  status: LeadStatus;
  demo: boolean;
  siteId: string | null;
  createdAt: string;
};

export type ChatEntry = { role: "user" | "assistant"; text: string; at: string };

export type Site = {
  id: string;
  slug: string;
  leadId: string | null;
  content: SiteContent;
  proof: Proof;
  history: SiteContent[];
  chat: ChatEntry[];
  published: boolean;
  generatedBy: "ia" | "modelo";
  createdAt: string;
  updatedAt: string;
};
