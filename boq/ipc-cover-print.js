(function(){
  'use strict';
  if(window.__ipcCoverPrintInstalled)return;
  window.__ipcCoverPrintInstalled=true;
  const nativeOpen=window.open;
  window.open=function(){
    const w=nativeOpen.apply(window,arguments);
    if(!w||!w.document)return w;
    const originalWrite=w.document.write.bind(w.document);
    w.document.write=function(html){
      if(typeof html==='string' && /<title>\s*IPC\b/i.test(html)) html=enhance(html);
      return originalWrite(html);
    };
    return w;
  };
  function enhance(html){
    const doc=new DOMParser().parseFromString(html,'text/html');
    const mast=doc.querySelector('.mast'),meta=doc.querySelector('.meta');
    if(!mast||!meta)return html;
    const data={};
    meta.querySelectorAll('.meta-row').forEach(row=>{
      const k=row.querySelector('strong')?.textContent?.trim()||'';
      const v=row.querySelector('span')?.textContent?.trim()||'';
      if(k)data[k]=v;
    });
    const cert=[...doc.querySelectorAll('.section')].find(s=>/Net Payment \/ Certification/i.test(s.querySelector('.section-title')?.textContent||''));
    const certData={};
    cert?.querySelectorAll('.summary tr').forEach(row=>{
      const cells=row.querySelectorAll('td');
      if(cells.length===2)certData[cells[0].textContent.trim()]=cells[1].textContent.trim();
    });
    const boqSection=[...doc.querySelectorAll('.section')].find(s=>/3\.\s*BOQ Current Bill \/ Valuation/i.test(s.querySelector('.section-title')?.textContent||''));
    if(boqSection){
      const quantityTable=boqSection.querySelector('.qty-table');
      const amountTable=boqSection.querySelector('.amount-table');
      const quantityRows=[...(quantityTable?.querySelectorAll('tbody tr')||[])];
      const amountRows=[...(amountTable?.querySelectorAll('tbody tr')||[])].filter(row=>row.querySelectorAll('td').length===7);
      if(quantityTable&&amountTable){
        const table=doc.createElement('table');
        table.className='boq-valuation-table';
        table.innerHTML=`<thead><tr><th>Item No.</th><th>Description</th><th>Unit</th><th class="num">BOQ Qty</th><th class="num">Previous Qty</th><th class="num">Current Qty</th><th class="num">Cumulative Qty</th><th class="num">Balance Qty</th><th class="num">Rate</th><th class="num">Current Amount</th><th class="num">Cumulative Amount</th></tr></thead><tbody></tbody>`;
        const body=table.querySelector('tbody');
        const formatBoqAmount=v=>{const n=Number(v);return Number.isFinite(n)?new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n):'0.00'};
        quantityRows.forEach((qRow,index)=>{
          const q=qRow.querySelectorAll('td');
          const a=amountRows[index]?.querySelectorAll('td');
          if(q.length!==8||!a||a.length!==7)return;
          const rate=Number((a[2].textContent||'').replace(/[^0-9.-]/g,''));
          const currentAmount=Number(q[5].textContent)*rate;
          const cumulativeAmount=Number(q[6].textContent)*rate;
          const row=doc.createElement('tr');
          row.innerHTML=`<td>${q[0].innerHTML}</td><td>${q[1].innerHTML}</td><td class="center nowrap">${q[2].innerHTML}</td><td class="num">${q[3].innerHTML}</td><td class="num">${q[4].innerHTML}</td><td class="num">${q[5].innerHTML}</td><td class="num">${q[6].innerHTML}</td><td class="num">${q[7].innerHTML}</td><td class="num">${a[2].innerHTML}</td><td class="num">${formatBoqAmount(currentAmount)}</td><td class="num">${formatBoqAmount(cumulativeAmount)}</td>`;
          body.appendChild(row);
        });
        const note=boqSection.querySelector('.section-note');
        note?.remove();
        quantityTable.remove();
        amountTable.remove();
        const wrap=doc.createElement('div');
        wrap.className='table-wrap';
        wrap.appendChild(table);
        boqSection.appendChild(wrap);
      }
    }
    const cover=doc.createElement('section');
    cover.className='ipc-cover';
    const field=(label,key,wide=false)=>`<div class="ipc-cover-field${wide?' wide':''}"><span>${label}</span><strong>${data[key]||'—'}</strong></div>`;
    cover.innerHTML=`
      <div class="ipc-cover-heading">
        <div class="ipc-cover-organization">${data['Employer / Client']||'—'}</div>
        <div class="ipc-cover-rule"></div>
        <div class="ipc-cover-kicker">PAYMENT CERTIFICATE</div>
        <h1>INTERIM PAYMENT CERTIFICATE</h1>
        <div class="ipc-cover-number">${data['IPC / Running Bill No.']||'—'}</div>
      </div>
      <div class="ipc-cover-block ipc-cover-identity">
        <div class="ipc-cover-block-title">Project Identity / Contract Information</div>
        <div class="ipc-cover-grid">
          ${field('Project / Work','Project / Work',true)}
          ${field('Project Location','Location',true)}
          ${field('Employer / Client','Employer / Client')}
          ${field('Contractor','Contractor')}
          ${field('Contract / Work Order No.','Work Order / Contract No.',true)}
          ${field('IPC / Running Bill No.','IPC / Running Bill No.')}
          ${field('Certificate / Bill Date','Bill Date')}
        </div>
      </div>
      <div class="ipc-cover-block ipc-cover-control">
        <div class="ipc-cover-block-title">Document Control / Certification</div>
        <div class="ipc-cover-signatures">
          <div><span>Prepared By</span><strong>${certData['Prepared By']||data['Prepared By']||'—'}</strong></div>
          <div><span>Checked By</span><strong>${certData['Checked By']||'—'}</strong></div>
          <div><span>Recommended By</span><strong>${certData['Recommended By']||'—'}</strong></div>
          <div><span>Approved By</span><strong>${certData['Approved By']||'—'}</strong></div>
        </div>
      </div>`;
    const firstSection=doc.querySelector('.document>.section');
    const documentRoot=doc.querySelector('.document');
    mast.remove();
    meta.remove();
    firstSection?.remove();
    if(documentRoot)documentRoot.insertBefore(cover,documentRoot.firstChild);
    const style=doc.createElement('style');
    style.textContent=`
      .ipc-cover{margin:0;break-inside:avoid;page-break-inside:avoid;break-after:page;page-break-after:always;min-height:245mm;display:flex;flex-direction:column;justify-content:flex-start}
      .ipc-cover-heading{border:1.4px solid #4f5652;text-align:center;padding:18pt 14pt 17pt;margin-bottom:20pt;min-height:120pt;display:flex;flex-direction:column;justify-content:center}
      .ipc-cover-organization{font-size:12pt;font-weight:700;letter-spacing:.025em;text-transform:uppercase;line-height:1.25}
      .ipc-cover-rule{width:38%;border-top:1px solid #7c837e;margin:8pt auto 9pt}
      .ipc-cover-kicker{font-size:7.2pt;font-weight:700;letter-spacing:.12em;color:#5c645f;text-transform:uppercase;margin-bottom:6pt}
      .ipc-cover-heading h1{font-size:19pt;line-height:1.15;letter-spacing:.025em;font-weight:700;margin:0}
      .ipc-cover-number{font-size:11pt;font-weight:700;margin-top:8pt;letter-spacing:.04em}
      .ipc-cover-block{border:1px solid #7c837e;margin-top:14pt;break-inside:avoid;page-break-inside:avoid}
      .ipc-cover-block-title{font-size:8.2pt;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #7c837e;padding:6pt 7pt}
      .ipc-cover-grid{display:grid;grid-template-columns:1fr 1fr}
      .ipc-cover-field{display:grid;grid-template-columns:40% 60%;padding:8pt 8pt;min-width:0;border-right:1px solid #c3c8c5;border-bottom:1px solid #c3c8c5}
      .ipc-cover-field.wide{grid-column:1 / -1;grid-template-columns:20% 80%;border-right:0}
      .ipc-cover-field:nth-last-child(1){border-bottom:0}
      .ipc-cover-field span{font-size:7pt;color:#59615c;font-weight:700;text-transform:uppercase}
      .ipc-cover-field strong{font-size:8.5pt;overflow-wrap:anywhere}
      .ipc-cover-control{margin-top:18pt}
      .ipc-cover-signatures{display:grid;grid-template-columns:repeat(4,1fr)}
      .ipc-cover-signatures>div{min-height:58pt;padding:10pt 8pt;border-right:1px solid #c3c8c5;position:relative}
      .ipc-cover-signatures>div:last-child{border-right:0}
      .ipc-cover-signatures span{font-size:7pt;color:#59615c;font-weight:700;text-transform:uppercase}
      .ipc-cover-signatures strong{display:block;margin-top:20pt;font-size:8pt;overflow-wrap:anywhere}
      .boq-valuation-table{font-size:7.3pt;table-layout:fixed}
      .boq-valuation-table th:nth-child(1){width:5%}.boq-valuation-table th:nth-child(2){width:23%}.boq-valuation-table th:nth-child(3){width:5%}.boq-valuation-table th:nth-child(4){width:7%}.boq-valuation-table th:nth-child(5){width:8%}.boq-valuation-table th:nth-child(6){width:8%}.boq-valuation-table th:nth-child(7){width:9%}.boq-valuation-table th:nth-child(8){width:7%}.boq-valuation-table th:nth-child(9){width:10%}.boq-valuation-table th:nth-child(10){width:9.5%}.boq-valuation-table th:nth-child(11){width:8.5%}
      .boq-valuation-table th,.boq-valuation-table td{padding:4pt 2.5pt;overflow-wrap:anywhere;word-break:normal}
      .boq-valuation-table th{white-space:normal;line-height:1.15;text-align:center;vertical-align:middle}
      .boq-valuation-table td:first-child,.boq-valuation-table td:nth-child(2),.boq-valuation-table td:nth-child(3){text-align:left}
      .boq-valuation-table th:first-child,.boq-valuation-table th:nth-child(2),.boq-valuation-table th:nth-child(3){text-align:left}
      .boq-valuation-table th:nth-child(n+4),.boq-valuation-table td:nth-child(n+4){text-align:right}
      .boq-valuation-table th,.boq-valuation-table td{min-width:0}
      .boq-valuation-table th:nth-child(4),.boq-valuation-table th:nth-child(5),.boq-valuation-table th:nth-child(6),.boq-valuation-table th:nth-child(7),.boq-valuation-table th:nth-child(8){min-width:7.5%}
      .boq-valuation-table th:nth-child(7){min-width:9%}
      .boq-valuation-table td.num{white-space:nowrap;overflow-wrap:normal;word-break:normal}
      .boq-valuation-table td.num{overflow:hidden;text-overflow:clip}
      .boq-valuation-table td:nth-child(9),.boq-valuation-table td:nth-child(10),.boq-valuation-table td:nth-child(11){font-variant-numeric:tabular-nums}
      .boq-valuation-table td:nth-child(9),.boq-valuation-table td:nth-child(10),.boq-valuation-table td:nth-child(11){font-feature-settings:"tnum" 1}
      .boq-valuation-table td:nth-child(9),.boq-valuation-table td:nth-child(10),.boq-valuation-table td:nth-child(11){white-space:nowrap}
      .boq-valuation-table td:nth-child(10) .currency,.boq-valuation-table td:nth-child(11) .currency{display:none}
      .section .summary{width:100%;table-layout:fixed}
      .section .summary tr>td:first-child{width:68%;text-align:left;padding:4pt 8pt}
      .section .summary tr>td:last-child{width:32%;text-align:right;padding:4pt 8pt;white-space:nowrap}
      .section .summary td{vertical-align:middle}
      .section .summary td+td{padding-left:8pt}
      .section .callout{padding:7pt 9pt;line-height:1.45;overflow-wrap:anywhere;word-break:normal}
      .section .signatures{margin-left:0;margin-right:0}
      @media print{.ipc-cover{min-height:245mm;break-after:page;page-break-after:always}}
    `;
    doc.head.appendChild(style);
    return '<!doctype html>'+doc.documentElement.outerHTML;
  }
})();
