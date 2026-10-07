# .mobileconfig - Sentechtipsvn — v1.1.0

Static website for GitHub Pages, featuring a minimalist `#5c5c5c` UI with Neumorphism effects popping from the top-left to the bottom-right. It generates an XML plist on the device and sends the **entire plain text** to the **Save Configuration (Lưu cấu hình)** shortcut. The shortcut is responsible for file naming, `.mobileconfig` creation, folder selection menu, and saving to iCloud Drive.

## Changes in this release

- Exports via `input=text&text=…`, eliminating clipboard read/write operations and the share sheet.
- Transitions to Shortcuts immediately upon button press; no waiting for image processing or asynchronous tasks during the export pipeline.
- Sets `FullScreen = true` for both websites and URL schemes (replacing the previous `false` setting for schemes); added `IgnoreManifestScope = true`.
- Horizontal scrolling button row: WebClip, Wi-Fi, DNS, VPN, Account, Certificate, Device Management. Each item features a dedicated form and actual builder.
- The **Paste URL / open profile** button is located right below the export button, opening a dual-mode popup.
- The backup file download button is now in the Help section; lengthy information has been collapsed there.

## Direct Export Flow to Shortcuts

1. Select the configuration type, enter the name, required information, and an optional description.
2. For WebClips, choose an icon if desired. The image is converted to PNG beforehand; the export button waits until the image is ready.
3. Tap **Export Configuration**. The website generates the XML and opens the URL:

```text
shortcuts://run-shortcut?name=L%C6%B0u%20c%E1%BA%A5u%20h%C3%ACnh&input=text&text=URL_ENCODED_XML
```

The `text` parameter is generated using `encodeURIComponent(xml)`. Shortcuts natively decodes the URL parameter and receives the raw XML, including line breaks, Vietnamese characters, `&`, `%`, and icon/certificate content. No JSON wrapping, no base64 encoding for the entire text, and no URL blobs are sent. (Base64 encoding inside the plist `<data>` tags is still required for icons/certificates per the profile structure).

There is no clipboard-reading step on the website. Your shortcut also needs to remove the **Get Clipboard** actions from the old workflow and use **Shortcut Input** instead. If iOS blocks the app switch, a **Resend to "Save Configuration"** link allows you to retry with the same XML. When information is modified, the old link is hidden to prevent exporting incorrect data.

The website cannot check if the shortcut exists or confirm that the save is complete, so it does not display a "saved" notification. Switching apps may still require iOS confirmation.

### Your Custom Shortcut Setup

The exact default name: **Lưu cấu hình** (Save Configuration). Change the name at `SHORTCUT_NAME` in `modules/config.js` if your shortcut uses a different name.

1. Get **Shortcut Input** as **Text** and store it in a variable (e.g., `ProfileContent`).
2. Optional: Check if the input contains `<?xml` and `<plist version="1.0">`; stop if missing. This is just a basic validation.
3. **Ask for Input** to name the file (e.g., `Sentechtipsvn.mobileconfig`).
4. Remove `/` from the name, reject empty names; append `.mobileconfig` once if it is not present.
5. Use the **Original XML in the variable** as the file content, then **Set Name** using the prompted name. Do not use the prompted name as the file content.
6. **Choose from Menu** for configured iCloud Drive folders.
7. **Save File** in the selected branch's folder. For a fixed folder, toggle off **Ask Where to Save** in this action.
8. Handle duplicate names as you prefer: prompt to overwrite, append numbers, or add timestamps.

The final file contains UTF-8 XML and has a `.mobileconfig` extension, not `.mobileconfig.txt`. Do not decode JSON/base64 or URL-encode it again within Shortcuts. Renaming the file does not change the display name inside the profile.

### Large XML and URL Limits

Including the entire XML in the URL makes it longer, especially when images/certificates are involved. Apple does not publish a universal limit guaranteed for all URL routing on iOS. Excessively long links might not be transferred or received completely. The website **does not truncate the content**; the notification when a URL exceeds 60,000 characters is merely a suggestion based on the app, not an official limit.

If the shortcut opens but receives no input, check the Shortcut Input variable first. For large XMLs, use a simpler icon or the **Download backup .mobileconfig file** option in the Help section. The backup button creates a Blob for direct downloading; iOS handles the profile download/receipt flow. Do not manually fallback to the clipboard.

## Available Configuration Types

Each export generates a profile for the **currently selected item**; it does not automatically merge all tabs. Tab data is kept in memory when switching tabs; the name and description are shared. Closing or reloading the page will clear the entered data.

