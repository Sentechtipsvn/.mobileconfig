# Công cụ tạo tệp .mobileconfig cho iOS

Website tĩnh tạo hồ sơ cấu hình iOS dưới dạng XML plist ngay trên thiết bị. Công cụ gửi XML sang phím tắt **Lưu cấu hình** để đặt tên và lưu thành tệp `.mobileconfig`. Người dùng tự chọn thư mục lưu. Có thể triển khai trên GitHub Pages, không cần backend hay bước build.

## Các loại cấu hình

Mỗi lần xuất tạo một hồ sơ cho **mục đang chọn**.

| Mục | Payload | Chức năng |
| --- | --- | --- |
| WebClip | `com.apple.webClip.managed` | Biểu tượng mở website hoặc URL scheme, có icon PNG |
| Wi-Fi | `com.apple.wifi.managed` | SSID, WPA2/WPA3 hoặc mạng mở, mật khẩu, tự kết nối |
| DNS | `com.apple.dnsSettings.managed` | DNS-over-HTTPS hoặc DNS-over-TLS |
| VPN | `com.apple.vpn.managed` | Kết nối IKEv2 bằng tài khoản EAP |
| Tài khoản | `com.apple.mail.managed` | Mail IMAP và SMTP dùng SSL/TLS |
| Chứng chỉ | `com.apple.security.pem` | Một chứng chỉ công khai X.509, nhận PEM/DER |
| Quản lý thiết bị | `com.apple.mobiledevice.passwordpolicy` | Chính sách mật mã thiết bị |

## Truyền văn bản sang Phím tắt

Website mở URL theo mẫu:

```text
shortcuts://run-shortcut?name=[TEN_PHIM_TAT]&input=text&text=[XML]
```

Tên phím tắt và XML được mã hóa bằng `encodeURIComponent()` khi ghép URL. Shortcuts nhận lại **toàn bộ XML dưới dạng văn bản** qua **Đầu vào phím tắt**. Không cần giải mã URL thêm trong phím tắt.

Tên mặc định là **Lưu cấu hình**. Nếu đổi tên, cập nhật `SHORTCUT_NAME` trong `modules/config.js` cho khớp.

## Cách xây dựng phím tắt Lưu cấu hình

Trong ứng dụng **Phím tắt**, tạo phím tắt mới và đặt tên **Lưu cấu hình**. Thêm các hành động theo thứ tự:

1. **Lấy văn bản từ đầu vào — Get Text from Input:** chọn nguồn là **Đầu vào phím tắt — Shortcut Input**.
2. **Đặt biến — Set Variable:** lưu kết quả bước 1 vào biến `XML`. Biến này giữ nguyên nội dung hồ sơ.
3. **Hỏi đầu vào — Ask for Input:** chọn kiểu **Văn bản**, hỏi “Tên tệp, không gồm phần mở rộng”. Ví dụ nhập `CauHinhDNS`. Không để trống hoặc dùng dấu `/` trong tên.
4. **Đặt biến — Set Variable:** lưu câu trả lời vào biến `TenTep`.
5. **Văn bản — Text:** chèn biến `TenTep`, rồi gõ thêm `.mobileconfig` ngay sau biến. Kết quả ví dụ: `CauHinhDNS.mobileconfig`.
6. **Đặt biến — Set Variable:** lưu kết quả bước 5 vào biến `TenTepDayDu`.
7. **Đặt tên — Set Name:** chọn **đầu vào là biến `XML`**, đặt tên bằng biến `TenTepDayDu`. Đây là bước tạo tệp có nội dung XML và tên kết thúc bằng `.mobileconfig`.
8. **Lưu tệp — Save File:** chọn đầu vào là **kết quả của Đặt tên** ở bước 7, rồi thiết lập nơi lưu theo nhu cầu bên dưới.

**Thiết lập thư mục lưu:**

- **Chọn mỗi lần chạy:** bật **Hỏi nơi lưu — Ask Where to Save**. Người dùng chọn thư mục trong Tệp, như iCloud Drive hoặc Trên iPhone.
- **Lưu vào thư mục cố định:** tắt **Hỏi nơi lưu**, rồi tự chọn thư mục đích trong hành động **Lưu tệp**.
- Nếu muốn có nhiều thư mục để chọn nhanh, thêm **Chọn từ menu — Choose from Menu** trước bước lưu; mỗi nhánh có một hành động **Lưu tệp** với thư mục do người dùng thiết lập.

Tệp cuối cùng phải chứa XML UTF-8 và có đuôi **`.mobileconfig`**, tránh `.mobileconfig.txt` hoặc lặp phần mở rộng. Khi đặt tên, luôn dùng biến `XML` làm nội dung; câu trả lời ở bước 3 chỉ dùng làm tên. Không nén ZIP hay mã hóa Base64 toàn bộ XML. Tên tệp độc lập với tên hiển thị của hồ sơ (`PayloadDisplayName`).

## Sử dụng và triển khai

1. Đưa toàn bộ tệp và thư mục của website vào repository GitHub. Bật **Settings → Pages → Deploy from a branch**, chọn nhánh và thư mục chứa `index.html`.
2. Mở website bằng Safari qua HTTPS, chọn loại cấu hình và nhập thông số.
3. Nhấn **Xuất cấu hình**; phím tắt nhận XML, hỏi tên và lưu tệp theo thiết lập của người dùng.
4. Mở tệp đã lưu và làm theo hướng dẫn của iOS để cài hồ sơ. Tạo và lưu tệp chưa đồng nghĩa với cài hồ sơ.

## Phạm vi kỹ thuật

- XML, biểu mẫu, icon và chứng chỉ được xử lý trên thiết bị. Hồ sơ xuất ra **chưa ký số, chưa mã hóa**; mật khẩu Wi-Fi/VPN đã nhập có thể nằm trong XML.
- DNS và VPN cần dịch vụ máy chủ thực tế. Quy tắc chặn quảng cáo, tên miền độc hại hoặc OTA được thiết lập ở máy chủ DNS; tệp DNS chỉ cấu hình kết nối đến máy chủ đó.
- Mục **Quản lý thiết bị** chỉ tạo chính sách mật mã, không đăng ký MDM. Mẫu VPN hỗ trợ IKEv2/EAP; mẫu Mail hỗ trợ IMAP/SMTP; mục chứng chỉ không nhận khóa riêng hoặc PKCS#12.
- Nếu XML quá lớn khiến URL sang Shortcuts không truyền đủ, dùng **Tải tệp .mobileconfig dự phòng** trong Trợ giúp.
- Cập nhật website không tự cập nhật hồ sơ đã cài. Khi thay đổi cấu hình, cần xuất và cài lại hồ sơ.

Tham khảo: [Shortcuts URL scheme](https://support.apple.com/guide/shortcuts/apd624386f42/ios).
