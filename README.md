# .mobileconfig · Sentechtipsvn — v3.0.0

Website tĩnh cho GitHub Pages, giao diện gọn màu `#5c5c5c`, Neumorphism nổi từ góc trên trái xuống dưới phải. Tạo XML plist trên thiết bị rồi gửi **toàn bộ văn bản thuần** sang phím tắt **Lưu cấu hình**. Phím tắt phụ trách đặt tên tệp, tạo `.mobileconfig`, menu chọn thư mục và lưu iCloud Drive.

## Thay đổi trong bản này

- Xuất bằng `input=text&text=…`, không đọc/ghi clipboard và không gọi bảng chia sẻ.
- Chuyển sang Shortcuts ngay trong thao tác nhấn nút; không chờ xử lý ảnh hay một tác vụ bất đồng bộ trên đường xuất.
- `FullScreen = true` cho cả website và URL scheme, thay cho bản cũ đặt `false` với scheme; thêm `IgnoreManifestScope = true`.
- Hàng nút cuộn ngang: WebClip, Wi-Fi, DNS, VPN, Tài khoản, Chứng chỉ, Quản lý thiết bị. Mỗi mục có form và builder thực tế.
- Nút **Dán URL / mở hồ sơ** ngay dưới nút xuất mở popup hai chế độ.
- Nút tải tệp dự phòng nằm trong Trợ giúp; các thông tin dài được thu gọn ở đó.

## Luồng xuất trực tiếp sang Shortcuts

1. Chọn loại cấu hình, nhập tên, thông tin cần thiết và mô tả tùy chọn.
2. Với WebClip, chọn icon nếu muốn. Ảnh được chuyển PNG trước; nút xuất chờ ảnh sẵn sàng.
3. Nhấn **Xuất cấu hình**. Website tạo XML và mở URL:

```text
shortcuts://run-shortcut?name=L%C6%B0u%20c%E1%BA%A5u%20h%C3%ACnh&input=text&text=XML_DA_MA_HOA_URL
```

Phần `text` được tạo bằng `encodeURIComponent(xml)`. Shortcuts tự giải mã tham số URL và nhận XML nguyên bản, gồm cả xuống dòng, tiếng Việt, `&`, `%` và nội dung icon/chứng chỉ. Không đóng gói JSON, không base64 toàn bộ văn bản, không gửi URL blob. Base64 trong thẻ `<data>` của plist vẫn cần cho icon/chứng chỉ theo cấu trúc hồ sơ.

Không có bước đọc bảng nhớ tạm trong website. Phím tắt cũng cần bỏ các hành động **Lấy bảng nhớ tạm** của luồng cũ và dùng **Đầu vào phím tắt**. Nếu iOS chặn chuyển app, liên kết **Gửi lại sang “Lưu cấu hình”** cho phép nhấn lại với cùng XML. Khi thay thông tin, liên kết cũ được ẩn để tránh xuất nhầm dữ liệu.

Website không thể kiểm tra phím tắt có tồn tại hoặc xác nhận việc lưu đã xong, nên không báo “đã lưu”. Việc chuyển app vẫn có thể cần xác nhận của iOS.

### Phím tắt bạn tự xây dựng

Tên mặc định chính xác: **Lưu cấu hình**. Đổi tên tại `SHORTCUT_NAME` trong `modules/config.js` nếu tên phím tắt của bạn khác.

1. Lấy **Đầu vào phím tắt** dưới dạng **Văn bản** và giữ trong biến, ví dụ `NoiDungCauHinh`.
2. Có thể kiểm tra đầu vào có `<?xml` và `<plist version="1.0">`; nếu thiếu thì dừng. Đây chỉ là kiểm tra sơ bộ.
3. **Hỏi đầu vào** để đặt tên, ví dụ `Sentechtipsvn.mobileconfig`.
4. Loại `/` khỏi tên, không nhận tên rỗng; thêm `.mobileconfig` một lần nếu chưa có.
5. Dùng **XML gốc trong biến** làm nội dung tệp, rồi **Đặt tên** bằng tên đã hỏi. Không dùng kết quả hỏi tên làm nội dung.
6. **Chọn từ menu** các thư mục iCloud Drive đã thiết lập.
7. **Lưu tệp** ở thư mục của nhánh đã chọn. Với thư mục cố định, tắt **Hỏi nơi lưu** trong hành động này.
8. Tự xử lý khi trùng tên theo ý bạn: hỏi ghi đè, thêm số hoặc thời gian.

