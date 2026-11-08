import { customAlphabet } from "nanoid";

const suffix = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 4);

export function slugify(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "site"}-${suffix()}`;
}
