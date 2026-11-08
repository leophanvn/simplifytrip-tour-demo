"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Tour, TourFacets } from "@/lib/types";
import {
  BUDGETS,
  DURATIONS,
  PAGE_SIZE,
  SORTS,
  activeChips,
  applyFilters,
  parseFilters,
  toQuery,
  type TourFilters,
} from "@/lib/filters";
import { unsplash } from "@/lib/format";
import { Icon } from "./Icon";
import { TourCard } from "./TourCard";

/** Ảnh nền khu vực tìm kiếm (Unsplash: Thiên Môn Sơn, tác giả 阳 晨) */
const HERO_PHOTO = "1700580180134-724396022d40";
const monthLabel = (m: string) => {
  const [y, mm] = m.split("-");
  return `Tháng ${Number(mm)}/${y}`;
};

type ListKey = "dest" | "cat" | "budget" | "days" | "air";

export function TourListing({ tours, facets }: { tours: Tour[]; facets: TourFacets }) {
  const { destinations: DESTINATIONS, months: MONTHS } = facets;
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const spKey = sp.toString();
  // Bộ lọc giữ trong state để giao diện phản hồi ngay, đồng thời ghi lên URL (chia sẻ được link đã lọc)
  const [f, setF] = useState<TourFilters>(() => parseFilters(new URLSearchParams(spKey)));
  useEffect(() => {
    setF(parseFilters(new URLSearchParams(spKey)));
  }, [spKey]);
  const [sheet, setSheet] = useState<null | "filter" | "sort">(null);

  const update = (patch: Partial<TourFilters>, resetPage = true) => {
    const next = { ...f, ...patch, page: resetPage ? 1 : (patch.page ?? f.page) };
    setF(next);
    router.replace(`${pathname}${toQuery(next)}`, { scroll: false });
  };
  const toggle = (key: ListKey, v: string) =>
    update({ [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] } as Partial<TourFilters>);
  const clearAll = () => {
    setF(parseFilters(new URLSearchParams()));
    router.replace(pathname, { scroll: false });
  };

  const results = useMemo(() => applyFilters(tours, f), [tours, f]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const chips = activeChips(f);
  const filterCount = chips.length;

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheet]);

  const filterPanel = (inSheet: boolean) => (
    <FilterPanel f={f} facets={facets} toggle={toggle} update={update} clearAll={clearAll} showHeader={!inSheet} />
  );

  return (
    <>
      {/* ------------------------------------------------ Hero + tìm kiếm */}
      <section className="bg-sage pt-4 pb-6 lg:pt-5 lg:pb-9">
        <div className="container-st">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-muted">
            <a href="https://simplifytrip.com/" className="text-muted hover:text-brand">
              Trang chủ
            </a>
            <Icon name="right" size={12} />
            <span className="text-ink">Tour nước ngoài</span>
          </nav>
          <div className="mt-4 grid items-center gap-8 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-3">
              <div className="goldbar" />
              <h1 className="text-2xl leading-tight font-bold text-brand lg:text-[32px]">
                {f.dest.length === 1 ? `Tour ${f.dest[0]} trọn gói` : "Tour nước ngoài trọn gói"}
              </h1>
              <p className="max-w-[520px] text-[15px] leading-relaxed text-ink-2">
                Vé máy bay, khách sạn, ăn uống và hướng dẫn viên trong một giá. Đặt tour cùng SIM/eSIM và visa ngay trên Simplify
                Trip.
              </p>
            </div>
            <div className="relative hidden h-[150px] overflow-hidden rounded-lg lg:block">
              <Image src={unsplash(HERO_PHOTO, 800)} alt="Thiên Môn Sơn, Trương Gia Giới" fill sizes="380px" className="object-cover" priority />
            </div>
          </div>

          {/* Ô tìm kiếm */}
          <div role="search" className="card mt-5 flex flex-col gap-3 p-4 shadow-hover">
            <div className="hidden gap-2 sm:flex">
              <button className="chip chip-on min-h-[34px]">Tour nước ngoài</button>
              <button className="chip min-h-[34px]">Tour trong nước</button>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-end">
              <label className="flex flex-col gap-1.5">
                <span className="label">Điểm đến</span>
                <span className="field">
                  <Icon name="pin" className="text-muted" />
                  <select
                    className="w-full bg-transparent outline-none"
                    value={f.dest[0] ?? ""}
                    onChange={(e) => update({ dest: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">Tất cả điểm đến</option>
                    {DESTINATIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">Khởi hành từ</span>
                <span className="field">
                  <Icon name="plane" className="text-muted" />
                  <select className="w-full bg-transparent outline-none" defaultValue="hcm">
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="hn" disabled>
                      Hà Nội (sắp có)
                    </option>
                  </select>
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="label">Tháng đi</span>
                <span className="field">
                  <Icon name="cal" className="text-muted" />
                  <select className="w-full bg-transparent outline-none" value={f.month} onChange={(e) => update({ month: e.target.value })}>
                    <option value="">Bất kỳ</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {monthLabel(m)}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
              <a href="#ket-qua" className="btn min-w-[132px] sm:col-span-2 lg:col-span-1">
                <Icon name="search" /> Tìm tour
              </a>
            </div>
          </div>

          <div className="no-scrollbar -mx-4 mt-3.5 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <span className="mr-1 hidden text-[13px] text-muted sm:inline">Điểm đến nổi bật:</span>
            {DESTINATIONS.map((d) => (
              <button key={d} onClick={() => update({ dest: f.dest.includes(d) && f.dest.length === 1 ? [] : [d] })} className={`chip ${f.dest.length === 1 && f.dest[0] === d ? "chip-on" : ""}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Thanh lọc mobile */}
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-line-soft bg-white px-4 py-2.5 lg:hidden">
        <button className="chip flex-1 justify-center font-semibold" onClick={() => setSheet("filter")}>
          <Icon name="filter" /> Bộ lọc
          {filterCount > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] text-white">{filterCount}</span>}
        </button>
        <button className="chip flex-1 justify-center" onClick={() => setSheet("sort")}>
          <Icon name="sort" /> Sắp xếp
        </button>
      </div>

      {/* ------------------------------------------------ Kết quả */}
      <section id="ket-qua" className="scroll-mt-4 bg-n25 pt-4 pb-11 lg:pt-7">
        <div className="container-st flex items-start gap-6">
          <aside aria-label="Bộ lọc tour" className="card hidden w-[248px] shrink-0 p-[18px] lg:block">
            {filterPanel(false)}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px]">
                  <b>{results.length}</b> tour phù hợp
                </span>
                {chips.map((c) => (
                  <span key={`${c.key}-${c.value}`} className="tag tag-g h-7 gap-1.5">
                    {c.label}
                    <button
                      aria-label={`Bỏ lọc ${c.label}`}
                      className="flex text-brand"
                      onClick={() =>
                        c.key === "month"
                          ? update({ month: "" })
                          : toggle(c.key as ListKey, c.value)
                      }
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <label className="hidden items-center lg:flex">
                <span className="field min-h-[38px] gap-2.5">
                  <span className="text-muted">Sắp xếp:</span>
                  <select className="bg-transparent outline-none" value={f.sort} onChange={(e) => update({ sort: e.target.value })}>
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </div>

            {pageItems.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((t, i) => (
                  <TourCard key={t.id} tour={t} priority={i < 3} />
                ))}
              </div>
            ) : (
              <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
                <Icon name="search" size={32} className="text-subtle" />
                <b>Chưa có tour phù hợp</b>
                <p className="text-sm text-muted">Thử bỏ bớt bộ lọc hoặc để lại thông tin, Simplify Trip sẽ báo khi có tour.</p>
                <button className="btn-outline btn-sm" onClick={clearAll}>
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {pages > 1 && (
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] text-muted">
                  Hiển thị {(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, results.length)} / {results.length} tour
                </span>
                <nav aria-label="Phân trang" className="flex items-center gap-1.5">
                  <PageBtn disabled={page === 1} onClick={() => update({ page: page - 1 }, false)} label="Trang trước">
                    <Icon name="left" size={14} />
                  </PageBtn>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <PageBtn key={p} active={p === page} onClick={() => update({ page: p }, false)} label={`Trang ${p}`}>
                      {p}
                    </PageBtn>
                  ))}
                  <PageBtn disabled={page === pages} onClick={() => update({ page: page + 1 }, false)} label="Trang sau">
                    <Icon name="right" size={14} />
                  </PageBtn>
                </nav>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Bottom sheet mobile */}
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={sheet === "filter" ? "Bộ lọc" : "Sắp xếp"}>
          <button aria-label="Đóng" className="absolute inset-0 bg-black/40" onClick={() => setSheet(null)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl bg-white">
            <div className="flex items-center justify-between border-b border-line-soft px-4 py-2">
              <b>{sheet === "filter" ? "Bộ lọc" : "Sắp xếp"}</b>
              <div className="flex items-center gap-1">
                {sheet === "filter" && (
                  <button onClick={clearAll} className="min-h-11 px-2 text-[13px] font-semibold text-brand">
                    Xóa tất cả
                  </button>
                )}
                <button aria-label="Đóng" className="flex size-11 items-center justify-center" onClick={() => setSheet(null)}>
                  <Icon name="x" size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              {sheet === "filter" ? (
                filterPanel(true)
              ) : (
                <div className="flex flex-col">
                  {SORTS.map((s) => (
                    <label key={s.id} className="flex min-h-12 items-center gap-3 border-b border-line-soft text-[15px]">
                      <input
                        type="radio"
                        name="sort-m"
                        className="size-4 accent-brand"
                        checked={f.sort === s.id}
                        onChange={() => {
                          update({ sort: s.id });
                          setSheet(null);
                        }}
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {sheet === "filter" && (
              <div className="border-t border-line-soft p-4">
                <button className="btn w-full" onClick={() => setSheet(null)}>
                  Xem {results.length} tour
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-9 items-center justify-center rounded text-sm ${
        active ? "bg-brand font-semibold text-white" : "border border-line bg-white text-ink hover:border-brand disabled:text-subtle disabled:hover:border-line"
      }`}
    >
      {children}
    </button>
  );
}

function FilterPanel({
  f,
  facets,
  toggle,
  update,
  clearAll,
  showHeader,
}: {
  f: TourFilters;
  facets: TourFacets;
  toggle: (k: ListKey, v: string) => void;
  update: (p: Partial<TourFilters>) => void;
  clearAll: () => void;
  showHeader: boolean;
}) {
  const { destinations: DESTINATIONS, categories: CATEGORIES, airlines: AIRLINES, months: MONTHS } = facets;
  const [showAllDest, setShowAllDest] = useState(false);
  const dests = showAllDest ? DESTINATIONS : DESTINATIONS.slice(0, 5);
  return (
    <div className="flex flex-col gap-4">
      <div className={`items-center justify-between ${showHeader ? "flex" : "hidden"}`}>
        <b className="flex items-center gap-2 text-base">
          <Icon name="filter" size={18} /> Bộ lọc
        </b>
        <button onClick={clearAll} className="min-h-9 text-[13px] font-semibold text-brand">
          Xóa tất cả
        </button>
      </div>

      <Group title="Tháng khởi hành">
        <span className="field">
          <select className="w-full bg-transparent outline-none" value={f.month} onChange={(e) => update({ month: e.target.value })} aria-label="Tháng khởi hành">
            <option value="">Bất kỳ</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </span>
      </Group>

      <Group title="Ngân sách / khách">
        <div className="flex flex-wrap gap-1.5">
          {BUDGETS.map((b) => (
            <button
              key={b.id}
              aria-pressed={f.budget.includes(b.id)}
              onClick={() => toggle("budget", b.id)}
              className={`chip min-h-[34px] px-2.5 text-[13px] ${f.budget.includes(b.id) ? "chip-on" : ""}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Điểm đến">
        {dests.map((d) => (
          <Check key={d} checked={f.dest.includes(d)} onChange={() => toggle("dest", d)} label={d} />
        ))}
        {DESTINATIONS.length > 5 && (
          <button onClick={() => setShowAllDest((v) => !v)} className="flex min-h-8 items-center gap-1 text-[13px] font-semibold text-brand">
            <Icon name="down" size={14} className={showAllDest ? "rotate-180" : ""} />
            {showAllDest ? "Thu gọn" : `Xem thêm ${DESTINATIONS.length - 5} điểm đến`}
          </button>
        )}
      </Group>

      {CATEGORIES.length > 0 && (
        <Group title="Thể loại">
          {CATEGORIES.map((c) => (
            <Check key={c} checked={f.cat.includes(c)} onChange={() => toggle("cat", c)} label={c} />
          ))}
        </Group>
      )}

      <Group title="Số ngày">
        {DURATIONS.map((d) => (
          <Check key={d.id} checked={f.days.includes(d.id)} onChange={() => toggle("days", d.id)} label={d.label} />
        ))}
      </Group>

      {AIRLINES.length > 0 && (
        <Group title="Hãng bay" last>
          {AIRLINES.map((a) => (
            <Check key={a} checked={f.air.includes(a)} onChange={() => toggle("air", a)} label={a} />
          ))}
        </Group>
      )}
    </div>
  );
}

function Group({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <fieldset className={`flex flex-col gap-2 pb-4 ${last ? "" : "border-b border-line-soft"}`}>
      <legend className="label mb-2">{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" className="size-4 accent-brand" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
