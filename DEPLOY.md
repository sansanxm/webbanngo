# Hướng dẫn Triển khai lên Firebase Hosting (Static Mode)

Chế độ **Static Export** ổn định và **hoàn toàn miễn phí** trên Firebase. (Nhược điểm: Khi đăng bài viết ở Admin, bạn cần ấn Deploy lại để có giao diện bài chi tiết).

## 1. Chuẩn bị (Chỉ làm lần đầu)

Đảm bảo bạn đã cài đặt Node.js và Firebase Tools:

```bash
npm install -g firebase-tools
firebase login
```

*(Nếu đã làm rồi thì bỏ qua bước này)*

## 2. Cấu hình (Đã làm xong)
- `next.config.ts`: Đã thêm `output: "export"`.
- `firebase.json`: Đã cấu hình trỏ vào thư mục `out`.
- `.firebaserc`: Đã trỏ vào project `thbanngopvs`.

## 3. Triển khai (Mỗi khi muốn cập nhật web HOẶC sau khi ĐĂNG BÀI MỚI)

Chỉ cần chạy lệnh duy nhất này:

```bash
npm run deploy
```

Lệnh này sẽ tự động:
1.  Build lại toàn bộ trang web (tạo ra thư mục `out` với đầy đủ thẻ SEO chia sẻ Facebook cho các bài viết mới).
2.  Đẩy thư mục `out` lên Firebase Hosting.

Sau khi chạy xong, nó sẽ hiện đường link (ví dụ: `https://thbanngopvs.web.app`).

---
### Lưu ý
- Vì là `Static Export`, nên trang web sẽ tải rất nhanh.
- Nếu không chạy Deploy, bài viết mới sẽ báo lỗi `Mất tiêu đề trang` hoặc văng ra khi người khác truy cập đường link chi tiết.
