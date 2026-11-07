import type { Tour } from "@/data/tours";
import { fromPrice, nextDeparture } from "./tour-repository";

export const BUDGETS = [
  { id: "lt10", label: "Dưới 10 triệu", min: 0, max: 10_000_000 },
  { id: "10-20", label: "10 – 20 triệu", min: 10_000_000, max: 20_000_000 },
  { id: "20-30", label: "20 – 30 triệu", min: 20_000_000, max: 30_000_000 },
  { id: "gt30", label: "Trên 30 triệu", min: 30_000_000, max: Infinity },
] as const;

export const DURATIONS = [
  { id: "3-4", label: "3 – 4 ngày", min: 3, max: 4 },
  { id: "5-6", label: "5 – 6 ngày", min: 5, max: 6 },
  { id: "7+", label: "7 ngày trở lên", min: 7, max: 99 },
] as const;

export const SORTS = [
  { id: "date", label: "Ngày khởi hành gần nhất" },
  { id: "price-asc", label: "Giá thấp → cao" },
  { id: "price-desc", label: "Giá cao → thấp" },
  { id: "days", label: "Số ngày ít → nhiều" },
] as const;

export const PAGE_SIZE = 9;

export interface TourFilters {
  dest: string[];
  cat: string[];
  budget: string[];
  days: string[];
  air: string[];
  month: string; // "2026-11" hoặc ""
  sort: string;
  page: number;
}

const LIST_KEYS = ["dest", "cat", "budget", "days", "air"] as const;

export function parseFilters(sp: URLSearchParams): TourFilters {
  const list = (k: string) => (sp.get(k) ? sp.get(k)!.split(",").filter(Boolean) : []);
  return {
    dest: list("dest"),
    cat: list("cat"),
    budget: list("budget"),
    days: list("days"),
    air: list("air"),
    month: sp.get("month") ?? "",
    sort: sp.get("sort") ?? "date",
    page: Math.max(1, Number(sp.get("page") ?? 1) || 1),
  };
}

export function toQuery(f: TourFilters): string {
  const sp = new URLSearchParams();
  for (const k of LIST_KEYS) if (f[k].length) sp.set(k, f[k].join(","));
  if (f.month) sp.set("month", f.month);
  if (f.sort !== "date") sp.set("sort", f.sort);
  if (f.page > 1) sp.set("page", String(f.page));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function applyFilters(tours: Tour[], f: TourFilters): Tour[] {
  let r = tours.filter((t) => {
    if (f.dest.length && !t.countries.some((c) => f.dest.includes(c))) return false;
    if (f.cat.length && !t.categories.some((c) => f.cat.includes(c))) return false;
    if (f.air.length && !f.air.includes(t.airline)) return false;
    if (f.budget.length) {
      const p = fromPrice(t);
      if (!BUDGETS.some((b) => f.budget.includes(b.id) && p >= b.min && p < b.max)) return false;
    }
    if (f.days.length && !DURATIONS.some((d) => f.days.includes(d.id) && t.durationDays >= d.min && t.durationDays <= d.max)) return false;
    if (f.month && !t.departures.some((d) => d.status !== "closed" && d.date.startsWith(f.month))) return false;
    return true;
  });
  r = [...r].sort((a, b) => {
    switch (f.sort) {
      case "price-asc":
        return fromPrice(a) - fromPrice(b);
      case "price-desc":
        return fromPrice(b) - fromPrice(a);
      case "days":
        return a.durationDays - b.durationDays;
      default:
        return nextDeparture(a).localeCompare(nextDeparture(b));
    }
  });
  return r;
}

export function activeChips(f: TourFilters): { key: keyof TourFilters; value: string; label: string }[] {
  const chips: { key: keyof TourFilters; value: string; label: string }[] = [];
  f.dest.forEach((v) => chips.push({ key: "dest", value: v, label: v }));
  f.cat.forEach((v) => chips.push({ key: "cat", value: v, label: v }));
  f.budget.forEach((v) => chips.push({ key: "budget", value: v, label: BUDGETS.find((b) => b.id === v)?.label ?? v }));
  f.days.forEach((v) => chips.push({ key: "days", value: v, label: DURATIONS.find((d) => d.id === v)?.label ?? v }));
  f.air.forEach((v) => chips.push({ key: "air", value: v, label: v }));
  if (f.month) {
    const [y, m] = f.month.split("-");
    chips.push({ key: "month", value: f.month, label: `Tháng ${Number(m)}/${y}` });
  }
  return chips;
}
