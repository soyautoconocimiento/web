(function(){
'use strict';
const B=window.TUCONTU_BUILDER;
const KEY='tucontu.builder.v04';
const LEGACY_KEY='tucontu.builder.v03';
const FAVORITES_KEY='tucontu.builder.favorites.v01';
const CONFIRM_KEY='tucontu.confirmations.dismissed.v01';
const STEPS=[
  {id:'base',label:'Base'},
  {id:'forma',label:'Forma'},
  {id:'colores',label:'Colores'},
  {id:'acabado',label:'Acabado'},
  {id:'ficha',label:'Ficha'}
];
const svgMount=document.getElementById('svgMount');
const panel=document.getElementById('panel');
const modalRoot=document.getElementById('modalRoot');
let importedLegacyDraft=false;
let spec=load();
let tab='base';
let selectedGroupId=spec.groups[0]?.id||null;
let selectedStrand=0;
let selectedWrap=0;
let openPalette=null;

function esc(value=''){
  return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function readStored(key,fallback=null){
  try{return localStorage.getItem(key)??fallback;}catch{return fallback;}
}
function writeStored(key,value){
  try{localStorage.setItem(key,value);return true;}catch{return false;}
}
function load(){
  try{
    const current=readStored(KEY);
    if(current!==null)return B.normalizeSpec(JSON.parse(current));
    const previous=readStored(LEGACY_KEY);
    if(previous!==null){importedLegacyDraft=true;return B.normalizeSpec(JSON.parse(previous));}
    return B.defaultSpec();
  }catch(error){return B.defaultSpec();}
}
function save(){return writeStored(KEY,JSON.stringify(spec));}
function hasCustomDraft(){return B.stableString(spec)!==B.stableString(B.defaultSpec());}
function favorites(){
  try{
    const value=JSON.parse(readStored(FAVORITES_KEY,'[]'));
    return Array.isArray(value)?value.filter(item=>item&&typeof item==='object'&&item.spec&&typeof item.spec==='object'&&typeof item.code==='string'):[];
  }catch{return [];}
}
function updateFavoriteCount(){document.getElementById('favoriteCount').textContent=String(favorites().length);}
function favoriteSpec(){
  const code=B.designCode(spec),items=favorites();
  if(items.some(item=>item.code===code))return {ok:true,alreadySaved:true};
  items.unshift({code,createdAt:new Date().toISOString(),spec:B.normalizeSpec(spec)});
  const saved=writeStored(FAVORITES_KEY,JSON.stringify(items.slice(0,20)));
  updateFavoriteCount();return {ok:saved,alreadySaved:false};
}
function askConfirmation(options,onConfirm,onCancel=()=>{}){
  const {title,description,action,force=false}=options;
  if(!force&&readStored(CONFIRM_KEY)==='true'){onConfirm();return;}
  const skip=force?'':'<label class="confirm-choice"><input type="checkbox" id="confirmSkip"> No volver a preguntar</label>';
  modalRoot.innerHTML='<div class="modal-bg"><div class="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirmTitle"><div class="label">TU DISEÑO</div><h2 id="confirmTitle">'+esc(title)+'</h2><p>'+esc(description)+'</p>'+skip+'<div class="modal-actions"><button type="button" class="secondary" data-cancel>Seguir diseñando</button><button type="button" class="primary" data-confirm>'+esc(action)+'</button></div></div></div>';
  const box=modalRoot.querySelector('.confirm-modal');
  const close=()=>{modalRoot.innerHTML='';};
  const cancel=()=>{close();onCancel();};
  modalRoot.querySelector('[data-cancel]').onclick=cancel;
  modalRoot.querySelector('.modal-bg').addEventListener('click',event=>{if(event.target===event.currentTarget)cancel();});
  modalRoot.querySelector('[data-confirm]').onclick=()=>{
    const skipChoice=modalRoot.querySelector('#confirmSkip');
    if(skipChoice&&skipChoice.checked)writeStored(CONFIRM_KEY,'true');
    close();onConfirm();
  };
  box.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();cancel();return;}
    if(event.key!=='Tab')return;
    const focusable=[...box.querySelectorAll('button,input')],first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  modalRoot.querySelector('[data-cancel]').focus({preventScroll:true});
}
function trapDialogFocus(dialog,onEscape){
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();onEscape();return;}
    if(event.key!=='Tab')return;
    const focusable=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href]')];
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
}
function catColor(id){return B.CATALOG.colors.find(color=>color.id===id)||B.CATALOG.colors[0];}
function currentGroup(){return spec.groups.find(group=>group.id===selectedGroupId)||null;}
function size(){return B.CATALOG.sizes.find(item=>item.id===spec.sizeId)||B.CATALOG.sizes[1];}
function stepIndex(){return STEPS.findIndex(step=>step.id===tab);}
function swatches(current,onAttr,key,title,colors=B.CATALOG.colors){
  return '<div class="palette" data-palette-options="'+esc(key)+'" role="group" aria-label="'+esc(title)+'">'+colors.map(color=>'<button type="button" class="swatch '+(color.id===current?'active':'')+'" style="--swatch:'+color.hex+'" '+onAttr+'="'+color.id+'" aria-label="'+esc(color.name)+'" aria-pressed="'+(color.id===current)+'"><i></i><span>'+esc(color.name)+'</span></button>').join('')+'</div>';
}
function colorPicker(key,title,current,onAttr,colors=B.CATALOG.colors){
  const color=catColor(current),isOpen=openPalette===key;
  const palette=isOpen?swatches(current,onAttr,key,title,colors):'<button type="button" class="current-color" data-palette-toggle="'+esc(key)+'" aria-expanded="false" aria-label="Cambiar '+esc(title)+'. Actual: '+esc(color.name)+'"><i style="--swatch:'+color.hex+'"></i><span>'+esc(color.name)+'</span><span class="current-color-action">Cambiar</span></button>';
  return '<div class="color-control"><div class="label">'+esc(title)+'</div>'+palette+'</div>';
}
function bindPaletteToggle(){
  panel.querySelectorAll('[data-palette-toggle]').forEach(button=>button.onclick=()=>{
    const key=button.dataset.paletteToggle;
    openPalette=openPalette===key?null:key;
    renderPanel();
    if(openPalette===key){
      const palette=panel.querySelector('[data-palette-options="'+key+'"]');
      (palette?.querySelector('[aria-pressed="true"]')||palette?.querySelector('button'))?.focus({preventScroll:true});
    }else focusPaletteToggle(key);
  });
  panel.querySelectorAll('[data-palette-options]').forEach(palette=>palette.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    event.preventDefault();event.stopPropagation();
    const key=palette.dataset.paletteOptions;
    openPalette=null;renderPanel();focusPaletteToggle(key);
  }));
}
function focusPaletteToggle(key){
  [...panel.querySelectorAll('[data-palette-toggle]')].find(toggle=>toggle.dataset.paletteToggle===key)?.focus({preventScroll:true});
}
function render(){
  spec=B.normalizeSpec(spec);
  if(!spec.groups.some(group=>group.id===selectedGroupId))selectedGroupId=spec.groups[0]?.id||null;
  document.getElementById('builderWorkspace').dataset.step=tab;
  save();
  renderPreview();
  renderPanel();
  renderProgress();
  syncNavigation();
}
function showIntro(restoreFocus=false){
  openPalette=null;
  document.querySelector('.app').classList.add('is-intro');
  document.getElementById('builderIntro').hidden=false;
  document.getElementById('builderWorkspace').hidden=true;
  document.getElementById('builderRail').hidden=true;
  document.getElementById('resetBtn').hidden=true;
  document.getElementById('myDesignsOpen').hidden=true;
  const selectedSize=size();
  document.querySelectorAll('[data-size-choice]').forEach(button=>{
    const selected=button.dataset.sizeChoice===spec.sizeId;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
  document.getElementById('builder-intro-selection').textContent=selectedSize.name+' · '+selectedSize.lengthCm+' cm';
  const migrationNotice=document.getElementById('builderMigrationNotice');
  if(migrationNotice)migrationNotice.hidden=!importedLegacyDraft;
  renderIntroArt();
  updateFavoriteCount();
  if(restoreFocus){
    const chosenSize=document.querySelector('[data-size-choice="'+spec.sizeId+'"]');
    if(chosenSize)chosenSize.focus({preventScroll:true});
  }
}
function renderIntroArt(){
  document.getElementById('builderIntroArt').innerHTML=B.renderSVG(spec,{idPrefix:'intro',showLengthGuide:true});
}
function openFavorites(opener=document.activeElement){
  const items=favorites();
  const rows=items.length?items.map((item,index)=>{
    const saved=B.normalizeSpec(item.spec),savedSize=B.CATALOG.sizes.find(option=>option.id===saved.sizeId)||B.CATALOG.sizes[1];
    return '<article class="favorite-card"><div><span class="label">'+esc(savedSize.name)+' · '+savedSize.lengthCm+' cm</span><strong>'+esc(item.code)+'</strong></div><div class="favorite-card-actions"><button type="button" class="secondary" data-open-favorite="'+index+'">Abrir</button><button type="button" class="favorite-remove" data-remove-favorite="'+index+'">Quitar</button></div></article>';
  }).join(''):'<p class="favorites-empty">Todavía no guardaste diseños. Cuando guardes una pieza desde su ficha, aparecerá aquí.</p>';
  modalRoot.innerHTML='<div class="modal-bg"><section class="modal favorites-modal" role="dialog" aria-modal="true" aria-labelledby="favoritesTitle"><div class="review-head"><div><div class="label">DISEÑOS GUARDADOS</div><h2 id="favoritesTitle">Mis TuconTu</h2></div><button type="button" class="review-close" data-close-favorites aria-label="Cerrar Mis TuconTu">×</button></div><div class="favorite-list">'+rows+'</div><div class="library-footer"><p>Los diseños se guardan en este navegador. No se sincronizan entre dispositivos ni perfiles.</p><button type="button" class="primary" data-create-design>Crear un TuconTu</button></div></section></div>';
  const close=()=>{modalRoot.innerHTML='';if(opener&&opener.isConnected&&typeof opener.focus==='function')opener.focus({preventScroll:true});};
  const startNew=()=>{
    const begin=()=>{modalRoot.innerHTML='';spec=B.defaultSpec();selectedGroupId=null;selectedStrand=0;selectedWrap=0;tab='base';save();startBuilder();};
    if(!hasCustomDraft())begin();
    else askConfirmation({title:'Crear otro TuconTu',description:'El borrador actual se reemplazará. Tus diseños guardados seguirán aquí.',action:'Crear una pieza nueva',force:true},begin,()=>openFavorites(opener));
  };
  modalRoot.querySelector('[data-close-favorites]').onclick=close;
  modalRoot.querySelector('.modal-bg').addEventListener('click',event=>{if(event.target===event.currentTarget)close();});
  modalRoot.querySelector('[data-create-design]').onclick=startNew;
  modalRoot.querySelectorAll('[data-open-favorite]').forEach(button=>button.onclick=()=>{
    const item=items[Number(button.dataset.openFavorite)];
    if(!item)return;
    const openSaved=()=>{spec=B.normalizeSpec(item.spec);selectedGroupId=spec.groups[0]?.id||null;selectedStrand=0;selectedWrap=0;tab='base';save();modalRoot.innerHTML='';startBuilder();};
    if(hasCustomDraft())askConfirmation({title:'Abrir un diseño guardado',description:'El borrador actual se reemplazará. Puedes volver a él cancelando ahora.',action:'Abrir diseño guardado',force:true},openSaved,()=>openFavorites(opener));
    else openSaved();
  });
  modalRoot.querySelectorAll('[data-remove-favorite]').forEach(button=>button.onclick=()=>askConfirmation({title:'Quitar de favoritos',description:'Este diseño guardado se eliminará de este dispositivo.',action:'Quitar favorito'},()=>{
    const current=favorites();current.splice(Number(button.dataset.removeFavorite),1);writeStored(FAVORITES_KEY,JSON.stringify(current));updateFavoriteCount();openFavorites(opener);
  },()=>openFavorites(opener)));
  trapDialogFocus(modalRoot.querySelector('.favorites-modal'),close);
  modalRoot.querySelector('[data-close-favorites]').focus({preventScroll:true});
}
function startBuilder(){
  document.querySelector('.app').classList.remove('is-intro');
  tab='base';
  document.getElementById('builderIntro').hidden=true;
  document.getElementById('builderWorkspace').hidden=false;
  document.getElementById('builderRail').hidden=false;
  document.getElementById('resetBtn').hidden=false;
  document.getElementById('myDesignsOpen').hidden=false;
  render();
  document.getElementById('stepNext').focus({preventScroll:true});
}
function renderPreview(){
  svgMount.innerHTML=B.renderSVG(spec,{selectedGroupId});
  svgMount.querySelectorAll('[data-group-id]').forEach(element=>{
    const canSelect=tab==='colores'||tab==='acabado';
    element.setAttribute('aria-disabled',String(!canSelect));
    element.setAttribute('tabindex',canSelect?'0':'-1');
    if(!canSelect)return;
    const pick=()=>{
      selectedGroupId=element.dataset.groupId;
      selectedStrand=0;
      selectedWrap=0;
      render();
    };
    element.addEventListener('click',pick);
    element.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();pick();}
    });
  });
}
function renderProgress(){
  const progress=document.getElementById('stepProgress');
  const current=stepIndex();
  progress.setAttribute('aria-valuenow',String(current+1));
  progress.setAttribute('aria-valuetext',`Paso ${current+1} de ${STEPS.length}: ${STEPS[current].label}`);
  [...progress.children].forEach((segment,index)=>{
    segment.classList.toggle('is-complete',index<current);
    segment.classList.toggle('is-current',index===current);
  });
}
function syncNavigation(){
  const back=document.getElementById('stepBack');
  const next=document.getElementById('stepNext');
  back.hidden=false;
  back.disabled=false;
  next.disabled=false;
  next.textContent=tab==='ficha'?'Guardar diseño':'Continuar';
}
function head(title){
  return '<div class="panel-head"><h2>'+esc(title)+'</h2></div>';
}
const HELP_CONTENT={
  intro:{title:'Elegir el largo',text:'Perséfone mide 30 cm y evoca a La Exploradora; Afrodita mide 60 cm y evoca a La Creadora; Héstia mide 90 cm y evoca a La Sacerdotisa. La pieza se teje a mano y puede variar levemente.'},
  base:{title:'El color del colet',text:'El colet es el aro que sostiene la pieza. Puedes elegirlo en negro o blanco; los cuatro cordones centrales siempre llevan ese mismo color.'},
  forma:{title:'La estructura fija',text:'Cada TuconTu tiene nueve cordones: tres forman la trenza de la izquierda, cuatro forman el centro embarrilado y dos forman el espiral de la derecha. Esa estructura no cambia.'},
  colores:{title:'Los colores de los cordones',text:'Elige por separado los tres colores de la trenza y los dos del espiral. El embarrilado central se configura en el paso siguiente; sus cuatro cordones internos mantienen el color del colet.'},
  acabado:{title:'Lana y algodón',text:'El embarrilado central puede combinar hasta tres tramos de lana o algodón. El espiral lleva un embarrilado sencillo de algodón, con una vuelta ascendente y espaciada que deja visibles sus cordones.'},
  ficha:{title:'Guardar tu diseño',text:'Revisa el código y las especificaciones. Antes de guardar te pediremos confirmación; después podrás descargar la ficha, contactar a Marcela por WhatsApp o volver al inicio.'}
};
function openHelp(){
  const isIntro=document.querySelector('.app').classList.contains('is-intro');
  const key=isIntro?'intro':tab;
  const content=HELP_CONTENT[key]||HELP_CONTENT.intro;
  const opener=document.getElementById('builderHelp');
  modalRoot.innerHTML='<div class="modal-bg"><section class="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="helpTitle" aria-describedby="helpCopy"><div class="review-head"><div><div class="label">TuconTu</div><h2 id="helpTitle">'+esc(content.title)+'</h2></div><button type="button" class="review-close" data-close-help aria-label="Cerrar información">×</button></div><div class="help-content"><p id="helpCopy">'+esc(content.text)+'</p><button type="button" class="help-guide-link" data-guide>Ver cómo se crea</button></div></section></div>';
  const closeHelp=()=>{modalRoot.innerHTML='';opener.focus({preventScroll:true});};
  const helpModal=modalRoot.querySelector('.help-modal');
  const renderSummary=()=>{
    modalRoot.querySelector('#helpTitle').textContent=content.title;
    modalRoot.querySelector('.help-modal .label').textContent='TuconTu';
    modalRoot.querySelector('.help-content').innerHTML='<p id="helpCopy">'+esc(content.text)+'</p><button type="button" class="help-guide-link" data-guide>Ver cómo se crea</button>';
  };
  const renderGuide=()=>{
    modalRoot.querySelector('#helpTitle').textContent='Cómo se crea';
    modalRoot.querySelector('.help-modal .label').textContent='UN RECORRIDO EN 5 PASOS';
    modalRoot.querySelector('.help-content').innerHTML='<ol class="help-guide-steps" id="helpCopy"><li><strong>Elige</strong> el largo y el color del colet.</li><li><strong>Reconoce</strong> la estructura fija.</li><li><strong>Combina</strong> colores en la trenza y el espiral.</li><li><strong>Personaliza</strong> los embarrilados.</li><li><strong>Revisa y guarda</strong> tu diseño.</li></ol><button type="button" class="help-guide-link" data-guide-back>Volver a la información</button>';
  };
  helpModal.addEventListener('click',event=>{
    if(event.target.closest('[data-close-help]')){closeHelp();return;}
    if(event.target.closest('[data-guide]')){renderGuide();modalRoot.querySelector('[data-guide-back]').focus({preventScroll:true});return;}
    if(event.target.closest('[data-guide-back]')){renderSummary();modalRoot.querySelector('[data-guide]').focus({preventScroll:true});}
  });
  modalRoot.querySelector('.modal-bg').addEventListener('click',event=>{if(event.target===event.currentTarget)closeHelp();});
  trapDialogFocus(helpModal,closeHelp);
  modalRoot.querySelector('[data-close-help]').focus({preventScroll:true});
  opener.setAttribute('aria-label','Más información: '+content.title);
}
document.getElementById('builderHelp').addEventListener('click',openHelp);
document.getElementById('stepBack').addEventListener('click',()=>tab==='base'?showIntro(true):moveStep(-1));
function renderPanel(){
  if(tab==='base')panelBase();
  else if(tab==='forma')panelForma();
  else if(tab==='colores')panelColores();
  else if(tab==='acabado')panelAcabado();
  else panelFicha();
}
function panelBase(){
  panel.innerHTML='<div class="panel-screen">'+head('Elige el color del colet')+'<div class="section">'+colorPicker('base','El colet solo puede ser negro o blanco',spec.colet.colorId,'data-colet-color',B.CATALOG.coletColors)+'</div></div>';
  bindPaletteToggle();
  panel.querySelectorAll('[data-colet-color]').forEach(button=>button.onclick=()=>{
    spec.colet.colorId=button.dataset.coletColor;
    openPalette=null;
    render();
    focusPaletteToggle('base');
  });
}
function panelForma(){
  const structures=[
    ['trenza','Trenza izquierda','3 cordones · colores a elección · sin embarrilado'],
    ['centro','Embarrilado central','4 cordones del color del colet · cobertura completa'],
    ['espiral','Espiral a la derecha','2 cordones · embarrilado sencillo de algodón']
  ];
  panel.innerHTML='<div class="panel-screen">'+head('Una estructura, tres gestos')+'<div class="section section-fixed-structure"><p class="structure-intro">Cada TuconTu mantiene la misma composición. Personalizar significa elegir el largo, el color del colet, los cordones y los acabados.</p><div class="fixed-structure-list">'+structures.map(([role,title,description],index)=>'<article class="fixed-structure-card"><span class="fixed-structure-index">0'+(index+1)+'</span><div><h3>'+title+'</h3><p>'+description+'</p></div></article>').join('')+'</div><p class="structure-note">1 colet · 9 cordones · la pieza se teje a mano.</p></div></div>';
}
function panelColores(){
  let group=currentGroup();
  if(!group||!['trenza','espiral'].includes(group.role)){group=spec.groups.find(item=>item.role==='trenza');selectedGroupId=group.id;}
  selectedStrand=Math.max(0,Math.min(selectedStrand,group.strands.length-1));
  const colorGroups=spec.groups.filter(item=>item.role==='trenza'||item.role==='espiral');
  panel.innerHTML=`<div class="panel-screen">${head('Elige los colores','La trenza tiene tres cordones; el espiral, dos. Cada color cambia solo el cordón seleccionado.')}<div class="section"><div class="color-structure-picker" role="group" aria-label="Estructura cuyos cordones quieres colorear">${colorGroups.map(item=>`<button type="button" data-color-structure="${item.role}" class="${group.id===item.id?'active':''}" aria-pressed="${group.id===item.id}">${item.role==='trenza'?'Trenza · 3':'Espiral · 2'}</button>`).join('')}</div><div class="strand-list strand-picker" aria-label="Cordones de la ${group.role==='trenza'?'trenza':'espiral'}">${group.strands.map((strand,index)=>`<button type="button" class="${index===selectedStrand?'active':''}" data-strand="${index}" aria-label="Cordón ${index+1} · ${esc(catColor(strand.colorId).name)}" aria-pressed="${index===selectedStrand}"><span>Cordón ${index+1}</span><i class="dot" style="--dot:${catColor(strand.colorId).hex}"></i></button>`).join('')}</div>${colorPicker(`strand:${group.id}:${selectedStrand}`,`Color del cordón ${selectedStrand+1}`,group.strands[selectedStrand].colorId,'data-strand-color')}<p class="structure-note">La trenza no lleva embarrilado. Los cuatro cordones centrales siempre comparten el color del colet.</p></div></div>`;
  bindPaletteToggle();
  panel.querySelectorAll('[data-color-structure]').forEach(button=>button.onclick=()=>{
    const next=spec.groups.find(item=>item.role===button.dataset.colorStructure);
    if(!next)return;
    selectedGroupId=next.id;selectedStrand=0;openPalette=null;render();
  });
  panel.querySelectorAll('[data-strand]').forEach(button=>button.onclick=()=>{
    selectedStrand=Number(button.dataset.strand);
    render();
  });
  panel.querySelectorAll('[data-strand-color]').forEach(button=>button.onclick=()=>{
    group.strands[selectedStrand].colorId=button.dataset.strandColor;
    openPalette=null;
    render();
    focusPaletteToggle(`strand:${group.id}:${selectedStrand}`);
  });
}
function panelAcabado(){
  const center=spec.groups.find(group=>group.role==='centro');
  const spiral=spec.groups.find(group=>group.role==='espiral');
  selectedWrap=Math.max(0,Math.min(selectedWrap,center.wraps.length-1));
  const wrap=center.wraps[selectedWrap];
  const baseColor=catColor(spec.colet.colorId);
  panel.innerHTML=`<div class="panel-screen">${head('Elige los acabados','El embarrilado central admite hasta tres tramos. El espiral lleva una vuelta ascendente y espaciada de algodón.')}<div class="section section-finishes"><div class="finish-block"><div class="finish-block-heading"><span class="label">Embarrilado central · 4 cordones</span><span class="finish-limit">Colet y centro · ${esc(baseColor.name)}</span></div><div class="center-color-status" aria-label="El colet y los cuatro cordones centrales son ${esc(baseColor.name.toLowerCase())}"><i style="--swatch:${baseColor.hex}"></i><span>Colet y 4 cordones centrales: ${esc(baseColor.name)}</span></div><div class="wrap-count-picker" role="group" aria-label="Cantidad de colores del embarrilado">${[1,2,3].map(count=>`<button type="button" data-wrap-count="${count}" class="${center.wraps.length===count?'active':''}" aria-pressed="${center.wraps.length===count}">${count} ${count===1?'color':'colores'}</button>`).join('')}</div><div class="wrap-nav" role="group" aria-label="Tramos del embarrilado">${center.wraps.map((item,index)=>`<button type="button" class="${index===selectedWrap?'active':''}" data-wrap="${index}" aria-label="Tramo ${index+1}" aria-pressed="${index===selectedWrap}">Tramo ${index+1}</button>`).join('')}</div><div class="materials" role="group" aria-label="Material del tramo">${B.CATALOG.wrapMaterials.map(material=>`<button type="button" class="${material.id===wrap.materialId?'active':''}" data-wrap-material="${material.id}" aria-pressed="${material.id===wrap.materialId}">${material.name}</button>`).join('')}</div>${colorPicker(`wrap:${selectedWrap}`,'Color del tramo '+(selectedWrap+1),wrap.colorId,'data-wrap-color')}<p class="wrap-hint">Los cuatro cordones internos mantienen el color del colet; el embarrilado los cubre salvo por sus puntas.</p></div><div class="finish-block finish-block--spiral"><div class="finish-block-heading"><span class="label">Espiral derecho · 2 cordones</span><span class="finish-limit">Algodón · fijo</span></div>${colorPicker('spiral-wrap','Color del embarrilado sencillo',spiral.wraps[0].colorId,'data-spiral-wrap-color')}<p class="wrap-hint">La vuelta asciende con espacio entre vueltas y deja visibles los dos cordones.</p></div></div></div>`;
  bindPaletteToggle();
  panel.querySelectorAll('[data-wrap]').forEach(button=>button.onclick=()=>{
    selectedWrap=Number(button.dataset.wrap);
    renderPanel();
  });
  panel.querySelectorAll('[data-wrap-count]').forEach(button=>button.onclick=()=>{
    const count=Number(button.dataset.wrapCount);
    center.wraps=center.wraps.slice(0,count);
    while(center.wraps.length<count){
      const previous=center.wraps.at(-1)||{materialId:'algodon',colorId:'musgo'};
      center.wraps.push({id:`tramo_${Math.random().toString(36).slice(2,8)}`,materialId:previous.materialId,colorId:previous.colorId});
    }
    selectedWrap=Math.min(selectedWrap,count-1);openPalette=null;render();
  });
  panel.querySelectorAll('[data-wrap-material]').forEach(button=>button.onclick=()=>{
    center.wraps[selectedWrap].materialId=button.dataset.wrapMaterial;
    render();
  });
  panel.querySelectorAll('[data-wrap-color]').forEach(button=>button.onclick=()=>{
    center.wraps[selectedWrap].colorId=button.dataset.wrapColor;
    openPalette=null;render();focusPaletteToggle(`wrap:${selectedWrap}`);
  });
  panel.querySelectorAll('[data-spiral-wrap-color]').forEach(button=>button.onclick=()=>{
    spiral.wraps[0].colorId=button.dataset.spiralWrapColor;
    openPalette=null;render();focusPaletteToggle('spiral-wrap');
  });
}
function panelFicha(){
  const manufacturing=B.toManufacturingSpec(spec);
  panel.innerHTML=`<div class="panel-screen">${head('Tu diseño','Revisa el código, el largo y la composición antes de guardarlo.')}<div class="section"><div class="spec-code">${manufacturing.designCode}</div><div class="summary summary-compact"><dl><div><dt>TAMAÑO</dt><dd>${esc(manufacturing.size.name)} · ${manufacturing.size.lengthCm} cm</dd></div><div><dt>COLET</dt><dd>${esc(manufacturing.colet.color)}</dd></div><div><dt>ESTRUCTURA</dt><dd>Trenza + centro + espiral</dd></div><div><dt>CORDONES</dt><dd>9</dd></div></dl></div><label class="label" for="note">Nota para el taller · opcional</label><textarea id="note" class="note-input" maxlength="240" placeholder="Escribe aquí cualquier detalle">${esc(spec.note)}</textarea><p class="save-location-note">Al guardar, tu diseño quedará en Mis TuconTu en este navegador.</p></div></div>`;
  document.getElementById('note').oninput=event=>{spec.note=event.target.value;save();};
}
function moveStep(direction){
  const next=stepIndex()+direction;
  if(next<0||next>=STEPS.length)return;
  const transition=direction>0?'forward':'backward';
  panel.dataset.stepTransition=transition;
  tab=STEPS[next].id;
  render();
  setTimeout(()=>{if(panel.dataset.stepTransition===transition)delete panel.dataset.stepTransition;},360);
  panel.focus?.({preventScroll:true});
}
function downloadDesignPNG(manufacturing){
  const source=svgMount.querySelector('svg');
  if(!source)return;
  const clone=source.cloneNode(true);
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  clone.setAttribute('width','1020');
  clone.setAttribute('height','1260');
  const svg=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});
  const url=URL.createObjectURL(svg),image=new Image();
  image.onload=()=>{
    const canvas=document.createElement('canvas'),width=1200,margin=88;
    const context=canvas.getContext('2d');
    const details=[
      'Largo · '+manufacturing.size.name+' · '+manufacturing.size.lengthCm+' cm',
      'Colet · '+manufacturing.colet.color,
      ...manufacturing.groups.map(group=>group.role==='centro'
        ?'Embarrilado central · 4 cordones del color del colet · '+group.wraps.map((item,index)=>`tramo ${index+1}: ${item.material.toLowerCase()} ${item.color.toLowerCase()}`).join(' · ')
        :group.role==='espiral'
        ?'Espiral a la derecha · 2 cordones '+group.strands.map(strand=>strand.color).join(' + ')+' · algodón '+group.wraps[0].color.toLowerCase()+' en vuelta ascendente espaciada'
          :'Trenza izquierda · 3 cordones '+group.strands.map(strand=>strand.color).join(' + ')+' · sin embarrilado'),
      ...(manufacturing.note?['Nota para el taller · '+manufacturing.note]:[])
    ];
    context.font='28px Inter, Arial, sans-serif';
    const wrap=text=>{
      const words=text.split(/\s+/),lines=[];
      let line='';
      words.forEach(word=>{
        const test=line?line+' '+word:word;
        if(line&&context.measureText(test).width>width-margin*2){lines.push(line);line=word;}else line=test;
      });
      if(line)lines.push(line);
      return lines;
    };
    const wrapped=details.map(wrap);
    const detailLines=wrapped.reduce((total,lines)=>total+lines.length,0);
    const height=Math.max(1450,1080+detailLines*42+wrapped.length*18+140);
    canvas.width=width;canvas.height=height;
    context.fillStyle='#f5f3ec';context.fillRect(0,0,width,height);
    context.strokeStyle='rgba(141,108,54,.48)';context.lineWidth=3;context.strokeRect(28,28,width-56,height-56);
    context.textAlign='center';context.fillStyle='#142a3c';context.font='italic 82px Cormorant, Georgia, serif';context.fillText('TuconTu',width/2,145);
    context.fillStyle='#756d62';context.font='28px Inter, Arial, sans-serif';context.fillText('Una pieza artesanal, tejida a mano',width/2,198);
    context.fillStyle='#8d6c36';context.font='26px ui-monospace, Menlo, monospace';context.fillText(manufacturing.designCode,width/2,250);
    context.drawImage(image,300,280,600,741);
    context.textAlign='left';context.fillStyle='#142a3c';context.font='28px Inter, Arial, sans-serif';
    let y=1080;
    wrapped.forEach(lines=>{
      lines.forEach(line=>{context.fillText(line,margin,y);y+=42;});
      y+=18;
    });
    context.textAlign='center';context.fillStyle='#756d62';context.font='italic 24px Cormorant, Georgia, serif';context.fillText('Representación aproximada · cada pieza se teje a mano',width/2,height-88);
    context.font='20px Inter, Arial, sans-serif';context.fillText('Diseño preparado desde SoyAutoconocimiento',width/2,height-52);
    canvas.toBlob(blob=>{
      if(blob){const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=manufacturing.designCode+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);}
      URL.revokeObjectURL(url);
    },'image/png');
  };
  image.onerror=()=>URL.revokeObjectURL(url);
  image.src=url;
}
function closeSuccessAndReturnToBuilder(){
  modalRoot.innerHTML='';
  panelFicha();
  document.getElementById('stepNext').focus({preventScroll:true});
}
function returnToHome(){
  modalRoot.innerHTML='';
  const dialog=document.getElementById('tucontu-builder-dialog');
  if(dialog.open)dialog.close();
  window.SoySiteNavigation?.goToSectionById('inicio');
}
function openSavedDesign(manufacturing){
  const summary=B.summaryText(spec);
  modalRoot.innerHTML=`<div class="modal-bg"><section class="modal review-modal saved-design-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="review-head"><div><div class="label">TuconTu guardado</div><h2 id="modalTitle">Tu diseño está guardado</h2></div><button type="button" class="review-close" data-continue-editing aria-label="Seguir en el creador">×</button></div><div class="review-body"><div class="review-preview" aria-label="Vista aproximada del TuconTu diseñado"><p class="review-approximation">Tu TuconTu quedará aproximadamente así.</p></div><div class="review-details"><figure class="review-real-photo"><img src="assets/tucontu/product/img-3343.webp" alt="Ejemplo real de un TuconTu tejido, con cordones blancos y negros"><figcaption>Ejemplo de una pieza real</figcaption></figure><p class="saved-code">Código · ${manufacturing.designCode}</p><pre>${esc(summary)}</pre><p class="share-note">Elige si quieres descargar la ficha para el taller o abrir un mensaje a Marcela por WhatsApp. La imagen no se adjunta automáticamente.</p></div></div><div class="modal-actions"><button type="button" class="secondary" data-png>Descargar ficha PNG</button><button type="button" class="secondary" data-whatsapp>Contactar por WhatsApp</button><button type="button" class="primary" data-return-home>Volver al inicio</button></div></section></div>`;
  const reviewPreview=modalRoot.querySelector('.review-preview');
  const reviewSvg=svgMount.querySelector('svg');
  if(reviewSvg)reviewPreview.append(reviewSvg.cloneNode(true));
  const success=modalRoot.querySelector('.saved-design-modal');
  const continueEditing=()=>closeSuccessAndReturnToBuilder();
  modalRoot.querySelector('[data-continue-editing]').onclick=continueEditing;
  modalRoot.querySelector('[data-return-home]').onclick=returnToHome;
  modalRoot.querySelector('.modal-bg').addEventListener('click',event=>{if(event.target===event.currentTarget)continueEditing();});
  modalRoot.querySelector('[data-png]').onclick=()=>downloadDesignPNG(manufacturing);
  modalRoot.querySelector('[data-whatsapp]').onclick=()=>{
    const lines=['Hola Marcela. Diseñé mi TuconTu en el sitio.','',`Código: ${manufacturing.designCode}`,`Tamaño: ${manufacturing.size.name} (${manufacturing.size.lengthCm} cm)`,`Colet: ${manufacturing.colet.color}`,'Composición:',...manufacturing.groups.map(group=>group.role==='centro'
      ?`  Embarrilado central · 4 cordones del color del colet · ${group.wraps.map((item,index)=>`tramo ${index+1}: ${item.material.toLowerCase()} ${item.color.toLowerCase()}`).join(' · ')}`
      :group.role==='espiral'
        ?`  Espiral a la derecha · 2 cordones ${group.strands.map(strand=>strand.color).join(' + ')} · algodón ${group.wraps[0].color.toLowerCase()} en vuelta ascendente espaciada`
        :`  Trenza izquierda · 3 cordones ${group.strands.map(strand=>strand.color).join(' + ')} · sin embarrilado`),...(manufacturing.note?[`Nota: ${manufacturing.note}`]:[]),'','Me gustaría coordinar la compra y la fecha de entrega. ¿Cómo lo hacemos?'];
    window.open(`https://wa.me/56962391328?text=${encodeURIComponent(lines.join('\n'))}`,'_blank','noopener,noreferrer');
  };
  trapDialogFocus(success,continueEditing);
  modalRoot.querySelector('[data-png]').focus({preventScroll:true});
}
function saveDesign(){
  askConfirmation({title:'Guardar tu diseño',description:'Se guardará en Mis TuconTu en este navegador. Después podrás descargar la ficha, escribirle a Marcela o volver al inicio.',action:'Guardar diseño',force:true},()=>{
    const result=favoriteSpec();
    if(!result.ok){
      modalRoot.innerHTML='<div class="modal-bg"><section class="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="saveErrorTitle"><div class="label">TuconTu</div><h2 id="saveErrorTitle">No se pudo guardar</h2><p>El navegador no pudo guardar el diseño. Prueba de nuevo o descarga la ficha mientras sigues aquí.</p><div class="modal-actions"><button type="button" class="secondary" data-cancel-save>Seguir diseñando</button><button type="button" class="primary" data-retry-save>Intentar otra vez</button></div></section></div>';
      modalRoot.querySelector('[data-cancel-save]').onclick=closeSuccessAndReturnToBuilder;
      modalRoot.querySelector('[data-retry-save]').onclick=saveDesign;
      modalRoot.querySelector('[data-cancel-save]').focus({preventScroll:true});
      return;
    }
    openSavedDesign(B.toManufacturingSpec(spec));
  });
}

