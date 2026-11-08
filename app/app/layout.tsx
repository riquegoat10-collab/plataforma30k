import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link href="/" className="font-bold">
            {BRAND.name}
          </Link>
          <nav className="flex gap-4 text-sm font-medium text-stone-600">
            <Link href="/app" className="hover:text-stone-900">Painel</Link>
            <Link href="/app/radar" className="hover:text-stone-900">Radar</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
