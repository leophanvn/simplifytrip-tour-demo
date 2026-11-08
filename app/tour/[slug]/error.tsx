"use client";

import Link from "next/link";

/** Hiện khi không tải được dữ liệu tour từ đối tác. Không hiển thị chi tiết lỗi. */
export default function TourDetailError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container-st flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-xl font-bold text-brand">Chưa tải được thông tin tour</h1>
      <p className="max-w-[460px] text-[15px] text-ink-2">
        Hệ thống đối tác đang bận. Vui lòng thử lại sau ít phút hoặc gọi hotline{" "}
        <a href="tel:+84931887120" className="font-semibold text-brand">
          (+84) 931 88 7120
        </a>
        .
      </p>
      <div className="flex gap-3">
        <button className="btn" onClick={reset}>
          Thử lại
        </button>
        <Link href="/tour" className="btn-outline">
          Xem tour khác
        </Link>
      </div>
    </main>
  );
}
