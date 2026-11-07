/** Định dạng tiền theo đúng cách simplifytrip.com đang hiển thị: 24,999,000 ₫ */
export function vnd(n: number): string {
  return `${n.toLocaleString("en-US")} ₫`;
}

/** 24999000 → "24,9tr" (dùng trên chip ngày khởi hành) */
export function shortVnd(n: number): string {
  const tr = Math.floor(n / 100000) / 10;
  return `${tr.toLocaleString("vi-VN")}tr`;
}

/** "2026-11-11" → "11/11" */
export function ddmm(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** "2026-11-11" → "11/11/2026" */
export function ddmmyyyy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function durationLabel(days: number, nights: number): string {
  return `${days} ngày ${nights} đêm`;
}

/** Ảnh Unsplash qua CDN của Unsplash (hotlink theo đúng hướng dẫn Unsplash) */
export function unsplash(id: string, w = 800): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
}
