# Simplify Trip – Demo dịch vụ Tour

Bản demo giao diện **danh sách tour** và **chi tiết tour** cho simplifytrip.com, dựng bằng Next.js + React. Mục đích: xem trước và bấm thử trước khi đưa vào website chính.

> Đây là bản demo. Giá, ngày khởi hành, số chỗ và lịch trình là **dữ liệu giả lập**. Trang được gắn `noindex` để Google không đưa vào kết quả tìm kiếm.

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
npm run dev        # http://localhost:3000/tour
npm run build && npm start   # chạy bản production
```

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
data/tours.ts             DỮ LIỆU GIẢ LẬP (kiểu dữ liệu + 12 tour)
lib/tour-repository.ts    Lớp đọc dữ liệu – nơi thay bằng API thật
lib/filters.ts            Logic lọc, sắp xếp, đọc/ghi URL
lib/format.ts             Định dạng tiền "24,999,000 ₫", ngày, ảnh Unsplash
app/globals.css           Design tokens (màu, font) theo simplifytrip.com
```

## Tích hợp API đối tác lữ hành sau này

Chỉ cần sửa `lib/tour-repository.ts`, giao diện giữ nguyên. Gợi ý ánh xạ với API Du Lịch Thiên Nhiên:

| Hàm | API |
| --- | --- |
| `getTours()` | `/tour-rows` (+ `/category` cho bộ lọc) |
| `getTourBySlug()` | `/content/...` (lịch trình, bao gồm/không bao gồm, lưu ý) |
| `Tour.departures` | `/calendar/...` + `/price/...` |
| Kiểm tra chỗ trước khi đặt | `/price/check_seat_available/{id}` |
| Đặt chỗ (giai đoạn sau) | `POST /booking/create` |

Khi dùng API thật, nên chuyển các hàm sang `async` và gọi API từ server (route handler hoặc server component) để không lộ `user_key` ra trình duyệt.

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
