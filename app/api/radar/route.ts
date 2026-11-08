import { NextResponse } from "next/server";
import { radarSearch } from "@/lib/places";
import { errorMessage, fail } from "@/lib/http";

export async function POST(req: Request) {
  const { nicheId, city } = (await req.json()) as { nicheId?: string; city?: string };
  if (!nicheId || !city?.trim()) return fail("Escolha o ramo e digite a cidade.");
  try {
    return NextResponse.json(await radarSearch(nicheId, city.trim()));
  } catch (e) {
    return fail(errorMessage(e), 502);
  }
}
