import type { SiteStyle } from "./schema";

export type Niche = {
  id: string;
  label: string;
  /** Termo usado na busca do Google Places. */
  searchTerm: string;
  primary: string;
  style: SiteStyle;
  font: "serif" | "sans";
  services: string[];
  cta: string;
};

export const NICHES: Niche[] = [
  { id: "barbearia", label: "Barbearia", searchTerm: "barbearia", primary: "#b45309", style: "ousado", font: "sans", services: ["Corte masculino", "Barba", "Corte + barba", "Pigmentação"], cta: "Agendar horário" },
  { id: "salao", label: "Salão de beleza", searchTerm: "salão de beleza", primary: "#be185d", style: "acolhedor", font: "serif", services: ["Corte e escova", "Coloração", "Manicure e pedicure", "Tratamentos capilares"], cta: "Agendar horário" },
  { id: "dentista", label: "Odontologia", searchTerm: "dentista", primary: "#0e7490", style: "elegante", font: "sans", services: ["Avaliação", "Limpeza", "Clareamento", "Ortodontia"], cta: "Agendar avaliação" },
  { id: "academia", label: "Academia", searchTerm: "academia", primary: "#dc2626", style: "ousado", font: "sans", services: ["Musculação", "Funcional", "Aulas coletivas", "Avaliação física"], cta: "Agendar aula experimental" },
  { id: "pizzaria", label: "Pizzaria", searchTerm: "pizzaria", primary: "#c2410c", style: "acolhedor", font: "serif", services: ["Pizzas tradicionais", "Pizzas especiais", "Delivery", "Bebidas"], cta: "Pedir no WhatsApp" },
  { id: "restaurante", label: "Restaurante", searchTerm: "restaurante", primary: "#15803d", style: "acolhedor", font: "serif", services: ["Almoço", "Jantar", "Pratos executivos", "Eventos"], cta: "Reservar mesa" },
  { id: "estetica", label: "Estética", searchTerm: "clínica de estética", primary: "#9333ea", style: "elegante", font: "serif", services: ["Limpeza de pele", "Depilação", "Massagem modeladora", "Drenagem linfática"], cta: "Agendar avaliação" },
  { id: "petshop", label: "Pet shop", searchTerm: "pet shop", primary: "#2563eb", style: "acolhedor", font: "sans", services: ["Banho", "Tosa", "Rações e acessórios", "Leva e traz"], cta: "Agendar banho" },
  { id: "advocacia", label: "Advocacia", searchTerm: "advogado", primary: "#1e3a8a", style: "elegante", font: "serif", services: ["Consultoria", "Direito trabalhista", "Direito de família", "Direito do consumidor"], cta: "Falar com um advogado" },
  { id: "mecanica", label: "Mecânica", searchTerm: "oficina mecânica", primary: "#374151", style: "moderno", font: "sans", services: ["Revisão", "Freios e suspensão", "Troca de óleo", "Diagnóstico eletrônico"], cta: "Pedir orçamento" },
  { id: "fisioterapia", label: "Fisioterapia", searchTerm: "fisioterapia", primary: "#0d9488", style: "moderno", font: "sans", services: ["Fisioterapia ortopédica", "Pilates", "RPG", "Reabilitação esportiva"], cta: "Agendar sessão" },
  { id: "imobiliaria", label: "Imobiliária", searchTerm: "imobiliária", primary: "#0f766e", style: "elegante", font: "sans", services: ["Venda de imóveis", "Locação", "Avaliação de imóvel", "Administração"], cta: "Falar com um corretor" },
];

export function getNiche(id: string): Niche {
  return NICHES.find((n) => n.id === id) ?? NICHES[0];
}
