# Dữ liệu mẫu đã che

Thư mục này chứa phản hồi mẫu của API Nature Tourist, đã:
- cắt còn tối đa 3 phần tử mỗi danh sách,
- xóa trường hoa hồng (`*_commission`) và giá landtour (`adults_land_price`),
- che số điện thoại, email, địa chỉ, tên người,
- thay địa chỉ server bằng `{server_api}`.

Tạo / cập nhật (trên máy Beo, sau khi đã điền `.env.local`):

```bash
npm run fetch-samples
npm run check-secrets
```

Mở từng file xem lại trước khi commit hoặc gửi cho Claude. Claude dùng các file này để map dữ liệu thật vào giao diện mà không cần key.