Tệp cuối cùng chứa XML UTF-8 và có đuôi `.mobileconfig`, không phải `.mobileconfig.txt`. Không giải mã JSON/base64 hoặc mã hóa URL lần nữa ở Shortcuts. Đổi tên tệp không đổi tên hiển thị trong hồ sơ.

### XML lớn và giới hạn URL

Đưa toàn bộ XML vào URL làm URL dài hơn, nhất là khi có ảnh/chứng chỉ. Apple không công bố một giới hạn chung bảo đảm cho mọi đường chuyển URL trên iOS. Liên kết quá dài có thể không được chuyển hoặc nhận đầy đủ. Website **không cắt nội dung**; thông báo khi URL vượt 60.000 ký tự chỉ là gợi ý của ứng dụng, không phải giới hạn chính thức.

Nếu phím tắt mở nhưng không nhận đầu vào, hãy kiểm tra biến Đầu vào phím tắt trước. Với XML lớn, dùng icon đơn giản hơn hoặc **Tải tệp .mobileconfig dự phòng** trong Trợ giúp. Nút dự phòng tạo Blob để tải trực tiếp; iOS quyết định luồng tải/nhận hồ sơ. Không tự chuyển về clipboard.

## Các loại cấu hình hiện có

Mỗi lần xuất tạo một hồ sơ cho **mục đang chọn**, không tự gộp toàn bộ tab. Dữ liệu các tab giữ trong bộ nhớ khi chuyển tab; tên và mô tả dùng chung. Đóng/tải lại trang sẽ xóa thông tin đã nhập.

| Mục | Payload / phạm vi |
| --- | --- |
| WebClip | `com.apple.webClip.managed`: tên, website hoặc URL scheme, icon PNG 180 × 180, cho phép gỡ |
| Wi-Fi | `com.apple.wifi.managed`: SSID, WPA2/WPA3 hoặc mạng mở, mật khẩu, tự kết nối, mạng ẩn |
| DNS | `com.apple.dnsSettings.managed`: DoH hoặc DoT, IP tùy chọn, tên miền áp dụng tùy chọn |
| VPN | `com.apple.vpn.managed`: IKEv2 với tài khoản EAP, máy chủ, Remote/Local Identifier, mật khẩu tùy chọn |
| Tài khoản | `com.apple.mail.managed`: Mail IMAP + SMTP dùng SSL/TLS; hỏi mật khẩu khi cài tương tác |
| Chứng chỉ | `com.apple.security.pem`: một chứng chỉ công khai X.509 PEM/DER, chuẩn hóa thành PEM |
| Quản lý thiết bị | `com.apple.mobiledevice.passwordpolicy`: độ dài mật mã, cho phép mật mã đơn giản, yêu cầu chữ/số |

Wi-Fi: SSID tối đa 32 byte UTF-8. Mật khẩu WPA2/WPA3 8–63 ký tự ASCII; WPA2 còn nhận khóa hex 64 ký tự. Mạng mở không chứa khóa Password trong XML. Chưa có mẫu Wi-Fi Enterprise/EAP.

DNS: DoH cần URL HTTPS, DoT cần tên máy chủ. IP nhận IPv4/IPv6; mỗi dòng một địa chỉ. Tên miền nhận dạng `example.com` hoặc `*.example.com`; bỏ trống áp dụng mọi miền. Mẫu này dùng payload XML truyền thống cho iOS 14 trở lên; Apple đánh dấu payload này deprecated từ iOS 27 và định hướng declarative management. Deprecated không tự đồng nghĩa bị loại bỏ; cần kiểm thử lại khi dùng phiên bản hệ điều hành mới.

