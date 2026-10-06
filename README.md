# .mobileconfig · Sentechtipsvn — v2.0.0

Giao diện Neumorphism màu `#5c5c5c`, tạo XML hồ sơ WebClip rồi chuyển **văn bản thuần** sang phím tắt **Lưu cấu hình**. Phím tắt phụ trách tên tệp, tạo `.mobileconfig`, menu thư mục và lưu vào iCloud Drive.

## Luồng xuất

1. Nhập tên hiển thị, URL và mô tả tùy chọn; chọn icon nếu muốn.
2. Nhấn **Xuất cấu hình**.
3. Website tạo XML plist, đợi sao chép toàn bộ XML vào clipboard thành công.
4. Website thử mở:

```text
shortcuts://run-shortcut?name=L%C6%B0u%20c%E1%BA%A5u%20h%C3%ACnh&input=clipboard
```

5. Shortcuts nhận đầu vào là **toàn bộ XML**. Phím tắt hỏi tên tệp và tự lưu theo luồng của bạn.

Không có JSON, không có base64 bọc quanh cả nội dung, không truyền URL blob, không gọi bảng chia sẻ. Base64 **bên trong phần `<data>` của icon** vẫn phải có vì đó là cấu trúc chuẩn của plist; đây không phải cách đóng gói dữ liệu gửi sang phím tắt.

Nút này thay nội dung clipboard hiện tại. iOS có thể hỏi quyền clipboard hoặc xác nhận mở Shortcuts. Nếu phím tắt không tự mở, nhấn liên kết **Mở “Lưu cấu hình”**. Website không thể kiểm tra phím tắt đã tồn tại hay xác nhận tệp đã được lưu. Vì vậy giao diện chỉ báo đã sao chép XML, không báo “đã lưu”.

Nếu clipboard bị từ chối hoặc không được hỗ trợ, trang hiện ô XML chỉ đọc và nút chọn toàn bộ. Dùng lệnh Sao chép của iOS, rồi nhấn **Đã sao chép — mở phím tắt**. Trong Trợ giúp có nút **Chỉ sao chép XML** nếu bạn muốn chạy phím tắt thủ công.

## Phím tắt do bạn tự xây dựng

Tên phải chính xác là **Lưu cấu hình**. Nếu đổi tên, sửa `SHORTCUT_NAME` trong `modules/config.js` rồi tăng phiên bản cache trong `sw.js`.

Gợi ý cấu trúc:

1. Lấy **Đầu vào phím tắt** dưới dạng **Văn bản**. Không yêu cầu đầu vào là Tệp và không giải mã JSON/base64.
2. Giữ văn bản XML trong một biến riêng, ví dụ `NoiDungCauHinh`.
3. Kiểm tra đầu vào có `<?xml` và `<plist version="1.0">`; nếu thiếu thì dừng và thông báo. Đây là kiểm tra sơ bộ, không thay cho phân tích XML.
4. **Hỏi đầu vào**: tên tệp, ví dụ `Sentechtipsvn.mobileconfig`.
5. Chuẩn hóa tên: không dùng `/`, không để tên rỗng; nếu chưa có `.mobileconfig` thì thêm một lần.
6. Chuyển **văn bản XML gốc** thành tệp và **Đặt tên** bằng tên đã nhập, có phần mở rộng `.mobileconfig`. Không lưu nhầm kết quả của bước hỏi tên làm nội dung tệp.
7. **Chọn từ menu** các thư mục bạn đã cấu hình.
8. **Lưu tệp** vào thư mục của nhánh đã chọn. Nếu đã chọn thư mục cố định, tắt **Hỏi nơi lưu** trong hành động Lưu tệp.
9. Tự xử lý khi trùng tên: hỏi ghi đè, thêm số thứ tự hoặc thêm thời gian tùy cách bạn muốn.

