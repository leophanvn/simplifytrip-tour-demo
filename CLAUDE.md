# Quy tắc cho Claude – website tour Simplify Trip

Người dùng là Beo (chủ Simplify Trip), không phải lập trình viên chuyên nghiệp.
Trả lời bằng tiếng Việt, ngắn gọn, từng bước, kèm lệnh chạy cụ thể.

## Bối cảnh
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.
- Nguồn tour: API Nature Tourist (Du Lịch Thiên Nhiên). Tóm tắt API: `docs/nature-tourist-api.md`.
- Kiểu dữ liệu chuẩn: `lib/types.ts`. Giao diện chỉ dùng các kiểu này.
- Nguồn dữ liệu: `lib/providers/` – `mock.ts` (dữ liệu giả), `rest.ts` (API thật), chọn bằng `TOUR_PROVIDER`.
- Trang chỉ gọi `lib/tour-repository.ts`. Mọi lời gọi đối tác chạy trên server; trình duyệt không bao giờ gọi thẳng đối tác.
- Dữ liệu mẫu đã che: `samples/*.redacted.json` (tạo bằng `npm run fetch-samples`).
- Next.js 16 khác nhiều so với bản cũ: xem `AGENTS.md` và tài liệu trong `node_modules/next/dist/docs/` trước khi viết code.

## Bảo mật – BẮT BUỘC
1. Không đọc, in, sửa hay tóm tắt `.env`, `.env.local`, `.env.*` (trừ `.env.example`). Không chạy lệnh in nội dung các file đó.
2. Không bao giờ yêu cầu Beo gửi key, mật khẩu, token, URL có key hay nội dung `.env.local`.
3. Đọc thông tin kết nối chỉ qua `getConfig()` trong `lib/config.ts`. Không viết cứng key. Không dùng `NEXT_PUBLIC_*` cho thông tin kết nối.
4. Ví dụ luôn dùng giá trị giả: `YOUR_API_KEY_HERE`, `https://api.example.com`.
5. Nếu Beo lỡ dán thứ trông giống key/mật khẩu thật: dừng lại, nhắc Beo xin key mới từ đối tác, không lặp lại giá trị.
6. Không log header, key, body chứa thông tin khách. Lỗi trả về trình duyệt phải chung chung.
7. Không đưa trường hoa hồng (`*_commission`) hay giá landtour (`adults_land_price`) ra khỏi `lib/providers/rest.ts`.
8. Không đọc / commit file PDF tài liệu gốc của đối tác (có key thử và tài khoản demo).
9. Biến môi trường mới → thêm vào `.env.example` (để trống) + `getConfig()`, rồi bảo Beo tự điền.

## Cách làm việc
- Trước khi sửa code: tóm tắt kế hoạch 3–5 dòng, liệt kê file sẽ sửa, chờ Beo đồng ý.
- Chỉ sửa đúng phần cần thiết. Khi map API: dựa vào `docs/nature-tourist-api.md` và `samples/`. Chỗ nào không rõ thì hỏi, không đoán.
- Các chỗ ghi `GIẢ ĐỊNH` / `TODO(samples)` trong `lib/providers/rest.ts` cần rà lại khi có dữ liệu mẫu.
- Sau mỗi thay đổi chạy và báo kết quả: `npm run typecheck`, `npm run build`, `npm run check-secrets`, kèm cách thử trên trình duyệt.
- Ưu tiên: đúng và an toàn > nhanh > đẹp.