VPN: máy chủ thực tế phải hỗ trợ IKEv2/EAP và thông số do nhà cung cấp cấp. Không dùng URL website làm địa chỉ máy chủ. Mẫu chưa hỗ trợ mọi nhà cung cấp, WireGuard/OpenVPN hay xác thực bằng chứng chỉ. Local Identifier/Remote Identifier nhập đúng thông tin dịch vụ; không tự suy đoán từ tên WebClip.

Mail: không ghi IncomingPassword/OutgoingPassword vào hồ sơ chưa mã hóa. Khi cài tương tác, iOS hỏi mật khẩu dùng cho cả hai máy chủ. Nhà cung cấp yêu cầu OAuth hay giao thức khác cần mẫu riêng.

Chứng chỉ: tối đa 64 KB; chỉ nhận một chứng chỉ công khai, không nhận khóa riêng, PKCS#12 hoặc chuỗi nhiều chứng chỉ. Kiểm tra cấu trúc X.509 cơ bản và chuyển định dạng, không xác minh chữ ký, thời hạn hoặc độ tin cậy. Cài chứng chỉ không tự cấp mọi mức tin cậy SSL.

Quản lý thiết bị hiện là **chính sách mật mã**, không phải đăng ký MDM hay quản trị từ xa. Đăng ký MDM cần máy chủ, chứng chỉ định danh, APNs topic và quy trình do nhà quản trị cấp; web tĩnh không tự sinh các thành phần đó. Có thể dùng popup **Mở tệp .mobileconfig** để mở link HTTPS của hồ sơ MDM đã được máy chủ quản lý cung cấp. Mẫu mật mã không thêm giới hạn số lần sai hay lệnh xóa thiết bị.

## WebClip URL scheme và việc mở Safari

Bản này xuất `FullScreen = true` với mọi WebClip và `IgnoreManifestScope = true`. Đây là sửa lỗi cấu hình của bản trước, không phải cơ chế bảo đảm bỏ qua Safari hay hộp xác nhận hệ thống với mọi scheme.

Hồ sơ cài thủ công không thể ép ứng dụng bất kỳ mở thẳng hoặc bỏ hộp “Mở trong Facebook?”. Apple quy định khóa `TargetApplicationBundleIdentifier` chỉ dùng khi cài hồ sơ qua MDM. Vì vậy mã không chèn bundle ID giả để hứa hẹn mở thẳng.

Scheme phải được ứng dụng đích hỗ trợ và ứng dụng phải đã cài. Với phím tắt, nhập ví dụ `shortcuts://run-shortcut?name=Ten%20phim%20tat`. Với app khác, dùng đúng scheme do app cung cấp. iOS và app đích quyết định chuyển hướng. Nếu cần biểu tượng chạy phím tắt trên Màn hình chính theo luồng của Shortcuts, dùng chức năng **Thêm vào Màn hình chính** của chính phím tắt.

**Hồ sơ đã cài không tự thay đổi khi website cập nhật.** Để kiểm tra bản sửa scheme, gỡ đúng hồ sơ WebClip cũ trong Cài đặt rồi tạo/cài lại hồ sơ mới. Mỗi lần xuất có UUID mới; cài nhiều bản có thể tạo nhiều hồ sơ/icon.

## Popup dán URL

- **Điền vào WebClip**: nhận website hoặc scheme, chuyển tab về WebClip và điền URL. URL này sẽ nằm trong payload khi bạn xuất.
- **Mở tệp .mobileconfig**: nhận URL HTTPS của tệp đã có trên máy chủ và mở URL đó. Không tải lên, không nối thêm nội dung, không đọc/sửa XML từ xa. Đây là link truy cập hồ sơ đã được lưu/host sẵn.

Không nhận đường dẫn nội bộ kiểu `/private/var/mobile/...` hay `file://`. URL HTTPS không nhất thiết kết thúc bằng `.mobileconfig` vì máy chủ có thể trả tệp qua endpoint; máy chủ phải trả đúng tệp/MIME. GitHub Pages không có mã backend để ghi tệp được tạo lên repository từ trình duyệt.

## Đưa lên GitHub Pages / cập nhật bản cũ

