import type { Metadata } from "next";
import { Suspense } from "react";
import { CrossSellCard } from "@/components/CrossSell";
import { Icon } from "@/components/Icon";
import { TourCard } from "@/components/TourCard";
import { TourListing } from "@/components/TourListing";
import { getRelatedProducts, getTours } from "@/lib/tour-repository";

export const metadata: Metadata = { title: "Tour nước ngoài trọn gói" };

const WHY = [
  { icon: "globe", title: "Một nơi cho cả chuyến đi", text: "Tour, visa và SIM/eSIM trong cùng một tài khoản, một giỏ hàng." },
  { icon: "tag", title: "Giá tốt cho đại lý", text: "Ưu đãi theo cấp đại lý, hiển thị ngay trên trang đặt tour." },
  { icon: "headset", title: "Hỗ trợ 24/7", text: "Đội ngũ hỗ trợ suốt hành trình, kể cả khi bạn đang ở nước ngoài." },
];

export default function TourListPage() {
  const tours = getTours();
  const related = getRelatedProducts(["esim-cn", "sim-cn", "visa-cn"]);

  return (
    <main>
      <Suspense fallback={<ListingFallback />}>
        <TourListing tours={tours} />
      </Suspense>

      <section className="bg-sage py-11">
        <div className="container-st">
          <div className="mb-6 flex flex-col items-center gap-2.5 text-center">
            <h2 className="section-title">Chuẩn bị cho chuyến đi</h2>
            <p className="text-sm text-muted">Đặt kèm với tour để có mạng ngay khi hạ cánh và giấy tờ sẵn sàng</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((p) => (
              <CrossSellCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-11">
        <div className="container-st grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="goldbar" />
            <b className="text-lg leading-snug text-brand">Vì sao đặt tour cùng Simplify Trip?</b>
          </div>
          {WHY.map((w) => (
            <div key={w.title} className="flex flex-col gap-2">
              <span className="flex size-9 items-center justify-center rounded-md bg-brand text-gold">
                <Icon name={w.icon} size={18} />
              </span>
              <b className="text-base text-brand">{w.title}</b>
              <span className="text-[13px] leading-relaxed text-ink-2">{w.text}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ListingFallback() {
  const tours = getTours().slice(0, 6);
  return (
    <section className="bg-n25 py-8">
      <div className="container-st grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tours.map((t) => (
          <TourCard key={t.id} tour={t} />
        ))}
      </div>
    </section>
  );
}
