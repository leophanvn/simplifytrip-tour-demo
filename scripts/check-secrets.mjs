#!/usr/bin/env node
/**
 * Quét các file SẼ được đẩy lên GitHub (đã theo dõi + mới, trừ file trong .gitignore)
 * để tìm key / mật khẩu bị viết cứng, file .env, file PDF tài liệu đối tác,
 * và dữ liệu hoa hồng trong file mẫu.
 *
 * Chạy: npm run check-secrets
 * Không bao giờ in ra giá trị bí mật – chỉ in tên file và số dòng.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const SELF = "scripts/check-secrets.mjs";

function listFiles() {
  try {
    return execSync("git ls-files --cached --others --exclude-standard", { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    console.error("Không chạy được git. Hãy chạy lệnh này trong thư mục repo.");
    process.exit(2);
  }
}

/** Đọc giá trị bí mật từ .env.local (nếu có) để dò xem có bị chép vào code không */
function secretValuesFromEnvLocal() {
  if (!existsSync(".env.local")) return [];
  const out = [];
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, name, raw] = m;
    const value = raw.replace(/^["']|["']$/g, "").trim();
    if (/(KEY|SECRET|TOKEN|PASSWORD|BASE_URL)/.test(name) && value.length >= 8 && !value.includes("example.com") && !value.startsWith("YOUR_")) {
      out.push({ name, value });
    }
  }
  return out;
}

const PATTERNS = [
  {
    why: "Biến NEXT_PUBLIC_ chứa key/secret (sẽ bị gửi xuống trình duyệt)",
    re: /NEXT_PUBLIC_[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD)/,
  },
  {
    why: "Header Authorization có giá trị viết cứng",
    re: /authorization["']?\s*[:=,]\s*["'`]\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  },
  {
    why: "Key / mật khẩu viết cứng",
    re: /(api[_-]?key|user[_-]?key|secret|token|password|passwd)["']?\s*[:=]\s*["'`](?!YOUR_|\$\{)[^"'`\s]{12,}["'`]/i,
  },
];

const findings = [];
const add = (file, line, why) => findings.push({ file, line, why });

const secrets = secretValuesFromEnvLocal();

for (const file of listFiles()) {
  if (file === SELF) continue;
  const base = file.split("/").pop();

  if (/^\.env/.test(base) && base !== ".env.example") add(file, 0, "File .env không được đưa lên GitHub");
  if (/\.pdf$/i.test(file)) add(file, 0, "File PDF (có thể là tài liệu API chứa key) không nên đưa lên GitHub");
  if (!existsSync(file)) continue;

  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes("\u0000")) continue; // file nhị phân (ảnh...)

  const lines = text.split("\n");
  lines.forEach((l, i) => {
    for (const p of PATTERNS) if (p.re.test(l)) add(file, i + 1, p.why);
    for (const s of secrets) if (l.includes(s.value)) add(file, i + 1, `Chứa giá trị của ${s.name} trong .env.local`);
  });

  if (/^samples\/.*\.json$/.test(file) && /"[^"]*(commission|land_price)[^"]*"\s*:/i.test(text)) {
    add(file, 0, "File mẫu còn trường hoa hồng / giá landtour – chạy lại npm run fetch-samples");
  }
}

if (findings.length) {
  console.error(`\n✖ Phát hiện ${findings.length} vấn đề cần xử lý trước khi đẩy code:\n`);
  for (const f of findings) console.error(`  - ${f.file}${f.line ? `:${f.line}` : ""}  →  ${f.why}`);
  console.error("\nKhông commit / push cho tới khi sửa xong. Nếu key đã lỡ lên GitHub: báo đối tác cấp key mới.\n");
  process.exit(1);
}

console.log(`✔ Không thấy key hay file bí mật trong các file sẽ đẩy lên GitHub${secrets.length ? " (đã đối chiếu với .env.local)" : ""}.`);
