import { NextResponse } from "next/server";
import { resultToLead, type RadarResult } from "@/lib/places";
import { store } from "@/lib/store";
import { fail } from "@/lib/http";

export async function GET() {
  return NextResponse.json(await store.listLeads());
}

/** Salva um resultado do radar como lead (sem duplicar o mesmo negócio). */
export async function POST(req: Request) {
  const body = (await req.json()) as { result?: RadarResult; nicheId?: string; city?: string; demo?: boolean };
  if (!body.result || !body.nicheId || !body.city) return fail("Dados do lead incompletos.");
  const lead = await store.upsertLead(resultToLead(body.result, body.nicheId, body.city, !!body.demo));
  return NextResponse.json(lead);
}
