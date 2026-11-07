import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-st flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-brand">Không tìm thấy trang</h1>
      <p className="text-muted">Tour có thể đã ngừng bán hoặc đường dẫn không đúng.</p>
      <Link href="/tour" className="btn">
        Xem danh sách tour
      </Link>
    </main>
  );
}
