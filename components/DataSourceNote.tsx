import type { DataSource } from "@/lib/types";

/**
 * Dòng chữ nhỏ cho biết trang đang dùng dữ liệu nào – giúp kiểm tra nhanh
 * sau khi điền key. Không bao giờ hiển thị giá trị cấu hình, chỉ tên biến.
 */
export function DataSourceNote({ source, fallbackReason }: { source: DataSource; fallbackReason?: string }) {
  return (
    <div className="container-st py-2 text-right text-xs text-muted">
      Nguồn dữ liệu: {source === "nature-tourist" ? "API Nature Tourist" : "Giả lập (demo)"}
      {fallbackReason && <span> · Chưa dùng API vì {fallbackReason}</span>}
    </div>
  );
}
