export function setupOffline(status) {
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(() => navigator.serviceWorker.ready).then(() => {
      status.textContent = navigator.onLine ? 'Sẵn sàng dùng offline.' : 'Đang dùng offline.';
    }).catch(() => { status.textContent = 'Offline chưa sẵn sàng. Bạn vẫn có thể xuất khi trang đang mở.'; });
  } else { status.textContent = 'Mở qua HTTPS để bật chế độ offline.'; }
  window.addEventListener('offline', () => { status.textContent = 'Đang dùng offline.'; });
  window.addEventListener('online', () => { status.textContent = 'Đã kết nối mạng.'; });
}
export function setupAuthorWave(link) {
  if ('IntersectionObserver' in window) {
    let visible = false;
    const update = () => link.classList.toggle('wave-active', visible && !document.hidden);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
    observer.observe(link);
    document.addEventListener('visibilitychange',update);
  } else { link.classList.add('wave-active'); }
}
export function setupFormTool({isBusy, stage}) {
  const context = document.modelContext;
  if (!context || typeof context.registerTool !== 'function') return;
  const lifecycle = new AbortController();
  try {
    Promise.resolve(context.registerTool({
      name:'configure_webclip', title:'Điền thông tin WebClip',
      description:'Điền biểu mẫu WebClip. Không mở Shortcuts hoặc lưu tệp.',
      inputSchema:{type:'object',properties:{name:{type:'string',minLength:1,maxLength:60},url:{type:'string',maxLength:4096},description:{type:'string',maxLength:1000}},required:['name','url'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input) {
        if (isBusy()) throw new Error('Đang xử lý. Hãy thử lại sau.');
        if (!input || typeof input.name !== 'string' || typeof input.url !== 'string' || (input.description !== undefined && typeof input.description !== 'string') || Object.keys(input).some(key => !['name','url','description'].includes(key))) throw new Error('Thông tin không hợp lệ.');
        return stage(input);
      }
    },{signal:lifecycle.signal})).catch(() => {});
    window.addEventListener('pagehide',event => { if (!event.persisted) lifecycle.abort(); });
  } catch {}
}
