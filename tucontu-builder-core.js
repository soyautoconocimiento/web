(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.TUCONTU_BUILDER=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION='tucontu.builder/0.2';
  const SCHEMA='tucontu.builder-spec/0.2';
  const MAX_GROUPS=3;
  const MAX_STRANDS=9;
  const MAX_WRAPS=3;
  const ROLE_ORDER=['trenza','centro','espiral'];
  const ROLE_INFO={
    trenza:{type:'braid',label:'Trenza izquierda',strandCount:3},
    centro:{type:'wrapped',label:'Embarrilado central',strandCount:4},
    espiral:{type:'spiral',label:'Espiral a la derecha',strandCount:2}
  };
  const CATALOG=Object.freeze({
    sizes:[
      {id:'artemisa',name:'Perséfone',lengthCm:30,subtitle:'La Exploradora'},
      {id:'afrodita',name:'Afrodita',lengthCm:60,subtitle:'La Creadora'},
      {id:'hestia',name:'Héstia',lengthCm:90,subtitle:'La Sacerdotisa'}
    ],
    colors:[
      {id:'negro',name:'Negro',hex:'#211f1c'},
      {id:'blanco',name:'Blanco',hex:'#f6f2e9'},
      {id:'terracota',name:'Terracota',hex:'#c65d3a'},
      {id:'musgo',name:'Musgo',hex:'#68745a'},
      {id:'crudo',name:'Crudo',hex:'#e4d5bd'},
      {id:'cafe',name:'Café',hex:'#6c493b'},
      {id:'mostaza',name:'Mostaza',hex:'#b78936'},
      {id:'cobre',name:'Turquesa',hex:'#287c7c'},
      {id:'vino',name:'Vino',hex:'#8c4c55'},
      {id:'carbon',name:'Carbón',hex:'#292725'}
    ],
    coletColors:[
      {id:'negro',name:'Negro',hex:'#211f1c'},
      {id:'blanco',name:'Blanco',hex:'#f6f2e9'}
    ],
    wrapMaterials:[
      {id:'algodon',name:'Algodón',strokeWidth:4.1},
      {id:'lana',name:'Lana',strokeWidth:4.8}
    ]
  });

  const clone=x=>JSON.parse(JSON.stringify(x));
  const uid=(p='id')=>`${p}_${Math.random().toString(36).slice(2,9)}`;
  const find=(arr,id)=>arr.find(x=>x.id===id)||arr[0];
  const color=id=>find(CATALOG.colors,id);
  const size=id=>find(CATALOG.sizes,id);
  const wrapMaterial=id=>find(CATALOG.wrapMaterials,id);
  const validColor=id=>CATALOG.colors.some(x=>x.id===id);
  const validWrap=id=>CATALOG.wrapMaterials.some(x=>x.id===id);

  function makeGroup(role,coletColor='negro',values={}){
    const info=ROLE_INFO[role];
    const defaults=role==='trenza'?['terracota','crudo','musgo']
      :role==='espiral'?['cobre','crudo']
      :Array(info.strandCount).fill(coletColor);
    const strands=(values.strands||[]).slice(0,info.strandCount);
    while(strands.length<info.strandCount)strands.push({});
    const normalizedStrands=strands.map((strand,index)=>({
      id:strand.id||uid('cord'),
      material:'algodon',
      colorId:role==='centro'?coletColor:(validColor(strand.colorId)?strand.colorId:defaults[index])
    }));
    let wraps=[];
    if(role==='centro'){
      const segments=(Array.isArray(values.wraps)?values.wraps:[]).slice(0,MAX_WRAPS);
      wraps=(segments.length?segments:[{}]).map(segment=>({
        id:segment.id||uid('tramo'),
        materialId:validWrap(segment.materialId)?segment.materialId:'algodon',
        colorId:validColor(segment.colorId)?segment.colorId:'musgo'
      }));
    }else if(role==='espiral'){
      const wrap=(Array.isArray(values.wraps)?values.wraps:[])[0]||{};
      wraps=[{id:wrap.id||uid('espiral'),materialId:'algodon',colorId:validColor(wrap.colorId)?wrap.colorId:'crudo',pattern:'espiral-ascendente'}];
    }
    return {id:role,role,type:info.type,strands:normalizedStrands,wraps};
  }

  function defaultSpec(){
    const coletColor='negro';
    return {
      schema:SCHEMA,
      version:VERSION,
      sizeId:'afrodita',
      colet:{colorId:coletColor},
      groups:ROLE_ORDER.map(role=>makeGroup(role,coletColor)),
      note:''
    };
  }

  function mapLegacyColet(colorId){
    if(colorId==='negro'||colorId==='carbon')return 'negro';
    if(colorId==='blanco'||colorId==='crudo')return 'blanco';
    return 'negro';
  }
  function normalizeSpec(input){
    const source=clone(input&&typeof input==='object'?input:defaultSpec());
    const isCurrent=source.schema===SCHEMA&&Array.isArray(source.groups)&&source.groups.some(group=>ROLE_ORDER.includes(group?.role));
    const s={schema:SCHEMA,version:VERSION,sizeId:source.sizeId,colet:source.colet,groups:[],note:String(source.note||'')};
    if(!CATALOG.sizes.some(x=>x.id===s.sizeId))s.sizeId='afrodita';
    const rawColetId=source.colet?.colorId;
    const coletColor=isCurrent&&CATALOG.coletColors.some(x=>x.id===rawColetId)
      ?rawColetId:mapLegacyColet(rawColetId);
    s.colet={colorId:coletColor};
    const rawGroups=Array.isArray(source.groups)?source.groups:[];
    let legacyBraid,legacySpiral,legacyCenter;
    if(!isCurrent){
      legacyBraid=rawGroups.find(group=>group?.type==='braid');
      legacySpiral=rawGroups.find(group=>group?.type==='spiral');
      legacyCenter=rawGroups.find(group=>Array.isArray(group?.wraps)&&group.wraps.length)
        ||rawGroups.find(group=>group?.type==='loose');
    }
    s.groups=ROLE_ORDER.map(role=>{
      const current=rawGroups.find(group=>group?.role===role);
      const legacy=role==='trenza'?legacyBraid:role==='espiral'?legacySpiral:legacyCenter;
      const sourceGroup=current||legacy||{};
      const wraps=Array.isArray(sourceGroup.wraps)?sourceGroup.wraps:[];
      const cleanWraps=role==='centro'
        ?wraps.slice(0,MAX_WRAPS).map(item=>({id:item.id,materialId:item.materialId==='lana'?'lana':'algodon',colorId:item.colorId}))
        :role==='espiral'?[{colorId:wraps[0]?.colorId||'crudo'}]:[];
      return makeGroup(role,coletColor,{strands:sourceGroup.strands,wraps:cleanWraps});
    });
    return s;
  }

  function canonical(spec){
    const s=normalizeSpec(spec);
    return {
      schema:s.schema,sizeId:s.sizeId,colet:{colorId:s.colet.colorId},
      groups:s.groups.map(group=>({role:group.role,strands:group.strands.map(strand=>({material:strand.material,colorId:strand.colorId})),wraps:group.wraps.map(wrap=>({materialId:wrap.materialId,colorId:wrap.colorId}))})),
      note:s.note.trim()
    };
  }
  function stableString(spec){return JSON.stringify(canonical(spec));}
  function fnv1a(str){
    let hash=0x811c9dc5;
    for(let i=0;i<str.length;i++){hash^=str.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}
    return hash>>>0;
  }
  function designCode(spec){return 'TCT-'+fnv1a(stableString(spec)).toString(16).toUpperCase().padStart(8,'0').slice(0,6);}
  function roleLabel(role){return ROLE_INFO[role]?.label||'Estructura';}

  function toManufacturingSpec(spec){
    const s=normalizeSpec(spec),selectedSize=size(s.sizeId);
    const groups=s.groups.map((group,index)=>({
      position:index+1,
      role:group.role,
      type:group.type,
      typeLabel:roleLabel(group.role),
      strandCount:group.strands.length,
      strands:group.strands.map((strand,position)=>({position:position+1,material:'Algodón',color:color(strand.colorId).name,colorId:strand.colorId})),
      wraps:group.wraps.map((wrap,position)=>({position:position+1,material:wrapMaterial(wrap.materialId).name,materialId:wrap.materialId,color:color(wrap.colorId).name,colorId:wrap.colorId,pattern:wrap.pattern||null}))
    }));
    const manufacturing={
      schema:'tucontu.manufacturing-spec/0.2',
      designCode:designCode(s),
      product:'TuconTu',
      size:{id:selectedSize.id,name:selectedSize.name,lengthCm:selectedSize.lengthCm},
      colet:{color:color(s.colet.colorId).name,colorId:s.colet.colorId},
      groups,
      note:s.note.trim()||null
    };
    manufacturing.summary={groups:groups.length,totalStrands:groups.reduce((total,group)=>total+group.strandCount,0),wrappedGroups:groups.filter(group=>group.wraps.length).length};
    manufacturing.commerce={lineAttributes:[
      {key:'Diseño TuconTu',value:manufacturing.designCode},
      {key:'Tamaño',value:`${selectedSize.name} · ${selectedSize.lengthCm} cm`},
      {key:'Colet',value:manufacturing.colet.color},
      {key:'Composición',value:'Trenza de 3 · Embarrilado central de 4 · Espiral de 2'}
    ]};
    return manufacturing;
  }

  function toCoreProduct(spec){
    const s=normalizeSpec(spec),selectedSize=size(s.sizeId);
    const sizeKey=selectedSize.lengthCm===30?'S':selectedSize.lengthCm===60?'M':'X';
    const cords=[],groups=[];
    s.groups.forEach(group=>{
      const indexes=[];
      group.strands.forEach(strand=>{
        indexes.push(cords.length);
        cords.push({materialId:`builder:cord:${strand.material}:${strand.colorId}`,thicknessMm:null});
      });
      groups.push({
        id:group.role,
        size:group.strands.length,
        role:group.role,
        cordIndexes:indexes,
        measuredFinalLengthM:null,
        customFinalLengthM:null,
        wraps:group.wraps.map(wrap=>({materialId:`builder:wrap:${wrap.materialId}:${wrap.colorId}`,meters:null,source:'custom'}))
      });
    });
    return {id:designCode(s),name:designCode(s),createdAt:null,sizeKey,customLengthM:sizeKey==='X'?selectedSize.lengthCm/100:null,cordCount:cords.length,coletId:`builder:colet:${s.colet.colorId}`,cords,groups,minutes:null,hourlyRate:null,extraWorkPct:0,cordWastePct:0,wrapWastePct:0,packaging:{templateId:null,items:[],laborMode:'none',minutes:null},price:null};
  }

  function summaryText(spec){
    const manufacturing=toManufacturingSpec(spec);
    const lines=[
      `TuconTu · ${manufacturing.designCode}`,
      `Tamaño: ${manufacturing.size.name} · ${manufacturing.size.lengthCm} cm`,
      `Colet: ${manufacturing.colet.color}`,
      '',
      'COMPOSICIÓN FIJA · 9 CORDONES'
    ];
    manufacturing.groups.forEach(group=>{
      lines.push(`${group.position}. ${group.typeLabel} · ${group.strandCount} cordones`);
      if(group.role==='centro'){
        lines.push(`   Base: 4 cordones del color del colet (${manufacturing.colet.color})`);
        lines.push(`   Embarrilado: ${group.wraps.map((wrap,index)=>`${wrap.material} ${wrap.color} · tramo ${index+1} de ${group.wraps.length}`).join(' / ')}`);
      }else if(group.role==='espiral'){
        lines.push(`   Colores de los cordones: ${group.strands.map(strand=>strand.color).join(' + ')}`);
        lines.push(`   Embarrilado sencillo de algodón ${group.wraps[0].color} · vuelta ascendente espaciada`);
      }else{
        lines.push(`   Colores de los cordones: ${group.strands.map(strand=>strand.color).join(' + ')}`);
        lines.push('   Embarrilado: No');
      }
    });
    if(manufacturing.note)lines.push('',`Nota para el taller: ${manufacturing.note}`);
    return lines.join('\n');
  }

  function esc(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
  function strandPath(cx,y0,length,amplitude,cycles,phase,offset=0){
    const points=[];
    for(let index=0;index<=64;index++){
      const t=index/64;
      const fade=Math.min(1,t/.12);
      const x=cx+offset+Math.sin(t*Math.PI*2*cycles+phase)*amplitude*fade;
      const y=y0+t*length;
      points.push(`${index?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  }
  function drawCordPath(path,hex,width){
    return `<path d="${path}" fill="none" stroke="#44352b" stroke-opacity=".23" stroke-width="${width+2.5}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="${hex}" stroke-width="${width}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="#fff8ec" stroke-opacity=".3" stroke-width="${Math.max(1,width*.2)}" stroke-linecap="round" transform="translate(-1.1 0)"/>`;
  }
  function renderBraid(group,cx,y0,length,selected){
    let out=`<g class="preview-group preview-group--braid" data-group-id="${group.id}" tabindex="0" role="button" aria-label="Seleccionar trenza de tres cordones">`;
    if(selected)out+=`<rect x="${cx-21}" y="${y0-8}" width="42" height="${length+18}" rx="14" fill="none" stroke="#248692" stroke-width="1.4" stroke-dasharray="3 5" opacity=".75"/>`;
    group.strands.forEach((strand,index)=>out+=drawCordPath(strandPath(cx,y0,length,7.5,7.5,index*Math.PI*2/3),color(strand.colorId).hex,7.5));
    out+=`<circle cx="${cx}" cy="${y0+length+3}" r="3.2" fill="${color(group.strands[1].colorId).hex}"/></g>`;
    return out;
  }
  function renderCenter(group,coletColor,cx,y0,length,selected){
    let out=`<g class="preview-group preview-group--center" data-group-id="${group.id}" tabindex="0" role="button" aria-label="Seleccionar embarrilado central de cuatro cordones">`;
    if(selected)out+=`<rect x="${cx-24}" y="${y0-8}" width="48" height="${length+18}" rx="14" fill="none" stroke="#248692" stroke-width="1.4" stroke-dasharray="3 5" opacity=".75"/>`;
    const offsets=[-8,-2.7,2.7,8];
    offsets.forEach(offset=>{out+=`<path d="${strandPath(cx,y0,length,1.2,1,offset*.03,offset)}" fill="none" stroke="${color(coletColor).hex}" stroke-width="5.2" stroke-linecap="round"/>`;});
    const coveredStart=y0+7,coveredLength=length-18,segmentLength=coveredLength/group.wraps.length;
    group.wraps.forEach((wrap,index)=>{
      const start=coveredStart+index*segmentLength;
      const end=start+segmentLength-1.3;
      const tone=color(wrap.colorId).hex;
      const basePath=`M${cx} ${start.toFixed(1)} L${cx} ${end.toFixed(1)}`;
      out+=`<path d="${basePath}" fill="none" stroke="#4b382f" stroke-opacity=".3" stroke-width="28" stroke-linecap="butt"/>`;
      out+=`<path d="${basePath}" fill="none" stroke="${tone}" stroke-width="25" stroke-linecap="butt"/>`;
      const pitch=wrap.materialId==='lana'?6.5:5.2;
      for(let y=start+2;y<end;y+=pitch){
        const forward=Math.floor((y-start)/pitch)%2===0;
        const d=forward?`M${cx-11} ${(y+2).toFixed(1)} Q${cx} ${(y-1).toFixed(1)} ${cx+11} ${(y+4).toFixed(1)}`:`M${cx+11} ${(y+2).toFixed(1)} Q${cx} ${(y-1).toFixed(1)} ${cx-11} ${(y+4).toFixed(1)}`;
        out+=`<path d="${d}" fill="none" stroke="${wrap.materialId==='lana'?'#fff4dc':'#fffaf0'}" stroke-opacity="${wrap.materialId==='lana'?'.55':'.42'}" stroke-width="${wrap.materialId==='lana'?1.55:1.15}" stroke-linecap="round"/>`;
      }
      if(index>0)out+=`<path d="M${cx-13} ${start.toFixed(1)} L${cx+13} ${start.toFixed(1)}" stroke="#f5f3ec" stroke-opacity=".9" stroke-width="1.5"/>`;
    });
    out+=`<circle cx="${cx-8}" cy="${y0+length-3}" r="2.8" fill="${color(coletColor).hex}"/><circle cx="${cx-2.7}" cy="${y0+length-3}" r="2.8" fill="${color(coletColor).hex}"/><circle cx="${cx+2.7}" cy="${y0+length-3}" r="2.8" fill="${color(coletColor).hex}"/><circle cx="${cx+8}" cy="${y0+length-3}" r="2.8" fill="${color(coletColor).hex}"/>`;
    out+='</g>';
    return out;
  }
  function renderSpiral(group,cx,y0,length,selected){
    let out=`<g class="preview-group preview-group--spiral" data-group-id="${group.id}" tabindex="0" role="button" aria-label="Seleccionar espiral de dos cordones">`;
    if(selected)out+=`<rect x="${cx-23}" y="${y0-8}" width="46" height="${length+18}" rx="14" fill="none" stroke="#248692" stroke-width="1.4" stroke-dasharray="3 5" opacity=".75"/>`;
    group.strands.forEach((strand,index)=>out+=drawCordPath(strandPath(cx,y0,length,8,6.5,index*Math.PI),color(strand.colorId).hex,7));
    const winding=group.wraps[0];
    let windingPath='';
    const pitch=13.5;
    for(let y=y0+5;y<y0+length-4;y+=pitch){
      windingPath+=`M${cx-10} ${y.toFixed(1)} C${cx-5} ${(y+2).toFixed(1)} ${cx+5} ${(y+pitch-2).toFixed(1)} ${cx+10} ${(y+pitch).toFixed(1)} `;
    }
    out+=`<path d="${windingPath}" fill="none" stroke="#4b382f" stroke-opacity=".27" stroke-width="5.2" stroke-linecap="round"/>`;
    out+=`<path d="${windingPath}" fill="none" stroke="${color(winding.colorId).hex}" stroke-width="3.7" stroke-linecap="round"/>`;
    out+=`<circle cx="${cx}" cy="${y0+length+3}" r="3.2" fill="${color(group.strands[1].colorId).hex}"/></g>`;
    return out;
  }

  function renderSVG(spec,options={}){
    const s=normalizeSpec(spec),selected=options.selectedGroupId||null;
    const idPrefix=String(options.idPrefix||'tct').replace(/[^a-z0-9_-]/gi,'');
    const titleId=`${idPrefix}Title`,descriptionId=`${idPrefix}Desc`;
    const sizeInfo=size(s.sizeId),coletHex=color(s.colet.colorId).hex;
    const width=340,height=420,cx=170,ringY=64,ringRadius=39,y0=111;
    const length=100+sizeInfo.lengthCm*1.82,endY=y0+length;
    const trenza=s.groups.find(group=>group.role==='trenza');
    const centro=s.groups.find(group=>group.role==='centro');
    const espiral=s.groups.find(group=>group.role==='espiral');
    let svg=`<svg class="product-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="${titleId} ${descriptionId}" xmlns="http://www.w3.org/2000/svg">`;
    svg+=`<title id="${titleId}">Vista previa de TuconTu</title><desc id="${descriptionId}">TuconTu de ${sizeInfo.lengthCm} centímetros: colet ${esc(color(s.colet.colorId).name)}, trenza izquierda de tres cordones, embarrilado central de cuatro cordones y espiral derecha de dos cordones.</desc>`;
    svg+=`<defs><linearGradient id="${idPrefix}Paper" x2="0" y2="1"><stop stop-color="#faf7f1"/><stop offset="1" stop-color="#e9dfcf"/></linearGradient><linearGradient id="${idPrefix}Hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4a382d"/><stop offset=".55" stop-color="#80604b"/><stop offset="1" stop-color="#3d3028"/></linearGradient><filter id="${idPrefix}Soft"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
    if(options.showLengthGuide){
      const hair=`M119 45 C102 58 101 82 112 100 C118 111 126 116 132 120 M221 44 C239 59 240 83 228 101 C221 112 214 117 208 120`;
      svg+=`<path d="${hair}" fill="none" stroke="#806c58" stroke-opacity=".22" stroke-width="14" stroke-linecap="round" filter="url(#${idPrefix}Soft)"/>`;
    }
    svg+=`<path d="M128 77 C121 38 202 28 218 67 C231 101 217 133 231 164 C250 208 244 278 224 332 C207 375 132 383 111 333 C91 285 93 222 112 175 C127 140 137 113 128 77Z" fill="url(#${idPrefix}Hair)" stroke="#624a39" stroke-opacity=".32" stroke-width="1.2"/>`;
    svg+=`<path d="M143 136 C140 203 146 274 137 342 M205 139 C214 210 210 281 202 344" fill="none" stroke="#d9c7ad" stroke-opacity=".22" stroke-width="2"/>`;
    svg+=renderBraid(trenza,96,y0,length,selected===trenza.id);
    svg+=renderCenter(centro,s.colet.colorId,cx,y0,length,selected===centro.id);
    svg+=renderSpiral(espiral,244,y0,length,selected===espiral.id);
    svg+=`<path d="M130 74 C134 48 164 36 188 47 C209 57 216 79 207 98 C199 116 175 122 154 111 C137 102 127 90 130 74Z" fill="none" stroke="#c9a06a" stroke-width="8"/><path d="M133 73 C138 52 164 42 185 51 C203 59 210 77 204 94 C196 111 175 116 156 107 C140 99 131 88 133 73Z" fill="none" stroke="#f0dfc5" stroke-width="1.8" opacity=".85"/>`;
    svg+=`<circle cx="${cx}" cy="${ringY}" r="${ringRadius}" fill="#f5f3ec" stroke="#5d4438" stroke-opacity=".2" stroke-width="13"/><circle cx="${cx}" cy="${ringY}" r="${ringRadius}" fill="none" stroke="${coletHex}" stroke-width="9"/><circle cx="${cx-3}" cy="${ringY-4}" r="${ringRadius}" fill="none" stroke="#fff8ea" stroke-opacity="${s.colet.colorId==='negro'?'.76':'.34'}" stroke-width="2"/><path d="M${cx-18},95 C${cx-12},111 ${cx+12},111 ${cx+18},95" fill="none" stroke="${coletHex}" stroke-width="10" stroke-linecap="round"/>`;
    svg+=`<path d="M${cx-27} ${endY+11} L${cx+27} ${endY+11}" stroke="#d1c4ae" stroke-width="1" stroke-dasharray="2 4"/><text x="${cx}" y="${endY+24}" text-anchor="middle" fill="#756d62" font-size="8" font-family="Arial, sans-serif">${sizeInfo.lengthCm} cm</text>`;
    svg+='</svg>';
    return svg;
  }

  return {VERSION,SCHEMA,MAX_GROUPS,MAX_STRANDS,MAX_WRAPS,CATALOG,ROLE_ORDER,ROLE_INFO,defaultSpec,normalizeSpec,stableString,designCode,toManufacturingSpec,toCoreProduct,summaryText,renderSVG};
});
