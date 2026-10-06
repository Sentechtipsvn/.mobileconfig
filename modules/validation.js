export const illegalXML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDFFF]/u;
const blockedSchemes = new Set(['javascript:', 'data:', 'vbscript:', 'file:', 'blob:', 'about:']);

export function parseTargetURL(value) {
  if (typeof value !== 'string') throw new Error('Nhập URL hoặc scheme hợp lệ.');
  const raw = value.trim();
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw) || /\s/u.test(raw) || illegalXML.test(raw) || raw.length > 4096 || /%(?![a-f0-9]{2})/i.test(raw)) {
    throw new Error('Nhập URL đầy đủ hoặc scheme hợp lệ. Khoảng trắng trong URL cần đổi thành %20.');
  }
  const parsed = new URL(raw);
  if (blockedSchemes.has(parsed.protocol) || parsed.username || parsed.password) throw new Error('Không hỗ trợ scheme script, tệp nội bộ hoặc URL chứa thông tin đăng nhập.');
  const isWeb = ['http:', 'https:'].includes(parsed.protocol);
  if (isWeb && (!/^https?:\/\/[^/\\]/i.test(raw) || !parsed.hostname || raw.includes('\\'))) throw new Error('URL website cần bắt đầu bằng https:// hoặc http:// và có tên miền.');
  return {url:isWeb ? parsed.href : raw, isWeb};
}

export function validateWebClip(input) {
  const label = typeof input.name === 'string' ? input.name.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const errors = {};
  let target;
  if (!label) errors.name = 'Nhập tên hiển thị.';
  else if (label.length > 60 || illegalXML.test(label)) errors.name = 'Tên tối đa 60 ký tự, không chứa ký tự điều khiển.';
  try { target = parseTargetURL(input.url); } catch (error) { errors.url = error.message; }
  if (description.length > 1000 || illegalXML.test(description)) errors.description = 'Mô tả tối đa 1.000 ký tự, không chứa ký tự điều khiển.';
  return Object.keys(errors).length ? {values:null, errors} : {values:{label, description, ...target}, errors};
}
