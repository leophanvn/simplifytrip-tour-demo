import { Fragment } from "react";

/** Hiển thị **in đậm**, xuống đoạn (\n\n) và ghi chú dòng bắt đầu bằng "> " */
export function RichText({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n\n+/);
  return (
    <div className={`prose-tour flex flex-col gap-2.5 ${className ?? ""}`}>
      {paras.map((p, i) =>
        p.startsWith("> ") ? (
          <p key={i} className="rounded-md bg-tag-y-bg px-3 py-2.5 text-sm leading-relaxed text-warn-ink">
            <Bold text={p.slice(2)} />
          </p>
        ) : (
          <p key={i}>
            <Bold text={p} />
          </p>
        ),
      )}
    </div>
  );
}

export function Bold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((s, i) => (i % 2 ? <b key={i}>{s}</b> : <Fragment key={i}>{s}</Fragment>))}
    </>
  );
}
