import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingBox } from "@/components/BookingBox";
import { CrossSellCard } from "@/components/CrossSell";
import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/Icon";
import { MobileBookingBar } from "@/components/MobileBookingBar";
import { Bold } from "@/components/RichText";
import { TourActions } from "@/components/TourActions";
import { TourCard } from "@/components/TourCard";
import { TourTabs } from "@/components/TourTabs";
import { durationLabel } from "@/lib/format";
import { DataSourceNote } from "@/components/DataSourceNote";
import { getDataSource, getRelatedProducts, getSimilarTours, getTourBySlug, getTourSlugs } from "@/lib/tour-repository";

/** Làm mới dữ liệu tối đa 15 phút/lần */
export const revalidate = 900;

export async function generateStaticParams() {
  return (await getTourSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/tour/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug).catch(() => undefined);
  return { title: tour?.title ?? "Tour" };
}

export default async function TourDetailPage({ params }: PageProps<"/tour/[slug]">) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const related = getRelatedProducts(tour.relatedProductIds).filter((p) => p.kind !== "visa");
  const similar = await getSimilarTours(tour);
  const { source, fallbackReason } = getDataSource();
  const facts = [
    { icon: "pin", label: "Khởi hành", value: tour.departCity },
    { icon: "clock", label: "Thời gian", value: durationLabel(tour.durationDays, tour.durationNights) },
    { icon: "plane", label: "Hãng bay", value: tour.airline },
    { icon: "hotel", label: "Khách sạn", value: tour.hotelClass },
  ];

  return (
    <main className="pb-[76px] lg:pb-0">
      <div className="bg-sage-soft pt-4 pb-6 lg:pt-5 lg:pb-7">
        <div className="container-st">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
            <a href="https://simplifytrip.com/" className="text-muted hover:text-brand">
              Trang chủ
            </a>
            <Icon name="right" size={12} />
            <Link href="/tour" className="text-muted hover:text-brand">
              Tour
            </Link>
            <Icon name="right" size={12} />
            <Link href={`/tour?dest=${encodeURIComponent(tour.country)}`} className="text-muted hover:text-brand">
              Tour {tour.country}
            </Link>
          </nav>
          <div className="mt-3.5 mb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-1.5">
                {tour.countries.map((c) => (
                  <span key={c} className="tag tag-g">
                    {c}
                  </span>
                ))}
                {tour.categories.map((c) => (
                  <span key={c} className={`tag ${c.includes("No Shopping") ? "tag-y" : "tag-o"}`}>
                    {c}
                  </span>
                ))}
              </div>
              <h1 className="max-w-[760px] text-[21px] leading-snug font-bold sm:text-[28px]">{tour.title}</h1>
            </div>
            <div className="hidden md:block">
              <TourActions title={tour.title} />
            </div>
          </div>
          <Gallery images={tour.images} title={tour.title} />
        </div>
      </div>

      <div className="container-st flex items-start gap-7 pt-6 pb-12">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-2.5 rounded-lg bg-n50 px-3.5 py-3">
                <Icon name={f.icon} size={18} className="mt-0.5 text-brand" />
                <div>
                  <div className="text-xs text-muted">{f.label}</div>
                  <b className="text-sm font-semibold">{f.value}</b>
                </div>
              </div>
            ))}
          </div>
          <div className="md:hidden">
            <TourActions title={tour.title} compact />
          </div>

          {tour.highlights.length > 0 && (
            <section className="flex flex-col gap-3 rounded-lg border border-sage-line bg-sage-soft px-5 py-[18px]">
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-brand">
                <Icon name="spark" size={18} className="text-gold" /> Lịch trình có gì hay?
              </h2>
              {tour.highlights.map((h) => (
                <p key={h} className="prose-tour flex gap-2.5 text-[15px] leading-relaxed text-ink-2">
                  <Icon name="check" size={20} strokeWidth={2.2} className="text-[#3e7a12]" />
                  <span>
                    <Bold text={h} />
                  </span>
                </p>
              ))}
            </section>
          )}

          {tour.promotion && (
            <section className="flex flex-col gap-2.5 rounded-lg border border-warn-line bg-warn-bg px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-warn-ink">
                <Icon name="gift" size={18} className="text-tag-o" /> Đang có khuyến mãi
              </h2>
              <b className="text-sm">{tour.promotion.title}</b>
              <ul className="flex flex-col gap-1.5 text-sm">
                {tour.promotion.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <Icon name="check" strokeWidth={2.4} className="mt-0.5 text-tag-o" /> {i}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <TourTabs tour={tour} />
        </div>

        <aside aria-label="Đặt tour" className="sticky top-4 hidden w-[360px] shrink-0 lg:block">
          <BookingBox tour={tour} />
        </aside>
      </div>

      {related.length > 0 && (
      <section className="bg-sage py-10">
        <div className="container-st">
          <div className="mb-[18px] flex flex-wrap items-end justify-between gap-2">
            <div className="flex flex-col gap-2">
              <div className="goldbar" />
              <h2 className="section-title">Chuẩn bị cho chuyến đi</h2>
            </div>
            <span className="text-[13px] text-muted">Thêm vào cùng đơn đặt tour</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {related.map((p) => (
              <CrossSellCard key={p.id} p={p} withAdd />
            ))}
          </div>
        </div>
      </section>
      )}

      {similar.length > 0 && (
        <section className="py-10">
          <div className="container-st">
            <div className="mb-[18px] flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <div className="goldbar" />
                <h2 className="section-title">Tour tương tự</h2>
              </div>
              <Link href="/tour" className="text-sm font-semibold text-brand">
                Xem tất cả
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      <DataSourceNote source={source} fallbackReason={fallbackReason} />
      <MobileBookingBar tour={tour} />
    </main>
  );
}
