'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const form = $('clip-form');
  const name = $('display-name');
  const url = $('clip-url');
  const description = $('description');
  const picker = $('icon-input');
  const save = $('save-button');
  const download = $('download-button');
  const AUTHOR = 'Sentechtipsvn';
  const MIME = 'application/x-apple-aspen-config';
  const objectURLs = new Set();
  let processing = false;
  let sharing = false;
  let imageSequence = 0;

  function defaultIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 180;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#5c5c5c'; ctx.fillRect(0, 0, 180, 180);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(58, 39); ctx.lineTo(107, 39);
    ctx.lineTo(130, 62); ctx.lineTo(130, 141); ctx.lineTo(58, 141); ctx.closePath();
    ctx.moveTo(107, 39); ctx.lineTo(107, 65); ctx.lineTo(130, 65);
    ctx.moveTo(76, 90); ctx.lineTo(112, 90);
    ctx.moveTo(76, 111); ctx.lineTo(104, 111); ctx.stroke();
    return canvas.toDataURL('image/png');
  }

  let iconData = defaultIcon();
  function updateIcon(data) {
    iconData = data;
    $('icon-preview').src = data;
    $('home-icon').src = data;
  }
  updateIcon(iconData);

  function say(message) { $('status').textContent = message; }
  function setBusy() {
    save.disabled = download.disabled = processing || sharing;
    $('save-label').textContent = processing ? 'Đang xử lý icon…' : sharing ? 'Đang mở bảng chia sẻ…' : 'Tạo & lưu vào Tệp';
    form.setAttribute('aria-busy', String(processing || sharing));
  }
  function setError(input, id, message) {
    input.setAttribute('aria-invalid', String(Boolean(message)));
    $(id).textContent = message;
    $(id).hidden = !message;
  }
  const illegalXML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDFFF]/u;
  function readValues(focus = true) {
    const label = name.value.trim();
    const rawURL = url.value.trim();
    const details = description.value.trim();
    let nameError = '';
    let urlError = '';
    let parsed;
    if (!label) nameError = 'Nhập tên hiển thị cho WebClip.';
    else if (label.length > 60 || illegalXML.test(label)) nameError = 'Tên tối đa 60 ký tự và không chứa ký tự điều khiển.';
    try {
      parsed = new URL(rawURL);
      if (!['https:', 'http:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || /\s/u.test(rawURL) || rawURL.length > 4096 || illegalXML.test(rawURL)) throw new Error('URL');
    } catch { urlError = 'Nhập URL đầy đủ bắt đầu bằng https:// hoặc http://, không có khoảng trắng hay thông tin đăng nhập.'; }
    setError(name, 'name-error', nameError);
    setError(url, 'url-error', urlError);
    if (nameError || urlError) {
      say('Kiểm tra lại thông tin được đánh dấu.');
      if (focus) (nameError ? name : url).focus();
      return null;
    }
    if (details.length > 1000 || illegalXML.test(details)) {
      say('Mô tả tối đa 1.000 ký tự và không chứa ký tự điều khiển.');
      if (focus) description.focus();
      return null;
    }
    return {label, url: parsed.href, description: details};
  }
  function escapeXML(value) {
    return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
  }
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID().toUpperCase();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const h = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`.toUpperCase();
  }
  function buildProfile(values) {
    const profileUUID = uuid();
    const clipUUID = uuid();
    const identifier = `vn.sentechtipsvn.webclip.${profileUUID.toLowerCase()}`;
    const text = value => `<string>${escapeXML(value)}</string>`;
    const pair = (key, value) => `    <key>${key}</key>\n    ${text(value)}`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${pair('PayloadType', 'Configuration')}
    <key>PayloadVersion</key><integer>1</integer>
${pair('PayloadIdentifier', identifier)}
${pair('PayloadUUID', profileUUID)}
${pair('PayloadDisplayName', values.label)}
${pair('PayloadDescription', values.description || `WebClip ${values.label} · ${AUTHOR}`)}
${pair('PayloadOrganization', AUTHOR)}
    <key>PayloadRemovalDisallowed</key><false/>
    <key>PayloadContent</key>
    <array>
      <dict>
${pair('PayloadType', 'com.apple.webClip.managed')}
        <key>PayloadVersion</key><integer>1</integer>
${pair('PayloadIdentifier', identifier + '.clip')}
${pair('PayloadUUID', clipUUID)}
${pair('PayloadDisplayName', values.label)}
${pair('PayloadDescription', values.description || `WebClip ${values.label}`)}
${pair('PayloadOrganization', AUTHOR)}
${pair('Label', values.label)}
${pair('URL', values.url)}
        <key>FullScreen</key><true/>
        <key>IgnoreManifestScope</key><true/>
        <key>IsRemovable</key><true/>
        <key>Precomposed</key><true/>
        <key>Icon</key>
        <data>${iconData.split(',')[1]}</data>
      </dict>
    </array>
</dict>
</plist>\n`;
  }
  function createFile() {
    if (processing || sharing) return null;
    const values = readValues();
    if (!values) return null;
    const filename = values.label.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'WebClip';
    return new File([buildProfile(values)], `${filename}.mobileconfig`, {type: MIME});
  }
  function downloadFile(file) {
    const blobURL = URL.createObjectURL(file);
    objectURLs.add(blobURL);
    const anchor = document.createElement('a');
    anchor.href = blobURL; anchor.download = file.name; anchor.hidden = true;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => { URL.revokeObjectURL(blobURL); objectURLs.delete(blobURL); }, 60000);
    say(`Đã yêu cầu tải ${file.name}. Kiểm tra mục Tải về; nếu chỉ hiện bản xem trước, mở bằng Safari rồi lưu hoặc chia sẻ vào Tệp.`);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const file = createFile();
    if (!file) return;
    let canShare = false;
    try { canShare = Boolean(navigator.share && navigator.canShare && navigator.canShare({files:[file]})); } catch {}
    if (!canShare) { downloadFile(file); return; }
    sharing = true; setBusy();
    try {
      // Invoke immediately within the user's gesture; no image work or network awaits here.
      await navigator.share({files:[file]});
      say('Bảng chia sẻ đã đóng. Nếu bạn chọn “Lưu vào Tệp”, hãy kiểm tra tệp ở thư mục đã chọn.');
    } catch (error) {
      say(error.name === 'AbortError' ? 'Đã hủy chia sẻ. Bạn có thể tạo và lưu lại.' : 'Không mở được chia sẻ tệp này. Nhấn “Tải xuống .mobileconfig”; nếu đang mở từ Màn hình chính, thử lại trong Safari.');
    } finally { sharing = false; setBusy(); }
  });
  download.addEventListener('click', () => { const file = createFile(); if (file) downloadFile(file); });
  name.addEventListener('input', () => { $('home-name').textContent = name.value.trim() || 'WebClip của bạn'; setError(name, 'name-error', ''); });
  url.addEventListener('input', () => setError(url, 'url-error', ''));
  $('pick-icon').addEventListener('click', () => picker.click());
  $('choose-icon').addEventListener('click', () => picker.click());

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const localURL = URL.createObjectURL(file);
      image.onload = () => { URL.revokeObjectURL(localURL); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(localURL); reject(new Error('Không đọc được ảnh. Hãy dùng PNG, JPG hoặc WebP.')); };
      image.src = localURL;
    });
  }
  picker.addEventListener('change', async () => {
    const file = picker.files && picker.files[0];
    picker.value = '';
    if (!file) return;
    const sequence = ++imageSequence;
    // Cancel stale jobs even when the newest selection is rejected.
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      processing = false; setBusy();
      say('Chọn ảnh PNG, JPG hoặc WebP không quá 10 MB. Icon trước đó vẫn được giữ.');
      return;
    }
    processing = true; setBusy(); say('Đang chuẩn bị icon…');
    try {
      const image = await loadImage(file);
      if (sequence !== imageSequence) return;
      if (image.naturalWidth * image.naturalHeight > 24000000) throw new Error('Ảnh quá lớn. Hãy chọn ảnh tối đa 24 megapixel.');
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#5c5c5c'; ctx.fillRect(0, 0, 180, 180);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      const size = Math.min(image.naturalWidth, image.naturalHeight);
      // iOS rounds the icon itself; embed an opaque, square PNG without pre-rounded edges.
      ctx.drawImage(image, (image.naturalWidth-size)/2, (image.naturalHeight-size)/2, size, size, 0, 0, 180, 180);
      updateIcon(canvas.toDataURL('image/png'));
      $('icon-hint').textContent = 'Đã cắt giữa ảnh · PNG 180 × 180';
      say('Icon đã sẵn sàng.');
    } catch (error) {
      if (sequence === imageSequence) say(error.message || 'Không xử lý được ảnh. Hãy thử ảnh khác.');
    } finally { if (sequence === imageSequence) { processing = false; setBusy(); } }
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', {scope:'./'}).then(async () => {
      await navigator.serviceWorker.ready;
      $('offline-status').textContent = navigator.onLine ? 'Sẵn sàng dùng offline trên thiết bị này.' : 'Đang dùng offline.';
    }).catch(() => { $('offline-status').textContent = 'Chế độ offline chưa sẵn sàng. Bạn vẫn có thể tạo tệp khi trang đang mở.'; });
  } else {
    $('offline-status').textContent = 'Mở qua HTTPS trên GitHub Pages để bật chế độ offline.';
  }
  window.addEventListener('offline', () => { $('offline-status').textContent = 'Đang dùng offline. Website đích có thể vẫn cần mạng.'; });
  window.addEventListener('online', () => { $('offline-status').textContent = 'Đã kết nối mạng.'; });

  // Optional WebMCP: stage the same visible form. File export remains a user gesture.
  const context = document.modelContext;
  if (context && typeof context.registerTool === 'function') {
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name:'configure_webclip', title:'Điền thông tin WebClip',
        description:'Điền tên, URL và mô tả vào biểu mẫu WebClip. Không tải hoặc chia sẻ tệp.',
        inputSchema:{type:'object',properties:{name:{type:'string',minLength:1,maxLength:60},url:{type:'string',maxLength:4096},description:{type:'string',maxLength:1000}},required:['name','url'],additionalProperties:false},
        annotations:{readOnlyHint:false,untrustedContentHint:false},
        execute(input) {
          if (processing || sharing) throw new Error('Đang xử lý. Hãy thử lại sau.');
          if (!input || typeof input.name !== 'string' || typeof input.url !== 'string' || (input.description !== undefined && typeof input.description !== 'string') || Object.keys(input).some(key => !['name','url','description'].includes(key))) throw new Error('Thông tin không hợp lệ.');
          let parsed;
          try { parsed = new URL(input.url); } catch { throw new Error('URL không hợp lệ.'); }
          if (!input.name.trim() || input.name.length > 60 || input.url.length > 4096 || (input.description || '').length > 1000 || !['https:','http:'].includes(parsed.protocol) || parsed.username || parsed.password || /\s/u.test(input.url) || [input.name,input.url,input.description || ''].some(value => illegalXML.test(value))) throw new Error('Thông tin không hợp lệ.');
          name.value = input.name; url.value = input.url; description.value = input.description || '';
          name.dispatchEvent(new Event('input')); url.dispatchEvent(new Event('input'));
          say('Đã điền thông tin. Nhấn nút tạo tệp khi sẵn sàng.');
          return {name:name.value,url:url.value,description:description.value,author:AUTHOR};
        }
      }, {signal:lifecycle.signal})).catch(() => {});
      window.addEventListener('pagehide', event => { if (!event.persisted) lifecycle.abort(); });
    } catch {}
  }
})();
