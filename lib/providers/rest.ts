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
  /** Ảnh: URL đầy đủ. File chương trình: là cả thẻ HTML `<a href=...>` (đã thấy trong samples) */
  path?: string;
  /** File chương trình: URL thật của file */
  path_ext?: string;
}

interface NtCategory {
  id: string;
  name?: string;
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
  /** GIẢ ĐỊNH: số giờ trước khởi hành thì ngừng nhận khách (mẫu: 96). Chưa dùng – chờ hỏi đối tác */
  before_depart?: Num;
}

interface NtTourBlock {
  id: string;
  category_id?: string;
  tour_name?: string;
  name?: string;
  tour_code?: string;
  /** Tài liệu ghi số 1/2/3; dữ liệu thật là chữ, ví dụ "SÀI GÒN" */
  departure?: Num;
  alias?: string;
  hight_lights?: string;
  /** Dữ liệu thật trong tour-block để rỗng → tra tên theo category_id */
  category_name?: string;
  total_day?: Num;
  total_night?: Num;
  vehicles_go?: Num;
  file_upload?: NtFile[];
  /** File PDF mang tên NATURE */
  file_upload_nature?: NtFile[];
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
  file_upload_nature?: NtFile[];
}

/* -------------------------------------------------------------------------- */
/* Hằng số                                                                     */
/* -------------------------------------------------------------------------- */
/** Giai đoạn 1 chỉ lấy tour nước ngoài. Tour trong nước: "domestic". */
const MARKET = "outbound";
/** Phân trang `page` + `limit`: đã kiểm chứng bằng samples. Mỗi trang 20 tour, gọi song song. */
const PAGE_LIMIT = 20;
/** Chặn trên để không gọi quá nhiều nếu đối tác trả total_pages bất thường (25 × 20 = 500 tour) */
const MAX_PAGES = 25;
/** tour-block trả `calendars: []` → lấy lịch từng tour; tối đa bấy nhiêu lời gọi cùng lúc */
const CALENDAR_CONCURRENCY = 6;
const FEW_SEATS = 5;

const DEPART_CITY: Record<string, string> = { "1": "TP. Hồ Chí Minh", "2": "Hà Nội", "3": "Cần Thơ" };
/** Dữ liệu thật trả chữ (viết hoa, có dấu) */
const DEPART_CITY_BY_NAME: Record<string, string> = {
  "SÀI GÒN": "TP. Hồ Chí Minh",
  "HỒ CHÍ MINH": "TP. Hồ Chí Minh",
  "TP. HỒ CHÍ MINH": "TP. Hồ Chí Minh",
  "TP HCM": "TP. Hồ Chí Minh",
  "HÀ NỘI": "Hà Nội",
  "CẦN THƠ": "Cần Thơ",
};
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
  let text: string;
  try {
    res = await fetch(url, {
      headers: { accept: "*/*", Authorization: api.key },
      signal: AbortSignal.timeout(api.timeoutMs),
      ...(opts.noStore ? { cache: "no-store" as const } : { next: { revalidate: revalidateSeconds } }),
    });
    if (!res.ok) throw new ProviderError(`API tour trả lỗi (${label}): HTTP ${res.status}`, res.status, `HTTP ${res.status}`);
    text = await res.text(); // đọc body cũng có thể hết giờ / đứt kết nối
  } catch (e) {
    if (e instanceof ProviderError) throw e;
    const code = errorCode(e);
    throw new ProviderError(`Không kết nối được API tour (${label}): ${code}`, undefined, code);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ProviderError(`API tour trả dữ liệu không đọc được (${label}): InvalidJSON`, undefined, "InvalidJSON");
  }
}

/**
 * Lấy mã lỗi kỹ thuật (không lấy message, vì message có thể chứa URL).
 * Ví dụ: TimeoutError (hết giờ), ECONNRESET (đối tác ngắt kết nối),
 * ENOTFOUND (sai tên miền), UND_ERR_CONNECT_TIMEOUT (không mở được kết nối).
 */
function errorCode(e: unknown): string {
  if (!(e instanceof Error)) return "UnknownError";
  if (e.name === "TimeoutError" || e.name === "AbortError") return e.name;
  const cause = (e as { cause?: unknown }).cause;
  if (cause && typeof cause === "object") {
    const c = cause as { code?: unknown; name?: unknown };
    if (typeof c.code === "string" && /^[A-Z0-9_]{2,40}$/.test(c.code)) return c.code;
    if (typeof c.name === "string" && c.name !== "Error") return c.name;
  }
  return e.name || "UnknownError";
}

