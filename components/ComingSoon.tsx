"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/**
 * Hộp thông báo "Sắp ra mắt" cho các tính năng chưa làm trong bản demo
 * (giỏ hàng, điền thông tin khách, đặt cọc, thanh toán...).
 */
type Ctx = (feature: string) => void;
const ComingSoonContext = createContext<Ctx>(() => {});

export function useComingSoon() {
  return useContext(ComingSoonContext);
}

export function ComingSoonProvider({ children }: { children: React.ReactNode }) {
  const [feature, setFeature] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const open = useCallback((f: string) => setFeature(f), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (feature && !d.open) d.showModal();
    if (!feature && d.open) d.close();
  }, [feature]);

  return (
    <ComingSoonContext.Provider value={open}>
      {children}
      <dialog
        ref={ref}
        onClose={() => setFeature(null)}
        onClick={(e) => e.target === ref.current && setFeature(null)}
        className="m-auto w-[min(92vw,420px)] rounded-xl p-0 shadow-hover backdrop:bg-black/40"
        aria-labelledby="cs-title"
      >
        <div className="flex flex-col gap-4 p-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-green-50 text-brand">
            <Icon name="spark" size={24} />
          </span>
          <h2 id="cs-title" className="text-lg font-bold">
            {feature ?? "Tính năng"} sắp ra mắt
          </h2>
          <p className="text-[15px] leading-relaxed text-ink-2">
            Đây là bản demo giao diện dịch vụ Tour. Giỏ hàng, điền thông tin khách, đặt cọc và thanh toán sẽ được
            cập nhật ở giai đoạn tiếp theo, theo đúng luồng giỏ hàng hiện tại của Simplify Trip.
          </p>
          <div className="flex gap-2">
            <button className="btn flex-1" onClick={() => setFeature(null)} autoFocus>
              Đã hiểu
            </button>
          </div>
        </div>
      </dialog>
    </ComingSoonContext.Provider>
  );
}

/** Nút/link bất kỳ mở hộp "Sắp ra mắt" */
export function ComingSoonButton({
  feature,
  className,
  children,
  ariaLabel,
}: {
  feature: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const open = useComingSoon();
  return (
    <button type="button" className={className} onClick={() => open(feature)} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
