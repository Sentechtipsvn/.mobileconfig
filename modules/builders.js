import { CATALOG } from './catalog.js';
import { illegalXML, parseTargetURL } from './validation.js';
import { PlistData, createConfigurationProfile, buildWebClipProfile } from './profile.js';

export class FieldError extends Error {
  constructor(field,message){super(message);this.field=field;}
}
function text(input,key,{required=true,max=4096,trim=true}={}) {
  const raw = typeof input[key]==='string'?input[key]:'';
  const value = trim?raw.trim():raw;
  if ((required&&!value)||value.length>max||illegalXML.test(value)) throw new FieldError(key,required&&!value?'Nhập thông tin này.':`Thông tin tối đa ${max} ký tự và không chứa ký tự điều khiển.`);
  return value;
}
const domainPattern=/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.?$/i;
function host(input,key) {
  const value=text(input,key,{max:253});
  if (/[\s/@?#]/u.test(value)) throw new FieldError(key,'Nhập tên máy chủ hoặc địa chỉ IP, không kèm giao thức/đường dẫn.');
  try {
    if (value.includes(':')) { if(!value.startsWith('[')&&!value.endsWith(']')) new URL(`https://[${value}]/`); else new URL(`https://${value}/`); }
    else {
      if(!domainPattern.test(value))throw new Error();
      if(/^[\d.]+$/.test(value)) {
        if(!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)||!value.split('.').every(p=>+p<=255&&(p==='0'||!p.startsWith('0'))))throw new Error();
      }
    }
  } catch { throw new FieldError(key,'Tên máy chủ hoặc IP không hợp lệ.'); }
  return value;
}
function integer(input,key,min,max) {
  const raw=String(input[key]??'');
  if(!/^\d+$/.test(raw)||+raw<min||+raw>max) throw new FieldError(key,`Nhập số nguyên từ ${min} đến ${max}.`);
  return +raw;
}
export function profileLink(value) {
  let target;
  try {target=parseTargetURL(value)} catch(error){throw new Error(error.message)}
  if(!target.isWeb || !target.url.startsWith('https://')) throw new Error('Link hồ sơ phải là HTTPS, không chứa thông tin đăng nhập.');
  return target.url;
}
const lines=value=>value.split(/[\s,;]+/u).filter(Boolean);
function ips(value) {
  return lines(value).map(ip=>{
    const valid4=/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)&&ip.split('.').every(p=>+p<=255&&(p==='0'||!p.startsWith('0')));
    let valid6=false;
    try{valid6=ip.includes(':')&&new URL(`https://[${ip}]/`).hostname.startsWith('[')}catch{}
    if(!valid4&&!valid6)throw new FieldError('addresses','Địa chỉ IP không hợp lệ.');
    return ip;
  });
}
export function buildProfile(type,input,assets={}) {
  if(!CATALOG[type])throw new Error('Loại cấu hình không được hỗ trợ.');
  const name=text(input,'name',{max:60});
  const description=text(input,'description',{required:false,max:1000});
  if(type==='webclip') {
    let target;
    try{target=parseTargetURL(input.url)}catch(error){throw new FieldError('url',error.message)}
    if(!assets.icon)throw new FieldError('icon','Chưa tải được icon. Hãy chọn ảnh khác.');
    return buildWebClipProfile({label:name,url:target.url,description},assets.icon);
  }
  let payload;
  if(type==='wifi') {
    const ssid=text(input,'ssid',{max:32,trim:false});
    if(!ssid.trim()||new TextEncoder().encode(ssid).length>32)throw new FieldError('ssid','SSID phải từ 1 đến 32 byte UTF-8.');
    if(!['None','WPA2','WPA3'].includes(input.encryption))throw new FieldError('encryption','Chọn kiểu bảo mật được hỗ trợ.');
    payload={PayloadType:'com.apple.wifi.managed',SSID_STR:ssid,EncryptionType:input.encryption,AutoJoin:Boolean(input.autoJoin),HIDDEN_NETWORK:Boolean(input.hidden)};
    if(input.encryption!=='None'){
      const password=text(input,'password',{max:64,trim:false});
      if(!(/^[\x20-\x7e]{8,63}$/.test(password)||(input.encryption==='WPA2'&&/^[a-f0-9]{64}$/i.test(password))))throw new FieldError('password','Mật khẩu 8–63 ký tự ASCII; WPA2 có thể dùng khóa hex 64 ký tự.');
      payload.Password=password;
    }
  } else if(type==='dns') {
    if(!['HTTPS','TLS'].includes(input.protocol))throw new FieldError('protocol','Chọn DoH hoặc DoT.');
    const settings={DNSProtocol:input.protocol};
    if(input.protocol==='HTTPS'){
      try{settings.ServerURL=profileLink(text(input,'serverURL'));}catch(error){throw new FieldError('serverURL',error.message)}
    }else settings.ServerName=host(input,'serverName');
    const addresses=ips(text(input,'addresses',{required:false}));
    if(addresses.length)settings.ServerAddresses=addresses;
    const domains=lines(text(input,'domains',{required:false}));
    if(domains.some(d=>d.length>253||!domainPattern.test(d.startsWith('*.')?d.slice(2):d)))throw new FieldError('domains','Nhập tên miền hợp lệ, có thể có tiền tố *.');
    if(domains.length)settings.SupplementalMatchDomains=domains;
    payload={PayloadType:'com.apple.dnsSettings.managed',DNSSettings:settings};
  } else if(type==='vpn') {
    const ike={RemoteAddress:host(input,'server'),RemoteIdentifier:text(input,'remoteID'),LocalIdentifier:text(input,'localID'),AuthenticationMethod:'None',ExtendedAuthEnabled:1,AuthName:text(input,'username')};
    const password=text(input,'password',{required:false,trim:false});if(password)ike.AuthPassword=password;
    payload={PayloadType:'com.apple.vpn.managed',UserDefinedName:name,VPNType:'IKEv2',IKEv2:ike};
  } else if(type==='account') {
    const email=text(input,'email',{max:254});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new FieldError('email','Địa chỉ email không hợp lệ.');
    const username=text(input,'username');
    payload={PayloadType:'com.apple.mail.managed',EmailAccountDescription:name,EmailAccountType:'EmailTypeIMAP',EmailAddress:email,
      IncomingMailServerHostName:host(input,'imap'),IncomingMailServerPortNumber:integer(input,'imapPort',1,65535),IncomingMailServerUseSSL:true,IncomingMailServerAuthentication:'EmailAuthPassword',IncomingMailServerUsername:username,
      OutgoingMailServerHostName:host(input,'smtp'),OutgoingMailServerPortNumber:integer(input,'smtpPort',1,65535),OutgoingMailServerUseSSL:true,OutgoingMailServerAuthentication:'EmailAuthPassword',OutgoingMailServerUsername:username,OutgoingPasswordSameAsIncomingPassword:true};
  } else if(type==='certificate') {
    if(!assets.certificate)throw new FieldError('certificateFile','Chọn chứng chỉ PEM/DER hợp lệ.');
    payload={PayloadType:'com.apple.security.pem',PayloadCertificateFileName:assets.certificate.name,PayloadContent:new PlistData(assets.certificate.pemBase64)};
  } else if(type==='management') {
    payload={PayloadType:'com.apple.mobiledevice.passwordpolicy',forcePIN:true,minLength:integer(input,'minLength',4,16),allowSimple:Boolean(input.allowSimple),requireAlphanumeric:Boolean(input.alphanumeric)};
  }
  payload.PayloadDisplayName=name;
  return createConfigurationProfile({displayName:name,description,payloads:[payload]});
}
