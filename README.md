# Cảm Xúc Club — Thư mời khách quý

Trang tĩnh HTML/CSS/JavaScript, không cần cài thư viện hoặc bước build. Toàn bộ ảnh và font đi kèm, không phụ thuộc vào địa chỉ Sites.

## Vercel
1. Giải nén, đưa nội dung thư mục này lên một Git repository.
2. Import repository trên Vercel, chọn Framework Preset: Other.
3. Root Directory: thư mục chứa index.html. Không đặt Build Command; Output Directory: `.`.
4. Deploy.

Xem tại máy: `python3 -m http.server 8000`, mở http://localhost:8000.

## Chỉnh sửa
- Nội dung, thời gian, địa điểm: index.html; nếu đổi lịch, cập nhật phần tạo ICS và lời phản hồi trong app.js.
- Màu, font và bố cục responsive: styles.css.
- Ảnh nền: assets/music-background.jpg.
- Font có hỗ trợ tiếng Việt nằm trong assets/fonts.

Nút phản hồi tạo lời nhắn để khách sao chép/chia sẻ cho người mời; không lưu đăng ký vào cơ sở dữ liệu. Fanpage chưa có liên kết chính thức nên nút này đang bị vô hiệu hóa. Lịch dùng giờ Việt Nam.

Đã giữ nội dung, ảnh và chức năng của bản trang đang hoạt động; thay toàn bộ stylesheet để tránh các lớp ghi đè tích lũy. Chưa kiểm tra trực tiếp bằng trình duyệt trong phiên tạo mã nguồn.
