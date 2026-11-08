# Simplify Trip – Demo dịch vụ Tour

Bản demo giao diện **danh sách tour** và **chi tiết tour** cho simplifytrip.com, dựng bằng Next.js + React. Mục đích: xem trước và bấm thử trước khi đưa vào website chính.

> Mặc định trang chạy bằng **dữ liệu giả lập**. Khi điền key API Nature Tourist (xem mục "Điền key"), trang tự chuyển sang dữ liệu thật. Góc dưới trang ghi rõ đang dùng nguồn nào. Trang được gắn `noindex` để Google không đưa vào kết quả tìm kiếm.

## Có gì trong bản demo

| Trang | Tính năng chạy được |
| --- | --- |
| `/tour` | Tìm theo điểm đến và tháng đi. Bộ lọc: ngân sách, điểm đến, thể loại, số ngày, hãng bay. Sắp xếp, phân trang, chip bỏ lọc. Bộ lọc ghi lên URL nên chia sẻ được link đã lọc. Trên mobile, bộ lọc và sắp xếp mở dạng bottom sheet. |
| `/tour/[slug]` | Gallery ảnh (xem ảnh lớn, vuốt trên mobile). Các tab Lịch trình, Chính sách giá, Hướng dẫn, Visa, Bảo hiểm. Lịch trình mở/đóng theo ngày. Chọn ngày khởi hành, tăng giảm số khách, tổng tiền và tiền cọc tự tính lại, có ưu đãi đại lý. Khung đặt tour dính bên phải (desktop) hoặc thanh đặt tour ở đáy màn hình (mobile). Nút chia sẻ link cho khách. |

**Chưa làm (giai đoạn sau):** giỏ hàng, điền thông tin khách, đặt cọc, thanh toán, tải PDF. Các nút này hiện hộp thông báo "Sắp ra mắt" (`components/ComingSoon.tsx`).

## Chạy trên máy

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
npm run dev              # http://localhost:3000/tour
npm run build && npm start   # chạy bản production
npm run typecheck        # kiểm tra kiểu dữ liệu
npm run check-secrets    # quét key / file bí mật trước khi đẩy lên GitHub
npm run fetch-samples    # lấy dữ liệu mẫu đã che từ API (cần .env.local)
```

## Điền key (Beo tự làm – không gửi key cho ai, kể cả Claude)

1. Trên máy:
   ```bash
   cp .env.example .env.local
   open -e .env.local
   ```
   Điền `TOUR_PROVIDER=rest`, `TOUR_API_BASE_URL`, `TOUR_API_KEY` (lấy từ tài liệu Nature Tourist), lưu lại.
   `.env.local` nằm trong `.gitignore`, không bao giờ lên GitHub.
2. `npm run dev`, mở http://localhost:3000/tour – góc dưới phải ghi "Nguồn dữ liệu: API Nature Tourist".
3. Trên Vercel: Project → Settings → Environment Variables → thêm đúng 3 biến trên, bật **Sensitive**, chọn Production + Preview → Deployments → Redeploy.
4. Đổi từ key Test sang Production: chỉ đổi giá trị biến, không sửa code.
5. Lỡ lộ key (dán vào chat, đẩy lên GitHub...): báo Nature Tourist khóa key cũ, cấp key mới.

Thiếu key hoặc sai định dạng → trang tự dùng dữ liệu giả và ghi lý do (chỉ tên biến, không ghi giá trị).
Lưu ý: ảnh tour lấy từ máy chủ của đối tác nên địa chỉ ảnh hiển thị công khai trên trình duyệt (điều này là bình thường; key thì không bao giờ xuống trình duyệt).

## Cấu trúc thư mục

```
app/
  layout.tsx              Header, footer, font Inter, noindex
  tour/page.tsx           Trang danh sách tour
  tour/[slug]/page.tsx    Trang chi tiết tour (tạo sẵn tĩnh cho từng tour)
components/
  TourListing.tsx         Ô tìm kiếm, bộ lọc, sắp xếp, phân trang (client)
  TourCard.tsx            Thẻ tour
  Gallery.tsx             Ảnh tour + lightbox
  TourTabs.tsx            Tab thông tin + lịch trình dạng accordion
  BookingBox.tsx          Chọn ngày, số khách, tính tổng tiền và cọc
  MobileBookingBar.tsx    Thanh đặt tour cố định đáy màn hình (mobile)
  CrossSell.tsx           Gợi ý mua kèm eSIM / SIM / Visa
  ComingSoon.tsx          Hộp "Sắp ra mắt"
  DataSourceNote.tsx      Dòng "Nguồn dữ liệu" cuối trang
