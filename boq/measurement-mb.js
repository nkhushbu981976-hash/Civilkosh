(function(){
  const mb$=id=>document.getElementById(id);
  const mbNum=n=>typeof fmt==='function'?fmt(n):new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0);
  const mbEsc=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const mbMoney=(n,unit)=>`${mbNum(n)} ${unit||''}`.trim();
  function mbItems(){return typeof items!=='undefined'&&Array.isArray(items)?items:[]}
  function mbVerification(item,itemIndex,recordIndex){
    const refs=[];
    (item?.ipcRecords||[]).forEach(ipc=>{
      if(!ipc?.no||!Array.isArray(ipc.items))return;
      const saved=ipc.items.find(x=>Number(x?.itemIndex)===itemIndex);
      if(!saved)return;
      const evidence=Array.isArray(saved.evidence)?saved.evidence:[];
      if(evidence.some(x=>Number(x)===recordIndex))refs.push({no:String(ipc.no),qty:Number(saved.current)||0});
    });
    return refs;
  }
  function mbBreakdownHtml(record){
    const rows=Array.isArray(record?.breakdowns)?record.breakdowns:[];
    if(!rows.length)return '<p class="muted-note">No detailed measurement breakdown was saved with this record.</p>';
    return `<div class="mb-breakdown-table-wrap"><table class="mb-breakdown-table"><thead><tr><th>Line</th><th>Type</th><th>Element / Work Face</th><th>Location / ID</th><th>Calculation / Basis</th><th class="num">Quantity</th></tr></thead><tbody>${rows.map((r,i)=>{const d=r?.detail||{};const basis=d.calculation||'';const type=d.type||'General / L×W×H';const location=r.location||d.memberId||'';const dims=[r.length,r.width,r.height].filter(v=>v!==''&&v!=null);const formula=(basis||dims.length)?`${basis}${basis&&dims.length?' · ':''}${dims.join(' × ')}${r.number!=null?` × ${r.number}`:''}${r.factor!=null?` × ${r.factor}`:''}`:'—';return `<tr><td>${i+1}</td><td>${mbEsc(type)}</td><td>${mbEsc(d.element||'—')}</td><td>${mbEsc(location||'—')}</td><td>${mbEsc(formula)}</td><td class="num">${r.quantity==null?'—':mbNum(r.quantity)}</td></tr>`}).join('')}</tbody></table></div>`;
  }
  function mbRecordRow(item,itemIndex,record,recordIndex){
    const cumulative=record?.previous!=null&&record?.current!=null?Number(record.previous)+Number(record.current):null;
    const verification=mbVerification(item,itemIndex,recordIndex);
    const ipcText=verification.length?verification.map(v=>`${mbEsc(v.no)} · ${mbNum(v.qty)} ${mbEsc(item.unit)}`).join('<br>'):'—';
    return `<tr><td>${recordIndex+1}</td><td>${mbEsc(record?.date||'—')}</td><td>${mbEsc(item.no)}</td><td>${mbEsc(item.desc||'—')}</td><td>${mbEsc(record?.location||'—')}</td><td>${mbEsc(record?.drawingReference||'—')}</td><td>${mbEsc(record?.note||'—')}</td><td class="num">${record?.measured==null?'—':mbMoney(record.measured,item.unit)}</td><td class="num">${record?.approved==null?'—':mbMoney(record.approved,item.unit)}</td><td class="num">${record?.previous==null?'—':mbMoney(record.previous,item.unit)}</td><td class="num">${record?.current==null?'—':mbMoney(record.current,item.unit)}</td><td class="num">${cumulative==null?'—':mbMoney(cumulative,item.unit)}</td><td>${mbEsc(record?.remarks||'—')}</td><td>${ipcText}</td></tr><tr class="mb-detail-row"><td colspan="14"><details><summary>Detailed measurement breakdown${Array.isArray(record?.breakdowns)&&record.breakdowns.length?` (${record.breakdowns.length} line${record.breakdowns.length===1?'':'s'})`:''}</summary>${mbBreakdownHtml(record)}</details></td></tr>`;
  }
  function mbRender(){
    const root=mb$('measurementMbWorkspace');if(!root)return;
    const itemsList=mbItems(),filter=mb$('measurementMbItem')?.value||'',rows=[];
    itemsList.forEach((item,itemIndex)=>{if(filter!==''&&String(itemIndex)!==filter)return;(item?.measurementRecords||[]).forEach((record,recordIndex)=>rows.push(mbRecordRow(item,itemIndex,record,recordIndex)));});
    const body=mb$('measurementMbRows');
    if(body)body.innerHTML=rows.length?rows.join(''):'<tr><td colspan="14" class="mb-empty">No saved Measurement / MB records match the selected BOQ item.</td></tr>';
    const summary=mb$('measurementMbSummary');
    if(summary)summary.textContent=`${rows.length} saved Measurement Record${rows.length===1?'':'s'} · source: existing measurementRecords`;
  }
  function mbPopulateItems(){
    const sel=mb$('measurementMbItem');if(!sel)return;
    const current=sel.value;
    sel.innerHTML='<option value="">All BOQ Items</option>'+mbItems().map((item,i)=>`<option value="${i}">${mbEsc(item.no)} — ${mbEsc(item.desc)}</option>`).join('');
    if(mbItems().some((_,i)=>String(i)===current))sel.value=current;
  }
  function mbInit(){
    if(document.getElementById('measurementMbWorkspace'))return;
    const anchor=document.querySelector('.summary-grid');
    if(!anchor)return;
    const css=document.createElement('link');css.rel='stylesheet';css.href='measurement-mb.css';document.head.appendChild(css);
    anchor.insertAdjacentHTML('afterend',`<section id="measurementMbWorkspace" class="boq-panel measurement-mb-panel" aria-labelledby="measurementMbTitle"><div class="panel-head"><div><span class="panel-kicker">MEASUREMENT / MB</span><h2 id="measurementMbTitle">Measurement / MB Verification</h2></div><span id="measurementMbSummary" class="panel-note"></span></div><div class="mb-toolbar"><label>BOQ Item<select id="measurementMbItem"><option value="">All BOQ Items</option></select></label><span>Review-only register linked to saved Measurement Records; no duplicate quantity entry.</span></div><div class="boq-table-wrap mb-table-wrap"><table class="boq-table mb-table"><thead><tr><th>Record No.</th><th>Date</th><th>BOQ Item No.</th><th>Work Description</th><th>Location / Reference</th><th>Drawing / Reference</th><th>Measurement Note</th><th class="num">Measured Qty</th><th class="num">Approved Qty</th><th class="num">Previous Certified Qty</th><th class="num">Current IPC Qty</th><th class="num">Cumulative Certified Qty</th><th>Remarks</th><th>IPC Evidence / Verification</th></tr></thead><tbody id="measurementMbRows"></tbody></table></div></section>`);
    mbPopulateItems();
    mb$('measurementMbItem')?.addEventListener('change',mbRender);
    mbRender();
    document.addEventListener('click',e=>{if(e.target.closest('#saveMeasurement,#addMeasurementBreakdown,[data-remove-measurement]'))setTimeout(()=>{mbPopulateItems();mbRender()},0)});
  }
  window.measurementMbRefresh=mbRender;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mbInit);else mbInit();
})();

