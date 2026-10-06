import { DEFAULT_ICON_URL, ICON_SIZE } from './config.js';

function loadImage(url) {
  return new Promise((resolve,reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Không đọc được ảnh. Hãy thử PNG, JPG hoặc WebP khác.'));
    image.src = url;
  });
}
function toPNG(image) {
  if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth*image.naturalHeight > 24000000) throw new Error('Ảnh phải không quá 24 megapixel.');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = ICON_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Thiết bị không hỗ trợ xử lý icon.');
  ctx.fillStyle = '#5c5c5c'; ctx.fillRect(0,0,ICON_SIZE,ICON_SIZE);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  const side = Math.min(image.naturalWidth,image.naturalHeight);
  ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,ICON_SIZE,ICON_SIZE);
  return canvas.toDataURL('image/png');
}
export async function loadDefaultIcon() {
  return toPNG(await loadImage(DEFAULT_ICON_URL));
}
export async function processIcon(file) {
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 10*1024*1024) throw new Error('Chọn PNG, JPG hoặc WebP không quá 10 MB.');
  const url = URL.createObjectURL(file);
  try { return toPNG(await loadImage(url)); }
  finally { URL.revokeObjectURL(url); }
}
