import { NextResponse } from "next/server";

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Erro inesperado.";
}
