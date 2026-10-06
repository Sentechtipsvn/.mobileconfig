import { AUTHOR } from './config.js';
import { illegalXML, validateWebClip } from './validation.js';

// Explicit plist <data> value; useful for icons or certificate payloads in future builders.
export class PlistData {
  constructor(base64) {
    if (typeof base64 !== 'string' || !base64 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) throw new Error('Dữ liệu base64 không hợp lệ.');
    this.base64 = base64;
  }
}
export function escapeXML(value) {
  if (illegalXML.test(value)) throw new Error('Ký tự XML không hợp lệ.');
  return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
}
export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID().toUpperCase();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(value => value.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`.toUpperCase();
}
function serialize(value, depth = 0) {
  const indent = '  '.repeat(depth);
  if (value instanceof PlistData) return `${indent}<data>${value.base64}</data>`;
  if (typeof value === 'string') return `${indent}<string>${escapeXML(value)}</string>`;
  if (typeof value === 'boolean') return `${indent}<${value ? 'true' : 'false'}/>`;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const type = Number.isInteger(value) ? 'integer' : 'real';
    return `${indent}<${type}>${value}</${type}>`;
  }
  if (Array.isArray(value)) return `${indent}<array>\n${value.map(item => serialize(item, depth+1)).join('\n')}\n${indent}</array>`;
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    const children = Object.entries(value).map(([key,item]) => `${indent}  <key>${escapeXML(key)}</key>\n${serialize(item,depth+1)}`).join('\n');
    return `${indent}<dict>\n${children}\n${indent}</dict>`;
  }
  throw new Error('Kiểu dữ liệu không được hỗ trợ trong plist.');
}

// Keep profile envelope separate from payload builders to make new profile types reusable.
export function createConfigurationProfile({displayName, description = '', payloads}) {
  if (typeof displayName !== 'string' || !displayName.trim() || !Array.isArray(payloads) || !payloads.length) throw new Error('Hồ sơ cần tên và ít nhất một payload.');
  const profileUUID = uuid();
  const profile = {
    PayloadType:'Configuration', PayloadVersion:1,
    PayloadIdentifier:`vn.sentechtipsvn.profile.${profileUUID.toLowerCase()}`,
    PayloadUUID:profileUUID, PayloadDisplayName:displayName,
    PayloadDescription:description || displayName, PayloadOrganization:AUTHOR,
    PayloadRemovalDisallowed:false,
    PayloadContent:payloads.map(payload => {
      if (!payload || typeof payload.PayloadType !== 'string' || !payload.PayloadType) throw new Error('Payload thiếu PayloadType.');
      const id = uuid();
      return {...payload, PayloadVersion:1, PayloadUUID:id,
        PayloadIdentifier:`vn.sentechtipsvn.payload.${id.toLowerCase()}`, PayloadOrganization:AUTHOR};
    })
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n${serialize(profile)}\n</plist>\n`;
}

export function buildWebClipProfile(values, iconDataURL) {
  const checked = validateWebClip({name:values.label, url:values.url, description:values.description});
  if (!checked.values) throw new Error(Object.values(checked.errors)[0]);
  const target = checked.values;
  if (!/^data:image\/png;base64,/.test(iconDataURL)) throw new Error('Icon phải là PNG.');
  return createConfigurationProfile({displayName:target.label,
    description:target.description || `WebClip ${target.label} · ${AUTHOR}`,
    payloads:[{
      PayloadType:'com.apple.webClip.managed', PayloadDisplayName:target.label,
      PayloadDescription:target.description || `WebClip ${target.label}`,
      Label:target.label, URL:target.url, FullScreen:target.isWeb,
      IgnoreManifestScope:target.isWeb, IsRemovable:true, Precomposed:true,
      Icon:new PlistData(iconDataURL.slice(iconDataURL.indexOf(',')+1))
    }]
  });
}
