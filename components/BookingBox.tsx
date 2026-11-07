"use client";

import { useMemo, useState } from "react";
import type { Departure, Tour } from "@/data/tours";
import { ddmm, ddmmyyyy, shortVnd, vnd } from "@/lib/format";
import { fromPrice } from "@/lib/tour-repository";
import { Icon } from "./Icon";
import { useComingSoon } from "./ComingSoon";

/** Ưu đãi đại lý giả lập (đại lý cấp 4) – sau này lấy theo tài khoản đăng nhập */
const AGENT_LEVEL = 4;
const AGENT_DISCOUNT_PER_ADULT = 300000;

type Pax = { adult: number; child: number; infant: number };

export function BookingBox({ tour, variant = "aside" }: { tour: Tour; variant?: "aside" | "sheet" }) {
  const openSoon = useComingSoon();
  const sorted = useMemo(() => [...tour.departures].sort((a, b) => a.date.localeCompare(b.date)), [tour]);
  const firstOpen = sorted.find((d) => d.status !== "closed") ?? sorted[0];
  const [depId, setDepId] = useState(firstOpen.id);
  const [pax, setPax] = useState<Pax>({ adult: 2, child: 0, infant: 0 });
  const dep = sorted.find((d) => d.id === depId)!;

  const totalPax = pax.adult + pax.child + pax.infant;
  const seatCap = dep.seatsLeft;
  const lines = [
    { k: "Người lớn", n: pax.adult, p: dep.priceAdult },
    { k: "Trẻ em", n: pax.child, p: dep.priceChild },
    { k: "Em bé", n: pax.infant, p: dep.priceInfant },
  ];
  const subtotal = lines.reduce((s, l) => s + l.n * l.p, 0);
  const discount = pax.adult * AGENT_DISCOUNT_PER_ADULT;
  const total = subtotal - discount;
  const deposit = Math.round((total * tour.depositPct) / 100);

  const setN = (k: keyof Pax, delta: number) =>
    setPax((p) => {
      const min = k === "adult" ? 1 : 0;
      const next = Math.max(min, p[k] + delta);
      // Em bé không chiếm ghế; người lớn + trẻ em không vượt quá số chỗ còn
      const seats = (k === "adult" ? next : p.adult) + (k === "child" ? next : p.child);
      if (delta > 0 && k !== "infant" && seats > seatCap) return p;
      if (k === "infant" && next > p.adult) return p; // tối đa 1 em bé / người lớn
      return { ...p, [k]: next };
    });

  const paxRows: { key: keyof Pax; label: string; sub: string; price: number }[] = [
    { key: "adult", label: "Người lớn", sub: "Từ 12 tuổi", price: dep.priceAdult },
    { key: "child", label: "Trẻ em", sub: "2 – 11 tuổi", price: dep.priceChild },
    { key: "infant", label: "Em bé", sub: "Dưới 2 tuổi", price: dep.priceInfant },
  ];

  const seatsInUse = pax.adult + pax.child;

  /** Đổi ngày: nếu số khách đang chọn vượt số chỗ còn thì giảm trẻ em trước, rồi đến người lớn */
  const selectDate = (d: Departure) => {
    setDepId(d.id);
    setPax((p) => {
      let { adult, child } = p;
      while (adult + child > d.seatsLeft && child > 0) child--;
      while (adult + child > d.seatsLeft && adult > 1) adult--;
      return { adult, child, infant: Math.min(p.infant, adult) };
    });
  };

  return (
    <div className={variant === "aside" ? "card overflow-hidden border border-line" : ""}>
      {variant === "aside" && (
        <div className="flex flex-col gap-1.5 bg-brand px-5 py-[18px] text-white">
          <span className="text-xs tracking-[0.06em] opacity-85">GIÁ TỪ</span>
          <div className="flex items-baseline gap-1.5">
            <b className="text-[28px] leading-none">{vnd(fromPrice(tour))}</b>
            <span className="text-sm opacity-85">/ khách</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-white/20 pt-2 text-[13px]">
            <span className="opacity-85">Mã tour</span>
            <b>{tour.code}</b>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-4 ${variant === "aside" ? "px-5 py-[18px]" : ""}`}>
        {/* Ngày khởi hành */}
        <fieldset className="flex flex-col gap-2">
          <legend className="label mb-2">Ngày khởi hành</legend>
          <div className="flex flex-wrap gap-2">
            {sorted.map((d) => (
              <DateChip key={d.id} d={d} selected={d.id === depId} onSelect={() => selectDate(d)} />
            ))}
          </div>
          <dl className="mt-1 flex flex-col gap-1 rounded-md bg-n50 px-3 py-2.5 text-[13px]">
            <Row k="Ngày đi – về" v={`${ddmmyyyy(dep.date)} – ${ddmm(dep.returnDate)}`} />
            <Row k="Chiều đi" v={dep.flightOut} />
            <Row k="Chiều về" v={dep.flightBack} />
            <Row k="Chỗ trống" v={<b className={dep.status === "few" ? "text-danger" : "text-brand"}>Còn {dep.seatsLeft} chỗ</b>} />
          </dl>
        </fieldset>

        {/* Số khách */}
        <fieldset className="flex flex-col gap-3">
          <legend className="label mb-3">Số khách</legend>
          {paxRows.map((r) => {
            const atMin = r.key === "adult" ? pax[r.key] <= 1 : pax[r.key] <= 0;
            const atMax = r.key === "infant" ? pax.infant >= pax.adult : seatsInUse >= seatCap;
            return (
              <div key={r.key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div className="text-xs text-muted">
                    {r.sub} · {vnd(r.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Stepper icon="minus" label={`Giảm ${r.label}`} disabled={atMin} onClick={() => setN(r.key, -1)} />
                  <span className="min-w-5 text-center font-semibold" aria-live="polite">
                    {pax[r.key]}
                  </span>
                  <Stepper icon="plus" label={`Tăng ${r.label}`} disabled={atMax} onClick={() => setN(r.key, 1)} />
                </div>
              </div>
            );
          })}
          {seatsInUse >= seatCap && <p className="text-xs text-danger">Đã chọn tối đa số chỗ còn của ngày này.</p>}
        </fieldset>

        {/* Tạm tính */}
        <div className="flex flex-col gap-2 rounded-md bg-n50 p-3 text-sm">
          {lines
            .filter((l) => l.n > 0)
            .map((l) => (
              <div key={l.k} className="flex justify-between">
                <span className="text-muted">
                  {l.k} × {l.n}
                </span>
                <span>{vnd(l.n * l.p)}</span>
              </div>
            ))}
          <div className="flex justify-between">
            <span className="text-muted">Ưu đãi đại lý cấp {AGENT_LEVEL}</span>
            <span className="text-[#2e7d32]">− {vnd(discount)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-2.5">
            <b>Tổng tiền ({totalPax} khách)</b>
            <b className="text-[22px] text-total">{vnd(total)}</b>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Cần đặt cọc ({tour.depositPct}%)</span>
            <b>{vnd(deposit)}</b>
          </div>
        </div>

        <button className="btn min-h-12 w-full text-base" onClick={() => openSoon("Đặt tour")} disabled={dep.status === "closed"}>
          Đặt tour ngay
        </button>
        <button className="btn-outline w-full" onClick={() => openSoon("Tư vấn trực tuyến")}>
          <Icon name="chat" /> Tư vấn miễn phí
        </button>
        <div className="flex items-center justify-center gap-1.5 text-[13px]">
          <Icon name="phone" size={14} className="text-muted" />
          <span className="text-muted">Hotline:</span>
          <a href="tel:+84931887120" className="font-semibold text-brand">
            (+84) 931 88 7120
          </a>
        </div>
      </div>
    </div>
  );
}

function DateChip({ d, selected, onSelect }: { d: Departure; selected: boolean; onSelect: () => void }) {
  const closed = d.status === "closed";
  const few = d.status === "few";
  return (
    <button
      onClick={onSelect}
      disabled={closed}
      aria-pressed={selected}
      className={`flex min-h-[52px] min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-md px-2.5 py-1 transition-colors ${
        closed
          ? "border border-line bg-n50"
          : selected
            ? "border-2 border-brand bg-green-50"
            : few
              ? "border border-warn-line bg-white hover:border-brand"
              : "border border-[#d9dde2] bg-white hover:border-brand"
      }`}
    >
      <b className={`text-sm ${closed ? "text-subtle line-through" : "text-ink"}`}>{ddmm(d.date)}</b>
      <span className={`text-xs ${closed ? "text-subtle" : few ? "font-semibold text-danger" : "text-brand"}`}>
        {closed ? "Đã đóng" : few ? `Còn ${d.seatsLeft} chỗ` : shortVnd(d.priceAdult)}
      </span>
    </button>
  );
}

function Stepper({ icon, label, disabled, onClick }: { icon: string; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-[#d9dde2] bg-white text-brand hover:border-brand disabled:text-[#c3c8ce] disabled:hover:border-[#d9dde2]"
    >
      <Icon name={icon} />
    </button>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
