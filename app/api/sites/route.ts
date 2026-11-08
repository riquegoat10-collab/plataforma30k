import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { generateSite } from "@/lib/ai";
import { store } from "@/lib/store";
import { slugify } from "@/lib/slug";
import { errorMessage, fail } from "@/lib/http";
import type { BusinessInput } from "@/lib/fallback";
import type { Site } from "@/lib/schema";

export const maxDuration = 120;

/** Gera um site a partir de um lead do radar ou de dados digitados à mão. */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    leadId?: string;
    manual?: { name: string; nicheId: string; city: string; phone?: string; notes?: string };
  };

  let input: BusinessInput;
  let lead = body.leadId ? await store.getLead(body.leadId) : null;
  if (body.leadId && !lead) return fail("Lead não encontrado.", 404);
  if (lead?.siteId) return NextResponse.json({ id: lead.siteId });

  if (lead) {
    input = { name: lead.name, nicheId: lead.nicheId, city: lead.city, phone: lead.phone, address: lead.address };
  } else if (body.manual?.name?.trim() && body.manual.city?.trim()) {
    const m = body.manual;
    input = { name: m.name.trim(), nicheId: m.nicheId, city: m.city.trim(), phone: m.phone?.trim() || null, address: null, notes: m.notes ?? null };
  } else {
    return fail("Informe o nome do negócio e a cidade.");
  }

  try {
    const { content, by } = await generateSite(input);
    const now = new Date().toISOString();
    const site: Site = {
      id: nanoid(10),
      slug: slugify(input.name),
      leadId: lead?.id ?? null,
      content,
      proof: { rating: lead?.rating ?? null, reviewCount: lead?.reviewCount ?? null, mapsUrl: lead?.mapsUrl ?? null },
      history: [],
      chat: [],
      published: false,
      generatedBy: by,
      createdAt: now,
      updatedAt: now,
    };
    await store.insertSite(site);
    if (lead) lead = await store.updateLead(lead.id, { siteId: site.id });
    return NextResponse.json({ id: site.id });
  } catch (e) {
    return fail(errorMessage(e), 502);
  }
}