data/tours.ts             DỮ LIỆU GIẢ LẬP (12 tour) + chính sách mặc định
lib/types.ts              KIỂU DỮ LIỆU CHUẨN – giao diện chỉ dùng các kiểu này
lib/config.ts             getConfig(): đọc key từ biến môi trường (chỉ server)
lib/providers/mock.ts     Nguồn dữ liệu giả
lib/providers/rest.ts     Nguồn API Nature Tourist: gọi API, map dữ liệu, bỏ hoa hồng
lib/providers/index.ts    Chọn nguồn theo TOUR_PROVIDER
lib/tour-repository.ts    Hàm các trang gọi (getTourList, getTourBySlug...)
lib/tour-utils.ts         fromPrice, nextDeparture, buildFacets (dùng được ở trình duyệt)
lib/filters.ts            Logic lọc, sắp xếp, đọc/ghi URL
scripts/check-secrets.mjs Quét key / file bí mật
scripts/fetch-samples.mjs Lấy dữ liệu mẫu đã che vào samples/
docs/nature-tourist-api.md Tóm tắt API đối tác (không có key)
CLAUDE.md, .claude/       Quy tắc cho Claude Code (cấm đọc .env*)
lib/format.ts             Định dạng tiền "24,999,000 ₫", ngày, ảnh Unsplash
app/globals.css           Design tokens (màu, font) theo simplifytrip.com
```

## Tích hợp API Nature Tourist

- Gọi API chỉ ở server (`lib/providers/rest.ts`), key gắn vào header `Authorization` tại đó.
- Danh sách tour: `/outbound/tour-block` (mỗi tour kèm lịch và giá). Chi tiết: thêm `/content/{alias}`.
- Giá hiển thị = giá bán thực tế (`adults_promotion`), trẻ em tour nước ngoài = `children_no_bed`, em bé = `infant`.
- Trường hoa hồng và giá landtour không bao giờ rời khỏi `rest.ts`.
- Dữ liệu làm mới tối đa 15 phút/lần. Số chỗ phải kiểm tra lại bằng `checkSeatsAvailable()` ngay trước khi giữ chỗ.
- Các chỗ ghi `GIẢ ĐỊNH` / `TODO(samples)` trong `rest.ts` cần rà lại khi có dữ liệu mẫu thật (`npm run fetch-samples`).
- Chưa làm: lịch trình theo ngày (chờ mẫu `/content`), tour trong nước, giữ chỗ `POST /booking/create`.

## Design tokens

Lấy từ giao diện simplifytrip.com hiện tại (xem `app/globals.css`):

| Token | Màu | Dùng cho |
| --- | --- | --- |
| `brand` | `#224900` | Tiêu đề section, giá, tab đang chọn |
| `btn` | `#3F4D36` | Nút chính |
| `sage` | `#E3ECE6` | Nền section nhấn |
| `gold` | `#E3B433` | Gạch vàng trên tiêu đề |
| `total` | `#C2570C` | Tổng tiền (đậm hơn `#FD7E14` để dễ đọc) |

Font: Inter. Định dạng tiền: `24,999,000 ₫` (giống site hiện tại).

## Ảnh

Ảnh tour lấy từ [Unsplash](https://unsplash.com) (Unsplash License, dùng miễn phí) và hiển thị trực tiếp qua CDN của Unsplash. Danh sách tác giả nằm trong `data/tours.ts` (`PHOTO_CREDITS`). Khi bán thật, nên thay bằng ảnh do đối tác lữ hành cung cấp.

Logo, huy hiệu Bộ Công Thương và ảnh sản phẩm SIM/eSIM là tài sản của Simplify Trip (`public/brand/`).

## Deploy preview lên Vercel

1. Đăng nhập https://vercel.com bằng tài khoản GitHub.
2. **Add New → Project** → chọn repo `simplifytrip-tour-demo` → **Deploy** (không cần sửa cấu hình).
3. Mỗi lần đẩy code lên nhánh `main`, Vercel tự cập nhật link preview.
