import { SHORTCUT_NAME } from './config.js';

// Plain XML stays in clipboard; no JSON, base64 envelope, blob URL or long URL input.
export function shortcutURL(name = SHORTCUT_NAME) {
  return `shortcuts://run-shortcut?name=${encodeURIComponent(name)}&input=clipboard`;
}
export async function copyProfileText(xml, clipboard = navigator.clipboard) {
  if (typeof xml !== 'string' || !xml.startsWith('<?xml') || !xml.includes('<plist version="1.0">')) throw new Error('Nội dung cấu hình không hợp lệ.');
  if (!clipboard || typeof clipboard.writeText !== 'function') throw new Error('Không có quyền sao chép tự động. Bạn có thể sao chép XML thủ công bên dưới.');
  // Call before any await at the click site to preserve iOS clipboard user activation.
  await clipboard.writeText(xml);
}
export function openSaveShortcut(location = window.location) {
  location.assign(shortcutURL());
}
