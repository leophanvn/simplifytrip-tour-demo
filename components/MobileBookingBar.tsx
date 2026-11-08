"use client";

import { useEffect, useState } from "react";
import type { Tour } from "@/lib/types";
import { vnd } from "@/lib/format";
import { fromPrice } from "@/lib/tour-utils";
import { BookingBox } from "./BookingBox";
import { Icon } from "./Icon";
import { useComingSoon } from "./ComingSoon";

/** Thanh giá cố định đáy màn hình (mobile/tablet) + bottom sheet đặt tour */
export function MobileBookingBar({ tour }: { tour: Tour }) {
  const [open, setOpen] = useState(false);
  const openSoon = useComingSoon();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex h-[76px] items-center justify-between gap-3 border-t border-line bg-white px-4 shadow-[0_-4px_12px_rgba(16,24,40,.06)] lg:hidden">
        <div>
          <div className="text-xs text-muted">Giá từ / khách</div>
          <b className="text-[19px] text-brand">{vnd(fromPrice(tour))}</b>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline px-3" aria-label="Tư vấn miễn phí" onClick={() => openSoon("Tư vấn trực tuyến")}>
            <Icon name="chat" size={20} />
          </button>
          <button className="btn" onClick={() => setOpen(true)}>
            Đặt tour
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Đặt tour">
          <button aria-label="Đóng" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-2xl bg-white">
            <div className="flex items-center justify-between border-b border-line-soft px-4 py-2">
              <b>Chọn ngày &amp; số khách</b>
              <button aria-label="Đóng" className="flex size-11 items-center justify-center" onClick={() => setOpen(false)}>
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <BookingBox tour={tour} variant="sheet" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
