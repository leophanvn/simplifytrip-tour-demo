/**
 * Hàm tiện ích thuần (không gọi API, không đọc cấu hình) – dùng được cả ở
 * server lẫn trình duyệt.
 */
import type { Tour, TourFacets } from "./types";

/** Giá thấp nhất trong các ngày còn mở bán */
export function fromPrice(tour: Tour): number {
  const open = tour.departures.filter((d) => d.status !== "closed");
  const list = open.length ? open : tour.departures;
  return list.length ? Math.min(...list.map((d) => d.priceAdult)) : 0;
}

/** Ngày khởi hành gần nhất còn mở bán (ISO) */
export function nextDeparture(tour: Tour): string {
  const open = tour.departures.filter((d) => d.status !== "closed").map((d) => d.date).sort();
  return open[0] ?? tour.departures[0]?.date ?? "";
}

const uniqSorted = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi"));

/** Tính các lựa chọn bộ lọc từ danh sách tour (preset nào có thì dùng preset) */
export function buildFacets(tours: Tour[], preset?: Partial<TourFacets>): TourFacets {
  const today = new Date().toISOString().slice(0, 10);
  return {
    destinations: preset?.destinations ?? uniqSorted(tours.flatMap((t) => t.countries)),
    categories: preset?.categories ?? uniqSorted(tours.flatMap((t) => t.categories)),
    airlines: preset?.airlines ?? uniqSorted(tours.map((t) => t.airline)),
    months:
      preset?.months ??
      [...new Set(tours.flatMap((t) => t.departures.filter((d) => d.status !== "closed" && d.date >= today).map((d) => d.date.slice(0, 7))))]
        .sort()
        .slice(0, 12),
  };
}
