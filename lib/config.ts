/**
 * ĐỌC CẤU HÌNH KẾT NỐI – chỉ chạy trên server.
 *
 * Mọi thông tin kết nối (địa chỉ API, key) đọc tại đây, từ biến môi trường:
 *   - Máy Beo:  file .env.local (không bao giờ đẩy lên GitHub)
 *   - Vercel:   Settings → Environment Variables (bật "Sensitive")
 *
 * Quy tắc:
 *   - Không viết cứng key trong code.
 *   - Không đặt key vào biến có tiền tố NEXT_PUBLIC_ (Next.js sẽ gửi xuống trình duyệt).
 *   - Không log giá trị key / URL có key.
 * Dòng `import "server-only"` khiến build báo lỗi nếu file này lỡ bị import
 * vào component chạy trên trình duyệt.
 */
import "server-only";

export type ProviderName = "mock" | "rest";

export interface TourApiConfig {
  baseUrl: string;
  key: string;
  /** Gốc đường dẫn ảnh/file nếu API trả về đường dẫn tương đối */
  assetBaseUrl: string;
  timeoutMs: number;
}

export interface AppConfig {
  provider: ProviderName;
  /** Có khi provider = "rest" */
  api?: TourApiConfig;
  /** Số giây giữ bộ nhớ đệm cho danh sách, nội dung, lịch tour */
  revalidateSeconds: number;
  /** Lý do quay về dữ liệu giả (để hiện cảnh báo, không chứa giá trị bí mật) */
  fallbackReason?: string;
}

const DEFAULT_TIMEOUT_MS = 8000;
export const REVALIDATE_SECONDS = 900; // 15 phút

let cached: AppConfig | undefined;
let warned = false;

function clean(v: string | undefined): string {
  return (v ?? "").trim();
}

/** Chỉ chấp nhận https (cho phép http với localhost để chạy thử máy chủ giả) */
function isHttpsUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname));
  } catch {
    return false;
  }
}

export function getConfig(): AppConfig {
  if (cached) return cached;

  const provider = clean(process.env.TOUR_PROVIDER).toLowerCase() || "mock";
  const baseUrl = clean(process.env.TOUR_API_BASE_URL).replace(/\/+$/, "");
  const key = clean(process.env.TOUR_API_KEY);
  const assetBaseUrl = clean(process.env.TOUR_ASSET_BASE_URL).replace(/\/+$/, "") || baseUrl;
  const timeoutMs = Number(clean(process.env.TOUR_API_TIMEOUT_MS)) || DEFAULT_TIMEOUT_MS;

  if (provider !== "rest") {
    cached = { provider: "mock", revalidateSeconds: REVALIDATE_SECONDS };
    return cached;
  }

  // Thiếu hoặc sai cấu hình → dùng dữ liệu giả để trang không bị hỏng.
  // Chỉ nêu TÊN biến bị thiếu, không bao giờ in giá trị.
  const problems: string[] = [];
  if (!baseUrl) problems.push("thiếu TOUR_API_BASE_URL");
  else if (!isHttpsUrl(baseUrl)) problems.push("TOUR_API_BASE_URL phải bắt đầu bằng https://");
  if (!key) problems.push("thiếu TOUR_API_KEY");

  if (problems.length) {
    const fallbackReason = problems.join(", ");
    if (!warned) {
      console.warn(`[tour-config] TOUR_PROVIDER=rest nhưng ${fallbackReason}. Đang dùng dữ liệu giả lập.`);
      warned = true;
    }
    cached = { provider: "mock", revalidateSeconds: REVALIDATE_SECONDS, fallbackReason };
    return cached;
  }

  cached = {
    provider: "rest",
    api: { baseUrl, key, assetBaseUrl, timeoutMs },
    revalidateSeconds: REVALIDATE_SECONDS,
  };
  return cached;
}
