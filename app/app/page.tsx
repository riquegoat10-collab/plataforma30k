import Link from "next/link";
import { store } from "@/lib/store";
import { aiEnabled } from "@/lib/ai";
import { LeadBoard } from "@/components/LeadBoard";
import { ManualGenerate } from "@/components/ManualGenerate";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [leads, sites] = await Promise.all([store.listLeads(), store.listSites()]);
  const ai = aiEnabled();
  const places = !!process.env.GOOGLE_PLACES_API_KEY;

  return (
    <div className="space-y-8">
      {(!ai || !places) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Modo de teste.</b>{" "}
          {!places && "Sem GOOGLE_PLACES_API_KEY, o radar mostra negócios de demonstração. "}
          {!ai && "Sem ANTHROPIC_API_KEY, os sites usam textos-modelo e a edição por IA fica desligada. "}
          Configure as chaves no arquivo <code>.env.local</code>.
        </div>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h1 className="text-2xl font-bold">Seus leads</h1>
          <Link href="/app/radar" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
            Buscar no radar
          </Link>
        </div>
        <LeadBoard leads={leads} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Sites</h2>
        {sites.length === 0 ? (
          <p className="text-stone-500">Nenhum site ainda. Gere o primeiro a partir de um lead ou com o formulário abaixo.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((s) => (
              <li key={s.id}>
                <Link href={`/app/sites/${s.id}`} className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: s.content.theme.primary }} />
                    <span className="font-semibold">{s.content.businessName}</span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {s.content.niche} · {s.content.city} · {s.published ? "publicado" : "rascunho"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-xl">
        <h2 className="mb-3 text-xl font-bold">Gerar site sem o radar</h2>
        <ManualGenerate />
      </section>
    </div>
  );
}

