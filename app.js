import { AUTHOR } from './modules/config.js';
import { parseTargetURL, validateWebClip } from './modules/validation.js';
import { CATALOG, defaultState } from './modules/catalog.js';
import { buildProfile, FieldError, profileLink } from './modules/builders.js';
import { loadDefaultIcon, processIcon } from './modules/icons.js';
import { readCertificate } from './modules/certificates.js';
import { openSaveShortcut, shortcutURL } from './modules/shortcuts.js';
import { setupOffline, setupAuthorWave, setupFormTool } from './modules/platform.js';

const $=id=>document.getElementById(id);
const form=$('clip-form');
const common={name:$('display-name'),description:$('description')};
const tabs=[...document.querySelectorAll('[data-type]')];
const states=Object.fromEntries(Object.keys(CATALOG).map(type=>[type,defaultState(type)]));
let currentType='webclip';
let controls={};
let icon='';
let certificate=null;
let iconBusy=true,certificateBusy=false;
let iconSequence=0,certificateSequence=0;
const downloads=new Set();
function say(text){$('status').textContent=text;$('status').hidden=!text;}
function invalidate(){ $('shortcut-retry').hidden=true;$('shortcut-retry').href='#'; }
function snapshot(){for(const [key,node]of Object.entries(controls)){if(node.type!=='file')states[currentType][key]=node.type==='checkbox'?node.checked:node.value;}}
function busy(){return currentType==='webclip'?iconBusy:currentType==='certificate'?certificateBusy:false;}
function updateBusy(){ $('export-button').disabled=busy();$('export-label').textContent=busy()?'Đang chuẩn bị…':'Xuất cấu hình';form.setAttribute('aria-busy',String(busy())); }
function clearErrors(){
  for(const key of [...Object.keys(common),...Object.keys(controls)]){
    const node=common[key]||controls[key];node.setAttribute('aria-invalid','false');
    const error=$(key+'-error');if(error){error.hidden=true;error.textContent='';}
  }
}
function showError(error){
  const key=error.field;
  const node=common[key]||controls[key];const message=key?$(key+'-error'):null;
  if(node){node.setAttribute('aria-invalid','true');node.focus();}
  if(message){message.hidden=false;message.textContent=error.message;}
  if(key==='icon')$('pick-icon').focus();
  say(error.message||'Không tạo được cấu hình.');
}
function renderFields(focusKey){
  const state=states[currentType];const container=$('type-fields');container.replaceChildren();controls={};
  for(const f of CATALOG[currentType].fields){
    if(f.when&&!f.when(state))continue;
    const row=document.createElement('div');row.className=f.kind==='checkbox'?'field checkbox-field':'field';
    const label=document.createElement('label');label.htmlFor='field-'+f.key;label.textContent=f.label;
    if(f.optional){const optional=document.createElement('span');optional.className='optional';optional.textContent='Tùy chọn';label.append(optional);}
    let input;
    if(f.kind==='select'){
      input=document.createElement('select');for(const [value,title]of f.options){const option=document.createElement('option');option.value=value;option.textContent=title;input.append(option);}
    }else if(f.kind==='textarea'){input=document.createElement('textarea');input.rows=2;}
    else {input=document.createElement('input');input.type=f.kind;}
    input.id='field-'+f.key;input.name=f.key;input.autocomplete='off';
    if(f.kind==='checkbox')input.checked=Boolean(state[f.key]);
    else if(f.kind!=='file')input.value=String(state[f.key]??'');
    if(f.required)input.required=true;
    if(f.placeholder)input.placeholder=f.placeholder;
    if(f.max&&f.kind!=='number')input.maxLength=f.max;
    if(f.kind==='number'){input.min=String(f.min);input.max=String(f.max);input.step='1';input.inputMode='numeric';}
    if(f.inputMode)input.inputMode=f.inputMode;
    if(f.accept)input.accept=f.accept;
    if(['text','email','password'].includes(f.kind)){input.autocapitalize='none';input.spellcheck=false;}
    input.setAttribute('aria-describedby',f.key+'-error');
    const error=document.createElement('p');error.id=f.key+'-error';error.className='field-error';error.hidden=true;
    if(f.kind==='checkbox')row.append(input,label);else row.append(label,input);
    row.append(error);container.append(row);controls[f.key]=input;
    if(f.kind==='file'){
      const info=document.createElement('p');info.className='field-note';info.textContent=certificate?certificate.name:'Chọn một chứng chỉ .pem, .cer, .crt hoặc .der';row.append(info);
      input.addEventListener('change',async()=>{
        const file=input.files&&input.files[0];input.value='';if(!file)return;
        const sequence=++certificateSequence;certificateBusy=true;updateBusy();invalidate();say('');
        try{const result=await readCertificate(file);if(sequence===certificateSequence){certificate=result;if(currentType==='certificate')renderFields('certificateFile');}}
        catch(e){if(sequence===certificateSequence&&currentType==='certificate')say(e.message);}
        finally{if(sequence===certificateSequence){certificateBusy=false;updateBusy();}}
      });
    }else{
      input.addEventListener('input',()=>{snapshot();invalidate();error.hidden=true;input.setAttribute('aria-invalid','false');say('');});
      if(f.kind==='select')input.addEventListener('change',()=>{snapshot();invalidate();renderFields(f.key);});
    }
  }
  if(focusKey&&controls[focusKey])controls[focusKey].focus();
}
function switchType(type,focus=false){
  if(!CATALOG[type])return;
  snapshot();currentType=type;
  for(const tab of tabs){const selected=tab.dataset.type===type;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}
  form.setAttribute('aria-labelledby','tab-'+type);
  $('icon-row').hidden=type!=='webclip';$('type-note').textContent=CATALOG[type].note;
  $('name-label').textContent=type==='webclip'?'Tên hiển thị':'Tên cấu hình';
  invalidate();say('');clearErrors();renderFields();updateBusy();
  if(focus)$('tab-'+type).focus();
}
for(const tab of tabs){
  tab.addEventListener('click',()=>switchType(tab.dataset.type));
  tab.addEventListener('keydown',event=>{
    const index=tabs.indexOf(tab);let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
    else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();switchType(tabs[next].dataset.type,true);tabs[next].scrollIntoView({block:'nearest',inline:'nearest'});}
  });
}
function createXML(){
  if(busy())return null;snapshot();clearErrors();
  try{return buildProfile(currentType,{...states[currentType],name:common.name.value,description:common.description.value},{icon,certificate});}
  catch(error){showError(error);return null;}
}
form.addEventListener('submit',event=>{
  event.preventDefault();const xml=createXML();if(!xml)return;
  // Entirely synchronous on the click path: preserve user activation for the custom scheme.
  const url=shortcutURL(xml);$('shortcut-retry').href=url;$('shortcut-retry').hidden=false;
  say(url.length>60000?'Đang mở phím tắt. XML lớn do icon/chứng chỉ; nếu không nhận được, giảm icon hoặc dùng tải tệp dự phòng.':'Đang mở “Lưu cấu hình”. Nếu chưa chạy, nhấn liên kết gửi lại.');
  try{openSaveShortcut(xml);}catch{say('Nhấn “Gửi lại sang Lưu cấu hình” để tiếp tục.');}
});
$('download-profile').addEventListener('click',()=>{
  const xml=createXML();if(!xml)return;
  const name=common.name.value.trim().replace(/[\\/:*?"<>|]/g,'-')||'Sentechtipsvn';
  const blobURL=URL.createObjectURL(new Blob([xml],{type:'application/x-apple-aspen-config'}));downloads.add(blobURL);
  const link=document.createElement('a');link.href=blobURL;link.download=name+'.mobileconfig';link.hidden=true;document.body.append(link);link.click();link.remove();
  setTimeout(()=>{URL.revokeObjectURL(blobURL);downloads.delete(blobURL)},60000);
  say('Đã yêu cầu tải tệp. Kiểm tra mục Tải về; iOS có thể chuyển sang luồng nhận hồ sơ.');
});
for(const [key,node]of Object.entries(common))node.addEventListener('input',()=>{
  invalidate();say('');node.setAttribute('aria-invalid','false');$(key+'-error').hidden=true;
  if(key==='name')$('preview-name').textContent=node.value.trim()||'WebClip của bạn';
});
$('pick-icon').addEventListener('click',()=>$('icon-input').click());
$('choose-icon').addEventListener('click',()=>$('icon-input').click());
$('icon-input').addEventListener('change',async()=>{
  const picker=$('icon-input'),file=picker.files&&picker.files[0];picker.value='';if(!file)return;
  const sequence=++iconSequence;iconBusy=true;updateBusy();invalidate();say('');
  try{const data=await processIcon(file);if(sequence===iconSequence){icon=data;$('icon-preview').src=data;}}
  catch(error){if(sequence===iconSequence&&currentType==='webclip')say(error.message);}
  finally{if(sequence===iconSequence){iconBusy=false;updateBusy();}}
});
const initialSequence=iconSequence;
loadDefaultIcon().then(data=>{if(initialSequence===iconSequence){icon=data;$('icon-preview').src=data;}}).catch(()=>{if(initialSequence===iconSequence&&currentType==='webclip')say('Chưa tải được icon. Hãy chọn ảnh khác.');}).finally(()=>{if(initialSequence===iconSequence){iconBusy=false;updateBusy();}});

const dialog=$('url-dialog');
function closeDialog(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
function pasteError(text){$('paste-error').textContent=text;$('paste-error').hidden=!text;$('pasted-url').setAttribute('aria-invalid',String(Boolean(text)));}
function pasteMode(){
  const isProfile=$('url-purpose').value==='profile';
  $('apply-pasted-url').textContent=isProfile?'Mở hồ sơ':'Điền vào WebClip';
  $('paste-note').textContent=isProfile?'Mở link HTTPS của tệp đã có. Trang không tải lên hoặc sửa tệp từ link này.':'URL được đưa vào trường URL của WebClip.';
  $('pasted-url').placeholder=isProfile?'https://…/ten-tep.mobileconfig':'https://… hoặc URL scheme';pasteError('');
}
$('paste-url-button').addEventListener('click',()=>{
  $('pasted-url').value='';pasteMode();
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
});
$('close-url-dialog').addEventListener('click',closeDialog);
$('url-purpose').addEventListener('change',pasteMode);
$('pasted-url').addEventListener('input',()=>pasteError(''));
$('pasted-url').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();$('apply-pasted-url').click();}});
$('apply-pasted-url').addEventListener('click',()=>{
  try{
    const raw=$('pasted-url').value;
    if($('url-purpose').value==='profile'){
      const target=profileLink(raw);window.location.assign(target);closeDialog();
    }else{
      const target=parseTargetURL(raw);switchType('webclip');controls.url.value=target.url;controls.url.dispatchEvent(new Event('input'));closeDialog();controls.url.focus();
    }
  }catch(error){pasteError(error.message||'URL không hợp lệ.');$('pasted-url').focus();}
});
switchType('webclip');
setupOffline($('offline-status'));setupAuthorWave($('author-link'));
setupFormTool({isBusy:()=>busy(),stage(input){
  const checked=validateWebClip(input);if(!checked.values)throw new Error(Object.values(checked.errors)[0]);
  switchType('webclip');common.name.value=input.name;common.description.value=input.description||'';controls.url.value=input.url;
  common.name.dispatchEvent(new Event('input'));controls.url.dispatchEvent(new Event('input'));return {...input,author:AUTHOR};
}});
