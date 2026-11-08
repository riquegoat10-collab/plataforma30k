import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { aiEnabled } from "@/lib/ai";
import { Editor } from "@/components/Editor";

export const dynamic = "force-dynamic";

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await store.getSite(id);
  if (!site) notFound();
  const lead = site.leadId ? await store.getLead(site.leadId) : null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return <Editor initial={site} lead={lead} appUrl={appUrl} aiOn={aiEnabled()} />;
}
