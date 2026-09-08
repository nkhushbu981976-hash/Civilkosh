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

/* Print-only linkage: compact Section 4 presentation using the existing saved measurementRecords. */
(function(){
  if(window.__measurementMbPrintLinkInstalled)return;
  window.__measurementMbPrintLinkInstalled=true;
  function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function fmt(v){return Number.isFinite(Number(v))?Number(v).toFixed(2):'—'}
  function qty(v,u){return v==null?'—':`${fmt(v)} ${esc(u||'')}`.trim()}
  function sourceItems(){return typeof items!=='undefined'&&Array.isArray(items)?items:[]}
  function records(){
    const out=[];
    sourceItems().forEach((item,itemIndex)=>(item?.measurementRecords||[]).forEach((m,index)=>out.push({item,itemIndex,m,index})));
    return out;
  }
  function ipcLinks(itemIndex,recordIndex){
    const state=typeof ipcState!=='undefined'&&ipcState?.record?ipcState.record:null,source=sourceItems(),links=[];
    (Array.isArray(source[itemIndex]?.ipcRecords)?source[itemIndex].ipcRecords:[]).forEach(ipc=>{
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
  function breakdownRows(x){
    const bs=Array.isArray(x.m?.breakdowns)?x.m.breakdowns:[];
    if(!bs.length)return '';
    return bs.map(b=>{
      const d=b?.detail||{},type=d.type||'General / L×W×H',element=[d.element,d.memberId].filter(Boolean).join(' · ')||'—';
      const l=b?.length===''?'—':b?.length??'—',w=b?.width===''?'—':b?.width??'—',h=b?.height===''?'—':b?.height??'—';
      const calc=d.calculation||[l!=='—'?l:'',w!=='—'?w:'',h!=='—'?h:'',b?.number!=null?`× ${b.number}`:'',b?.factor!=null?`× ${b.factor}`:''].filter(Boolean).join(' × ')||'—';
      return `<tr><td>Record ${x.index+1}</td><td>${esc(type)}</td><td>${esc(element)}</td><td>${esc(l)}</td><td>${esc(w)}</td><td>${esc(h)}</td><td>${esc(b?.number??'—')}</td><td>${esc(b?.factor??'—')}</td><td>${esc(calc)}</td><td class="num">${b?.quantity==null?'—':fmt(b.quantity)}</td></tr>`;
    }).join('');
  }
  function summaryRows(rows){
    return rows.map(x=>{const m=x.m||{},links=ipcLinks(x.itemIndex,x.index),prev=m.previous==null?null:Number(m.previous),cur=m.current==null?null:Number(m.current),cum=prev==null||cur==null?null:prev+cur;
      return `<tr><td>${x.index+1}</td><td>${esc(m.date||'—')}</td><td>${esc(x.item?.no||'—')}</td><td>${esc(m.location||'—')}</td><td>${esc(m.drawingReference||'—')}</td><td class="num">${qty(m.measured,x.item?.unit)}</td><td class="num">${qty(m.approved,x.item?.unit)}</td><td class="num">${qty(prev,x.item?.unit)}</td><td class="num">${qty(cur,x.item?.unit)}</td><td class="num">${qty(cum,x.item?.unit)}</td></tr>`;
    }).join('');
  }
  function detailRows(rows){
    return rows.map(x=>{const bs=Array.isArray(x.m?.breakdowns)?x.m.breakdowns:[];if(!bs.length)return '';
      return `<tr class="mb-record-label"><td colspan="10"><strong>Record ${x.index+1}</strong> · ${esc(x.item?.no||'—')} · ${esc(x.m?.date||'—')} · ${esc(x.m?.location||'—')} · ${esc(x.m?.drawingReference||'—')}</td></tr>${breakdownRows(x)}`;
    }).join('');
  }
  function evidenceRows(rows){
    return rows.map(x=>{const m=x.m||{},links=ipcLinks(x.itemIndex,x.index),prev=m.previous==null?null:Number(m.previous),cur=m.current==null?null:Number(m.current),cum=prev==null||cur==null?null:prev+cur;
      const refs=links.length?links.map(l=>`${esc(l.no)} · ${fmt(l.qty)} ${esc(x.item?.unit||'')}`).join('<br>'):'—';
      return `<tr><td>${x.index+1}</td><td>${esc(m.date||'—')}</td><td>${esc(m.location||'—')}</td><td>${esc(m.drawingReference||'—')}</td><td>${esc(m.note||'—')}</td><td class="num">${qty(m.measured,x.item?.unit)}</td><td class="num">${qty(m.approved,x.item?.unit)}</td><td class="num">${qty(prev,x.item?.unit)}</td><td class="num">${qty(cur,x.item?.unit)}</td><td class="num">${qty(cum,x.item?.unit)}</td><td>${esc(m.remarks||'—')}</td><td>${refs}</td></tr>`;
    }).join('');
  }
  function linkedSectionHtml(){
    const rows=records();
    if(!rows.length)return '<p class="section-note">No saved Measurement / MB records are available.</p>';
    const summary=`<div class="table-wrap"><table class="mb-print-summary"><thead><tr><th>Record</th><th>Date</th><th>BOQ Item</th><th>Location / Reference</th><th>Drawing / Ref.</th><th>Measured Qty</th><th>Approved Qty</th><th>Previous Certified</th><th>Current IPC</th><th>Cumulative</th></tr></thead><tbody>${summaryRows(rows)}</tbody></table></div>`;
    const details=`<div class="mb-print-subtitle">Detailed Measurement Breakdown</div><div class="table-wrap"><table class="mb-print-breakdown"><thead><tr><th>Record / Group</th><th>Type</th><th>Element / Member</th><th>L</th><th>W</th><th>H/D/T</th><th>No.</th><th>Factor</th><th>Calculation / Basis</th><th class="num">Qty</th></tr></thead><tbody>${detailRows(rows)||'<tr><td colspan="10">No detailed measurement breakdown is saved for these records.</td></tr>'}</tbody></table></div>`;
    const evidence=`<div class="mb-print-subtitle">Evidence / Verification Trail</div><div class="table-wrap"><table class="mb-print-evidence"><thead><tr><th>Record</th><th>Date</th><th>Location / Reference</th><th>Drawing / Reference</th><th>Measurement Note</th><th>Measured Qty</th><th>Approved Qty</th><th>Previous Certified Qty</th><th>Current IPC Qty</th><th>Cumulative Certified Qty</th><th>Remarks</th><th>IPC Evidence / History</th></tr></thead><tbody>${evidenceRows(rows)}</tbody></table></div>`;
    return `<p class="section-note">Saved Measurement / MB records are reproduced directly from <strong>measurementRecords</strong>. Records with Current IPC Qty = 0 remain visible for traceability.</p>${summary}${details}${evidence}`;
  }
  function patch(html){
    try{
      const doc=new DOMParser().parseFromString(html,'text/html');
      const target=[...doc.querySelectorAll('.section')].find(s=>/Measurement \/ MB Verification/i.test(s.querySelector('.section-title')?.textContent||''));
      if(target){target.innerHTML=`<h2 class="section-title">4. Measurement / MB Verification</h2>${linkedSectionHtml()}`;target.querySelectorAll('.evidence-group').forEach(e=>e.remove());}
      const state=typeof ipcState!=='undefined'&&ipcState?.record?ipcState.record:{};
      const number=String(state.no||state.editingNo||'').trim();
      if(number)doc.querySelectorAll('.meta-row').forEach(row=>{if(/IPC \/ Running Bill No\./i.test(row.querySelector('strong')?.textContent||'')){const span=row.querySelector('span');if(span)span.textContent=number}});
      const style=doc.createElement('style');style.textContent=`
        .mb-print-summary,.mb-print-breakdown,.mb-print-evidence{font-size:6.7pt;margin:0 0 5pt;table-layout:fixed}
        .mb-print-summary th,.mb-print-summary td,.mb-print-breakdown th,.mb-print-breakdown td,.mb-print-evidence th,.mb-print-evidence td{padding:2.4pt 2.5pt;vertical-align:top;line-height:1.2}
        .mb-print-summary th{white-space:normal;text-align:center}.mb-print-summary th:nth-child(1){width:6%}.mb-print-summary th:nth-child(2){width:8%}.mb-print-summary th:nth-child(3){width:9%}.mb-print-summary th:nth-child(4){width:17%}.mb-print-summary th:nth-child(5){width:12%}.mb-print-summary th:nth-child(6){width:9%}.mb-print-summary th:nth-child(7){width:9%}.mb-print-summary th:nth-child(8){width:10%}.mb-print-summary th:nth-child(9){width:10%}.mb-print-summary th:nth-child(10){width:10%}
        .mb-print-breakdown{font-size:6.5pt}.mb-print-breakdown th:nth-child(1){width:8%}.mb-print-breakdown th:nth-child(2){width:11%}.mb-print-breakdown th:nth-child(3){width:15%}.mb-print-breakdown th:nth-child(4){width:6%}.mb-print-breakdown th:nth-child(5){width:6%}.mb-print-breakdown th:nth-child(6){width:7%}.mb-print-breakdown th:nth-child(7){width:6%}.mb-print-breakdown th:nth-child(8){width:7%}.mb-print-breakdown th:nth-child(9){width:25%}.mb-print-breakdown th:nth-child(10){width:9%}
        .mb-print-evidence{font-size:6.2pt}.mb-print-evidence th:nth-child(1){width:5%}.mb-print-evidence th:nth-child(2){width:7%}.mb-print-evidence th:nth-child(3){width:12%}.mb-print-evidence th:nth-child(4){width:10%}.mb-print-evidence th:nth-child(5){width:14%}.mb-print-evidence th:nth-child(6){width:7%}.mb-print-evidence th:nth-child(7){width:7%}.mb-print-evidence th:nth-child(8){width:8%}.mb-print-evidence th:nth-child(9){width:8%}.mb-print-evidence th:nth-child(10){width:8%}.mb-print-evidence th:nth-child(11){width:8%}.mb-print-evidence th:nth-child(12){width:6%}
        .mb-print-subtitle{font-size:7.4pt;font-weight:700;text-transform:uppercase;letter-spacing:.025em;margin:5pt 0 3pt;padding:3pt 4pt;background:#f1f3f1;border-left:2px solid #555d58;break-after:avoid;page-break-after:avoid}
        .mb-record-label td{font-weight:700;background:#f5f6f5;padding:2.5pt 3pt;break-after:avoid;page-break-after:avoid}
        .mb-print-summary tr,.mb-print-breakdown tr,.mb-print-evidence tr{break-inside:avoid;page-break-inside:avoid}
        .mb-print-breakdown thead,.mb-print-summary thead,.mb-print-evidence thead{display:table-header-group}
        .mb-print-breakdown tbody .mb-record-label{break-after:avoid;page-break-after:avoid}
        @media print{.mb-print-summary,.mb-print-breakdown,.mb-print-evidence{width:100%}.mb-print-subtitle{break-after:avoid;page-break-after:avoid}}
      `;doc.head.appendChild(style);
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
