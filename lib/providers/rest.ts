/**
 * NGUỒN DỮ LIỆU THẬT: API Nature Tourist (Du Lịch Thiên Nhiên).
 *
 * - Chỉ chạy trên server. Key được gắn vào header `Authorization` tại đây,
 *   đọc qua getConfig(); không có ở bất kỳ nơi nào khác.
 * - Chuyển dữ liệu đối tác về kiểu chuẩn trong lib/types.ts.
 * - KHÔNG đọc / trả về các trường hoa hồng (`*_commission`) và giá landtour
 *   (`adults_land_price`): các kiểu Nt* bên dưới cố ý không khai báo chúng.
 * - Lỗi trả ra ngoài chỉ có mô tả chung; không log header, key hay body.
 *
 * Tài liệu tóm tắt: docs/nature-tourist-api.md
 *
 * Các chỗ ghi "GIẢ ĐỊNH" là suy ra từ tài liệu PDF, CHƯA kiểm chứng bằng
 * dữ liệu thật. Khi có file samples/*.redacted.json thì rà lại từng chỗ.
 */
import "server-only";
import { RELATED_PRODUCTS, DEFAULT_POLICY } from "@/data/tours";
import { getConfig } from "@/lib/config";
import { vnd } from "@/lib/format";
import type { Departure, Tour } from "@/lib/types";
import { ProviderError, type TourProvider } from "./types";

/* -------------------------------------------------------------------------- */
/* Kiểu dữ liệu thô của đối tác (chỉ các trường được dùng)                     */
/* -------------------------------------------------------------------------- */
type Num = number | string | null | undefined;

interface NtFile {
  id?: string;
  name?: string;
  path?: string;
}

interface NtPrice {
  id: string;
  level_nam?: string;
  calendar_id?: string;
  ticket_plane_go?: string;
  ticket_plane_back?: string;
  adults_price?: Num; // giá đề xuất
  adults_promotion?: Num; // giá bán thực tế
  children_has_bed_price?: Num;
  children_has_bed_promotion?: Num;
  children_no_bed_price?: Num;
  children_no_bed_promotion?: Num;
  infant_price?: Num;
  infant_promotion?: Num;
  single_room_add?: Num;
  number_seat_open?: Num;
  number_seat_available?: Num;
}

interface NtCalendar {
  id: string;
  tour_id?: string;
  tour_type?: Num; // 0 thường, 1 sự kiện, 2 lễ tết
  start_date?: string;
  end_date?: string;
  number_seat_open?: Num;
  number_seat_available?: Num;
  prices?: NtPrice[];
  hotel_name?: string;
}

interface NtTourBlock {
  id: string;
  category_id?: string;
  tour_name?: string;
  name?: string;
  tour_code?: string;
  departure?: Num; // 1 Sài Gòn, 2 Hà Nội, 3 Cần Thơ
  alias?: string;
  hight_lights?: string;
  category_name?: string;
  total_day?: Num;
  total_night?: Num;
  vehicles_go?: Num;
  file_upload?: NtFile[];
  image?: NtFile | NtFile[];
  images?: NtFile[];
  calendars?: NtCalendar[];
  ages_adults?: Num;
  ages_children1_from?: Num;
  ages_children1_to?: Num;
  ages_infant?: Num;
}

interface NtPaged<T> {
  page?: Num;
  limit?: Num;
  total_records?: Num;
  total_pages?: Num;
  data_list?: T[];
}

/** Một phần ContentTourModel (theo code mẫu C#). Lịch trình theo ngày: chờ dữ liệu mẫu. */
interface NtContent {
  name?: string;
  hight_lights?: string;
  file_upload?: NtFile[];
}