/** Gom lỗi theo mã: "TimeoutError×2, ECONNRESET×1" */
function summarizeErrors(errors: unknown[]): string {
  const counts = new Map<string, number>();
  for (const e of errors) {
    const code = e instanceof ProviderError ? (e.code ?? "UnknownError") : errorCode(e);
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  return [...counts].map(([code, n]) => (n > 1 ? `${code}×${n}` : code)).join(", ");
}

/** Chạy `fn` cho từng phần tử, tối đa `limit` lời gọi cùng lúc; lỗi không làm dừng phần còn lại */
async function mapSettled<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const out: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try {
        out[i] = { status: "fulfilled", value: await fn(items[i]) };
      } catch (reason) {
        out[i] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
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
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  let s = String(v ?? "").replace(/[^\d.,-]/g, "");
  // Dấu chấm/phẩy ngăn cách hàng nghìn: "8.790.000", "8,790,000" (thấy trong /content)
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(s)) s = s.replace(/[.,]/g, "");
  const n = Number(s);
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

/**
 * URL file chương trình tour. `path` của đối tác là thẻ `<a href=...>`, link thật ở `path_ext`.
 * GIẢ ĐỊNH: ưu tiên PDF NATURE (`file_upload_nature`), không có thì dùng `file_upload` (.docx TOP).
 */
function programFile(x: { file_upload?: NtFile[]; file_upload_nature?: NtFile[] }): string | undefined {
  for (const f of [...(x.file_upload_nature ?? []), ...(x.file_upload ?? [])]) {
    const href = f.path_ext?.trim() || f.path?.match(/href\s*=\s*['"]([^'"]+)['"]/i)?.[1];
    const url = href ? absUrl(decodeEntities(href)) : f.path && !f.path.includes("<") ? absUrl(f.path) : undefined;
    if (url) return url;
  }
  return undefined;
}

function departCity(v: Num): string {
  const s = String(v ?? "").normalize("NFC").trim();
  if (!s) return "Đang cập nhật";
  if (DEPART_CITY[s]) return DEPART_CITY[s];
  const upper = s.toLocaleUpperCase("vi");
  if (DEPART_CITY_BY_NAME[upper]) return DEPART_CITY_BY_NAME[upper];
  // Tên khác: viết hoa chữ đầu mỗi từ, ví dụ "ĐÀ NẴNG" → "Đà Nẵng"
  return s.toLocaleLowerCase("vi").replace(/(^|\s)(\S)/g, (_, sp: string, c: string) => sp + c.toLocaleUpperCase("vi"));
}

/** Tên danh mục "Tour Thái Lan" → điểm đến "Thái Lan" */
function countryOf(b: NtTourBlock, categories: Map<string, string>): string {
  // GIẢ ĐỊNH: danh mục chính (category_id) là quốc gia; category_sub_id có thể là thành phố nên không dùng
  const name = (b.category_id && categories.get(b.category_id)) || b.category_name?.trim() || "";
  return name.replace(/^tour\s+/i, "").trim() || "Tour nước ngoài";
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
  ndash: "–", mdash: "—", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", bull: "•",
  agrave: "à", aacute: "á", acirc: "â", atilde: "ã", egrave: "è", eacute: "é", ecirc: "ê",
  igrave: "ì", iacute: "í", ograve: "ò", oacute: "ó", ocirc: "ô", otilde: "õ",
  ugrave: "ù", uacute: "ú", yacute: "ý",
  Agrave: "À", Aacute: "Á", Acirc: "Â", Atilde: "Ã", Egrave: "È", Eacute: "É", Ecirc: "Ê",
  Igrave: "Ì", Iacute: "Í", Ograve: "Ò", Oacute: "Ó", Ocirc: "Ô", Otilde: "Õ",
  Ugrave: "Ù", Uacute: "Ú", Yacute: "Ý",
};

/** Giải mã &agrave; &#225; &#xE1;... (đối tác có chỗ mã hóa HTML 2 lần) */
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return NAMED_ENTITIES[e] ?? m;
  });
}

