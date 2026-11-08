import { nanoid } from "nanoid";
import type { Lead } from "./schema";
import { getNiche } from "./niches";

export type RadarResult = {
  placeId: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  mapsUrl: string | null;
  websiteUri: string | null;
  score: number;
};

/** Redes sociais não contam como site próprio: o negócio ainda é um bom lead. */
const SOCIAL_HOSTS = ["instagram.com", "facebook.com", "linktr.ee", "wa.me", "whatsapp.com", "tiktok.com"];

export function hasOwnWebsite(uri: string | null | undefined): boolean {
  if (!uri) return false;
  try {
    const host = new URL(uri).hostname.replace(/^www\./, "");
    return !SOCIAL_HOSTS.some((s) => host === s || host.endsWith(`.${s}`));
  } catch {
    return false;
  }
}

/**
 * Nota de oportunidade de 0 a 100: negócios bem avaliados e com muitas avaliações
 * têm clientes e reputação, mas ainda não têm site. São os mais fáceis de fechar.
 */
export function opportunityScore(rating: number | null, reviews: number | null, hasPhone: boolean): number {
  const r = rating ?? 0;
  const n = reviews ?? 0;
  const base = (r / 5) * 55 + Math.min(35, Math.log10(n + 1) * 14) + (hasPhone ? 10 : 0);
  return Math.max(1, Math.min(99, Math.round(base)));
}

type PlacesResponse = {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    businessStatus?: string;
  }>;
  nextPageToken?: string;
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
  "nextPageToken",
].join(",");

/** Busca pela API oficial Google Places (New) — Text Search. */
async function searchGoogle(term: string, city: string, apiKey: string, maxPages = 3): Promise<RadarResult[]> {
  const out: RadarResult[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: `${term} em ${city}`,
        languageCode: "pt-BR",
        regionCode: "BR",
        pageSize: 20,
        ...(pageToken ? { pageToken } : {}),
      }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Google Places respondeu ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as PlacesResponse;
    for (const p of data.places ?? []) {
      if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;
      const phone = p.nationalPhoneNumber ?? null;
      out.push({
        placeId: p.id,
        name: p.displayName?.text ?? "Sem nome",
        address: p.formattedAddress ?? null,
        phone,
        rating: p.rating ?? null,
        reviewCount: p.userRatingCount ?? null,
        mapsUrl: p.googleMapsUri ?? null,
        websiteUri: p.websiteUri ?? null,
        score: opportunityScore(p.rating ?? null, p.userRatingCount ?? null, !!phone),
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

/** Dados de exemplo para testar o app sem chave do Google. Sempre marcados como demonstração. */
function demoResults(nicheId: string, city: string): RadarResult[] {
  const niche = getNiche(nicheId);
  const prefixes = ["Central", "Bella", "Nova Era", "Do Bairro", "Prime", "Vila", "Estrela", "Real", "Clássica", "Point"];
  return prefixes.map((p, i) => {
    const rating = Math.round((4 + ((i * 37) % 10) / 10) * 10) / 10;
    const reviews = 12 + ((i * 53) % 240);
    const phone = `(11) 9${(8100 + i * 137).toString().padStart(4, "0")}-${(1000 + i * 911).toString().slice(0, 4)}`;
    return {
      placeId: `demo-${nicheId}-${city}-${i}`.toLowerCase().replace(/\s+/g, "-"),
      name: `${niche.label} ${p}`,
      address: `Rua Exemplo, ${100 + i * 12} · ${city}`,
      phone,
      rating: Math.min(5, rating),
      reviewCount: reviews,
      mapsUrl: null,
      websiteUri: i % 4 === 3 ? "https://exemplo.com.br" : null,
      score: opportunityScore(Math.min(5, rating), reviews, true),
    };
  });
}

export async function radarSearch(nicheId: string, city: string) {
  const niche = getNiche(nicheId);
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const demo = !apiKey;
  const all = demo ? demoResults(nicheId, city) : await searchGoogle(niche.searchTerm, city, apiKey);
  const withoutSite = all.filter((r) => !hasOwnWebsite(r.websiteUri)).sort((a, b) => b.score - a.score);
  return { demo, total: all.length, results: withoutSite };
}

export function resultToLead(r: RadarResult, nicheId: string, city: string, demo: boolean): Lead {
  return {
    id: nanoid(10),
    placeId: r.placeId,
    name: r.name,
    nicheId,
    city,
    address: r.address,
    phone: r.phone,
    rating: r.rating,
    reviewCount: r.reviewCount,
    mapsUrl: r.mapsUrl,
    score: r.score,
    status: "novo",
    demo,
    siteId: null,
    createdAt: new Date().toISOString(),
  };
}
