import Image from "next/image";
import type { RelatedProduct } from "@/data/tours";
import { Icon } from "./Icon";
import { ComingSoonButton } from "./ComingSoon";

export function CrossSellCard({ p, withAdd = false }: { p: RelatedProduct; withAdd?: boolean }) {
  const tagClass = p.kind === "esim" ? "tag-g" : p.kind === "sim" ? "tag-y" : "tag-o";
  return (
    <div className="card flex items-center gap-3.5 p-3">
      {p.image ? (
        <Image src={p.image} alt="" width={96} height={96} className="size-20 shrink-0 rounded-md object-cover sm:size-24" />
      ) : (
        <span className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md bg-brand text-white sm:size-24">
          <Icon name="doc" size={28} className="text-gold" />
          <b className="text-xs">VISA</b>
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className={`tag ${tagClass} self-start`}>{p.label}</span>
        <b className="text-sm leading-snug">{p.title}</b>
        <span className="text-sm font-bold text-brand">{p.price}</span>
      </div>
      {withAdd && (
        <ComingSoonButton feature="Thêm vào giỏ hàng" className="btn-outline btn-sm shrink-0">
          Thêm
        </ComingSoonButton>
      )}
    </div>
  );
}
