# Cảm Xúc Club — Đăng ký khách quý

HTML/CSS/JavaScript, ảnh và font đi kèm; API Vercel lưu đăng ký vào Google Sheets thông qua Apps Script. Fanpage: https://www.facebook.com/Camxuc.club.

## 1. Chuẩn bị Google Sheets
1. Tạo Google Sheets mới, đặt tên “Cảm Xúc Club — Khách đăng ký”. Giữ bảng riêng tư.
2. Chọn Extensions / Tiện ích mở rộng → Apps Script.
3. Dán nội dung `setup/Code.gs` vào trình chỉnh sửa, lưu lại.
4. Chọn hàm `setup`, bấm Run và cấp quyền cho tài khoản của bạn. Hàm tạo tab `DangKy` và khóa riêng.
5. Trong Project Settings → Script Properties, sao chép giá trị `REGISTRATION_SECRET`. Không chia sẻ khóa này và không đưa vào mã frontend.
6. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Bấm Deploy, sao chép URL kết thúc `/exec`.

Google Sheets phải thuộc tài khoản thực hiện triển khai. Nếu Workspace chặn web app cho Anyone, cần dùng tài khoản được phép hoặc thay phương án kết nối. Khi chỉnh Apps Script, cập nhật deployment sang version mới.

## 2. Triển khai Vercel
1. Đưa toàn bộ mã nguồn lên Git repository, import vào Vercel.
2. Framework Preset: Other; Root Directory: thư mục chứa index.html; không đặt Build Command; Output Directory: `.`.
3. Vercel → Settings → Environment Variables, thêm:
   - `GOOGLE_SCRIPT_URL`: URL `/exec` ở bước trên.
   - `REGISTRATION_SECRET`: khóa từ Script Properties.
4. Áp dụng cho Production (và Preview nếu muốn kiểm tra), rồi Deploy / Redeploy.

Đừng mở công khai sheet hoặc thêm khóa bí mật vào app.js. Giao diện chỉ gọi `/api/register`; URL Apps Script và khóa nằm ở Vercel phía server.

## 3. Kiểm tra trước khi gửi khách
- Gửi một đăng ký thử từ website Vercel. Kiểm tra tab DangKy có dòng mới trước khi sử dụng chính thức.
- Kiểm tra số điện thoại giữ số 0 đầu, số người và lời nhắn chính xác.
- Bấm gửi lại với cùng dữ liệu/mã: không tạo dòng trùng.
- Xác nhận thông tin với khách và cập nhật cột Trạng thái trực tiếp trong Sheets.
- Nếu chưa cấu hình hoặc kết nối lỗi, website không báo thành công giả; hướng khách tới fanpage.

Các cột: mã đăng ký, thời gian, tên, điện thoại, số người, người mời, lời nhắn, đồng ý liên hệ, trạng thái. Thành công nghĩa là đã nhận đăng ký, chưa phải xác nhận chỗ ngồi. Không gửi email/SMS tự động. Có kiểm tra dữ liệu, honeypot và chống ghi trùng; chưa tích hợp CAPTCHA cho lưu lượng công khai lớn.

Chưa kiểm tra đầu cuối với tài khoản Google/Vercel thực tế. `python3 -m http.server` chỉ xem được giao diện; cần Vercel để chạy API.
