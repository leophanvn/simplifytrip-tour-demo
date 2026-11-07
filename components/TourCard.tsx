import Image from "next/image";
import Link from "next/link";
import type { Tour } from "@/data/tours";
import { ddmm, durationLabel, unsplash, vnd } from "@/lib/format";
import { fromPrice } from "@/lib/tour-repository";
import { Icon } from "./Icon";

export function TourCard({ tour, priority = false }: { tour: Tour; priority?: boolean }) {
  const href = `/tour/${tour.slug}`;
  const open = tour.departures.filter((d) => d.status !== "closed").sort((a, b) => a.date.localeCompare(b.date));
  const shown = open.slice(0, 3);
  const few = open.some((d) => d.status === "few");

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-hover">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-sage" tabIndex={-1} aria-hidden="true">
        <Image
          src={unsplash(tour.images[0], 640)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          priority={priority}
        />
        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded bg-white/95 px-2 py-[3px] text-xs font-semibold">
          <Icon name="clock" size={13} /> {durationLabel(tour.durationDays, tour.durationNights)}
        </span>
        {few && (
          <span className="absolute top-2.5 left-2.5 rounded bg-orange px-2 py-[3px] text-xs font-bold text-white">Sắp hết chỗ</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 pb-4">
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
        <h3 className="min-h-[42px] text-[15px] leading-[1.4] font-semibold">
          <Link href={href} className="line-clamp-2 text-ink hover:text-brand">
            {tour.title}
          </Link>
        </h3>
        <div className="flex flex-col gap-1.5 text-[13px] text-muted">
          <span className="flex items-center gap-1.5">
            <Icon name="pin" size={14} /> Khởi hành: <b className="font-medium text-ink">{tour.departCity}</b>
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="plane" size={14} /> {tour.airline}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Icon name="cal" size={14} className="text-muted" />
          {shown.map((d, i) => (
            <span key={d.id} className={`tag ${i === 0 ? "tag-y" : "bg-n50 text-ink-2"}`}>
              {ddmm(d.date)}
            </span>
          ))}
          {open.length > 3 && <span className="text-xs text-muted">+{open.length - 3}</span>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-line-soft pt-3">
          <div>
            <div className="text-xs text-muted">Giá từ</div>
            <div className="text-lg font-bold text-brand">{vnd(fromPrice(tour))}</div>
          </div>
          <Link href={href} className="btn btn-sm">
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
