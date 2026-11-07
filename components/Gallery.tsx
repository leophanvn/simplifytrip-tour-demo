"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { unsplash } from "@/lib/format";
import { Icon } from "./Icon";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const [mIdx, setMIdx] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (idx !== null && !d.open) d.showModal();
    if (idx === null && d.open) d.close();
  }, [idx]);

  const n = images.length;
  const go = (delta: number) => setIdx((i) => (i === null ? i : (i + delta + n) % n));
  const main = images[0];
  const side = images.slice(1, 3);

  return (
    <>
      {/* Desktop: lưới ảnh */}
      <div className="hidden h-[408px] grid-cols-[2fr_1fr] grid-rows-2 gap-2 overflow-hidden rounded-lg md:grid">
        <button className="relative row-span-2" onClick={() => setIdx(0)} aria-label="Xem ảnh lớn">
          <Image src={unsplash(main, 1200)} alt={title} fill sizes="(max-width:1080px) 66vw, 700px" className="object-cover" priority />
        </button>
        {side.map((img, i) => (
          <button key={img} className="relative" onClick={() => setIdx(i + 1)} aria-label={`Xem ảnh ${i + 2}`}>
            <Image src={unsplash(img, 700)} alt="" fill sizes="350px" className="object-cover" />
            {i === side.length - 1 && (
              <span className="btn-ghost absolute right-3 bottom-3 bg-white">
                <Icon name="img" /> Xem tất cả {n} ảnh
              </span>
            )}
          </button>
        ))}
        {side.length < 2 && <div className="bg-sage" />}
      </div>

      {/* Mobile: vuốt ngang */}
      <div className="relative -mx-4 md:hidden">
        <div
          ref={strip}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMIdx(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <button key={img} className="relative aspect-[4/3] w-full shrink-0 snap-center" onClick={() => setIdx(i)} aria-label={`Xem ảnh ${i + 1}`}>
              <Image src={unsplash(img, 800)} alt={i === 0 ? title : ""} fill sizes="100vw" className="object-cover" priority={i === 0} />
            </button>
          ))}
        </div>
        <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-2.5 py-0.5 text-xs text-white">
          {mIdx + 1} / {n}
        </span>
      </div>

      {/* Lightbox */}
      <dialog
        ref={dlg}
        onClose={() => setIdx(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-black/95 p-0"
        aria-label="Ảnh tour"
      >
        {idx !== null && (
          <div className="relative flex h-full items-center justify-center">
            <Image src={unsplash(images[idx], 1600)} alt="" fill sizes="100vw" className="object-contain" />
            <button onClick={() => setIdx(null)} aria-label="Đóng" className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/15 text-white">
              <Icon name="x" size={22} />
            </button>
            <button onClick={() => go(-1)} aria-label="Ảnh trước" className="absolute left-3 flex size-11 items-center justify-center rounded-full bg-white/15 text-white">
              <Icon name="left" size={22} />
            </button>
            <button onClick={() => go(1)} aria-label="Ảnh sau" className="absolute right-3 flex size-11 items-center justify-center rounded-full bg-white/15 text-white">
              <Icon name="right" size={22} />
            </button>
            <span className="absolute bottom-4 rounded-full bg-white/15 px-3 py-1 text-sm text-white">
              {idx + 1} / {n}
            </span>
          </div>
        )}
      </dialog>
    </>
  );
}
