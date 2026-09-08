(function(){
  'use strict';
  if(window.__civilKoshWorkbookInstalled)return;
  window.__civilKoshWorkbookInstalled=true;
  const escW=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const numW=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
  const fmtW=v=>typeof fmt==='function'?fmt(numW(v)):numW(v).toFixed(2);
  const moneyW=v=>typeof money==='function'?money(v):`NPR ${fmtW(v)}`;
  const navItems=[['boqMaster','BOQ MASTER'],['measurementMb','MEASUREMENT / MB'],['quantityAbstract','QUANTITY ABSTRACT'],['rateAnalysisRoot','RATE ANALYSIS'],['ipcRoot','IPC / RUNNING BILL'],['variationSection','VARIATION'],['evidenceSection','EVIDENCE & DOCUMENTS'],['reportsPrint','REPORTS / PRINT']];

  function installStyle(){
    if(document.getElementById('civilkoshWorkbookStyle'))return;
    const style=document.createElement('style');
    style.id='civilkoshWorkbookStyle';
    style.textContent=`
      .ck-workbook-shell{grid-column:1 / -1;width:100%;min-width:0;margin:0 0 16px;border:1px solid #c8d0cb;border-radius:8px;background:#f4f6f5;box-shadow:0 2px 8px rgba(32,37,34,.05);overflow:hidden;position:sticky;top:0;z-index:30}
      .ck-workbook-titlebar{display:flex;align-items:center;min-height:38px;padding:7px 12px;background:#e7ece9;border-bottom:1px solid #c8d0cb;color:#25312c}
      .ck-workbook-title{font-size:12px;font-weight:850;letter-spacing:.12em;line-height:1;text-transform:uppercase}
      .ck-workbook-subtitle{margin-left:10px;color:#68746e;font-size:10px;font-weight:600;letter-spacing:.02em}
      .ck-workbook-nav{display:block;width:100%;box-sizing:border-box;padding:0 7px;background:#eef1ef}
      .ck-workbook-nav-inner{display:flex;align-items:flex-end;gap:3px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;white-space:nowrap;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
      .ck-workbook-nav a{position:relative;display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;min-height:34px;margin-top:5px;padding:6px 11px;border:1px solid #c5ceca;border-bottom-color:#b9c4be;border-radius:6px 6px 0 0;background:#f9faf9;color:#44514b;text-decoration:none;font-size:10.5px;font-weight:800;letter-spacing:.035em;line-height:1;outline:none}
      .ck-workbook-nav a:hover{background:#fff;color:#24312b}
      .ck-workbook-nav a:focus-visible{z-index:2;box-shadow:0 0 0 2px rgba(22,113,91,.22)}
      .ck-workbook-nav a[aria-current="page"]{margin-top:2px;min-height:37px;border-color:#aebbb4;border-bottom-color:#fff;background:#fff;color:#123f32;box-shadow:0 -2px 0 #16715b inset}
      .ck-workbook-nav a[aria-current="page"]:before{content:"";position:absolute;top:-1px;left:10px;right:10px;height:2px;border-radius:2px;background:#16715b}
      #quantityAbstract{grid-column:1 / -1;scroll-margin-top:92px;margin-top:12px}
      #quantityAbstract .panel-head{margin-bottom:5px}
      .ck-abstract-note{font-size:12px;color:#5b635e;margin:0 0 8px}
      .ck-abstract-wrap{overflow-x:auto}
      .ck-abstract-table{min-width:1180px;font-size:11.5px}
      .ck-abstract-table th,.ck-abstract-table td{padding:5px 6px;vertical-align:middle}
      .ck-abstract-table th{white-space:nowrap}
      .ck-abstract-table td.num{white-space:nowrap}
      .ck-abstract-table .ck-progress{min-width:72px}
      .ck-source-links{display:flex;gap:7px;flex-wrap:wrap;margin-top:4px}
      .ck-source-link{font-size:10px;line-height:1.2;color:#16715b;text-decoration:underline;text-underline-offset:2px;cursor:pointer;white-space:nowrap;font-weight:700}
      .ck-row-link{font-size:10.5px;margin-left:5px;color:#16715b;text-decoration:underline;text-underline-offset:2px;cursor:pointer;white-space:nowrap;font-weight:700}
      .ck-linked-row{scroll-margin-top:96px}
      #boqMaster,#measurementMb,#rateAnalysisRoot,#ipcRoot,#variationSection,#evidenceSection,#reportsPrint{scroll-margin-top:96px}
      @media(max-width:700px){
        .ck-workbook-shell{margin-left:-4px;margin-right:-4px;width:calc(100% + 8px);border-radius:6px}
        .ck-workbook-titlebar{min-height:34px;padding:6px 10px}
        .ck-workbook-title{font-size:10.5px}
        .ck-workbook-subtitle{display:none}
        .ck-workbook-nav{padding:0 4px}
        .ck-workbook-nav a{min-height:32px;padding:6px 9px;font-size:10px}
        .ck-workbook-nav a[aria-current="page"]{min-height:35px}
        .ck-abstract-table{font-size:11px}
        .ck-source-link,.ck-row-link{font-size:10px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureAnchor(id,element){if(!element)return null;element.id=id;return element}
  function locateAnchors(){
    const layout=document.querySelector('.boq-layout');
    ensureAnchor('boqMaster',layout);
    ensureAnchor('measurementMb',document.querySelector('.summary-grid'));
    const rate=document.getElementById('rateAnalysisRoot');if(rate)ensureAnchor('rateAnalysisRoot',rate);
    const ipc=document.getElementById('ipcRoot');if(ipc)ensureAnchor('ipcRoot',ipc);
    const variation=document.querySelector('[data-variation-fields]');if(variation)ensureAnchor('variationSection',variation);
    const evidence=ipc?[...ipc.querySelectorAll('details')].find(x=>/IPC Evidence \/ Document Register/i.test(x.querySelector('summary')?.textContent||'')):null;if(evidence)ensureAnchor('evidenceSection',evidence);
    const reports=document.querySelector('.boq-actions');if(reports)ensureAnchor('reportsPrint',reports);
  }
  function openTarget(target){
    if(!target)return;
    const detail=target.closest('details');if(detail)detail.open=true;
    target.scrollIntoView({behavior:'smooth',block:'start'});
    history.replaceState(null,'',`#${target.id}`);
    setActiveTab(target.id);
  }
  function setActiveTab(id){
    const nav=document.getElementById('civilkoshWorkbookNav');if(!nav)return;
    nav.querySelectorAll('a[data-workbook-target]').forEach(a=>a.setAttribute('aria-current',a.dataset.workbookTarget===id?'page':''));
  }
  function renderNav(){
    locateAnchors();
    const host=document.querySelector('.boq-section>.container');if(!host)return;
    let shell=document.getElementById('civilkoshWorkbookShell');
    if(!shell){
      shell=document.createElement('section');
      shell.id='civilkoshWorkbookShell';
      shell.className='ck-workbook-shell';
      shell.setAttribute('aria-label','Project Workbook');
      host.insertBefore(shell,host.firstElementChild);
    }
    shell.innerHTML=`<div class="ck-workbook-titlebar"><span class="ck-workbook-title">PROJECT WORKBOOK</span><span class="ck-workbook-subtitle">Linked project control sheets</span></div><div id="civilkoshWorkbookNav" class="ck-workbook-nav" role="tablist" aria-label="Project workbook sheets"><div class="ck-workbook-nav-inner">${navItems.map(([id,label])=>`<a href="#${id}" data-workbook-target="${id}" role="tab">${label}</a>`).join('')}</div></div>`;
    shell.querySelectorAll('a[data-workbook-target]').forEach(a=>a.addEventListener('click',e=>{const target=document.getElementById(a.dataset.workbookTarget);if(!target)return;e.preventDefault();openTarget(target)}));
    const hash=location.hash.replace(/^#/,'');
    const initial=navItems.some(([id])=>id===hash)?hash:'boqMaster';
    setActiveTab(initial);
  }

  function savedRows(item,index){
    const records=Array.isArray(item?.ipcRecords)?item.ipcRecords.filter(r=>r&&r.no):[];
    const byNo=new Map();records.forEach(r=>{if(!byNo.has(r.no))byNo.set(r.no,r)});
    const unique=[...byNo.values()].sort((a,b)=>(typeof ipcOrdinal==='function'?ipcOrdinal(a.no):0)-(typeof ipcOrdinal==='function'?ipcOrdinal(b.no):0));
    const active=typeof ipcState!=='undefined'?ipcState.record:null;let previous=0,current=0;
    if(active?.editingNo){previous=typeof ipcPrevQty==='function'?ipcPrevQty(item,active.editingNo):unique.filter(r=>(typeof ipcOrdinal==='function'?ipcOrdinal(r.no):0)<(typeof ipcOrdinal==='function'?ipcOrdinal(active.editingNo):0)).reduce((s,r)=>s+numW(r.items?.find(x=>x.itemIndex===index)?.current),0);current=numW(active.items?.find(x=>x.itemIndex===index)?.current)}
    else if(active?.no&&Array.isArray(active.items)&&active.items.length){previous=unique.reduce((s,r)=>s+numW(r.items?.find(x=>x.itemIndex===index)?.current),0);current=numW(active.items.find(x=>x.itemIndex===index)?.current)}
    else if(unique.length){const latest=unique[unique.length-1];current=numW(latest.items?.find(x=>x.itemIndex===index)?.current);previous=unique.slice(0,-1).reduce((s,r)=>s+numW(r.items?.find(x=>x.itemIndex===index)?.current),0)}
    const cumulative=previous+current;const limit=typeof variationAllowedQty==='function'?numW(variationAllowedQty(item)):numW(item.qty);const balance=limit-cumulative;const progress=limit>0?Math.max(0,cumulative/limit*100):0;
    return{previous,current,cumulative,limit,balance,progress,previousAmount:previous*numW(item.rate),currentAmount:current*numW(item.rate),cumulativeAmount:cumulative*numW(item.rate)};
  }

  function renderAbstract(){
    if(typeof items==='undefined')return;
    const host=document.getElementById('quantityAbstract');if(!host||!Array.isArray(items))return;
    const rows=items.map((item,i)=>({item,data:savedRows(item,i),index:i}));
    host.innerHTML=`<div class="panel-head"><div><span class="panel-kicker">QUANTITY ABSTRACT</span><h2>Certified Quantity &amp; Payment Bridge</h2></div><span class="panel-note">Linked to saved Measurement / MB and IPC history</span></div><p class="ck-abstract-note">Certified quantities are derived from the existing saved IPC history; Measurement / MB remains the supporting quantity and verification source. No duplicate quantity entry is required here.</p><div class="ck-abstract-wrap"><table class="boq-table ck-abstract-table"><thead><tr><th>Item No.</th><th>Description</th><th>Unit</th><th class="num">BOQ Qty</th><th class="num">Previous Certified Qty</th><th class="num">Current Certified Qty</th><th class="num">Cumulative Certified Qty</th><th class="num">Balance Qty</th><th class="num">Rate</th><th class="num">Previous Amount</th><th class="num">Current Amount</th><th class="num">Cumulative Amount</th><th class="num ck-progress">Progress %</th></tr></thead><tbody>${rows.length?rows.map(({item,data,index})=>`<tr><td>${escW(item.no)}</td><td>${escW(item.desc)}<div class="ck-source-links"><a href="#boqMaster" class="ck-source-link" data-boq-item="${index}">View BOQ</a><a href="#measurementMb" class="ck-source-link" data-measurement-item="${index}">View Measurements</a><a href="#ipcRoot" class="ck-source-link" data-ipc-item="${index}">View IPC</a></div></td><td>${escW(item.unit)}</td><td class="num">${fmtW(item.qty)}</td><td class="num">${fmtW(data.previous)}</td><td class="num">${fmtW(data.current)}</td><td class="num">${fmtW(data.cumulative)}</td><td class="num">${fmtW(data.balance)}</td><td class="num">${moneyW(item.rate)}</td><td class="num">${moneyW(data.previousAmount)}</td><td class="num">${moneyW(data.currentAmount)}</td><td class="num">${moneyW(data.cumulativeAmount)}</td><td class="num">${fmtW(data.progress)}%</td></tr>`).join(''):'<tr><td colspan="13">No saved BOQ items yet.</td></tr>'}</tbody></table></div>`;
    bindSourceLinks();
  }

  function installAbstract(){
    const summary=document.querySelector('.summary-grid');
    if(!summary||document.getElementById('quantityAbstract'))return;
    const section=document.createElement('section');section.id='quantityAbstract';section.className='boq-panel';summary.after(section);renderAbstract();
  }
  function focusBoq(index){const row=document.getElementById(`ck-boq-item-${index}`);openTarget(row||document.getElementById('boqMaster'));}
  function focusMeasurement(index,recordIndex){const sel=document.getElementById('measurementMbItem');if(sel){sel.value=String(index);sel.dispatchEvent(new Event('change'))}setTimeout(()=>openTarget(document.getElementById(`ck-measurement-record-${index}-${recordIndex}`)||document.getElementById('measurementMb')),0)}
  function focusIpc(){openTarget(document.getElementById('ipcRoot'));}
  function bindSourceLinks(){
    const root=document.getElementById('quantityAbstract');if(!root)return;
    root.querySelectorAll('[data-boq-item]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();focusBoq(Number(a.dataset.boqItem))}));
    root.querySelectorAll('[data-measurement-item]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();focusMeasurement(Number(a.dataset.measurementItem),-1)}));
    root.querySelectorAll('[data-ipc-item]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();focusIpc()}));
  }
  function decorateBoq(){
    const body=document.getElementById('boqRows');if(!body)return;
    [...body.querySelectorAll('tr')].forEach((row,index)=>{if(index>=((typeof items!=='undefined'&&Array.isArray(items))?items.length:0))return;row.id=`ck-boq-item-${index}`;row.classList.add('ck-linked-row');const cell=row.cells?.[0];if(cell&&!cell.querySelector('[data-boq-source]')){const link=document.createElement('a');link.className='ck-row-link';link.href='#measurementMb';link.dataset.boqSource='';link.textContent='View Measurements';link.addEventListener('click',e=>{e.preventDefault();focusMeasurement(index,-1)});cell.appendChild(link)}});
  }
  function decorateMeasurement(){
    const body=document.getElementById('measurementMbRows');if(!body)return;const rows=[];
    if(typeof items!=='undefined'&&Array.isArray(items))items.forEach((item,itemIndex)=>(item?.measurementRecords||[]).forEach((record,recordIndex)=>rows.push({item,itemIndex,record,recordIndex})));
    [...body.querySelectorAll('tr')].filter(x=>!x.classList.contains('mb-detail-row')).forEach((row,i)=>{const x=rows[i];if(!x)return;row.id=`ck-measurement-record-${x.itemIndex}-${x.recordIndex}`;row.classList.add('ck-linked-row');const cell=row.cells?.[2];if(cell&&!cell.querySelector('[data-boq-source]')){const link=document.createElement('a');link.className='ck-row-link';link.href='#boqMaster';link.dataset.boqSource='';link.textContent='View BOQ';link.addEventListener('click',e=>{e.preventDefault();focusBoq(x.itemIndex)});cell.appendChild(link)}});
  }
  function decorateIpc(){
    const root=document.getElementById('ipcRoot');if(!root)return;const table=[...root.querySelectorAll('.boq-table')].find(t=>t.querySelector('th')?.textContent?.trim()==='Item');if(!table)return;
    table.querySelectorAll('tbody tr').forEach((row,index)=>{if(typeof items==='undefined'||!items[index])return;row.id=`ck-ipc-item-${index}`;row.classList.add('ck-linked-row');const cell=row.cells?.[0];if(cell&&!cell.querySelector('[data-mb-source]')){const link=document.createElement('a');link.className='ck-row-link';link.href='#measurementMb';link.dataset.mbSource='';link.textContent='View MB';link.addEventListener('click',e=>{e.preventDefault();focusMeasurement(index,-1)});cell.appendChild(link)}});
  }
  function decorate(){decorateBoq();decorateMeasurement();decorateIpc();}
  function refresh(){renderAbstract();renderNav();decorate();}
  function wrapGlobal(name,after){const original=window[name];if(typeof original!=='function'||original.__workbookWrapped)return;const wrapped=function(){const result=original.apply(this,arguments);after();return result};wrapped.__workbookWrapped=true;window[name]=wrapped;}
  function observeActiveSections(){
    if(!('IntersectionObserver'in window))return;
    const targets=navItems.map(([id])=>document.getElementById(id)).filter(Boolean);
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)setActiveTab(entry.target.id)})},{root:null,rootMargin:'-88px 0px -60% 0px',threshold:0});
    targets.forEach(target=>observer.observe(target));
  }
  function install(){
    installStyle();installAbstract();refresh();wrapGlobal('render',refresh);wrapGlobal('ipcRender',refresh);wrapGlobal('saveMeasurement',refresh);
    observeActiveSections();
    const observer=new MutationObserver(()=>{if(!document.getElementById('quantityAbstract'))installAbstract();locateAnchors();decorate()});
    const root=document.querySelector('.boq-section>.container');if(root)observer.observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