/* -------------------------------------------------------------------------- */
/* Hằng số                                                                     */
/* -------------------------------------------------------------------------- */
/** Giai đoạn 1 chỉ lấy tour nước ngoài. Tour trong nước: "domestic". */
const MARKET = "outbound";
/** GIẢ ĐỊNH: tham số phân trang tên `page` và `limit` (thấy trong code mẫu). */
const PAGE_LIMIT = 50;
const MAX_PAGES = 10;
const FEW_SEATS = 5;

const DEPART_CITY: Record<string, string> = { "1": "TP. Hồ Chí Minh", "2": "Hà Nội", "3": "Cần Thơ" };
const VEHICLE: Record<string, string> = { "0": "Tự chọn", "1": "Máy bay", "2": "Ô tô", "3": "Tàu hỏa", "4": "Tàu cao tốc" };
const TOUR_TYPE: Record<string, string> = { "1": "Sự kiện", "2": "Lễ, Tết" };
/** GIẢ ĐỊNH: thông tin chuyến bay bắt đầu bằng mã hãng 2 ký tự, ví dụ "VN 512 ..." */
const AIRLINE_BY_CODE: Record<string, string> = {
  VN: "Vietnam Airlines",
  VJ: "VietJet Air",
  QH: "Bamboo Airways",
  VU: "Vietravel Airlines",
  CZ: "China Southern Airlines",
  MU: "China Eastern Airlines",
  CA: "Air China",
  ZH: "Shenzhen Airlines",
  QW: "Qingdao Airlines",
  SC: "Shandong Airlines",
  GY: "Colorful Guizhou Airlines",
  KE: "Korean Air",
  OZ: "Asiana Airlines",
  JL: "Japan Airlines",
  NH: "All Nippon Airways",
  TG: "Thai Airways",
  SQ: "Singapore Airlines",
  EK: "Emirates",
  CI: "China Airlines",
  BR: "EVA Air",
};

/* -------------------------------------------------------------------------- */
/* Gọi API                                                                     */
/* -------------------------------------------------------------------------- */
type Query = Record<string, string | number>;

async function ntGet<T>(path: string, opts: { query?: Query; noStore?: boolean } = {}): Promise<T> {
  const { api, revalidateSeconds } = getConfig();
  if (!api) throw new ProviderError("Chưa cấu hình API tour");

  const url = new URL(api.baseUrl + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, String(v));

  // Tên endpoint để ghi log, bỏ phần id cho gọn: "/calendar/list/:id"
  const label = path.replace(/\/[0-9a-f-]{16,}/gi, "/:id");

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { accept: "*/*", Authorization: api.key },
      signal: AbortSignal.timeout(api.timeoutMs),
      ...(opts.noStore ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } }),
    });
  } catch {
    throw new ProviderError(`Không kết nối được API tour (${label})`);
  }
  if (!res.ok) throw new ProviderError(`API tour trả lỗi ${res.status} (${label})`, res.status);

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ProviderError(`API tour trả dữ liệu không đọc được (${label})`);
  }
}

/** Danh sách có thể trả về dạng mảng hoặc dạng phân trang { data_list } */
function listOf<T>(x: T[] | NtPaged<T> | null | undefined): T[] {
  if (Array.isArray(x)) return x;
  return x?.data_list ?? [];
}

/* -------------------------------------------------------------------------- */
/* Chuyển đổi dữ liệu                                                          */
/* -------------------------------------------------------------------------- */
function num(v: Num): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Giá bán thực tế; nếu đối tác để 0 thì dùng giá đề xuất */
function sale(promotion: Num, suggested: Num): number {
  return num(promotion) > 0 ? num(promotion) : num(suggested);
}

function isoDate(v: string | undefined): string {
  return (v ?? "").slice(0, 10);
}

function todayVN(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
}

function absUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  const base = getConfig().api?.assetBaseUrl ?? "";
  // GIẢ ĐỊNH: đường dẫn tương đối tính từ gốc server API (đổi bằng TOUR_ASSET_BASE_URL)
  return `${base}/${path.replace(/^\/+/, "")}`;
}

