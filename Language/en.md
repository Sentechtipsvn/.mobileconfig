# iOS .mobileconfig Profile Builder

A static website that generates iOS configuration profiles as XML plists on your device. It sends the XML to the **Lưu cấu hình** shortcut, which names and saves a `.mobileconfig` file. You choose the destination folder. The website can run on GitHub Pages without a backend or build step.

## Supported configuration types

Each export creates one profile for the **currently selected tab**.

| Tab | Payload | Function |
| --- | --- | --- |
| WebClip | `com.apple.webClip.managed` | Home Screen icon for a website or URL scheme, with a PNG icon |
| Wi-Fi | `com.apple.wifi.managed` | SSID, WPA2/WPA3 or open network, password, automatic connection |
| DNS | `com.apple.dnsSettings.managed` | DNS-over-HTTPS or DNS-over-TLS |
| VPN | `com.apple.vpn.managed` | IKEv2 connection with EAP credentials |
| Accounts | `com.apple.mail.managed` | IMAP and SMTP mail using SSL/TLS |
| Certificates | `com.apple.security.pem` | One public X.509 certificate, accepting PEM/DER |
| Device management | `com.apple.mobiledevice.passwordpolicy` | Device passcode policy |

## Passing text to Shortcuts

The website opens a URL with this structure:

```text
shortcuts://run-shortcut?name=[SHORTCUT_NAME]&input=text&text=[XML]
```

The shortcut name and XML are encoded with `encodeURIComponent()` when constructing the URL. Shortcuts receives the **complete XML as text** through **Shortcut Input**. No additional URL decoding is needed inside the shortcut.

The default shortcut name is **Lưu cấu hình**. If you rename it, update `SHORTCUT_NAME` in `modules/config.js` to match.

## Building the Lưu cấu hình shortcut

In the **Shortcuts** app, create a new shortcut named **Lưu cấu hình**. Add these actions in order:

1. **Get Text from Input:** set the source to **Shortcut Input**.
2. **Set Variable:** store the result from step 1 in a variable named `XML`. This preserves the profile content.
3. **Ask for Input:** select **Text** and ask “File name, without the extension”. For example, enter `DNSProfile`. Do not leave the name empty or include `/`.
4. **Set Variable:** store the answer in a variable named `FileName`.
5. **Text:** insert the `FileName` variable, then type `.mobileconfig` directly after it. Example result: `DNSProfile.mobileconfig`.
6. **Set Variable:** store the result from step 5 in a variable named `FullFileName`.
7. **Set Name:** explicitly select **the `XML` variable as the input** and `FullFileName` as the name. This creates a file containing the XML with a name ending in `.mobileconfig`.
8. **Save File:** use **the output of Set Name** from step 7 as the input, then configure the destination as described below.

**Destination folder options:**

- **Choose each time:** enable **Ask Where to Save**. You select a folder in Files, such as iCloud Drive or On My iPhone.
- **Use a fixed folder:** disable **Ask Where to Save**, then select your destination folder in the **Save File** action.
- To offer several folder choices, insert **Choose from Menu** before saving. Each branch contains a **Save File** action with a destination folder you configure.

The final file must contain UTF-8 XML and end in **`.mobileconfig`**, avoiding `.mobileconfig.txt` or a repeated extension. Always use the `XML` variable as the file content; the answer in step 3 is only the file name. Do not ZIP the file or Base64-encode the entire XML. The file name is independent of the profile display name (`PayloadDisplayName`).

## Usage and deployment

1. Upload all website files and folders to a GitHub repository. Enable **Settings → Pages → Deploy from a branch**, then select the branch and folder containing `index.html`.
2. Open the website in Safari over HTTPS, select a configuration type, and enter its settings.
3. Tap **Export configuration**. The shortcut receives the XML, asks for a name, and saves the file according to your settings.
4. Open the saved file and follow the iOS instructions to install the profile. Creating and saving the file does not install it.

## Technical scope

- XML, form data, icons, and certificates are processed on your device. Exported profiles are **unsigned and unencrypted**; entered Wi-Fi/VPN passwords may appear in the XML.
- DNS and VPN require working server services. Ad, malicious-domain, and OTA blocking rules are configured on the DNS server; the DNS file only configures the connection to that server.
- **Device management** creates a passcode policy, not MDM enrollment. The VPN template supports IKEv2/EAP; the mail template supports IMAP/SMTP; certificate import does not accept private keys or PKCS#12.
- If a large XML document cannot be fully passed through the Shortcuts URL, use the **fallback .mobileconfig download** in Help.
- Website updates do not automatically update installed profiles. Export and reinstall a profile when its configuration changes.

Reference: [Shortcuts URL scheme](https://support.apple.com/guide/shortcuts/apd624386f42/ios).
