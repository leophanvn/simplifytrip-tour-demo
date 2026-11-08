/**
 * Lớp đọc dữ liệu tour cho các trang (chỉ chạy trên server).
 * Trang chỉ gọi các hàm ở đây; nguồn dữ liệu cụ thể nằm trong lib/providers/.
 */
import "server-only";
import { RELATED_PRODUCTS } from "@/data/tours";
import { getConfig } from "./config";
import { getProvider, ProviderError } from "./providers";
import { buildFacets } from "./tour-utils";
import type { DataSource, RelatedProduct, Tour, TourFacets } from "./types";

export interface TourList {
  tours: Tour[];
  facets: TourFacets;
  source: DataSource;
  /** true khi gọi đối tác lỗi – trang hiện thông báo chung */
  failed: boolean;
}

function logError(where: string, e: unknown) {
  // Chỉ log mô tả chung, không log chi tiết request (có thể chứa header/key)
  console.error(`[tour] ${where}: ${e instanceof ProviderError ? e.message : "lỗi không xác định"}`);
}

export async function getTourList(): Promise<TourList> {
  const provider = getProvider();
  try {
    const tours = await provider.listTours();
    return { tours, facets: buildFacets(tours, provider.facetPreset), source: provider.source, failed: false };
  } catch (e) {
    logError("danh sách tour", e);
    return { tours: [], facets: buildFacets([]), source: provider.source, failed: true };
  }
}

/** Ném lỗi lên để Next.js giữ lại bản trang cũ thay vì lưu trang lỗi */
export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  try {
    return await getProvider().getTourBySlug(slug);
  } catch (e) {
    logError("chi tiết tour", e);
    throw new Error("Không tải được dữ liệu tour");
  }
}

/** Danh sách slug để tạo sẵn trang; lỗi thì trả rỗng (trang sẽ tạo khi có người mở) */
export async function getTourSlugs(): Promise<string[]> {
  try {
    return (await getProvider().listTours()).map((t) => t.slug);
  } catch (e) {
    logError("danh sách slug", e);
    return [];
  }
}

export async function getSimilarTours(tour: Tour, limit = 3): Promise<Tour[]> {
  try {
    const all = await getProvider().listTours();
    return all.filter((t) => t.id !== tour.id && t.countries.some((c) => tour.countries.includes(c))).slice(0, limit);
  } catch {
    return [];
  }
}

export function getRelatedProducts(ids: string[]): RelatedProduct[] {
  return RELATED_PRODUCTS.filter((p) => ids.includes(p.id));
}

export function getDataSource(): { source: DataSource; fallbackReason?: string } {
  const cfg = getConfig();
  return { source: getProvider().source, fallbackReason: cfg.fallbackReason };
}
