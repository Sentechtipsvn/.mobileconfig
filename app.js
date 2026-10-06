import { AUTHOR } from './modules/config.js';
import { validateWebClip } from './modules/validation.js';
import { buildWebClipProfile } from './modules/profile.js';
import { loadDefaultIcon, processIcon } from './modules/icons.js';
import { copyProfileText, openSaveShortcut, shortcutURL } from './modules/shortcuts.js';
import { setupOffline, setupAuthorWave, setupFormTool } from './modules/platform.js';

const $ = id => document.getElementById(id);
const form = $('clip-form');
const fields = {name:$('display-name'), url:$('clip-url'), description:$('description')};
const errors = {name:$('name-error'), url:$('url-error'), description:$('description-error')};
const primary = $('export-button');
const picker = $('icon-input');
let iconData = '';
let iconBusy = true;
let copying = false;
let iconSequence = 0;

function say(message) {
  $('status').textContent = message;
  $('status').hidden = !message;
}
function updateBusy() {
  primary.disabled = $('copy-xml').disabled = iconBusy || copying;
  $('export-label').textContent = iconBusy ? 'Đang chuẩn bị icon…' : copying ? 'Đang sao chép XML…' : 'Xuất cấu hình';
  form.setAttribute('aria-busy', String(iconBusy || copying));
  // Freeze form only during clipboard write; the XML being sent matches the visible form.
  for (const input of Object.values(fields)) input.disabled = copying;
  $('pick-icon').disabled = $('choose-icon').disabled = picker.disabled = copying;
}
function invalidatePreparedText() {
  $('shortcut-retry').hidden = true;
  $('manual-panel').hidden = true;
  $('manual-xml').value = '';
}
function showErrors(messages = {}) {
  for (const key of Object.keys(fields)) {
    const message = messages[key] || '';
    fields[key].setAttribute('aria-invalid', String(Boolean(message)));
    errors[key].hidden = !message;
    errors[key].textContent = message;
  }
}
function currentInput() {
  return {name:fields.name.value, url:fields.url.value, description:fields.description.value};
}
function createXML() {
  const checked = validateWebClip(currentInput());
  showErrors(checked.errors);
  if (!checked.values) {
    fields[Object.keys(checked.errors)[0]].focus();
    say('Kiểm tra lại thông tin được đánh dấu.');
    return null;
  }
  if (!iconData) {
    say('Chưa tải được icon mặc định. Hãy chọn ảnh icon rồi thử lại.');
    return null;
  }
  return buildWebClipProfile(checked.values, iconData);
}
function updateIcon(data) {
  iconData = data;
  $('icon-preview').src = data;
  invalidatePreparedText();
}

async function exportText(openShortcut) {
  if (iconBusy || copying) return;
  let xml;
  try { xml = createXML(); }
  catch (error) { say(error.message || 'Không tạo được cấu hình.'); return; }
  if (!xml) return;
  copying = true; updateBusy(); invalidatePreparedText();
  try {
    // No async work precedes this call. Clipboard must complete before opening Shortcuts.
    await copyProfileText(xml);
  } catch (error) {
    $('manual-xml').value = xml;
    $('manual-panel').hidden = false;
    say('Không sao chép tự động được. Chọn toàn bộ XML bên dưới, sao chép rồi mở phím tắt.');
    copying = false; updateBusy();
    return;
  }
  $('shortcut-retry').hidden = false;
  say(openShortcut ? 'Đã sao chép XML. Nếu phím tắt chưa mở, nhấn “Mở Lưu cấu hình”.' : 'Đã sao chép toàn bộ XML. Mở phím tắt khi sẵn sàng.');
  copying = false; updateBusy();
  if (openShortcut && !document.hidden) {
    try { openSaveShortcut(); }
    catch { say('XML đã được sao chép. Nhấn “Mở Lưu cấu hình” để tiếp tục.'); }
  }
  // We cannot observe the user's folder selection or confirm a file was saved by Shortcuts.
}

form.addEventListener('submit', event => { event.preventDefault(); void exportText(true); });
$('copy-xml').addEventListener('click', () => { void exportText(false); });
for (const [key,input] of Object.entries(fields)) {
  input.addEventListener('input', () => {
    invalidatePreparedText(); say('');
    errors[key].hidden = true; errors[key].textContent = '';
    input.setAttribute('aria-invalid','false');
    if (key === 'name') $('preview-name').textContent = input.value.trim() || 'WebClip của bạn';
  });
}
$('pick-icon').addEventListener('click', () => picker.click());
$('choose-icon').addEventListener('click', () => picker.click());
$('shortcut-retry').href = $('manual-shortcut').href = shortcutURL();
$('select-xml').addEventListener('click', () => {
  const text = $('manual-xml'); text.focus(); text.select(); text.setSelectionRange(0,text.value.length);
  say('XML đã được chọn. Dùng lệnh Sao chép của iOS, rồi mở phím tắt.');
});

picker.addEventListener('change', async () => {
  const file = picker.files && picker.files[0];
  picker.value = '';
  if (!file) return;
  const sequence = ++iconSequence;
  iconBusy = true; updateBusy(); invalidatePreparedText(); say('');
  try {
    const data = await processIcon(file);
    if (sequence === iconSequence) updateIcon(data);
  } catch (error) {
    if (sequence === iconSequence) say(error.message || 'Không xử lý được icon.');
  } finally {
    if (sequence === iconSequence) { iconBusy = false; updateBusy(); }
  }
});
const initialSequence = iconSequence;
loadDefaultIcon().then(data => {
  if (initialSequence === iconSequence) updateIcon(data);
}).catch(() => {
  if (initialSequence === iconSequence) say('Chưa tải được icon mặc định. Hãy chọn ảnh icon.');
}).finally(() => {
  if (initialSequence === iconSequence) { iconBusy = false; updateBusy(); }
});

setupOffline($('offline-status'));
setupAuthorWave($('author-link'));
setupFormTool({
  isBusy:() => copying || iconBusy,
  stage(input) {
    const checked = validateWebClip(input);
    if (!checked.values) throw new Error(Object.values(checked.errors)[0]);
    for (const key of Object.keys(fields)) {
      fields[key].value = input[key] || '';
      fields[key].dispatchEvent(new Event('input'));
    }
    showErrors();
    return {...currentInput(), author:AUTHOR};
  }
});
