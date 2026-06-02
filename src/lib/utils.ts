import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const TIER_COLOURS: Record<string, string> = {
  Budget: "bg-green-100 text-green-800 border-green-200",
  Everyday: "bg-blue-100 text-blue-800 border-blue-200",
  Premium: "bg-purple-100 text-purple-800 border-purple-200",
  Retail: "bg-amber-100 text-amber-800 border-amber-200",
  Designer: "bg-red-100 text-red-800 border-red-200",
};

export const STATUS_COLOURS: Record<string, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-blue-100 text-blue-800 border-blue-200",
  Quoted: "bg-amber-100 text-amber-800 border-amber-200",
  Won: "bg-green-100 text-green-800 border-green-200",
  Lost: "bg-red-100 text-red-800 border-red-200",
};