/** Bỏ thẻ HTML, tách thành từng dòng ngắn */
function textLines(html: string | undefined, max = 6): string[] {
  if (!html) return [];
  return decodeEntities(decodeEntities(html)) // lần 1: &lt;p&gt; → <p>; lần 2: &amp;agrave; còn sót
    .replace(/<\s*(br|\/p|\/li|\/div)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
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

/**
 * `calendars`: lịch lấy từ /calendar/list/{tour_id} (tour-block thật trả `calendars: []`).
 * `categories`: category_id → tên, từ /category/outbound.
 */
function mapTour(b: NtTourBlock, calendars: NtCalendar[], categories: Map<string, string>): Tour | undefined {
  const today = todayVN();
  // GIẢ ĐỊNH: vẫn hiện ngày khởi hành từ hôm nay trở đi, chưa trừ `before_depart` – chờ đối tác xác nhận
  const departures = calendars
    .map(mapCalendar)
    .filter((d): d is Departure => !!d && d.date >= today)
    .sort((x, y) => x.date.localeCompare(y.date));
  if (!departures.length) return undefined; // không còn ngày khởi hành → không hiển thị

  const first = departures.find((d) => d.status !== "closed") ?? departures[0];
  const firstPrice = calendars.flatMap((c) => c.prices ?? []).find((p) => p.id === first.id);
  const country = countryOf(b, categories);
  const tourTypes = [...new Set(calendars.map((c) => TOUR_TYPE[String(c.tour_type ?? "")]).filter(Boolean))];

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
    departCity: departCity(b.departure),
    airline: airlineOf(firstPrice?.ticket_plane_go, b.vehicles_go),
    hotelClass: firstPrice?.level_nam?.trim() || "Đang cập nhật",
    images: [...files(b.image), ...files(b.images)]
      .map((f) => absUrl(f.path))
      .filter((u): u is string => !!u)
      .filter((u, i, all) => all.indexOf(u) === i),
    highlights: textLines(b.hight_lights),
    itinerary: [], // TODO(samples): lấy lịch trình theo ngày từ /content khi có dữ liệu mẫu
    programFileUrl: programFile(b),
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
function warn(what: string, failed: number, total: number, errors: unknown[]) {
  // Chỉ ghi tên endpoint + số lượng + mã lỗi; không ghi URL, header, key hay body
  console.warn(`[tour-rest] ${what}: lỗi ${failed}/${total} (${summarizeErrors(errors)})`);
}

function fetchBlockPage(page: number) {
  return ntGet<NtPaged<NtTourBlock> | NtTourBlock[]>(`/${MARKET}/tour-block`, {
    query: { page, limit: PAGE_LIMIT },
  });
}

/** category_id → tên. Lỗi thì trả rỗng (tour vẫn hiện, chỉ thiếu tên nước) */
async function fetchCategories(): Promise<Map<string, string>> {
  try {
    const list = listOf(await ntGet<NtCategory[] | NtPaged<NtCategory>>(`/category/${MARKET}`));
    return new Map(list.filter((c) => c.id && c.name).map((c) => [c.id, c.name!.trim()]));
  } catch (e) {
    warn(`/category/${MARKET}`, 1, 1, [e]);
    return new Map();
  }
}

async function listTours(): Promise<Tour[]> {
  // 1. Trang 1 (để biết tổng số trang) và danh mục, gọi cùng lúc.
  //    Trang 1 lỗi thì không biết có bao nhiêu tour → báo lỗi lên trang.
  const [first, categories] = await Promise.all([fetchBlockPage(1), fetchCategories()]);
  const blocks = [...listOf(first)];
  const totalPages = Math.min(MAX_PAGES, Array.isArray(first) ? 1 : num(first.total_pages) || 1);

  // 2. Các trang còn lại gọi song song; trang lỗi thì bỏ, giữ tour đã lấy được
  if (totalPages > 1) {
    const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const results = await Promise.allSettled(pages.map(fetchBlockPage));
    const errors: unknown[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") blocks.push(...listOf(r.value));
      else errors.push(r.reason);
    }
    if (errors.length) warn(`/${MARKET}/tour-block (trang)`, errors.length, totalPages, errors);
  }

  // Bỏ tour trùng (dữ liệu có thể đổi giữa các trang)
  const unique = [...new Map(blocks.filter((b) => b.id).map((b) => [b.id, b])).values()];

  // 3. Lịch khởi hành từng tour (tour-block trả calendars rỗng). Tour lỗi lịch thì bỏ tour đó.
  const calendarResults = await mapSettled(unique, CALENDAR_CONCURRENCY, async (b) =>
    b.calendars?.length
      ? b.calendars
      : listOf(await ntGet<NtCalendar[] | NtPaged<NtCalendar>>(`/calendar/list/${encodeURIComponent(b.id)}`)),
  );
  const calendarErrors = calendarResults.flatMap((r) => (r.status === "rejected" ? [r.reason] : []));
  if (calendarErrors.length) warn("/calendar/list/:id", calendarErrors.length, unique.length, calendarErrors);
  if (unique.length && calendarErrors.length === unique.length) {
    // Hỏng toàn bộ → báo lỗi để trang hiện thông báo thay vì danh sách trống
    throw new ProviderError(`Không lấy được lịch khởi hành (${summarizeErrors(calendarErrors)})`);
  }

  return unique
    .map((b, i) => {
      const r = calendarResults[i];
      return r.status === "fulfilled" ? mapTour(b, r.value, categories) : undefined;
    })
    .filter((t): t is Tour => !!t);
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
      programFileUrl: programFile(content) ?? tour.programFileUrl,
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
