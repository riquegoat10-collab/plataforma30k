"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Lead, LeadStatus } from "@/lib/schema";
import { getNiche } from "@/lib/niches";

const COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "contatado", label: "Contatado" },
  { id: "negociando", label: "Negociando" },
  { id: "fechado", label: "Fechado" },
  { id: "perdido", label: "Perdido" },
];

export function LeadBoard({ leads: initial }: { leads: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (leads.length === 0) {
    return <p className="text-stone-500">Nenhum lead salvo. Use o radar para encontrar negócios sem site.</p>;
  }

  async function setStatus(id: string, status: LeadStatus) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function generate(lead: Lead) {
    setBusyId(lead.id);
    setError(null);
    const res = await fetch("/api/sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: lead.id }) });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) return setError(data.error);
    router.push(`/app/sites/${data.id}`);
  }

  return (
    <>
      {error && <p className="mb-2 text-sm text-red-700">{error}</p>}
      <div className="grid gap-3 md:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = leads.filter((l) => l.status === col.id);
          return (
            <div key={col.id} className="rounded-xl bg-stone-100 p-3">
              <h3 className="mb-2 text-sm font-semibold text-stone-600">
                {col.label} <span className="text-stone-400">{items.length}</span>
              </h3>
              <div className="space-y-2">
                {items.map((l) => (
                  <div key={l.id} className="rounded-lg border border-stone-200 bg-white p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold">{l.name}</span>
                      <span className="rounded bg-teal-50 px-1.5 text-xs font-semibold text-teal-800" title="Nota de oportunidade">{l.score}</span>
                    </div>
                    <p className="text-stone-500">
                      {getNiche(l.nicheId).label} · {l.city}
                      {l.demo && " · demonstração"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {l.siteId ? (
                        <Link href={`/app/sites/${l.siteId}`} className="text-teal-700 underline">Abrir site</Link>
                      ) : (
                        <button onClick={() => generate(l)} disabled={busyId !== null} className="text-teal-700 underline disabled:opacity-50">
                          {busyId === l.id ? "Gerando…" : "Gerar site"}
                        </button>
                      )}
                      <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value as LeadStatus)} className="ml-auto rounded border border-stone-200 text-xs">
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
