/**
 * KIỂU DỮ LIỆU CHUẨN của website tour.
 *
 * Giao diện (components/, app/) chỉ dùng các kiểu ở file này.
 * Mỗi nguồn dữ liệu (lib/providers/*) có nhiệm vụ chuyển dữ liệu của nó
 * về đúng các kiểu này. Không đưa trường nội bộ của đối tác (hoa hồng,
 * giá landtour...) vào đây, vì mọi thứ trong Tour đều có thể tới trình duyệt.
 */

export type DepartureStatus = "open" | "few" | "closed";

export interface Departure {
  /** Khóa duy nhất của lựa chọn ngày + mức giá (Nature Tourist: price_id) */
  id: string;
  /** Nature Tourist: calendar_id – dùng khi cần gọi lại lịch/giá */
  calendarId?: string;
  /** ISO date, ví dụ 2026-11-11 */
  date: string;
  returnDate: string;
  /** Giá bán thực tế cho khách (đã gồm khuyến mãi của đối tác nếu có) */
  priceAdult: number;
  priceChild: number;
  priceInfant: number;
  /** Phụ thu phòng đơn, nếu có */
  singleRoomAdd?: number;
  seatsLeft: number;
  status: DepartureStatus;
  flightOut: string;
  flightBack: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  meals?: string;
  /** Cho phép **in đậm** bằng cú pháp markdown đơn giản */
  body: string;
}

export interface Tour {
  id: string;
  code: string;
  slug: string;
  title: string;
  country: string;
  countries: string[];
  categories: string[];
  durationDays: number;
  durationNights: number;
  departCity: string;
  airline: string;
  hotelClass: string;
  /** Unsplash photo id (dữ liệu giả) hoặc URL ảnh đầy đủ (API thật) */
  images: string[];
  highlights: string[];
  promotion?: { title: string; items: string[] };
  itinerary: ItineraryDay[];
  /** File chương trình tour (PDF) của đối tác, nếu có */
  programFileUrl?: string;
  includes: string[];
  excludes: string[];
  childPolicy: { age: string; price: string; note: string }[];
  depositPct: number;
  cancelRules: { when: string; fee: string }[];
  notes: string[];
  /** true / false khi biết chắc; để trống khi đối tác chưa cung cấp */
  visaIncluded?: boolean;
  departures: Departure[];
  relatedProductIds: string[];
}

export interface RelatedProduct {
  id: string;
  kind: "esim" | "sim" | "visa";
  label: string;
  title: string;
  price: string;
  image?: string;
  href: string;
}

/** Các lựa chọn hiển thị trong bộ lọc, tính từ danh sách tour */
export interface TourFacets {
  destinations: string[];
  categories: string[];
  airlines: string[];
  /** "2026-11", "2026-12"... */
  months: string[];
}

/** Nguồn dữ liệu đang dùng – hiển thị nhỏ trên trang để dễ kiểm tra */
export type DataSource = "mock" | "nature-tourist";