document.getElementById('stepNext').onclick=()=>tab==='ficha'?saveDesign():moveStep(1);
document.getElementById('resetBtn').onclick=()=>{
  askConfirmation({title:'Empezar desde cero',description:'Se reemplazará el borrador actual. Tus diseños guardados no cambiarán.',action:'Empezar de cero',force:true},()=>{
    spec=B.defaultSpec();selectedGroupId=null;selectedStrand=0;selectedWrap=0;tab='base';save();showIntro(true);
  });
};
document.querySelectorAll('[data-size-choice]').forEach(button=>button.addEventListener('click',()=>{
  spec.sizeId=button.dataset.sizeChoice;
  save();
  document.querySelectorAll('[data-size-choice]').forEach(option=>{
    const selected=option===button;
    option.classList.toggle('active',selected);
    option.setAttribute('aria-pressed',String(selected));
  });
  const selectedSize=size();
  document.getElementById('builder-intro-selection').textContent=`${selectedSize.name} · ${selectedSize.lengthCm} cm`;
  renderIntroArt();
}));
document.getElementById('favoritesOpen').addEventListener('click',()=>openFavorites(document.activeElement));
document.getElementById('myDesignsOpen').addEventListener('click',()=>openFavorites(document.activeElement));
document.getElementById('builderStart').addEventListener('click',startBuilder);
window.TUCONTU_BUILDER_APP={showIntro,startBuilder};
render();
showIntro();
})();