Tệp cuối cùng phải có nội dung XML UTF-8 và đuôi `.mobileconfig`, không phải `.mobileconfig.txt`. Tên hành động/tùy chọn có thể khác theo ngôn ngữ và phiên bản iOS. Đổi tên tệp không thay đổi `Label`/`PayloadDisplayName` trong XML: đó là tên hiển thị đã nhập trên website.

Tài liệu Apple về đầu vào clipboard: https://support.apple.com/guide/shortcuts/apd624386f42/ios

## Đưa lên GitHub Pages / cập nhật bản cũ

1. Giải nén ZIP và đưa **nội dung bên trong** thư mục `sentechtipsvn-webclip` lên thư mục gốc repository.
2. Giữ các tệp gốc cùng cấp: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`.
3. Đưa lên cả thư mục mới **`modules/`** và ảnh mới **`icons/default-webclip.png`**. Thiếu một module sẽ khiến nút xuất không hoạt động.
4. Trong **Settings → Pages**, chọn **Deploy from a branch → main → /(root) → Save**.
5. Mở URL HTTPS bằng Safari, thêm vào Màn hình chính nếu chưa có.
6. Với bản cũ: đóng hẳn các cửa sổ/WebClip, mở lại online để nhận service worker `v2.0.0`. Bản cập nhật tải xong có thể cần đóng rồi mở lại lần nữa.

Không cần npm, framework, API hoặc bước build. Đường dẫn tương đối hỗ trợ cả URL domain gốc lẫn `/ten-repository/`. Đây là ES modules, cần phục vụ qua HTTP/HTTPS; không chạy trực tiếp bằng `file://`.

Chạy thử ở thư mục chứa `index.html`:

```sh
python3 -m http.server 8080
```

Mở `http://localhost:8080/` trên máy tính. Trên iPhone cần URL HTTPS để có clipboard/service worker. HTTP trong mạng LAN thường không có các quyền này.

## Cấu trúc để tái sử dụng

| Tệp | Trách nhiệm |
| --- | --- |
| `index.html` | Form, trạng thái, trợ giúp, metadata iOS |
| `styles.css` | Màu, Neumorphism, safe-area, responsive, sóng tác giả |
| `app.js` | Nối giao diện với các module, xử lý trạng thái |
| `modules/config.js` | Tác giả, tên phím tắt, icon mặc định, phiên bản app |
| `modules/validation.js` | Kiểm tra tên, mô tả và URL/scheme |
| `modules/profile.js` | Ghi plist, bao hồ sơ và xây payload WebClip |
| `modules/icons.js` | Đọc ảnh, cắt giữa, tạo PNG 180 × 180 |
| `modules/shortcuts.js` | Sao chép văn bản và mở phím tắt |
| `modules/platform.js` | Offline, sóng tác giả, WebMCP tùy chọn |
| `sw.js` | Danh sách tài nguyên cache, phạm vi repository, cập nhật |

Để thêm DNS/Wi-Fi hoặc nhiều WebClip: tạo builder cho payload đó, dùng `createConfigurationProfile({displayName, description, payloads})` trong `modules/profile.js`, rồi gửi XML kết quả bằng `copyProfileText(xml)`. `PlistData` dành cho giá trị `<data>` nhị phân base64; serializer có hỗ trợ dictionary, array, string, boolean và số. Chưa có form hoặc builder DNS/Wi-Fi trong bản này; cần viết và kiểm tra khóa payload theo tài liệu Apple. Thêm module vào danh sách `ASSETS` của `sw.js` để hoạt động offline.

Tác giả hồ sơ luôn được đặt là **Sentechtipsvn**, độc lập với tên tệp bạn chọn trong Shortcuts.

## Thay ảnh

