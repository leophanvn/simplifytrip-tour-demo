import Image from "next/image";
import { PHOTO_CREDITS } from "@/data/tours";

const TERMS = ["Điều khoản dịch vụ", "Chính sách bảo vệ thông tin người tiêu dùng", "Chính sách đổi trả", "Chính sách hủy tour", "Chính sách thanh toán"];
const HELP = ["Về Simplify Trip", "Câu hỏi thường gặp", "Hướng dẫn đặt tour", "Hướng dẫn cài đặt SIM", "Hợp tác cùng Simplify Trip", "Blogs"];

export function Footer() {
  return (
    <footer className="bg-n50 pt-12 pb-6">
      <div className="container-st grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="flex flex-col gap-2.5">
          <Image src="/brand/logo.png" alt="Simplify Trip – go global, stay local" width={172} height={46} className="h-11 w-auto self-start" />
          <b className="mt-2 text-sm">
            CÔNG TY TNHH ĐƠN GIẢN HOÁ CHUYẾN ĐI
            <br />
            (SIMPLIFY TRIP)
          </b>
          <p className="text-[13px] text-muted">
            Giấy chứng nhận Đăng ký Kinh doanh số 0318490860 do Sở Kế hoạch và Đầu tư TP Hồ Chí Minh cấp ngày 05/06/2024.
          </p>
          <p className="text-[13px] text-muted">Địa chỉ: 133 Nguyễn Thị Mười, Phường Chánh Hưng, TP Hồ Chí Minh</p>
          <p className="text-[13px] text-muted">Hotline: (+84) 931 88 7120 · Email: info@simplifytrip.com</p>
          <p className="text-[13px] text-muted">[Giấy phép kinh doanh lữ hành quốc tế / đơn vị lữ hành đối tác]</p>
          <Image src="/brand/bct.png" alt="Đã thông báo Bộ Công Thương" width={92} height={28} className="mt-1.5 h-[34px] w-auto self-start" />
        </div>
        <FooterCol title="Điều khoản" items={TERMS} />
        <FooterCol title="Hỗ trợ" items={HELP} />
      </div>
      <div className="container-st mt-8 flex flex-col gap-2 border-t border-line pt-4 text-[13px] text-muted sm:flex-row sm:justify-between">
        <span>© 2024 Simplify Trip. All rights reserved.</span>
        <span>Zalo · Messenger · WhatsApp · Facebook · TikTok</span>
      </div>
      <p className="container-st mt-3 text-xs leading-relaxed text-subtle">
        Bản demo giao diện. Ảnh tour từ Unsplash ({PHOTO_CREDITS.map((c) => c.author).join(", ")}). Giá, ngày khởi hành và lịch trình chỉ để minh họa.
      </p>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <b className="text-[15px]">{title}</b>
      {items.map((i) => (
        <a key={i} href="#" className="text-sm text-muted hover:text-brand">
          {i}
        </a>
      ))}
    </div>
  );
}