1. Giải nén ZIP, đưa **nội dung bên trong** thư mục `sentechtipsvn-webclip` vào thư mục gốc repository.
2. Giữ cùng cấp: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`. Đưa lên toàn bộ `modules/`, `icons/`, `launch/` và README.
3. Với bản cũ, thay cả thư mục `modules/`, gồm các tệp mới `catalog.js`, `builders.js`, `certificates.js`; thiếu module sẽ làm ứng dụng ngừng chạy.
4. Trong **Settings → Pages**, chọn **Deploy from a branch → main → /(root) → Save**.
5. Mở URL HTTPS qua Safari, dùng **Thêm vào Màn hình chính** để chạy công cụ standalone.
6. Đóng hẳn các cửa sổ/WebClip đang mở, mở lại online để nhận service worker `v3.0.0`. Bản tải xong có thể cần đóng rồi mở lại lần nữa. Cập nhật website và cài lại hồ sơ WebClip là hai việc riêng.

Không cần npm/framework/API/build. Đường dẫn tương đối hỗ trợ domain gốc và `/ten-repository/`. Các tệp trong `modules/` là ES modules, không chạy trực tiếp bằng `file://`.

Chạy thử ở thư mục chứa `index.html`:

```sh
python3 -m http.server 8080
```

Mở `http://localhost:8080/` trên máy tính. Dùng URL HTTPS trên iPhone để bật service worker. Phím tắt vẫn phải được bạn tạo trên thiết bị.

## Cấu trúc để tái sử dụng

| Tệp | Trách nhiệm |
| --- | --- |
| `index.html` | Khung giao diện, tab, popup, trợ giúp, metadata iOS |
| `styles.css` | Neumorphism, pill, tab cuộn ngang, safe-area, sóng tác giả |
| `app.js` | Nối form với builder, dữ liệu tab, xuất, popup, trạng thái |
| `modules/config.js` | Tác giả, tên phím tắt, icon mặc định, phiên bản |
| `modules/catalog.js` | Danh mục loại cấu hình, định nghĩa field, mặc định, điều kiện hiện field |
| `modules/builders.js` | Kiểm tra dữ liệu và xây payload cho từng loại |
| `modules/profile.js` | Serializer plist, phong bì hồ sơ, payload WebClip, UUID |
| `modules/validation.js` | Kiểm tra văn bản XML và URL/scheme |
| `modules/icons.js` | Đọc/cắt giữa ảnh, tạo PNG 180 × 180 |
| `modules/certificates.js` | Nhận PEM/DER công khai và chuẩn hóa PEM |
| `modules/shortcuts.js` | Tạo URL `input=text`, mở Shortcuts đồng bộ |
| `modules/platform.js` | Offline, sóng tác giả, công cụ WebMCP tùy chọn |
| `sw.js` | Cache tài nguyên theo repository và phiên bản |

Để thêm loại mới: thêm mục ở CATALOG, nút tab trong HTML và builder tương ứng. Builder tạo payload theo tài liệu Apple rồi gọi `createConfigurationProfile({displayName, description, payloads})`. Hàm này hỗ trợ nhiều payload, nhưng UI hiện xuất một tab một lần. Dùng `PlistData` cho dữ liệu base64 nhị phân. Nếu thêm module, đưa vào ASSETS trong service worker. Tăng `VERSION` của `sw.js` và `APP_VERSION` khi phát hành thay đổi.

Tác giả hồ sơ luôn là **Sentechtipsvn**, độc lập với tên tệp do Shortcuts đặt. Đây là nhãn tác giả, không phải chữ ký xác thực.

## Thay ảnh

| Vị trí | Tệp / mã |
| --- | --- |
| Icon mặc định của form và hồ sơ | `icons/default-webclip.png` — PNG vuông, nên 180 × 180 |
| Icon công cụ trên Màn hình chính iOS | `icons/apple-touch-icon.png` — 180 × 180 |
| Icon trong manifest | `icons/icon-192.png`, `icons/icon-512.png` |
| Icon maskable | `icons/icon-maskable-512.png` — 512 × 512, giữ hình chính trong vùng an toàn |
| Logo nhỏ ở tiêu đề | SVG `.brand-mark` trong `index.html` |
| Ảnh khởi động iOS | `launch/`, đúng tên kích thước/hướng |

