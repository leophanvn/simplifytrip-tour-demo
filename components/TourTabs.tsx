"use client";

import { useState } from "react";
import type { Tour } from "@/data/tours";
import { Icon } from "./Icon";
import { RichText } from "./RichText";

const TABS = ["Lịch trình", "Chính sách giá", "Hướng dẫn", "Visa", "Bảo hiểm"] as const;

export function TourTabs({ tour }: { tour: Tour }) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<boolean[]>(() => tour.itinerary.map((_, i) => i < 2));
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold sm:text-xl">Lịch trình chi tiết</h2>
              <button
                className="min-h-11 text-sm font-semibold text-brand"
                onClick={() => setOpen(open.map(() => !allOpen))}
              >
                {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
              </button>
            </div>
            {tour.itinerary.map((d, i) => (
              <div key={d.day} className="overflow-hidden rounded-lg border border-line">
                <button
                  aria-expanded={open[i]}
                  onClick={() => setOpen(open.map((v, j) => (j === i ? !v : v)))}
                  className="flex min-h-[52px] w-full items-center gap-3 bg-n25 px-4 py-3 text-left"
                >
                  <span className="rounded bg-brand px-2 py-1 text-xs font-bold whitespace-nowrap text-white">NGÀY {d.day}</span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold">{d.title}</span>
                    {d.meals && <span className="text-xs text-muted">{d.meals}</span>}
                  </span>
                  <Icon name="down" size={18} className={`text-muted transition-transform ${open[i] ? "rotate-180" : ""}`} />
                </button>
                {open[i] && (
                  <div className="border-t border-line-soft px-4 py-3.5 text-[15px] leading-[1.75] text-ink-2">
                    <RichText text={d.body} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Box title="Giá tour bao gồm" titleClass="text-brand">
                <List items={tour.includes} icon="check" iconClass="text-[#3e7a12]" />
              </Box>
              <Box title="Không bao gồm" titleClass="text-danger">
                <List items={tour.excludes} icon="x" iconClass="text-[#c2410c]" />
              </Box>
            </div>
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
              <p className="text-[13px] text-muted">1 người lớn đi cùng 1 bé dưới 12 tuổi: bé tính giá giường riêng.</p>
            </Box>
          </div>
        )}

        {tab === 2 && (
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
            <Box title="Lưu ý quan trọng">
              <List items={tour.notes} icon="right" iconClass="text-brand" />
            </Box>
          </div>
        )}

        {tab === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 text-[15px] leading-relaxed">
              <Icon name={tour.visaIncluded ? "check" : "info"} size={20} className="mt-0.5 text-brand" />
              <span>
                {tour.visaIncluded ? (
                  <>
                    Tour <b>đã bao gồm visa đoàn</b> nhập cảnh. Quý khách chỉ cần nộp hộ chiếu và ảnh theo hướng dẫn.
                  </>
                ) : (
                  <>
                    Tour <b>chưa bao gồm visa</b> cho chặng Nhật Bản. Simplify Trip hỗ trợ làm visa trọn gói.
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
      {items.map((x) => (
        <li key={x} className="flex items-start gap-2.5">
          <Icon name={icon} size={18} strokeWidth={2.2} className={`mt-0.5 ${iconClass}`} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}