function files(x: NtFile | NtFile[] | undefined): NtFile[] {
  return Array.isArray(x) ? x : x ? [x] : [];
}

/** Bỏ thẻ HTML, tách thành từng dòng ngắn */
function textLines(html: string | undefined, max = 6): string[] {
  if (!html) return [];
  return html
    .replace(/<\s*(br|\/p|\/li|\/div)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split(/\n|•/)
    .map((s) => s.replace(/^[\s\-–*+]+/, "").trim())
    .filter((s) => s.length > 2)
    .slice(0, max);
}

function airlineOf(flight: string | undefined, vehicle: Num): string {
  const code = (flight ?? "").trim().toUpperCase().match(/^([A-Z0-9]{2})\s?-?\d/)?.[1];
  if (code && AIRLINE_BY_CODE[code]) return AIRLINE_BY_CODE[code];
  if (code) return code;
  return VEHICLE[String(vehicle ?? "")] ?? "Đang cập nhật";
}

function slugOf(b: NtTourBlock): string {
  const alias = (b.alias ?? "").split("/").filter(Boolean).pop();
  return alias || b.id;
}

/** Mỗi ngày khởi hành → một lựa chọn, lấy mức giá rẻ nhất còn bán */
function mapCalendar(c: NtCalendar): Departure | undefined {
  const prices = (c.prices ?? []).filter((p) => sale(p.adults_promotion, p.adults_price) > 0);
  if (!prices.length || !c.start_date) return undefined;
  const p = prices.reduce((a, b) => (sale(b.adults_promotion, b.adults_price) < sale(a.adults_promotion, a.adults_price) ? b : a));

  const seatValues = [p.number_seat_available, c.number_seat_available].filter((v) => v !== undefined && v !== null).map(num);
  const seatsLeft = seatValues.length ? Math.max(0, Math.min(...seatValues)) : 0;

  return {
    id: p.id,
    calendarId: c.id,
    date: isoDate(c.start_date),
    returnDate: isoDate(c.end_date) || isoDate(c.start_date),
    priceAdult: sale(p.adults_promotion, p.adults_price),
    // Tour nước ngoài: trẻ em dùng giá "children_no_bed" (mục #11 tài liệu)
    priceChild: sale(p.children_no_bed_promotion, p.children_no_bed_price),
    priceInfant: sale(p.infant_promotion, p.infant_price),
    singleRoomAdd: num(p.single_room_add) || undefined,
    seatsLeft,
    status: seatsLeft <= 0 ? "closed" : seatsLeft <= FEW_SEATS ? "few" : "open",
    flightOut: p.ticket_plane_go?.trim() || "Đang cập nhật",
    flightBack: p.ticket_plane_back?.trim() || "Đang cập nhật",
  };
}

function priceOfDeparture(b: NtTourBlock, d: Departure): NtPrice | undefined {
  return b.calendars?.flatMap((c) => c.prices ?? []).find((p) => p.id === d.id);
}

function mapTour(b: NtTourBlock): Tour | undefined {
  const today = todayVN();
  const departures = (b.calendars ?? [])
    .map(mapCalendar)
    .filter((d): d is Departure => !!d && d.date >= today)
    .sort((x, y) => x.date.localeCompare(y.date));
  if (!departures.length) return undefined; // không còn ngày khởi hành → không hiển thị

  const first = departures.find((d) => d.status !== "closed") ?? departures[0];
  const firstPrice = priceOfDeparture(b, first);
  const country = b.category_name?.trim() || "Tour nước ngoài";
  const tourTypes = [...new Set((b.calendars ?? []).map((c) => TOUR_TYPE[String(c.tour_type ?? "")]).filter(Boolean))];

  const infantAge = num(b.ages_infant) || 2;
  const childFrom = num(b.ages_children1_from) || infantAge;
  const childTo = num(b.ages_children1_to) || 11;
  const adultAge = num(b.ages_adults) || childTo;

  return {
    id: b.id,
    code: b.tour_code?.trim() || b.id.slice(0, 8).toUpperCase(),
    slug: slugOf(b),
    title: (b.tour_name || b.name || "Tour").trim(),
    country,
    countries: [country],
    categories: tourTypes,
    durationDays: num(b.total_day),
    durationNights: num(b.total_night),
    departCity: DEPART_CITY[String(b.departure ?? "")] ?? "Đang cập nhật",
    airline: airlineOf(firstPrice?.ticket_plane_go, b.vehicles_go),
    hotelClass: firstPrice?.level_nam?.trim() || "Đang cập nhật",
    images: [...files(b.image), ...files(b.images)]
      .map((f) => absUrl(f.path))
      .filter((u): u is string => !!u)
      .filter((u, i, all) => all.indexOf(u) === i),
    highlights: textLines(b.hight_lights),
    itinerary: [], // TODO(samples): lấy lịch trình theo ngày từ /content khi có dữ liệu mẫu
    programFileUrl: absUrl(b.file_upload?.[0]?.path),
    includes: [], // TODO(samples)
    excludes: [], // TODO(samples)
    childPolicy: [
      { age: `Dưới ${infantAge} tuổi`, price: vnd(first.priceInfant), note: "Em bé" },
      { age: `Từ ${childFrom} đến dưới ${childTo} tuổi`, price: vnd(first.priceChild), note: "Trẻ em" },
      { age: `Từ ${adultAge} tuổi trở lên`, price: vnd(first.priceAdult), note: "Như người lớn" },
    ],
    depositPct: DEFAULT_POLICY.depositPct,
    cancelRules: DEFAULT_POLICY.cancelRules, // GIẢ ĐỊNH: chính sách Simplify Trip, cần khớp hợp đồng đối tác
    notes: DEFAULT_POLICY.notes,
    visaIncluded: undefined, // đối tác chưa có trường này
    departures,
    relatedProductIds: country.includes("Trung Quốc") ? RELATED_PRODUCTS.map((p) => p.id) : [],
  };
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */
async function listTours(): Promise<Tour[]> {
  const blocks: NtTourBlock[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await ntGet<NtPaged<NtTourBlock> | NtTourBlock[]>(`/${MARKET}/tour-block`, {
      query: { page, limit: PAGE_LIMIT },
    });
    const items = listOf(res);
    blocks.push(...items);
    const totalPages = Array.isArray(res) ? 1 : num(res.total_pages) || 1;
    if (page >= totalPages || items.length === 0) break;
  }
  return blocks.map(mapTour).filter((t): t is Tour => !!t);
}

async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  const tour = (await listTours()).find((t) => t.slug === slug);
  if (!tour) return undefined;

  // Nội dung chi tiết: lỗi ở đây không làm hỏng trang, chỉ thiếu phần bổ sung
  try {
    const content = await ntGet<NtContent>(`/content/${encodeURIComponent(slug)}`);
    const highlights = textLines(content.hight_lights);
    return {
      ...tour,
      highlights: highlights.length ? highlights : tour.highlights,
      programFileUrl: absUrl(content.file_upload?.[0]?.path) ?? tour.programFileUrl,
    };
  } catch (e) {
    console.warn(`[tour-rest] ${e instanceof ProviderError ? e.message : "Lỗi đọc nội dung tour"}`);
    return tour;
  }
}

async function checkSeatsAvailable(priceId: string): Promise<number> {
  const res = await ntGet<Num | { number_seat_available?: Num }>(
    `/price/check_seat_available/${encodeURIComponent(priceId)}`,
    { noStore: true },
  );
  return typeof res === "object" && res !== null ? num(res.number_seat_available) : num(res);
}

export const restProvider: TourProvider = {
  source: "nature-tourist",
  listTours,
  getTourBySlug,
  checkSeatsAvailable,
};
