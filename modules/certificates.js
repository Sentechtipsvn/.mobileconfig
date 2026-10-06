function toBase64(bytes) {
  let text='';for(let i=0;i<bytes.length;i+=4096)text+=String.fromCharCode(...bytes.subarray(i,i+4096));return btoa(text);
}
function checkDER(bytes) {
  function item(start) {
    if(start+2>bytes.length)throw new Error('Chứng chỉ bị thiếu dữ liệu.');
    const tag=bytes[start];let length=bytes[start+1],offset=start+2;
    if(length&128){const count=length&127;if(!count||count>4||offset+count>bytes.length)throw new Error('Độ dài DER không hợp lệ.');length=0;for(let i=0;i<count;i++)length=length*256+bytes[offset++];}
    const end=offset+length;if(end>bytes.length)throw new Error('Chứng chỉ bị cắt ngắn.');return {tag,offset,end};
  }
  const root=item(0);if(root.tag!==48||root.end!==bytes.length)throw new Error('Tệp không phải chứng chỉ X.509 DER.');
  const tbs=item(root.offset),algorithm=item(tbs.end),signature=item(algorithm.end);
  if(tbs.tag!==48||algorithm.tag!==48||signature.tag!==3||signature.end!==root.end||signature.offset===signature.end)throw new Error('Cấu trúc chứng chỉ X.509 không hợp lệ.');
  let cursor=tbs.offset;
  if(bytes[cursor]===160)cursor=item(cursor).end; // Optional explicit version.
  const tags=[2,48,48,48,48,48]; // Serial, algorithm, issuer, validity, subject, public key.
  const parts=[];
  for(const [index,tag] of tags.entries()){const part=item(cursor);if(part.tag!==tag||part.end>tbs.end||([0,1,3,5].includes(index)&&part.end===part.offset))throw new Error('Thiếu trường bắt buộc trong chứng chỉ X.509.');parts.push(part);cursor=part.end;}
  const validity=parts[3],from=item(validity.offset),until=item(from.end);
  if(![23,24].includes(from.tag)||![23,24].includes(until.tag)||until.end!==validity.end)throw new Error('Thời hạn trong chứng chỉ X.509 không hợp lệ.');
}
export async function readCertificate(file) {
  if(file.size>64*1024)throw new Error('Chứng chỉ tối đa 64 KB.');
  const raw=new Uint8Array(await file.arrayBuffer());let der=raw;
  const text=new TextDecoder().decode(raw).trim();
  if(text.startsWith('-----')){
    const match=/^-----BEGIN CERTIFICATE-----\s*([A-Za-z0-9+/=\s]+)\s*-----END CERTIFICATE-----$/.exec(text);
    if(!match)throw new Error('Chỉ nhận một chứng chỉ X.509 công khai, không nhận khóa riêng hoặc chuỗi nhiều chứng chỉ.');
    const base64=match[1].replace(/\s/g,'');
    try{der=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));}catch{throw new Error('Nội dung PEM không hợp lệ.');}
  }
  checkDER(der);
  const body=toBase64(der).match(/.{1,64}/g).join('\n');
  const pem=`-----BEGIN CERTIFICATE-----\n${body}\n-----END CERTIFICATE-----\n`;
  return {name:file.name.replace(/\.[^.]+$/,'')+'.pem',pemBase64:btoa(pem)};
}
