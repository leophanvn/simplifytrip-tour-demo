"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { useComingSoon } from "./ComingSoon";

/** Chia sẻ link tour cho khách (dùng Web Share API nếu có, không thì sao chép link) */
export function TourActions({ title, compact = false }: { title: string; compact?: boolean }) {
  const openSoon = useComingSoon();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* người dùng huỷ chia sẻ */
    }
  };

  return (
    <div className={`flex gap-2 ${compact ? "w-full" : ""}`}>
      <button className={`btn-ghost ${compact ? "flex-1" : ""}`} onClick={share}>
        <Icon name="share" /> {copied ? "Đã sao chép link" : compact ? "Chia sẻ" : "Chia sẻ cho khách"}
      </button>
      <button className={`btn-ghost ${compact ? "flex-1" : ""}`} onClick={() => openSoon("Tải chương trình tour (PDF)")}>
        <Icon name="download" /> Tải PDF
      </button>
      {!compact && (
        <button className="btn-ghost" aria-label="In chương trình" onClick={() => window.print()}>
          <Icon name="print" />
        </button>
      )}
    </div>
  );
}