| Item | Payload / Scope |
| --- | --- |
| WebClip | `com.apple.webClip.managed`: name, website or URL scheme, 180 × 180 PNG icon, removable |
| Wi-Fi | `com.apple.wifi.managed`: SSID, WPA2/WPA3 or Open network, password, auto-join, hidden network |
| DNS | `com.apple.dnsSettings.managed`: DoH or DoT, optional IPs, optional match domains |
| VPN | `com.apple.vpn.managed`: IKEv2 with EAP account, server, Remote/Local Identifier, optional password |
| Account | `com.apple.mail.managed`: IMAP + SMTP Mail using SSL/TLS; prompts for password during interactive installation |
| Certificate | `com.apple.security.pem`: one X.509 PEM/DER public certificate, normalized to PEM |
| Device Mgmt | `com.apple.mobiledevice.passwordpolicy`: passcode length, allow simple passcode, require alphanumeric |

Wi-Fi: SSID maximum 32 bytes UTF-8. WPA2/WPA3 passwords must be 8–63 ASCII characters; WPA2 also accepts a 64-character hex key. Open networks do not include the Password key in the XML. Wi-Fi Enterprise/EAP templates are not yet available.

DNS: DoH requires an HTTPS URL, DoT requires a hostname. IPs accept IPv4/IPv6; one address per line. Domains accept formats like `example.com` or `*.example.com`; leaving it blank applies to all domains. This template uses the traditional XML payload for iOS 14 and later; Apple marked this payload as deprecated starting in iOS 27, shifting towards declarative management. "Deprecated" does not automatically mean removed; re-testing is required when using newer OS versions.

VPN: The actual server must support IKEv2/EAP and parameters provided by the provider. Do not use a website URL as the server address. The template does not currently support all providers, WireGuard/OpenVPN, or certificate-based authentication. Enter the exact service information for Local Identifier/Remote Identifier; do not infer this from the WebClip name.

Mail: IncomingPassword/OutgoingPassword are not written to unencrypted profiles. During interactive installation, iOS will prompt for the password used for both servers. Providers requiring OAuth or other protocols need custom templates.

Certificate: Maximum 64 KB; only accepts a single public certificate. Does not accept private keys, PKCS#12, or certificate chains. Basic X.509 structure checking and format conversion are performed, but signature, expiration, or trust verification are not. Installing a certificate does not automatically grant all SSL trust levels.

Device Management is currently a **passcode policy**, not MDM enrollment or remote management. MDM enrollment requires a server, identity certificates, APNs topic, and a process provided by the administrator; a static web app cannot generate these components. You can use the **Open .mobileconfig file** popup to open an HTTPS link to an MDM profile provided by a managed server. The passcode template does not add failed attempt limits or remote wipe commands.

## WebClip URL Scheme and Opening Safari

This release exports `FullScreen = true` with all WebClips and `IgnoreManifestScope = true`. This fixes a configuration issue from the previous version; it is not a guaranteed mechanism to bypass Safari or system confirmation prompts for all schemes.

Manually installed profiles cannot force an arbitrary app to open directly or bypass the "Open in Facebook?" prompt. Apple dictates that the `TargetApplicationBundleIdentifier` key is only used when the profile is installed via MDM. Therefore, the code does not inject fake bundle IDs to promise direct opening.

The scheme must be supported by the target app, and the app must be installed. For shortcuts, enter for example `shortcuts://run-shortcut?name=Shortcut%20Name`. For other apps, use the exact scheme provided by the app. iOS and the target app determine the redirection. If you need a shortcut icon on the Home Screen following the Shortcuts native flow, use the shortcut's own **Add to Home Screen** feature.

**Installed profiles do not update automatically when the website is updated.** To test the scheme fix, remove the specific old WebClip profile in Settings, then create/reinstall the new profile. Each export generates a new UUID; installing multiple versions may create multiple profiles/icons.

## Paste URL Popup

- **Fill in WebClip**: Accepts a website or scheme, switches the tab to WebClip, and populates the URL. This URL will be included in the payload when you export.
- **Open .mobileconfig file**: Accepts an HTTPS URL of a file already hosted on a server and opens that URL. It does not upload, append content, or read/edit remote XML. This is a link to access a pre-saved/hosted profile.

It does not accept internal paths like `/private/var/mobile/...` or `file://`. The HTTPS URL does not necessarily have to end in `.mobileconfig` since the server might return the file via an endpoint; the server must return the correct file/MIME type. GitHub Pages does not have backend code to write locally generated files to the repository from the browser.

## Deploying to GitHub Pages / Updating from old version

1. Unzip the file and place the **contents inside** the `sentechtipsvn-webclip` folder into your repository's root directory.
2. Keep at the root level: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`. Upload the entire `modules/`, `icons/`, `launch/` folders, and the README.
3. For older versions, replace the entire `modules/` folder, which includes the new files `catalog.js`, `builders.js`, `certificates.js`; missing modules will break the app.
4. In **Settings → Pages**, select **Deploy from a branch → main → /(root) → Save**.
5. Open the HTTPS URL via Safari and use **Add to Home Screen** to run the tool standalone.
6. Completely close any open windows/WebClips, then open it again online to fetch the `v3.0.0` service worker. Once downloaded, you may need to close and reopen it one more time. Updating the website and reinstalling WebClip profiles are two separate tasks.

No npm/framework/API/build process is required. Relative paths support root domains and `/repository-name/`. Files in `modules/` are ES modules and cannot be run directly via `file://`.