| Vị trí | Tệp / mã |
| --- | --- |
| Icon mặc định của form và hồ sơ | `icons/default-webclip.png` — nên dùng PNG vuông 180 × 180 |
| Icon công cụ trên Màn hình chính iOS | `icons/apple-touch-icon.png` — 180 × 180 |
| Icon trong manifest | `icons/icon-192.png`, `icons/icon-512.png` |
| Icon maskable | `icons/icon-maskable-512.png` — 512 × 512, giữ hình chính trong vùng an toàn |
| Logo nhỏ ở tiêu đề | SVG `.brand-mark` trong `index.html` |
| Ảnh khởi động iOS | `launch/`, theo tên kích thước/hướng |

Icon do người dùng chọn được xử lý trong bộ nhớ và đưa vào XML, không ghi đè ảnh mặc định. Không lưu lịch sử form hay icon đã chọn.

## iOS, offline và giới hạn

Có manifest standalone, thẻ meta iOS, apple-touch-icon, ảnh khởi động cho một số màn hình phổ biến, safe-area và font hệ thống. Trạng thái offline và hướng dẫn nằm trong Trợ giúp để form gọn. Sau lần mở online thành công, mã/module/icon được cache để tạo XML offline. iOS có thể xóa cache khi thiếu dung lượng; cần mở lại online nếu xảy ra.

URL nhận HTTP/HTTPS và scheme như `zalo://`, `shortcuts://`, `tel:`, `sms:`, `mailto:`, kể cả dạng scheme không có đường dẫn. URL website được chuẩn hóa; scheme khác được giữ nguyên sau khi bỏ khoảng trắng đầu/cuối. Không nhận khoảng trắng bên trong (dùng `%20`), escape `%` sai, thông tin đăng nhập, ký tự XML không hợp lệ hay các scheme `javascript:`, `data:`, `vbscript:`, `file:`, `blob:`, `about:`.

WebClip website có `FullScreen = true`; scheme khác có `FullScreen = false` để không ép luồng app vào một web app toàn màn hình. App đích và iOS vẫn quyết định scheme có mở được hay không. Không thêm `TargetApplicationBundleIdentifier` tùy tiện.

Ảnh nhận PNG/JPG/WebP tối đa 10 MB, 24 megapixel; cắt giữa, chuyển PNG 180 × 180, nền trong suốt được đặt trên `#5c5c5c`. HEIC cần chuyển sang JPG/PNG trước.

Hồ sơ chưa ký số, có thể hiện “Chưa được xác minh”. `PayloadOrganization` là nhãn tác giả, không phải chữ ký xác thực. Mỗi lần xuất tạo định danh mới; cài nhiều bản có thể tạo nhiều hồ sơ/icon. Việc lưu tệp và cài hồ sơ là hai thao tác riêng.

Không gửi XML/icon/form lên máy chủ, không analytics, không API. Trang vẫn tải các tài nguyên website từ GitHub Pages. Clipboard là cơ chế chuyển dữ liệu sang Shortcuts trên thiết bị. Sau khi chuyển app, không chép nội dung khác trước khi phím tắt đọc đầu vào.

Không thể đảm bảo tuyệt đối không giật như native trên mọi máy. Hiệu ứng sóng chỉ chạy trên chữ tác giả khi trong màn hình, dừng lúc ẩn và khi bật Giảm chuyển động.

## Kiểm tra

Đã kiểm tra tự động serializer plist, tiếng Việt/emoji, scheme/website, icon PNG và giao thức clipboard văn bản thuần; kiểm tra trạng thái sao chép thành công/thất bại, thứ tự sao chép trước khi mở Shortcuts, form lỗi và nguồn cache trong môi trường mô phỏng.

Chưa kiểm thử luồng chuyển app, bảng quyền clipboard, lưu iCloud hoặc cài hồ sơ trên iPhone thật. Cần thử với phím tắt của bạn để xác nhận các bước cuối.

Khi sửa tài nguyên, tăng `VERSION` trong `sw.js`; cập nhật `APP_VERSION` trong `modules/config.js` nếu đổi phiên bản. Không dùng service worker cũ cho mã đã thay đổi.
