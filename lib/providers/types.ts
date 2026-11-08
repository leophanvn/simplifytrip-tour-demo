import type { DataSource, Tour, TourFacets } from "@/lib/types";

/**
 * Giao kèo chung cho mọi nguồn dữ liệu tour.
 * Thêm nguồn mới (đối tác khác) = viết thêm một file trong lib/providers/
 * trả về đúng các kiểu trong lib/types.ts.
 */
export interface TourProvider {
  source: DataSource;
  listTours(): Promise<Tour[]>;
  getTourBySlug(slug: string): Promise<Tour | undefined>;
  /** Lựa chọn bộ lọc cố định (nếu có); không có thì tính từ danh sách tour */
  facetPreset?: Partial<TourFacets>;
  /** Số chỗ còn thật, gọi ngay trước khi đặt – không dùng bộ nhớ đệm */
  checkSeatsAvailable?(departureId: string): Promise<number>;
}

/** Lỗi gọi đối tác. `message` chỉ chứa mô tả chung, an toàn để log. */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
