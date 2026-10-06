# WebClip Studio · Sentechtipsvn

Bộ mã nguồn tĩnh để tạo tệp `.mobileconfig` có một WebClip iOS. Không cần npm, API, máy chủ ứng dụng hoặc bước build.

## Đưa lên GitHub Pages

1. Giải nén ZIP. Tạo repository GitHub của bạn.
2. Đưa **nội dung bên trong** thư mục `sentechtipsvn-webclip` vào thư mục gốc repository: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, các thư mục `icons`, `launch`, `README.md` và `.nojekyll`. Không chỉ tải nguyên tệp ZIP lên repository.
3. Vào **Settings → Pages → Build and deployment**.
4. Chọn **Deploy from a branch**, nhánh **main**, thư mục **/(root)**, rồi **Save**.
5. Chờ GitHub triển khai và mở URL được hiển thị trong Pages. Với repository dự án, URL thường có dạng `https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/`.

Tất cả đường dẫn tài nguyên và scope đều tương đối. Bộ mã dùng được cả domain gốc, tên miền riêng và đường dẫn repository. Nếu đổi chỗ các tệp hoặc tên thư mục, cần sửa liên kết tương ứng.

Hướng dẫn chính thức: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Thêm công cụ vào Màn hình chính iOS

Mở URL **HTTPS bằng Safari**, nhấn **Chia sẻ → Thêm vào Màn hình chính → Thêm**. Mở lại bằng icon vừa tạo để dùng chế độ độc lập, không có thanh địa chỉ Safari.

Trang có manifest, các thẻ meta iOS, apple-touch-icon PNG, ảnh khởi động cho một số kích thước iPhone/iPad phổ biến, màu giao diện hệ thống, vùng safe-area và cache offline. Các kích thước khác dùng giao diện khởi động mặc định của iOS. Ảnh khởi động chỉ được iOS dùng khi thiết bị và trình duyệt hỗ trợ, không phải cơ chế đảm bảo hiệu năng.

Mở online ít nhất một lần để tải cache. Khi thấy **Sẵn sàng dùng offline**, bạn có thể mở lại công cụ và tạo tệp không cần mạng. iOS có thể xóa dữ liệu cache khi thiếu dung lượng hoặc khi bạn xóa dữ liệu website; khi đó mở lại online. Website đích của WebClip vẫn cần mạng nếu chính nó không hỗ trợ offline.

## Tạo và lưu tệp

1. Nhập tên hiển thị và URL đầy đủ bắt đầu bằng `https://` hoặc `http://`.
2. Điền mô tả nếu muốn. **Tác giả luôn là Sentechtipsvn**, không có ô chỉnh tác giả.
3. Chọn ảnh PNG/JPG/WebP tối đa 10 MB, 24 megapixel. HEIC không được nhận trực tiếp: xuất/chuyển ảnh thành JPG hoặc PNG trước. Nếu không chọn ảnh, dùng icon mặc định.
4. Ảnh được cắt vuông từ tâm, thu nhỏ thành PNG 180 × 180 và nhúng vào hồ sơ. Phần trong suốt được đặt trên nền `#5c5c5c`. iOS tự bo góc icon.
5. Nhấn **Tạo & lưu vào Tệp**. Nếu trình duyệt cho chia sẻ tệp `.mobileconfig`, chọn **Lưu vào Tệp** và chọn thư mục.
6. Nếu không có hỗ trợ chia sẻ định dạng này, trang yêu cầu tải tệp xuống. Có thể chủ động nhấn **Tải xuống .mobileconfig**. Kiểm tra mục Tải về của Safari/Tệp. Một số phiên bản iOS mở bản xem trước hoặc chuyển sang luồng nhận hồ sơ thay vì tải thông thường; thử lại trong Safari khi cần.

Website không thể tự chọn thư mục, tự xác nhận lưu hay tự cài hồ sơ. Bảng chia sẻ đóng không có nghĩa người dùng đã lưu: bạn có thể đã chọn ứng dụng khác hoặc hủy thao tác.

## Cài hồ sơ và mở WebClip

Lưu tệp và cài hồ sơ là hai thao tác khác nhau. Tệp trong ứng dụng Tệp có thể chỉ được xem trước, tùy phiên bản iOS. Apple hỗ trợ nhận hồ sơ từ website hoặc thư điện tử và cài qua Cài đặt; bạn cũng có thể dùng Apple Configurator trên máy tính. Nếu cần cài từ website, đưa tệp `.mobileconfig` đã tạo lên một URL HTTPS rồi mở URL đó bằng Safari. **Trang này không tự tải hồ sơ của bạn lên GitHub.**

Sau khi iOS nhận hồ sơ, mở **Cài đặt → Hồ sơ đã tải về**, hoặc **Cài đặt chung → VPN & Quản lý thiết bị**, chọn hồ sơ và làm theo hướng dẫn. Một số thiết bị do tổ chức quản lý có thể hạn chế cài hồ sơ.

Hồ sơ tạo ra là XML plist **chưa ký số**, nên iOS có thể hiện “Chưa được xác minh”. `PayloadOrganization = Sentechtipsvn` là nhãn tác giả; muốn hồ sơ được xác minh cần chứng chỉ và quy trình ký riêng.

Mỗi lần xuất tạo UUID và định danh hồ sơ mới. Nếu cài nhiều lần, có thể có nhiều WebClip/hồ sơ; gỡ bản cũ trước khi cài bản thay thế nếu không muốn trùng.

Tài liệu Apple: https://support.apple.com/en-ca/102400

## Thành phần cấu hình