Ảnh người dùng chọn chỉ ở trong bộ nhớ/XML, không ghi đè icon mặc định. Nhận PNG/JPG/WebP tối đa 10 MB, 24 megapixel, cắt giữa, tạo PNG 180 × 180; nền trong suốt được đặt trên `#5c5c5c`. HEIC cần đổi PNG/JPG trước.

## Offline và dữ liệu

Có manifest standalone, thẻ iOS, apple-touch-icon, ảnh khởi động cho một số màn hình, safe-area và font hệ thống. Sau lần mở online thành công, mã và icon được cache để tạo XML offline. iOS có thể xóa cache khi thiếu dung lượng. Hiệu ứng chữ tác giả dừng khi ẩn/ngoài màn hình; Giảm chuyển động sẽ tắt hiệu ứng.

Trang không gửi XML/form/icon/chứng chỉ lên máy chủ, không analytics và không lưu lịch sử form. Tài nguyên ứng dụng được tải từ GitHub Pages; khi mở link hồ sơ bên ngoài, trình duyệt truy cập máy chủ của link đó. XML chuyển trực tiếp trong URL sang Shortcuts và có thể chứa mật khẩu Wi-Fi/VPN bạn đã nhập. Hồ sơ chưa ký số/chưa mã hóa; iOS có thể hiện “Chưa được xác minh”.

URL nhận HTTP/HTTPS và scheme như `zalo://`, `shortcuts://`, `tel:`, `sms:`, `mailto:`, kể cả scheme không có đường dẫn. Website được chuẩn hóa, scheme khác giữ nguyên sau khi bỏ khoảng trắng đầu/cuối. Không nhận khoảng trắng bên trong (dùng `%20`), escape `%` sai, thông tin đăng nhập, ký tự XML không hợp lệ hoặc scheme script/tệp nội bộ.

## Kiểm tra và tài liệu

Đã kiểm tra tự động 21 hồ sơ thuộc 7 loại, 10 dạng URL, tiếng Việt/emoji, XML escaping, kiểu dữ liệu plist, UUID, chứng chỉ PEM/DER, giữ nguyên XML sau truyền URL, cả XML lớn. Dùng Python plistlib độc lập để đọc lại hồ sơ. Đã kiểm tra form lỗi, tab/field có điều kiện, giữ dữ liệu giữa tab, popup hai chế độ, điều hướng đồng bộ/retry, xử lý icon/chứng chỉ và cache phạm vi repository trong môi trường mô phỏng DOM/OS.

**Chưa thử trên iPhone thật** việc mở app, nhận XML dài, lưu iCloud, cài hồ sơ hoặc kết nối dịch vụ Wi-Fi/DNS/VPN/Mail. Các bước này phụ thuộc phím tắt, phiên bản iOS và dịch vụ thực tế của bạn.

Tài liệu chính thức dùng cho các mẫu:

- [Shortcuts URL scheme](https://support.apple.com/guide/shortcuts/apd624386f42/ios)
- [WebClip](https://developer.apple.com/documentation/devicemanagement/webclip)
- [Wi-Fi](https://developer.apple.com/documentation/devicemanagement/wifi)
- [DNSSettings](https://developer.apple.com/documentation/devicemanagement/dnssettings)
- [DNSSettings dictionary](https://developer.apple.com/documentation/devicemanagement/dnssettings/dnssettings-data.dictionary)
- [VPN](https://developer.apple.com/documentation/devicemanagement/vpn)
- [IKEv2 dictionary](https://developer.apple.com/documentation/devicemanagement/vpn/ikev2-data.dictionary)
- [Mail](https://developer.apple.com/documentation/devicemanagement/mail)
- [CertificatePEM](https://developer.apple.com/documentation/devicemanagement/certificatepem)
- [Passcode](https://developer.apple.com/documentation/devicemanagement/passcode)
- [MDM](https://developer.apple.com/documentation/devicemanagement/mdm)
