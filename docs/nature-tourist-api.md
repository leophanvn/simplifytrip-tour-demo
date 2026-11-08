# API Nature Tourist – tóm tắt (đã che thông tin kết nối)

Tóm tắt từ 3 file PDF tài liệu của Nature Tourist (Du Lịch Thiên Nhiên), bản tháng 11/2026.
Địa chỉ server, key Test, tài khoản portal demo **không** ghi ở đây – xem tài liệu gốc, chỉ điền vào `.env.local` / Vercel.

## Kết nối

| Mục | Giá trị |
| --- | --- |
| `server_api` | Có 2 môi trường: Test và Production → biến `TOUR_API_BASE_URL` |
| `user_key` | GUID do Nature Tourist cấp (Production cấp riêng) → biến `TOUR_API_KEY` |
| Header | `accept: */*` và `Authorization: {user_key}` (không có tiền tố `Bearer`) |
| Swagger | Có trang Swagger trên server Test – xem chi tiết tham số ở đó |

## Ba kịch bản lấy dữ liệu

1. **Dạng khối** (tour-block): mỗi tour một dòng, kèm `calendars[]` và trong mỗi lịch có `prices[]`. Trang danh sách dùng cách này.
2. **Dạng hàng** (tour-rows): mỗi dòng = 1 tour + 1 ngày khởi hành + 1 mức giá, có sẵn `tour_id`, `calendar_id`, `price_id`.
3. **Đơn giản** (`/selective/...`): giống dạng hàng nhưng ít trường hơn.

Sau khi giữ chỗ thành công trên hệ thống Nature Tourist, đối tác tự cập nhật số chỗ. Nature Tourist không cho sửa nội dung giữ chỗ hay hủy vé qua API.

## Endpoint

Tất cả là `GET`, trừ đặt chỗ.

| Việc | Endpoint | Schema trả về |
| --- | --- | --- |
| Danh mục tour nội địa / nước ngoài | `/category/domestic`, `/category/outbound` | `CategoryModel[]`: `id`, `alias`, `name` |
| Danh mục (dạng đơn giản) | `/selective/category/outbound`, `/selective/category/domestic` | như trên |
| Danh sách tour dạng khối | `/domestic/tour-block`, `/outbound/tour-block` | `ItemTourBlockModel` |
| Danh sách tour dạng hàng | `/domestic/tour-rows`, `/outbound/tour-rows` (tham số `category_id` hoặc all) | `ItemTourRowModel` |
| Danh sách dạng đơn giản | `/selective/outbound/tour-rows` | như dạng hàng, ít trường hơn |
| Lịch khởi hành của tour | `/calendar/list/{tour_id}` | `CalendarModel` |
| Lịch khởi hành (chỉ mảng ngày) | `/calendar/array/{tour_id}` | `CalandarArrayModel` |
| Chi tiết một ngày khởi hành | `/calendar/{id}` | `CalendarModel` |
| Giá + số chỗ theo ngày | `/price/list/{calendar_id}` | `PriceModel` |
| Chi tiết một mức giá | `/price/{id}` | `PriceModel` |
| Kiểm tra chỗ còn | `/price/check_seat_available/{price_id}` | số nguyên |
| Nội dung tour | `/content/{alias}` hoặc `/content/tour/{id}` | `ContentTourModel` |
| Giữ chỗ | `POST /booking/create` | `ResultBookingStatusModel` |

Tham số phân trang/lọc của tour-block và tour-rows: tài liệu ghi "tham khảo Swagger". Code mẫu dùng `page`, `limit`, `month`, `start_date`, `category_id` → **cần xác nhận**.

## Mô hình dữ liệu chính

**ItemTourBlockModel / ItemTourRowModel** (phân trang): `page`, `limit`, `total_records`, `total_pages`, `data_list[]`.

