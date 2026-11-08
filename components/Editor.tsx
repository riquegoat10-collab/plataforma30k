"use client";

import { useState } from "react";
import type { Lead, Site } from "@/lib/schema";
import { SiteRenderer } from "./SiteRenderer";
import { pitchMessage, whatsappLink } from "@/lib/pitch";

const SUGGESTIONS = [
  "Deixa o visual mais sofisticado, com fundo escuro",
  "Troca a cor principal para verde",
  "Coloca as perguntas frequentes antes dos serviços",
  "Reescreve o título para focar em agendamento rápido",
];

export function Editor({ initial, lead, appUrl, aiOn }: { initial: Site; lead: Lead | null; appUrl: string; aiOn: boolean }) {
  const [site, setSite] = useState(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const publicUrl = `${appUrl.replace(/\/$/, "")}/s/${site.slug}`;
  const pitch = pitchMessage({ name: site.content.businessName, rating: site.proof.rating, reviewCount: site.proof.reviewCount }, publicUrl);
  const waPitch = whatsappLink(lead?.phone ?? site.content.contact.whatsapp, pitch);

  async function patch(body: object) {
    const res = await fetch(`/api/sites/${site.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) setSite(await res.json());
  }

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/sites/${site.id}/edit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instruction: text }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    setSite(data);
    setInput("");
  }

  async function copyPitch() {
    await navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-5">
        <div>
          <h1 className="text-xl font-bold">{site.content.businessName}</h1>
          <p className="text-sm text-stone-500">
            {site.content.niche} · {site.content.city} · {site.generatedBy === "ia" ? "gerado por IA" : "textos-modelo"}
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{site.published ? "Publicado" : "Rascunho"}</span>
            <button onClick={() => patch({ published: !site.published })} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${site.published ? "border border-stone-300" : "bg-teal-700 text-white"}`}>
              {site.published ? "Despublicar" : "Publicar"}
            </button>
          </div>
          {site.published && (
            <a href={`/s/${site.slug}`} target="_blank" rel="noreferrer" className="block truncate text-sm text-teal-700 underline">{publicUrl}</a>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4">
          <span className="font-semibold">Mensagem para o cliente</span>
          <p className="whitespace-pre-line rounded-lg bg-stone-50 p-3 text-sm text-stone-700">{pitch}</p>
          {!site.published && <p className="text-xs text-amber-700">Publique antes de enviar, para o link funcionar.</p>}
          <div className="flex gap-2">
            <button onClick={copyPitch} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold">{copied ? "Copiada!" : "Copiar"}</button>
            {waPitch && (
              <a href={waPitch} target="_blank" rel="noreferrer" className="rounded-lg bg-[#25d366] px-3 py-1.5 text-sm font-semibold text-white">Abrir no WhatsApp</a>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Editar conversando</span>
            <button onClick={() => patch({ undo: true })} disabled={site.history.length === 0} className="text-sm text-stone-600 underline disabled:opacity-40">Desfazer</button>
          </div>
          {!aiOn && <p className="text-xs text-amber-700">Configure ANTHROPIC_API_KEY para editar por IA.</p>}
          {site.chat.length > 0 && (
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {site.chat.slice(-10).map((m, i) => (
                <li key={i} className={m.role === "user" ? "rounded-lg bg-teal-50 p-2" : "p-2 text-stone-500"}>{m.text}</li>
              ))}
            </ul>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="space-y-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} placeholder="Ex.: muda o botão para 'Agende pelo WhatsApp'" className="input w-full text-sm" disabled={busy || !aiOn} />
            <button disabled={busy || !aiOn || !input.trim()} className="w-full rounded-lg bg-stone-900 py-2 text-sm font-semibold text-white disabled:opacity-40">
              {busy ? "Aplicando…" : "Aplicar alteração"}
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} disabled={busy || !aiOn} className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-50 disabled:opacity-40">{s}</button>
            ))}
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </aside>

      <section>
        <div className="mb-2 flex gap-2 text-sm">
          {(["desktop", "mobile"] as const).map((d) => (
            <button key={d} onClick={() => setDevice(d)} className={`rounded-lg px-3 py-1 ${device === d ? "bg-stone-900 text-white" : "border border-stone-300"}`}>
              {d === "desktop" ? "Computador" : "Celular"}
            </button>
          ))}
        </div>
        <div className={`mx-auto overflow-hidden rounded-xl border border-stone-300 shadow-sm transition-all ${device === "mobile" ? "max-w-[390px]" : "w-full"} ${busy ? "opacity-60" : ""}`}>
          <div className="h-[75vh] overflow-y-auto">
            <SiteRenderer content={site.content} proof={site.proof} preview />
          </div>
        </div>
      </section>
    </div>
  );
}
