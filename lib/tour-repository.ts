/**
 * Lớp đọc dữ liệu tour.
 * Bản demo đọc từ data/tours.ts. Khi tích hợp API Du Lịch Thiên Nhiên,
 * chỉ cần thay phần thân các hàm dưới đây (giữ nguyên kiểu trả về).
 */
import { TOURS, RELATED_PRODUCTS, type Tour, type RelatedProduct } from "@/data/tours";

export function getTours(): Tour[] {
  return TOURS;
}

export function getTourBySlug(slug: string): Tour | undefined {
  return TOURS.find((t) => t.slug === slug);
}

export function getRelatedProducts(ids: string[]): RelatedProduct[] {
  return RELATED_PRODUCTS.filter((p) => ids.includes(p.id));
}

export function getSimilarTours(tour: Tour, limit = 3): Tour[] {
  return TOURS.filter((t) => t.id !== tour.id && t.countries.some((c) => tour.countries.includes(c))).slice(0, limit);
}

/** Giá thấp nhất trong các ngày còn mở bán */
export function fromPrice(tour: Tour): number {
  const open = tour.departures.filter((d) => d.status !== "closed");
  const list = open.length ? open : tour.departures;
  return Math.min(...list.map((d) => d.priceAdult));
}

/** Ngày khởi hành gần nhất còn mở bán (ISO) */
export function nextDeparture(tour: Tour): string {
  const open = tour.departures.filter((d) => d.status !== "closed").map((d) => d.date).sort();
  return open[0] ?? tour.departures[0].date;
}
