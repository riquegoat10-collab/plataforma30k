import type { CSSProperties, ReactNode } from "react";
import type { Proof, SectionId, SiteContent } from "@/lib/schema";
import { whatsappLink } from "@/lib/pitch";
import { BRAND } from "@/lib/brand";

/**
 * Renderiza o site a partir do JSON. Usa container queries (@md, @lg) para que
 * a prévia "celular" do editor se comporte igual a um celular de verdade.
 */
export function SiteRenderer({
  content: c,
  proof,
  showBadge = true,
  preview = false,
}: {
  content: SiteContent;
  proof: Proof;
  showBadge?: boolean;
  /** Na prévia do editor o botão flutuante de WhatsApp é omitido (ele ficaria preso à janela). */
  preview?: boolean;
}) {
  const dark = c.theme.mode === "escuro";
  const vars = {
    "--p": safeColor(c.theme.primary),
    "--bg": dark ? "#0c0a09" : "#fafaf9",
    "--fg": dark ? "#f5f5f4" : "#1c1917",
    "--muted": dark ? "#a8a29e" : "#57534e",
    "--card": dark ? "#1c1917" : "#ffffff",
    "--line": dark ? "#292524" : "#e7e5e4",
    fontFamily: c.theme.font === "serif" ? 'Georgia, "Times New Roman", serif' : 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  } as CSSProperties;

  const wa = whatsappLink(c.contact.whatsapp, `Olá! Vi o site da ${c.businessName} e gostaria de mais informações.`);
  const ctaHref = wa ?? (c.contact.phone ? `tel:${c.contact.phone.replace(/\D/g, "")}` : "#contato");
  const style = c.theme.style;
  const rounded = style === "acolhedor" ? "rounded-3xl" : style === "ousado" ? "rounded-none" : "rounded-xl";

  const sections: Record<SectionId, ReactNode> = {
    about: (
      <Section key="about" title={c.about.title}>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted)]">{c.about.body}</p>
      </Section>
    ),
    services: c.services.items.length > 0 && (
      <Section key="services" title={c.services.title}>
        <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3">
          {c.services.items.map((s, i) => (
            <div key={i} className={`${rounded} border border-[var(--line)] bg-[var(--card)] p-6`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">{s.name}</h3>
                {s.price && <span className="shrink-0 font-semibold text-[var(--p)]">{s.price}</span>}
              </div>
              <p className="mt-2 text-[var(--muted)]">{s.description}</p>
            </div>
          ))}
        </div>
      </Section>
    ),
    highlights: c.highlights.items.length > 0 && (
      <Section key="highlights" title={c.highlights.title} tinted>
        <div className="grid gap-6 @md:grid-cols-3">
          {c.highlights.items.map((h, i) => (
            <div key={i}>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center ${rounded} bg-[var(--p)] font-bold text-white`}>{i + 1}</div>
              <h3 className="text-lg font-semibold">{h.title}</h3>
              <p className="mt-1 text-[var(--muted)]">{h.description}</p>
            </div>
          ))}
        </div>
      </Section>
    ),
    proof: proof.rating && proof.reviewCount ? (
      <Section key="proof" title="Quem conhece, recomenda">
        <div className={`${rounded} flex flex-col items-start gap-2 border border-[var(--line)] bg-[var(--card)] p-6 @md:flex-row @md:items-center @md:gap-6`}>
          <div className="text-5xl font-bold text-[var(--p)]">{proof.rating.toFixed(1).replace(".", ",")}</div>
          <div>
            <div className="text-xl tracking-widest text-amber-500">{"★".repeat(Math.round(proof.rating))}</div>
            <p className="text-[var(--muted)]">
              Nota no Google, com {proof.reviewCount} avaliações de clientes.
              {proof.mapsUrl && (
                <>
                  {" "}
                  <a className="underline" href={proof.mapsUrl} target="_blank" rel="noreferrer">
                    Ver avaliações
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </Section>
    ) : null,
    faq: c.faq.items.length > 0 && (
      <Section key="faq" title={c.faq.title}>
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {c.faq.items.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="cursor-pointer list-none text-lg font-medium">
                <span className="mr-2 text-[var(--p)] group-open:hidden">+</span>
                <span className="mr-2 hidden text-[var(--p)] group-open:inline">−</span>
                {f.question}
              </summary>
              <p className="mt-2 pl-5 text-[var(--muted)]">{f.answer}</p>
            </details>
          ))}
        </div>
      </Section>
    ),
    contact: (
      <Section key="contact" title={c.contact.title} id="contato" tinted>
        <div className="grid gap-6 @md:grid-cols-2">
          <ul className="space-y-3 text-lg">
            {c.contact.whatsapp && <li><b>WhatsApp:</b> {c.contact.whatsapp}</li>}
            {c.contact.phone && c.contact.phone !== c.contact.whatsapp && <li><b>Telefone:</b> {c.contact.phone}</li>}
            {c.contact.address && <li><b>Endereço:</b> {c.contact.address}</li>}
            {c.contact.hours && <li><b>Horário:</b> {c.contact.hours}</li>}
            {c.contact.instagram && <li><b>Instagram:</b> {c.contact.instagram}</li>}
          </ul>
          <div>
            <a href={ctaHref} className={`inline-block ${rounded} bg-[var(--p)] px-6 py-4 text-lg font-semibold text-white shadow-lg`}>
              {c.hero.ctaLabel}
            </a>
          </div>
        </div>
      </Section>
    ),
  };

  return (
    <div className="@container relative min-h-full bg-[var(--bg)] text-[var(--fg)]" style={vars}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-lg font-bold">{c.businessName}</span>
        <a href={ctaHref} className={`${rounded} bg-[var(--p)] px-4 py-2 text-sm font-semibold text-white`}>
          {wa ? "WhatsApp" : "Contato"}
        </a>
      </header>

      <Hero c={c} href={ctaHref} rounded={rounded} />

      {c.sections.map((id) => sections[id] || null)}

      <footer className="border-t border-[var(--line)] px-5 py-8 text-center text-sm text-[var(--muted)]">
        © {new Date().getFullYear()} {c.businessName} · {c.city}
        {showBadge && <span className="block pt-1 opacity-70">Feito com {BRAND.name}</span>}
      </footer>

      {wa && !preview && (
        <a href={wa} aria-label="Falar no WhatsApp" className={`fixed bottom-5 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl`}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
          </svg>
        </a>
      )}
    </div>
  );
}

function Hero({ c, href, rounded }: { c: SiteContent; href: string; rounded: string }) {
  const s = c.theme.style;
  const centered = s === "elegante";
  const bg =
    s === "ousado"
      ? "bg-[var(--p)] text-white"
      : s === "moderno"
        ? "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--p)_18%,var(--bg)),var(--bg))]"
        : s === "acolhedor"
          ? "bg-[color-mix(in_srgb,var(--p)_10%,var(--bg))]"
          : "";
  const button = s === "ousado" ? "bg-white text-[var(--p)]" : "bg-[var(--p)] text-white";
  return (
    <section className={`${bg} px-5 py-16 @md:py-24`}>
      <div className={`mx-auto max-w-6xl ${centered ? "text-center" : ""}`}>
        <p className={`mb-4 text-sm font-semibold uppercase tracking-[0.2em] ${s === "ousado" ? "text-white/80" : "text-[var(--p)]"}`}>{c.hero.eyebrow}</p>
        <h1 className={`${centered ? "mx-auto" : ""} max-w-3xl text-4xl font-bold leading-tight @md:text-6xl ${s === "ousado" ? "uppercase" : ""}`}>
          {c.hero.headline}
        </h1>
        <p className={`${centered ? "mx-auto" : ""} mt-5 max-w-2xl text-lg @md:text-xl ${s === "ousado" ? "text-white/85" : "text-[var(--muted)]"}`}>{c.hero.subheadline}</p>
        <a href={href} className={`mt-8 inline-block ${rounded} ${button} px-7 py-4 text-lg font-semibold shadow-lg`}>
          {c.hero.ctaLabel}
        </a>
      </div>
    </section>
  );
}

function Section({ title, children, id, tinted }: { title: string; children: ReactNode; id?: string; tinted?: boolean }) {
  return (
    <section id={id} className={`px-5 py-14 ${tinted ? "bg-[color-mix(in_srgb,var(--p)_6%,var(--bg))]" : ""}`}>
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-3xl font-bold">{title}</h2>
        {children}
      </div>
    </section>
  );
}

/** Aceita só cores hexadecimais, para a IA não injetar CSS estranho. */
function safeColor(c: string) {
  return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : "#0f766e";
}
