import { SHORTCUT_NAME } from './config.js';
// Exact XML goes in the text parameter. Never read or write the clipboard.
export function shortcutURL(xml,name=SHORTCUT_NAME) {
  if(typeof xml!=='string'||!xml.startsWith('<?xml')||!xml.includes('<plist version="1.0">'))throw new Error('Nội dung XML cấu hình không hợp lệ.');
  return `shortcuts://run-shortcut?name=${encodeURIComponent(name)}&input=text&text=${encodeURIComponent(xml)}`;
}
export function openSaveShortcut(xml,location=window.location) {
  const url=shortcutURL(xml);location.assign(url);return url;
}
