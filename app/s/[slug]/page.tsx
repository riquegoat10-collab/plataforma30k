import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { SiteRenderer } from "@/components/SiteRenderer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await store.getSiteBySlug((await params).slug);
  if (!site?.published) return {};
  return { title: site.content.seo.title, description: site.content.seo.description };
}

export default async function PublicSite({ params }: Props) {
  const site = await store.getSiteBySlug((await params).slug);
  if (!site?.published) notFound();
  return <SiteRenderer content={site.content} proof={site.proof} />;
}