To test locally in the directory containing `index.html`:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/` on your computer. Use the HTTPS URL on your iPhone to activate the service worker. The shortcut must still be created by you on your device.

## Structure for Reuse

| File | Responsibility |
| --- | --- |
| `index.html` | UI framework, tabs, popups, help, iOS metadata |
| `styles.css` | Neumorphism, pills, horizontal scroll tabs, safe-area, author wave effect |
| `app.js` | Connects forms with builders, tab data, export logic, popups, state |
| `modules/config.js` | Author name, shortcut name, default icon, version |
| `modules/catalog.js` | Config type catalog, field definitions, defaults, field visibility conditions |
| `modules/builders.js` | Data validation and payload construction for each type |
| `modules/profile.js` | Plist serializer, profile envelope, WebClip payload, UUIDs |
| `modules/validation.js` | XML and URL/scheme text validation |
| `modules/icons.js` | Read/center-crop images, generate 180 × 180 PNGs |
| `modules/certificates.js` | Parse public PEM/DER and normalize to PEM |
| `modules/shortcuts.js` | Generate `input=text` URL, synchronous Shortcuts opening |
| `modules/platform.js` | Offline state, author wave effect, optional WebMCP tools |
| `sw.js` | Resource caching scoped by repository and version |

To add a new type: add an entry in CATALOG, a tab button in HTML, and a corresponding builder. The builder generates the payload based on Apple documentation and calls `createConfigurationProfile({displayName, description, payloads})`. This function supports multiple payloads, but the UI currently exports one tab at a time. Use `PlistData` for binary base64 data. If you add a module, include it in the ASSETS array within the service worker. Increment the `VERSION` in `sw.js` and `APP_VERSION` when releasing changes.

The profile author is always **Sentechtipsvn**, independent of the filename set by Shortcuts. This is an author label, not a cryptographic signature.

## Replacing Images

| Location | File / Code |
| --- | --- |
| Default form and profile icon | `icons/default-webclip.png` — Square PNG, recommended 180 × 180 |
| Tool icon on iOS Home Screen | `icons/apple-touch-icon.png` — 180 × 180 |
| Manifest icons | `icons/icon-192.png`, `icons/icon-512.png` |
| Maskable icon | `icons/icon-maskable-512.png` — 512 × 512, keep the main graphic within the safe zone |
| Small logo in the header | SVG `.brand-mark` inside `index.html` |
| iOS launch screens | `launch/`, ensure exact dimension/orientation naming |

Images chosen by the user reside only in memory/XML and do not overwrite the default icon. Supports PNG/JPG/WebP up to 10 MB, 24 megapixels, center-cropped, outputting a 180 × 180 PNG; transparent backgrounds are placed on a `#5c5c5c` canvas. HEIC images must be converted to PNG/JPG first.

## Offline and Data

Includes a standalone manifest, iOS meta tags, apple-touch-icon, launch screens for select displays, safe-area support, and system fonts. After a successful online launch, code and icons are cached to generate XML offline. iOS may clear this cache if storage is low. The author text wave effect pauses when hidden/off-screen; Reduce Motion will disable the effect entirely.

The site does not send XML/forms/icons/certificates to any server, uses no analytics, and does not save form history. App resources are loaded from GitHub Pages; when opening external profile links, the browser accesses the server hosting that link. XML is transferred directly via URL to Shortcuts and may contain passwords you entered for Wi-Fi/VPN. Profiles are unsigned/unencrypted; iOS may display "Not Verified".

URLs accept HTTP/HTTPS and schemes like `zalo://`, `shortcuts://`, `tel:`, `sms:`, `mailto:`, even schemes without paths. Websites are normalized; other schemes are kept as-is after trimming leading/trailing whitespace. Does not accept internal spaces (use `%20`), incorrect `%` escapes, login credentials, invalid XML characters, or script/internal file schemes.

## Testing and Documentation

Automated testing was performed on 21 profiles across 7 types, 10 URL formats, Vietnamese text/emojis, XML escaping, plist data types, UUIDs, PEM/DER certificates, XML integrity preservation after URL transmission, and large XML handling. An independent Python plistlib was used to parse back the profiles. Tested form error handling, conditional tabs/fields, data retention between tabs, dual-mode popups, synchronous/retry navigation, icon/certificate processing, and repository-scoped caching in a simulated DOM/OS environment.

**Not yet tested on a real iPhone** regarding app opening, receiving long XMLs, saving to iCloud, installing profiles, or connecting to actual Wi-Fi/DNS/VPN/Mail services. These steps depend on your shortcut setup, iOS version, and actual service providers.

Official documentation used for the templates:

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
