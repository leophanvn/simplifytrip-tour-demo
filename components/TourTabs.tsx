"use client";

import { useState } from "react";
import type { Tour } from "@/lib/types";
import { Icon } from "./Icon";
import { RichText } from "./RichText";

const TABS = ["Lịch trình", "Chính sách giá", "Hướng dẫn", "Visa", "Bảo hiểm"] as const;

export function TourTabs({ tour }: { tour: Tour }) {
  const [tab, setTab] = useState(0);
  const days = tour.itinerary.filter((d) => !d.note);
  const notes = tour.itinerary.filter((d) => d.note);
  // Chỉ mở ngày đầu: cả hành trình nhìn gọn trên một màn hình, muốn đọc ngày nào thì mở ngày đó
  const [open, setOpen] = useState<boolean[]>(() => days.map((_, i) => i === 0));
  const allOpen = open.every(Boolean);

  return (
    <section aria-label="Thông tin tour" className="flex flex-col gap-4">
      <div role="tablist" aria-label="Thông tin tour" className="no-scrollbar sticky top-0 z-10 -mx-4 flex overflow-x-auto border-b border-line bg-white px-4 sm:mx-0 sm:px-0">
        {TABS.map((t, i) => (
          <button
            key={t}
            role="tab"
            id={`tab-${i}`}
            aria-selected={tab === i}
            aria-controls={`panel-${i}`}
            onClick={() => setTab(i)}
            className={`mr-6 shrink-0 border-b-2 py-3 text-[15px] whitespace-nowrap ${
              tab === i ? "border-brand font-semibold text-brand" : "border-transparent font-medium text-muted hover:text-brand"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">Lịch trình chi tiết</h2>
                {days.length > 0 && <p className="text-[13px] text-muted">Bấm vào từng ngày để xem chi tiết</p>}
              </div>
              {days.length > 1 && (
                <button
                  className="min-h-11 shrink-0 text-sm font-semibold text-brand"
                  onClick={() => setOpen(open.map(() => !allOpen))}
                >
                  {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
                </button>
              )}
            </div>
            {tour.itinerary.length === 0 && (
              <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[#c9cfd6] p-5 text-[15px] text-ink-2">
                <span>Lịch trình theo ngày đang được cập nhật.</span>
                {tour.programFileUrl && (
                  <a href={tour.programFileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm self-start">
                    <Icon name="doc" /> Xem chương trình tour (PDF)
                  </a>
                )}
              </div>
            )}
            {days.length > 0 && (
              <ol className="flex flex-col">
                {days.map((d, i) => {
                  const label = d.label ?? `Ngày ${d.day}`;
                  const isOpen = open[i];
                  return (
                    <li key={i} className="relative pl-11">
                      {/* Đường nối các ngày */}
                      {i < days.length - 1 && <span aria-hidden className="absolute top-9 bottom-0 left-[15px] w-0.5 bg-sage-line" />}
                      <span
                        aria-hidden
                        className={`absolute top-2.5 left-0 flex size-8 items-center justify-center rounded-full border-2 border-brand text-[13px] font-bold ${
                          isOpen ? "bg-brand text-white" : "bg-white text-brand"
                        }`}
                      >
                        {label.match(/\d+/)?.[0] ?? i + 1}
                      </span>
                      <button
                        aria-expanded={isOpen}
                        onClick={() => setOpen(open.map((v, j) => (j === i ? !v : v)))}
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-sage-soft"
                      >
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</span>
                          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[15px] leading-snug font-semibold text-ink">
                            {(d.stops ?? [d.title]).map((s, j) => (
                              <span key={j} className="inline-flex items-center gap-1.5">
                                {j > 0 && <span aria-hidden className="font-normal text-subtle">›</span>}
                                {s}
                              </span>
                            ))}
                          </span>
                          {d.meals && (
                            <span className="mt-0.5 self-start rounded-full bg-sage-soft px-2.5 py-0.5 text-xs font-medium text-brand">{d.meals}</span>
                          )}
                        </span>
                        <Icon name="down" size={18} className={`mt-5 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="flex flex-col gap-3 px-3 pt-1 pb-5">
                          {d.image && (
                            <div className="aspect-[16/9] w-full max-w-[560px] overflow-hidden rounded-lg bg-n50">
                              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ máy chủ đối tác, không qua bộ tối ưu */}
                              <img src={d.image} alt={`${label}: ${d.title}`} loading="lazy" className="size-full object-cover" />
                            </div>
                          )}
                          <RichText text={d.body} className="max-w-[68ch] text-[15px] leading-[1.75] text-ink-2" />
                        </div>
                      )}
                      {!isOpen && i < days.length - 1 && <div className="h-2" />}
                    </li>
                  );
                })}
              </ol>
            )}
            {notes.map((n, i) => (
              <details key={i} className="group rounded-lg border border-warn-line bg-warn-bg">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[15px] font-semibold text-warn-ink">
                  <Icon name="info" size={18} />
                  <span className="flex-1">{n.label}</span>
                  <Icon name="down" size={18} className="transition-transform group-open:rotate-180" />
                </summary>
                <RichText text={n.body} className="border-t border-warn-line px-4 py-3.5 text-[15px] leading-[1.75] text-ink-2" />
              </details>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div className="flex flex-col gap-5">
            {(tour.includes.length > 0 || tour.excludes.length > 0) && (
              <div className="grid gap-4 md:grid-cols-2">
                <Box title="Giá tour bao gồm" titleClass="text-brand">
                  <List items={tour.includes} icon="check" iconClass="text-[#3e7a12]" />
                </Box>
                <Box title="Không bao gồm" titleClass="text-danger">
                  <List items={tour.excludes} icon="x" iconClass="text-[#c2410c]" />
                </Box>
              </div>
            )}
            <Box title="Giá trẻ em">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-n50 text-left">
                      <th className="px-3 py-2.5 font-semibold">Độ tuổi</th>
                      <th className="px-3 py-2.5 font-semibold">Mức giá</th>
                      <th className="px-3 py-2.5 font-semibold">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tour.childPolicy.map((c) => (
                      <tr key={c.age} className="border-b border-line-soft last:border-0">
                        <td className="px-3 py-2.5">{c.age}</td>
                        <td className="px-3 py-2.5 font-semibold">{c.price}</td>
                        <td className="px-3 py-2.5 text-muted">{c.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>
          </div>
        )}

        {tab === 2 && tour.cancelText && (
          <div className="flex flex-col gap-5">
            <Box title="Điều kiện đặt cọc & hoàn / hủy" sub="(theo nhà điều hành tour)">
              <List items={tour.cancelText} icon="right" iconClass="text-brand" />
            </Box>
            {tour.notes.length > 0 && (
              <Box title="Lưu ý quan trọng">
                <List items={tour.notes} icon="right" iconClass="text-brand" />
              </Box>
            )}
          </div>
        )}

        {tab === 2 && !tour.cancelText && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 text-[15px] leading-relaxed">
              <Icon name="info" size={20} className="mt-0.5 text-brand" />
              <span>
                <b>Đặt cọc {tour.depositPct}% giá tour</b> khi đăng ký. Thanh toán phần còn lại trước ngày đi <b>10 ngày làm việc</b>.
              </span>
            </div>
            <Box title="Phí hủy / chuyển tour" sub="(tính theo ngày làm việc, không tính T7, CN, Lễ, Tết)">
              <ol className="flex flex-col">
                {tour.cancelRules.map((r, i) => (
                  <li key={r.when} className="grid grid-cols-[20px_1fr_auto] items-start gap-3">
                    <span className="flex h-full flex-col items-center">
                      <span className="mt-1 size-3 rounded-full bg-brand" />
                      {i < tour.cancelRules.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-sage-line" />}
                    </span>
                    <span className="pb-4 text-[15px]">{r.when}</span>
                    <b className="text-[15px] text-danger">{r.fee}</b>
                  </li>
                ))}
              </ol>
              <p className="text-[13px] text-muted">Lãnh sự từ chối cấp visa: quý khách nộp lệ phí visa theo quy định.</p>
            </Box>
            {tour.notes.length > 0 && (
              <Box title="Lưu ý quan trọng">
                <List items={tour.notes} icon="right" iconClass="text-brand" />
              </Box>
            )}
          </div>
        )}

        {tab === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 text-[15px] leading-relaxed">
              <Icon name={tour.visaIncluded ? "check" : "info"} size={20} className="mt-0.5 text-brand" />
              <span>
                {tour.visaIncluded === undefined ? (
                  <>
                    Thông tin visa của tour đang được cập nhật. Liên hệ Simplify Trip để được tư vấn <b>visa trọn gói</b>.
                  </>
                ) : tour.visaIncluded ? (
                  <>
                    Tour <b>đã bao gồm visa đoàn</b> nhập cảnh. Quý khách chỉ cần nộp hộ chiếu và ảnh theo hướng dẫn.
                  </>
                ) : (
                  <>
                    Tour <b>chưa bao gồm visa</b>. Simplify Trip hỗ trợ làm visa trọn gói.
                  </>
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line p-[18px]">
              <div className="flex items-center gap-3.5">
                <span className="flex size-12 items-center justify-center rounded-lg bg-brand text-gold">
                  <Icon name="doc" size={24} />
                </span>
                <div>
                  <b className="text-[15px]">Cần visa cá nhân hoặc khách quốc tịch nước ngoài?</b>
                  <div className="mt-0.5 text-[13px] text-muted">Dịch vụ visa của Simplify Trip – hồ sơ nhanh, đúng, đủ.</div>
                </div>
              </div>
              <a href="#visa" className="btn-outline btn-sm">
                Xem dịch vụ visa
              </a>
            </div>
          </div>
        )}

        {tab === 4 && (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#c9cfd6] p-6 text-[15px] text-ink-2">
            <Icon name="shield" size={24} className="text-muted" />
            [Nội dung bảo hiểm du lịch: đơn vị bảo hiểm, mức bồi thường tối đa, quyền lợi chính, hotline bồi thường]
          </div>
        )}
      </div>
    </section>
  );
}

function Box({ title, sub, titleClass, children }: { title: string; sub?: string; titleClass?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line p-[18px]">
      <b className={`text-base ${titleClass ?? ""}`}>
        {title} {sub && <span className="text-[13px] font-normal text-muted">{sub}</span>}
      </b>
      {children}
    </div>
  );
}

function List({ items, icon, iconClass }: { items: string[]; icon: string; iconClass: string }) {
  return (
    <ul className="flex flex-col gap-2.5 text-[15px] leading-relaxed text-ink-2">
      {items.map((x, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <Icon name={icon} size={18} strokeWidth={2.2} className={`mt-0.5 ${iconClass}`} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}
