#!/usr/bin/env node
/**
 * Lấy DỮ LIỆU MẪU ĐÃ CHE từ API Nature Tourist để Claude map dữ liệu chính xác
 * mà không cần nhìn thấy key.
 *
 * Chạy (trên máy Beo, sau khi đã điền .env.local):  npm run fetch-samples
 *
 * Script sẽ:
 *   - đọc TOUR_API_BASE_URL, TOUR_API_KEY từ .env.local
 *   - gọi vài endpoint, chỉ giữ 3 phần tử đầu của mỗi danh sách
 *   - xóa trường hoa hồng / giá landtour, che số điện thoại, email, tên người
 *   - thay địa chỉ server bằng {server_api}
 *   - ghi ra samples/<tên>.redacted.json
 * Không in key, header hay nội dung trả về ra màn hình.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

loadEnvLocal();
const BASE = (process.env.TOUR_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const KEY = (process.env.TOUR_API_KEY ?? "").trim();
const MARKET = "outbound";

if (!BASE || !KEY || KEY.startsWith("YOUR_")) {
  console.error("Chưa có TOUR_API_BASE_URL hoặc TOUR_API_KEY trong .env.local. Xem README, mục 'Điền key'.");
  process.exit(1);
}

const DROP = /commission|land_price/i;
const MASK = /phone|email|address|contract|booker|buy_id|guide|flag_name|card/i;
const MAX_ITEMS = 3;

function redact(v, key = "") {
  if (Array.isArray(v)) return v.slice(0, MAX_ITEMS).map((x) => redact(x, key));
  if (v && typeof v === "object") {
    const out = {};
    for (const [k, x] of Object.entries(v)) {
      if (DROP.test(k)) continue;
      out[k] = MASK.test(k) && x !== null && x !== "" ? "[đã che]" : redact(x, k);
    }
    return out;
  }
  if (typeof v === "string") {
    if (KEY && v.includes(KEY)) return "[đã che]";
    return v.split(BASE).join("{server_api}");
  }
  return v;
}

async function get(path) {
  const res = await fetch(BASE + path, {
    headers: { accept: "*/*", Authorization: KEY },
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!res) throw new Error("không kết nối được");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

mkdirSync("samples", { recursive: true });
const saved = [];

async function save(name, path) {
  // Chỉ in tên endpoint dạng mẫu, không in id hay địa chỉ server
  const clean = path.replace(/\?.*$/, "");
  const label = /^\/(calendar|price|content)\//.test(clean) ? clean.replace(/\/[^/]+$/, "/:id") : clean;
  try {
    const data = await get(path);
    writeFileSync(`samples/${name}.redacted.json`, JSON.stringify(redact(data), null, 2) + "\n");
    saved.push(name);
    console.log(`✔ ${label}  →  samples/${name}.redacted.json`);
    return data;
  } catch (e) {
    console.log(`✖ ${label}: ${e.message}`);
    return null;
  }
}

const list = (x) => (Array.isArray(x) ? x : (x?.data_list ?? []));

await save("category-outbound", `/category/${MARKET}`);
const blocks = await save("outbound-tour-block", `/${MARKET}/tour-block?page=1&limit=${MAX_ITEMS}`);
await save("outbound-tour-rows", `/${MARKET}/tour-rows?page=1&limit=${MAX_ITEMS}`);

const tour = list(blocks)[0];
if (tour?.id) {
  const cal = await save("calendar-list", `/calendar/list/${encodeURIComponent(tour.id)}`);
  const calendarId = list(cal)[0]?.id ?? tour.calendars?.[0]?.id;
  if (calendarId) {
    const prices = await save("price-list", `/price/list/${encodeURIComponent(calendarId)}`);
    const priceId = list(prices)[0]?.id;
    if (priceId) await save("check-seat", `/price/check_seat_available/${encodeURIComponent(priceId)}`);
  }
  if (tour.alias) await save("content-by-alias", `/content/${encodeURIComponent(String(tour.alias).split("/").filter(Boolean).pop())}`);
  await save("content-by-id", `/content/tour/${encodeURIComponent(tour.id)}`);
} else {
  console.log("Không có tour nào trong tour-block nên bỏ qua lịch, giá, nội dung.");
}

console.log(`\nĐã lưu ${saved.length} file trong thư mục samples/. Mở ra xem lại trước khi gửi cho Claude hoặc commit.`);
console.log("Sau đó chạy: npm run check-secrets");
