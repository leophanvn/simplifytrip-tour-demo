import type { Metadata } from "next";
import { Suspense } from "react";
import { CrossSellCard } from "@/components/CrossSell";
import { Icon } from "@/components/Icon";
import { TourCard } from "@/components/TourCard";
import { TourListing } from "@/components/TourListing";
import { DataSourceNote } from "@/components/DataSourceNote";
import { getDataSource, getRelatedProducts, getTourList } from "@/lib/tour-repository";
import type { Tour } from "@/lib/types";

export const metadata: Metadata = { title: "Tour nước ngoài trọn gói" };

/** Làm mới dữ liệu tối đa 15 phút/lần (giá và số chỗ được kiểm tra lại khi đặt) */
export const revalidate = 900;

const WHY = [
  { icon: "globe", title: "Một nơi cho cả chuyến đi", text: "Tour, visa và SIM/eSIM trong cùng một tài khoản, một giỏ hàng." },
  { icon: "tag", title: "Giá tốt cho đại lý", text: "Ưu đãi theo cấp đại lý, hiển thị ngay trên trang đặt tour." },
  { icon: "headset", title: "Hỗ trợ 24/7", text: "Đội ngũ hỗ trợ suốt hành trình, kể cả khi bạn đang ở nước ngoài." },
];

export default async function TourListPage() {
  const { tours, facets, failed } = await getTourList();
  const related = getRelatedProducts(["esim-cn", "sim-cn", "visa-cn"]);
  const { source, fallbackReason } = getDataSource();

  return (
    <main>
      {failed && (
        <div role="alert" className="bg-warn-bg px-4 py-3 text-center text-sm text-warn-ink">
          Chưa tải được dữ liệu tour. Vui lòng thử lại sau ít phút hoặc gọi hotline (+84) 931 88 7120.
        </div>
      )}
      <Suspense fallback={<ListingFallback tours={tours} />}>
        <TourListing tours={tours} facets={facets} />
      </Suspense>
      <DataSourceNote source={source} fallbackReason={fallbackReason} />

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

function ListingFallback({ tours }: { tours: Tour[] }) {
  return (
    <section className="bg-n25 py-8">
      <div className="container-st grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tours.slice(0, 6).map((t) => (
          <TourCard key={t.id} tour={t} />
        ))}
      </div>
    </section>
  );
}
