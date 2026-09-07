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
    const field=(label,key)=>`<div class="ipc-cover-field"><span>${label}</span><strong>${data[key]||'—'}</strong></div>`;
    cover.innerHTML=`
      <div class="ipc-cover-heading">
        <div class="ipc-cover-kicker">PAYMENT CERTIFICATE</div>
        <h1>INTERIM PAYMENT CERTIFICATE</h1>
        <div class="ipc-cover-subtitle">${data['IPC / Running Bill No.']||'—'}</div>
      </div>
      <div class="ipc-cover-block">
        <div class="ipc-cover-block-title">Project &amp; Contract Information</div>
        <div class="ipc-cover-grid">
          ${field('Employer / Client','Employer / Client')}
          ${field('Contractor','Contractor')}
          ${field('Project / Work','Project / Work')}
          ${field('Project Location','Location')}
          ${field('Contract / Work Order No.','Work Order / Contract No.')}
          ${field('IPC / Running Bill No.','IPC / Running Bill No.')}
          ${field('Certificate / Bill Date','Bill Date')}
          ${field('Previous IPC','Previous IPC')}
        </div>
      </div>
      <div class="ipc-cover-block ipc-cover-cert">
        <div class="ipc-cover-block-title">Certificate Details</div>
        <div class="ipc-cover-signatures">
          <div><span>Prepared By</span><strong>${certData['Prepared By']||data['Prepared By']||'—'}</strong></div>
          <div><span>Checked By</span><strong>${certData['Checked By']||'—'}</strong></div>
          <div><span>Recommended By</span><strong>${certData['Recommended By']||'—'}</strong></div>
          <div><span>Approved By</span><strong>${certData['Approved By']||'—'}</strong></div>
        </div>
      </div>`;
    const firstSection=doc.querySelector('.document>.section');
    mast.remove();
    meta.remove();
    firstSection?.remove();
    const documentRoot=doc.querySelector('.document');
    if(documentRoot)documentRoot.insertBefore(cover,documentRoot.firstChild);
    const style=doc.createElement('style');
    style.textContent=`
      .ipc-cover{margin:0 0 9pt;break-inside:avoid;page-break-inside:avoid}
      .ipc-cover-heading{border:1.4px solid #4f5652;text-align:center;padding:14pt 12pt 12pt;margin-bottom:8pt}
      .ipc-cover-kicker{font-size:7pt;font-weight:700;letter-spacing:.12em;color:#5c645f;text-transform:uppercase;margin-bottom:5pt}
      .ipc-cover-heading h1{font-size:18pt;line-height:1.15;letter-spacing:.03em;font-weight:700;margin:0}
      .ipc-cover-subtitle{font-size:9pt;font-weight:700;margin-top:5pt}
      .ipc-cover-block{border:1px solid #7c837e;margin-top:8pt;break-inside:avoid;page-break-inside:avoid}
      .ipc-cover-block-title{font-size:8.2pt;font-weight:700;text-transform:uppercase;letter-spacing:.04em;background:#edf0ee;border-bottom:1px solid #7c837e;padding:5pt 6pt}
      .ipc-cover-grid{display:grid;grid-template-columns:1fr 1fr}
      .ipc-cover-field{display:grid;grid-template-columns:42% 58%;padding:6pt;border-right:1px solid #c3c8c5;border-bottom:1px solid #c3c8c5;min-width:0}
      .ipc-cover-field:nth-child(2n){border-right:0}.ipc-cover-field:nth-last-child(-n+2){border-bottom:0}
      .ipc-cover-field span,.ipc-cover-signatures span{font-size:7pt;color:#59615c;font-weight:700;text-transform:uppercase}
      .ipc-cover-field strong{font-size:8.3pt;overflow-wrap:anywhere}
      .ipc-cover-signatures{display:grid;grid-template-columns:repeat(4,1fr)}
      .ipc-cover-signatures>div{min-height:38pt;padding:8pt 7pt;border-right:1px solid #c3c8c5}
      .ipc-cover-signatures>div:last-child{border-right:0}
      .ipc-cover-signatures strong{display:block;margin-top:8pt;font-size:8pt;overflow-wrap:anywhere}
    `;
    doc.head.appendChild(style);
    return '<!doctype html>'+doc.documentElement.outerHTML;
  }
})();
