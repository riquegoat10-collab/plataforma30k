"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NICHES } from "@/lib/niches";

export function ManualGenerate() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        manual: {
          name: f.get("name"),
          nicheId: f.get("nicheId"),
          city: f.get("city"),
          phone: f.get("phone"),
          notes: f.get("notes"),
        },
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    router.push(`/app/sites/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Nome do negócio" className="input" />
        <select name="nicheId" className="input">
          {NICHES.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>
        <input name="city" required placeholder="Cidade, UF" className="input" />
        <input name="phone" placeholder="WhatsApp (opcional)" className="input" />
      </div>
      <textarea name="notes" rows={2} placeholder="Observações: serviços, preços, horário… (opcional)" className="input w-full" />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-lg bg-stone-900 px-4 py-2 font-semibold text-white disabled:opacity-50">
        {busy ? "Gerando o site…" : "Gerar site"}
      </button>
    </form>
  );
}
