import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { fail } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const site = await store.getSite((await params).id);
  return site ? NextResponse.json(site) : fail("Site não encontrado.", 404);
}

/** Publicar/despublicar ou desfazer a última edição. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json()) as { published?: boolean; undo?: boolean };
  const site = await store.updateSite(id, (s) => {
    if (typeof body.published === "boolean") s.published = body.published;
    if (body.undo) {
      const prev = s.history.pop();
      if (prev) {
        s.content = prev;
        s.chat.push({ role: "assistant", text: "Desfiz a última alteração.", at: new Date().toISOString() });
      }
    }
  });
  return site ? NextResponse.json(site) : fail("Site não encontrado.", 404);
}
