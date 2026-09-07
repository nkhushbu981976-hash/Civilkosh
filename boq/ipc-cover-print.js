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
    const pageTwoSection=documentRoot?.querySelector('.section');
    pageTwoSection?.classList.add('ipc-page-two-start');
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
      .ipc-page-two-start{break-before:page;page-break-before:always}
      @media print{.ipc-cover{min-height:245mm;break-after:page;page-break-after:always}.ipc-page-two-start{break-before:page;page-break-before:always}}
    `;
    doc.head.appendChild(style);
    return '<!doctype html>'+doc.documentElement.outerHTML;
  }
})();