/* Print-only linkage: reuse the same saved measurementRecords data shown above. */
(function(){
  if(window.__measurementMbPrintLinkInstalled)return;
  window.__measurementMbPrintLinkInstalled=true;
  function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function fmt(v){return Number.isFinite(Number(v))?Number(v).toFixed(2):'—'}
  function unit(v,u){return v==null?'—':`${fmt(v)} ${esc(u||'')}`.trim()}
  function records(){
    const source=Array.isArray(window.items)?window.items:[];
    const out=[];
    source.forEach((item,itemIndex)=>{
      (item&&Array.isArray(item.measurementRecords)?item.measurementRecords:[]).forEach((m,index)=>out.push({item,itemIndex,m,index}));
    });
    return out;
  }
  function ipcLinks(itemIndex,recordIndex){
    const state=window.ipcState&&window.ipcState.record;
    const links=[];
    (itemIndex>=0&&Array.isArray(window.items?.[itemIndex]?.ipcRecords)?window.items[itemIndex].ipcRecords:[]).forEach(ipc=>{
      if(!ipc?.no||!Array.isArray(ipc.items))return;
      const saved=ipc.items.find(x=>Number(x?.itemIndex)===itemIndex);
      if(Array.isArray(saved?.evidence)&&saved.evidence.some(x=>Number(x)===recordIndex))links.push({no:String(ipc.no),qty:Number(saved.current)||0});
    });
    if(state?.no&&Array.isArray(state.items)){
      const saved=state.items.find(x=>Number(x?.itemIndex)===itemIndex);
      if(Array.isArray(saved?.evidence)&&saved.evidence.some(x=>Number(x)===recordIndex)&&!links.some(x=>x.no===state.no))links.push({no:String(state.no),qty:Number(saved.current)||0});
    }
    return links;
  }
  function breakdown(b){
    const d=b?.detail||{};
    const type=d.type||'General / L×W×H';
    const element=[d.element,d.memberId].filter(Boolean).join(' · ')||'—';
    const dims=[b?.length,b?.width,b?.height].filter(v=>v!==''&&v!=null).join(' × ');
    const calc=d.calculation||[dims,b?.number!=null?`× ${b.number}`:'',b?.factor!=null?`× ${b.factor}`:''].filter(Boolean).join(' ');
    const notes=[d.barMark&&`Bar Mark: ${d.barMark}`,d.barType&&`Bar Type / Shape: ${d.barType}`,d.deduction&&`Deduction: ${d.deduction}`,d.addition&&`Addition: ${d.addition}`,b?.note].filter(Boolean).join(' · ');
    return `<tr><td>${esc(type)}</td><td>${esc(element)}</td><td>${esc(b?.length===''?'—':b?.length??'—')}</td><td>${esc(b?.width===''?'—':b?.width??'—')}</td><td>${esc(b?.height===''?'—':b?.height??'—')}</td><td>${esc(b?.number??'—')}</td><td>${esc(b?.factor??'—')}</td><td>${esc(calc||'—')}${notes?`<div class="small">${esc(notes)}</div>`:''}</td><td class="num">${b?.quantity==null?'—':fmt(b.quantity)}</td></tr>`;
  }
  function recordHtml(x){
    const m=x.m||{},previous=m.previous==null?null:Number(m.previous),current=m.current==null?null:Number(m.current),cumulative=previous==null||current==null?null:previous+current;
    const links=ipcLinks(x.itemIndex,x.index);
    const bs=Array.isArray(m.breakdowns)?m.breakdowns:[];
    const breakdownHtml=bs.length?`<div class="table-wrap"><table class="evidence-record-table"><thead><tr><th>Type</th><th>Element / Member ID</th><th>L</th><th>W</th><th>H / D / T</th><th>No.</th><th>Factor</th><th>Calculation / Basis</th><th class="num">Qty</th></tr></thead><tbody>${bs.map(breakdown).join('')}</tbody></table></div>`:'';
    return `<div class="evidence-group"><div class="evidence-head"><div><strong>Record No.</strong><span>Record ${x.index+1}</span></div><div><strong>BOQ Item</strong><span>${esc(x.item?.no||'—')}</span></div><div><strong>Date</strong><span>${esc(m.date||'—')}</span></div><div><strong>Location / Reference</strong><span>${esc(m.location||'—')}</span></div><div><strong>Drawing / Reference</strong><span>${esc(m.drawingReference||'—')}</span></div></div><div class="table-wrap"><table class="evidence-record-table"><thead><tr><th>Work Description / Measurement Note</th><th class="num">Measured Qty</th><th class="num">Approved Qty</th><th class="num">Previous Certified Qty</th><th class="num">Current IPC Qty</th><th class="num">Cumulative Certified Qty</th><th>Remarks</th><th>IPC Evidence / Verification</th></tr></thead><tbody><tr><td>${esc(x.item?.desc||'—')}${m.note?`<div class="small">${esc(m.note)}</div>`:''}</td><td class="num">${unit(m.measured,x.item?.unit)}</td><td class="num">${unit(m.approved,x.item?.unit)}</td><td class="num">${unit(previous,x.item?.unit)}</td><td class="num">${unit(current,x.item?.unit)}</td><td class="num">${unit(cumulative,x.item?.unit)}</td><td>${esc(m.remarks||'—')}</td><td>${links.length?links.map(l=>`${esc(l.no)} · ${fmt(l.qty)} ${esc(x.item?.unit||'')}`).join('<br>'):'Record retained for Measurement / MB history; no current IPC linkage recorded.'}</td></tr></tbody></table></div>${breakdownHtml?`<div style="padding:4pt"><strong>Detailed Measurement Breakdown</strong>${breakdownHtml}</div>`:''}</div>`;
  }
  function linkedSectionHtml(){
    const rows=records();
    if(!rows.length)return '<p class="section-note">No saved Measurement / MB records are available.</p>';
    return `<p class="section-note">Measurement / MB verification is read directly from the saved measurementRecords data. Records with Current IPC Qty = 0 are retained where they form part of the saved measurement history or evidence trail.</p>${rows.map(recordHtml).join('')}`;
  }
  function patch(html){
    try{
      const doc=new DOMParser().parseFromString(html,'text/html');
      const target=[...doc.querySelectorAll('.section')].find(s=>/Measurement \/ MB Verification/i.test(s.querySelector('.section-title')?.textContent||''));
      if(target)target.innerHTML=`<h2 class="section-title">4. Measurement / MB Verification</h2>${linkedSectionHtml()}`;
      const state=window.ipcState&&window.ipcState.record||{};
      const number=String(state.no||state.editingNo||'').trim();
      if(number){
        doc.querySelectorAll('.meta-row').forEach(row=>{if(/IPC \/ Running Bill No\./i.test(row.querySelector('strong')?.textContent||'')){const span=row.querySelector('span');if(span)span.textContent=number}});
        doc.querySelectorAll('.mast .docref').forEach(el=>{if(el.textContent.trim()==='')el.textContent=number});
      }
      return '<!doctype html>'+doc.documentElement.outerHTML;
    }catch(e){return html}
  }
  const nativeOpen=window.open;
  window.open=function(){
    const w=nativeOpen.apply(window,arguments);
    if(!w||!w.document)return w;
    const originalWrite=w.document.write.bind(w.document);
    w.document.write=function(html){return originalWrite(patch(html))};
    return w;
  };
})();
