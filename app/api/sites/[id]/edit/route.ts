import { NextResponse } from "next/server";
import { editSite } from "@/lib/ai";
import { store } from "@/lib/store";
import { errorMessage, fail } from "@/lib/http";

export const maxDuration = 120;

const MAX_HISTORY = 20;

/** Edição por conversa: o usuário descreve a mudança e a IA devolve o site atualizado. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { instruction } = (await req.json()) as { instruction?: string };
  if (!instruction?.trim()) return fail("Descreva a alteração que você quer.");
  const site = await store.getSite(id);
  if (!site) return fail("Site não encontrado.", 404);

  try {
    const updated = await editSite(site.content, instruction.trim());
    const now = new Date().toISOString();
    const saved = await store.updateSite(id, (s) => {
      s.history.push(s.content);
      if (s.history.length > MAX_HISTORY) s.history.shift();
      s.content = updated;
      s.chat.push({ role: "user", text: instruction.trim(), at: now }, { role: "assistant", text: "Pronto, alteração aplicada.", at: now });
    });
    return NextResponse.json(saved);
  } catch (e) {
    return fail(errorMessage(e), 502);
  }
}
