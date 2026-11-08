import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { fail } from "@/lib/http";
import type { LeadStatus } from "@/lib/schema";

const STATUSES: LeadStatus[] = ["novo", "contatado", "negociando", "fechado", "perdido"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = (await req.json()) as { status?: LeadStatus };
  if (!status || !STATUSES.includes(status)) return fail("Status inválido.");
  const lead = await store.updateLead(id, { status });
  return lead ? NextResponse.json(lead) : fail("Lead não encontrado.", 404);
}
