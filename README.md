![.mobileconfig Banner](https://capsule-render.vercel.app/api?type=waving&height=300&color=gradient&section=header&reversal=false&text=.mobileconfig&textBg=false&fontColor=D5D5D5&fontSize=70&fontAlign=50&fontAlignY=50&rotate=0&strokeWidth=0&descSize=20&descAlign=50&descAlignY=60)
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=300&color=gradient&section=header&reversal=false&text=.mobileconfig&textBg=false&fontColor=D5D5D5&fontSize=70&fontAlign=50&fontAlignY=50&rotate=0&strokeWidth=0&descSize=20&descAlign=50&descAlignY=60" alt=".mobileconfig banner" />
</div>

<div align="center">
  <a href="Language/en.md"><img src="https://img.shields.io/badge/🇺🇸_English-0969DA?style=flat-square" alt="English"></a>
  &nbsp;
  <a href="Language/vi.md"><img src="https://img.shields.io/badge/🇻🇳_Tiếng_Việt-DA251D?style=flat-square" alt="Tiếng Việt"></a>
</div>

<br>

Static website for GitHub Pages, featuring a minimalist `#5c5c5c` UI with Neumorphism effects popping from the top-left to the bottom-right. It generates an XML plist on the device and sends the **entire plain text** to the **Save Configuration (Lưu cấu hình)** shortcut. The shortcut is responsible for file naming, `.mobileconfig` creation, folder selection menu, and saving to iCloud Drive.

> **Note:** Please choose your preferred language above to read the full documentation. / *Vui lòng chọn ngôn ngữ ở trên để đọc toàn bộ tài liệu.*

## Changes in this release

- Exports via `input=text&text=…`, eliminating clipboard read/write operations and the share sheet.
- Transitions to Shortcuts immediately upon button press; no waiting for image processing or asynchronous tasks during the export pipeline.
- Sets `FullScreen = true` for both websites and URL schemes (replacing the previous `false` setting for schemes); added `IgnoreManifestScope = true`.
- Horizontal scrolling button row: WebClip, Wi-Fi, DNS, VPN, Account, Certificate, Device Management. Each item features a dedicated form and actual builder.
