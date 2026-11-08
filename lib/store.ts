import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead, Site } from "./schema";

/**
 * Armazenamento simples em arquivo JSON, bom para desenvolvimento local.
 * Para produção, troque por Postgres/Supabase mantendo estas mesmas funções.
 */
type DB = { leads: Lead[]; sites: Site[] };

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DB;
  } catch {
    return { leads: [], sites: [] };
  }
}

async function write(db: DB) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE);
}

/** Executa leituras/escritas em fila para não perder dados com requisições simultâneas. */
function tx<T>(fn: (db: DB) => T | Promise<T>, save: boolean): Promise<T> {
  const run = queue.then(async () => {
    const db = await read();
    const result = await fn(db);
    if (save) await write(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const store = {
  listLeads: () => tx((db) => [...db.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), false),
  getLead: (id: string) => tx((db) => db.leads.find((l) => l.id === id) ?? null, false),
  upsertLead: (lead: Lead) =>
    tx((db) => {
      const existing = lead.placeId ? db.leads.find((l) => l.placeId === lead.placeId) : undefined;
      if (existing) return existing;
      db.leads.push(lead);
      return lead;
    }, true),
  updateLead: (id: string, patch: Partial<Lead>) =>
    tx((db) => {
      const lead = db.leads.find((l) => l.id === id);
      if (!lead) return null;
      Object.assign(lead, patch);
      return lead;
    }, true),

  listSites: () => tx((db) => [...db.sites].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), false),
  getSite: (id: string) => tx((db) => db.sites.find((s) => s.id === id) ?? null, false),
  getSiteBySlug: (slug: string) => tx((db) => db.sites.find((s) => s.slug === slug) ?? null, false),
  insertSite: (site: Site) =>
    tx((db) => {
      db.sites.push(site);
      return site;
    }, true),
  updateSite: (id: string, fn: (site: Site) => void) =>
    tx((db) => {
      const site = db.sites.find((s) => s.id === id);
      if (!site) return null;
      fn(site);
      site.updatedAt = new Date().toISOString();
      return site;
    }, true),
};
