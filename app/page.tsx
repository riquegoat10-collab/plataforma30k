import Link from "next/link";
import { BRAND } from "@/lib/brand";

const STEPS = [
  { t: "1. Radar", d: "Escolha o ramo e a cidade. Mostramos os negócios bem avaliados no Google que ainda não têm site." },
  { t: "2. Site em 1 minuto", d: "A IA escreve os textos do negócio e monta o site com o design do ramo, usando só dados reais." },
  { t: "3. Ajuste conversando", d: "Peça mudanças em português: \"troca a cor para verde\", \"tira a seção de perguntas\". Sem limite de edições." },
  { t: "4. Publique e mande", d: "Publique com um clique e envie a prévia pelo WhatsApp com a mensagem pronta." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav className="flex items-center justify-between">
        <span className="text-xl font-bold">{BRAND.name}</span>
        <Link href="/app" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
          Abrir o app
        </Link>
      </nav>

      <section className="py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Para quem vende sites</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          Chegue no cliente com o site dele já pronto.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-stone-600">{BRAND.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/app/radar" className="rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white">
            Buscar clientes
          </Link>
          <Link href="/app" className="rounded-lg border border-stone-300 px-6 py-3 font-semibold">
            Ver meu painel
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.t} className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold">{s.t}</h2>
            <p className="mt-2 text-stone-600">{s.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
