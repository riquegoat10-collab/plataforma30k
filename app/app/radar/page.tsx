"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NICHES } from "@/lib/niches";
import type { RadarResult } from "@/lib/places";
import type { Lead } from "@/lib/schema";

type Search = { demo: boolean; total: number; results: RadarResult[]; nicheId: string; city: string };

export default function RadarPage() {
  const router = useRouter();
  const [nicheId, setNicheId] = useState(NICHES[0].id);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState<Search | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, Lead>>({});
  const [generating, setGenerating] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/radar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nicheId, city }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setSearch({ ...data, nicheId, city });
  }

  async function save(r: RadarResult): Promise<Lead | null> {
    if (!search) return null;
    const key = r.placeId ?? r.name;
    if (saved[key]) return saved[key];
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: r, nicheId: search.nicheId, city: search.city, demo: search.demo }),
    });
    const lead = (await res.json()) as Lead;
    setSaved((s) => ({ ...s, [key]: lead }));
    return lead;
  }

  async function generate(r: RadarResult) {
    const key = r.placeId ?? r.name;
    setGenerating(key);
    setError(null);
    const lead = await save(r);
    if (!lead) return;
    const res = await fetch("/api/sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: lead.id }) });
    const data = await res.json();
    setGenerating(null);
    if (!res.ok) return setError(data.error);
    router.push(`/app/sites/${data.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Radar</h1>
        <p className="text-stone-600">Negócios da cidade que ainda não têm site próprio, ordenados pela nota de oportunidade.</p>
      </div>

      <form onSubmit={run} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row">
        <select value={nicheId} onChange={(e) => setNicheId(e.target.value)} className="input">
          {NICHES.map((n) => (
            <option key={n.id} value={n.id}>{n.label}</option>
          ))}
        </select>
        <input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Cidade, UF (ex.: Curitiba, PR)" className="input flex-1" />
        <button disabled={loading} className="rounded-lg bg-teal-700 px-5 py-2 font-semibold text-white disabled:opacity-50">
          {loading ? "Buscando…" : "Buscar clientes"}
        </button>
      </form>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {search && (
        <div>
          <p className="mb-3 text-sm text-stone-600">
            {search.results.length} de {search.total} negócios sem site próprio em {search.city}.
            {search.demo && <b className="text-amber-700"> Dados de demonstração: configure GOOGLE_PLACES_API_KEY para buscar negócios reais.</b>}
          </p>
          <ul className="grid gap-3 md:grid-cols-2">
            {search.results.map((r) => {
              const key = r.placeId ?? r.name;
              const lead = saved[key];
              return (
                <li key={key} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-teal-50 text-teal-800" title="Nota de oportunidade">
                    <span className="text-lg font-bold leading-none">{r.score}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{r.name}</p>
                    <p className="truncate text-sm text-stone-500">{r.address}</p>
                    <p className="text-sm text-stone-500">
                      {r.rating ? `★ ${r.rating.toFixed(1).replace(".", ",")} (${r.reviewCount})` : "Sem avaliações"} · {r.phone ?? "sem telefone"}
                      {r.websiteUri && " · só redes sociais"}
                    </p>
                    <div className="mt-2 flex gap-3 text-sm">
                      <button onClick={() => generate(r)} disabled={generating !== null} className="font-semibold text-teal-700 underline disabled:opacity-50">
                        {generating === key ? "Gerando o site…" : lead?.siteId ? "Abrir site" : "Gerar site"}
                      </button>
                      <button onClick={() => save(r)} disabled={!!lead} className="text-stone-600 underline disabled:no-underline disabled:opacity-60">
                        {lead ? "Salvo no CRM" : "Salvar lead"}
                      </button>
                      {r.mapsUrl && (
                        <a href={r.mapsUrl} target="_blank" rel="noreferrer" className="text-stone-600 underline">Ver no Maps</a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