**TourBlockModel**: `order`, `id` (tour_id), `category_id`, `tour_name`, `tour_code`, `departure` (1 Sài Gòn, 2 Hà Nội, 3 Cần Thơ), `alias`, `hight_lights`, `category_name`, `price_default` (string), `total_day`, `total_night`, `vehicles_go` / `vehicles_back` (0 tự chọn, 1 máy bay, 2 ô tô, 3 tàu hỏa, 4 tàu cao tốc), `wait_address_customer` (điểm đón), `file_upload[]` (file chương trình tour), `image`, `images[]` (`id`, `name`, `path`), `calendars[]`, `ages_adults`, `ages_children1_from/_to`, `ages_children2_from/_to`, `ages_infant`.

**TourRowModel**: các trường trên + `calendar_id`, `price_id`, `name`, `price_code_manager`, `level_nam` (tiêu chuẩn khách sạn), `start_date`, `end_date`, `ticket_plane_go/back`, giá `*_price` (đề xuất) và `*_price_sales` (bán thực tế), `seat_expires_later` (thời gian giữ chỗ), `deadline_visa`, `number_seat_calendar_open/sold`, `number_seat_price_open/sold`, `number_booking_sure`, `number_booking_seat`, `number_tickets_available`.

**CalendarModel**: `id` (calendar_id), `tour_id`, `tour_type` (0 thường, 1 sự kiện, 2 lễ tết), `start_date`, `end_date`, `after_depart` (giờ hiệu lực giữ chỗ), `number_seat_open`, `number_seat_available`, `prices[]`, `flag_name` (nhà điều hành), `hotel_name`, `local_guide`, `guide_real` (trưởng đoàn).

**PriceModel**: `id` (price_id), `level_nam`, `calendar_id`, `ticket_plane_go/back`, `adults_price` (đề xuất), `adults_promotion` (bán thực tế), `children_has_bed_price/_promotion` (trẻ loại 1), `children_no_bed_price/_promotion` (trẻ loại 2), `infant_price/_promotion`, `single_room_add`, `foreign_surcharge`, `number_seat_open`, `number_seat_available`.
Các trường `*_commission` và `adults_land_price` là dữ liệu nội bộ – **không hiển thị, không gửi xuống trình duyệt**.

**ContentTourModel** (theo code mẫu C#, chưa đủ): `tour_type`, `tour_id`, `category_id`, `alias`, `name`, `hight_lights`, `category_name`, `price_default`, `total_day`, `total_night`, `vehicles_go/back`, `wait_address_customer`, `file_upload`... Lịch trình theo ngày, bao gồm/không bao gồm: **chờ dữ liệu mẫu**.

## Cách tính tuổi tương ứng với giá (mục #11)

Tour nội địa:
1. `adults_price_sales` → từ `ages_adults` (11) tuổi
2. `children_has_bed_price_sales` → từ `ages_children1_from` (5) đến dưới `ages_children1_to` (11)
3. `children_no_bed_price_sales` → từ `ages_children2_from` (2) đến dưới `ages_children2_to` (5)
4. `infant_price_sales` → dưới `ages_infant` (2)

Tour nước ngoài:
1. `adults_price_sales` → từ `ages_adults` (11) tuổi
2. `children_no_bed_price_sales` → từ `ages_children1_from` (2) đến dưới `ages_children1_to` (11)
3. `infant_price_sales` → dưới `ages_infant` (2)

## Giữ chỗ (giai đoạn sau)

`POST /booking/create`, body `BookingCreateModel`:
bắt buộc `price_id`, `contract_phone`, `email`, `number_adults`, `number_children_1`, `number_children_2`, `number_infant`;
tùy chọn `x_sequence`, `x_timestamp`, `x_hash` (mặc định ""), `buy_id`, `contract_name`, `cell_phone`, `address`, `total_single_room`, `note_room_single`, `notes_ghep_tour`, `note_info_booking`, `note_info_tax`, `invoice_type` (0 lấy hóa đơn, 2 không), `booker_name`, `booker_id`.

Trả về: `result` (true/false), `booking_code`, `booking_expiration_date`, `message`.

Cần hỏi Nature Tourist: cách tính `x_hash` / `x_sequence`, `buy_id` lấy từ đâu, thời gian giữ chỗ, cách hủy giữ chỗ.
