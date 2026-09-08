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