| Khóa | Giá trị |
| --- | --- |
| `PayloadType` ngoài cùng | `Configuration` |
| `PayloadType` WebClip | `com.apple.webClip.managed` |
| `PayloadVersion` | Số nguyên `1` |
| `PayloadOrganization` | `Sentechtipsvn` ở cả hồ sơ và payload |
| `Label` | Tên đã nhập |
| `URL` | URL đã kiểm tra và chuẩn hóa |
| `Icon` | Dữ liệu PNG nhúng bằng base64 |
| `FullScreen` | `true` |
| `IgnoreManifestScope` | `true` |
| `Precomposed` | `true` |
| `IsRemovable` | `true` |
| `PayloadRemovalDisallowed` | `false` |

URL chỉ nhận HTTP/HTTPS, không chứa thông tin đăng nhập. Ký tự XML trong tên, mô tả và URL được escape; ký tự điều khiển không hợp lệ bị từ chối. Tên tệp được chuyển thành dạng an toàn.

Tài liệu payload: https://developer.apple.com/documentation/devicemanagement/webclip

## Hiệu năng và giới hạn

Nền và tất cả bề mặt/nút dùng `#5c5c5c`. Chữ và bóng dùng sắc sáng/tối để đọc được và tạo hiệu ứng Neumorphism: sáng phía trên trái, bóng tối phía dưới phải. Các ô nhập có bo tròn dạng viên thuốc; ô mô tả nhiều dòng bo tròn phù hợp chiều cao.

Không có font tải ngoài, CDN, framework, animation nền, blur/backdrop-filter hoặc xử lý trên mỗi sự kiện cuộn. Chuyển động nút chỉ ngắn và tắt khi người dùng bật Giảm chuyển động. Input dùng cỡ 16 px để giảm việc Safari tự zoom. Không chặn zoom trợ năng và không khóa cuộn khi bàn phím xuất hiện.

Không thể đảm bảo “không giật 100% như app native” trên mọi thiết bị. Hiệu năng phụ thuộc iOS/WebKit, bộ nhớ, ảnh nhập và website đích. `FullScreen` không biến website đích thành app native và không thể tăng tốc trang bên ngoài.

Tên, URL, mô tả và ảnh được xử lý trong bộ nhớ thiết bị, không gửi đến máy chủ của công cụ. Không có analytics, không lưu lịch sử form. Khi đóng/tải lại trang, biểu mẫu bắt đầu lại. Service worker chỉ lưu mã giao diện và icon ứng dụng. Khi triển khai GitHub Pages, các tài nguyên website vẫn được tải từ GitHub như một trang web thông thường.

## Cập nhật mã nguồn

Sau khi sửa HTML/CSS/JS/manifest/icon, tăng `VERSION` trong `sw.js`, ví dụ từ `v1.0.0` thành `v1.0.1`, rồi đưa mã lên GitHub. Service worker mới chờ các cửa sổ/phiên ứng dụng cũ đóng để không trộn tài nguyên hai phiên bản. Đóng hẳn app, mở lại online; có thể cần đóng và mở lại lần nữa sau khi bản cập nhật đã tải xong.

Ảnh khởi động không nằm trong cache offline để giữ bộ nhớ cache nhẹ. Cache được phân biệt theo đường dẫn repository, không xóa cache của ứng dụng khác.

## Chạy thử trên máy tính

Tại thư mục chứa `index.html`:

```sh
python3 -m http.server 8080
```

Mở `http://localhost:8080/`. Không dùng `file://` để kiểm tra service worker. Khi thử trực tiếp trên iPhone, dùng URL HTTPS; địa chỉ HTTP trong mạng LAN thường không bật service worker.

Kiểm tra thực tế: tên tiếng Việt/emoji, URL có `&`, ảnh ngang/dọc, hủy chia sẻ, tải tệp, mở từ Màn hình chính, xoay màn hình, nhập khi bàn phím mở và mở lại sau khi tắt mạng. Cài hồ sơ trên thiết bị iOS thật để xác nhận hành vi cuối cùng.

## Các tệp

- `index.html`: giao diện, metadata iOS và liên kết tài nguyên.
- `styles.css`: Neumorphism, responsive, safe-area và trợ năng.
- `app.js`: xác thực form, icon PNG, xuất plist, chia sẻ/tải tệp.
- `manifest.webmanifest`: khai báo ứng dụng Màn hình chính.
- `sw.js`: cache offline và cập nhật theo phiên bản.
- `icons/`: icon ứng dụng PNG, gồm icon maskable.
- `launch/`: ảnh khởi động iOS cho các màn hình phổ biến.
- `.nojekyll`: phục vụ tệp tĩnh trên GitHub Pages.

## Kiểm tra đã thực hiện

Đã kiểm tra cú pháp JavaScript; chạy luồng nhập liệu, xử lý PNG và chia sẻ thành công/hủy/lỗi bằng môi trường mô phỏng DOM có canvas; phân tích tệp xuất bằng `plistlib`; xác nhận UUID, tiếng Việt/emoji và icon PNG nhúng; kiểm tra danh sách tài nguyên HTML/manifest và logic cache/service worker trong môi trường mô phỏng. WebMCP là tích hợp tùy chọn: đã kiểm tra handler bằng registry mô phỏng, chưa kiểm tra trong trình duyệt hỗ trợ WebMCP thật.

Chưa có kiểm thử giao diện trong Safari/iPhone thật hoặc cài hồ sơ trên thiết bị. Các bài kiểm tra trên không xác nhận tốc độ khung hình, bàn phím iOS hoặc việc lưu/cài hồ sơ trên một phiên bản iOS cụ thể.

Tác giả: **Sentechtipsvn**.
