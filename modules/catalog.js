const field = (key,label,kind='text',extra={}) => ({key,label,kind,...extra});
export const CATALOG = {
  webclip:{title:'WebClip',note:'Icon mở website hoặc URL scheme.',fields:[field('url','URL','text',{placeholder:'https://… hoặc shortcuts://…',inputMode:'url',required:true,max:4096})]},
  wifi:{title:'Wi-Fi',note:'Mạng cá nhân WPA2/WPA3 hoặc mạng mở.',fields:[
    field('ssid','Tên mạng (SSID)','text',{required:true,max:32}),
    field('encryption','Bảo mật','select',{options:[['WPA2','WPA2 / WPA3 tương thích'],['WPA3','Chỉ WPA3'],['None','Mạng mở']],default:'WPA2'}),
    field('password','Mật khẩu Wi-Fi','password',{when:s=>s.encryption!=='None',required:true,max:64}),
    field('autoJoin','Tự kết nối','checkbox',{default:true}),field('hidden','Mạng ẩn','checkbox',{default:false})]},
  dns:{title:'DNS',note:'DNS mã hóa DoH / DoT · iOS 14 trở lên.',fields:[
    field('protocol','Giao thức','select',{options:[['HTTPS','DNS over HTTPS'],['TLS','DNS over TLS']],default:'HTTPS'}),
    field('serverURL','URL máy chủ DoH','text',{when:s=>s.protocol==='HTTPS',required:true,placeholder:'https://dns.example.com/dns-query',inputMode:'url'}),
    field('serverName','Tên máy chủ DoT','text',{when:s=>s.protocol==='TLS',required:true,placeholder:'dns.example.com'}),
    field('addresses','Địa chỉ IP','textarea',{optional:true,placeholder:'Mỗi dòng một IPv4 hoặc IPv6'}),
    field('domains','Tên miền áp dụng','textarea',{optional:true,placeholder:'Để trống để áp dụng cho mọi tên miền'})]},
  vpn:{title:'VPN',note:'IKEv2 · xác thực EAP bằng tài khoản.',fields:[
    field('server','Máy chủ VPN','text',{required:true,placeholder:'vpn.example.com'}),
    field('remoteID','Remote Identifier','text',{required:true,placeholder:'Tên định danh trong chứng chỉ máy chủ'}),
    field('localID','Local Identifier','text',{required:true,placeholder:'Định danh do nhà cung cấp VPN cấp'}),
    field('username','Tài khoản','text',{required:true}),
    field('password','Mật khẩu','password',{optional:true,placeholder:'Để trống để nhập khi kết nối'})]},
  account:{title:'Tài khoản',note:'Mail IMAP + SMTP dùng SSL/TLS. Nhập mật khẩu khi cài.',fields:[
    field('email','Địa chỉ email','email',{required:true}),
    field('username','Tên đăng nhập','text',{required:true}),
    field('imap','Máy chủ IMAP','text',{required:true,placeholder:'imap.example.com'}),
    field('imapPort','Cổng IMAP','number',{default:'993',min:1,max:65535}),
    field('smtp','Máy chủ SMTP','text',{required:true,placeholder:'smtp.example.com'}),
    field('smtpPort','Cổng SMTP','number',{default:'465',min:1,max:65535})]},
  certificate:{title:'Chứng chỉ',note:'Chứng chỉ công khai X.509 · PEM hoặc DER.',fields:[
    field('certificateFile','Chọn chứng chỉ','file',{accept:'.pem,.cer,.crt,.der',required:true})]},
  management:{title:'Quản lý thiết bị',note:'Chính sách mật mã. Đăng ký MDM cần máy chủ và hồ sơ do nhà quản trị cấp.',fields:[
    field('minLength','Độ dài mật mã tối thiểu','number',{default:'6',min:4,max:16}),
    field('allowSimple','Cho phép mật mã đơn giản','checkbox',{default:false}),
    field('alphanumeric','Yêu cầu chữ và số','checkbox',{default:false})]}
};
export function defaultState(type) {
  return Object.fromEntries(CATALOG[type].fields.map(f=>[f.key,f.default ?? (f.kind==='checkbox'?false:'')]));
}
