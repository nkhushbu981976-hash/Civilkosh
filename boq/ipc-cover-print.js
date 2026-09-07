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

    const makeSection=(title,html)=>{const s=doc.createElement('section');s.className='section';s.innerHTML=`<h2 class="section-title">${title}</h2>${html}`;return s;};
    const value=(key)=>data[key]||'';
    const contractPairs=[
      ['Project / Work','Project / Work'],['Project Location','Location'],['Employer / Client','Employer / Client'],['Contractor','Contractor'],
      ['Contract / Work Order No.','Work Order / Contract No.'],['Agreement / Contract No.','Agreement / Contract No.'],['Agreement Date','Agreement Date'],
      ['Commencement Date','Commencement Date'],['Original Completion Date','Original Completion Date'],['Revised / Extended Completion Date','Extension / Revised Completion Date'],
      ['IPC / Running Bill No.','IPC / Running Bill No.'],['Bill Date','Bill Date'],['Previous IPC','Previous IPC'],['Billing / Measurement Period','Billing / Measurement Period'],
      ['Measurement Book (MB) No.','Measurement Book No.'],['MB Page / Reference','MB Page / Reference']
    ].filter(([,key])=>value(key));
    const contractRows=contractPairs.map(([label,key])=>`<div class="meta-row"><strong>${label}</strong><span>${value(key)}</span></div>`).join('');
    const payment=doc.querySelector('.section-title')&&[...doc.querySelectorAll('.section')].find(s=>/2\. Payment Summary/i.test(s.querySelector('.section-title')?.textContent||''));
    if(payment){
      payment.querySelector('.section-title').textContent='Payment Summary';
      payment.querySelectorAll('.summary td:first-child').forEach(td=>{
        const t=td.textContent.trim();
        const map={
          'Previous Certified Gross Amount':'Previous Certified Amount',
          'Current IPC Gross Amount':'Current Bill Amount',
          'Cumulative Certified Gross Amount':'Cumulative Certified Amount',
          'Balance BOQ Value':'Balance Amount',
          'Other Deduction':'Other Deductions',
          'Other Addition / Adjustment':'Other Additions',
          'Current Net Payable':'Net Payable Amount'
        };
        if(map[t])td.textContent=map[t];
      });
    }
    const contractSection=makeSection('Contract & Payment Details',`<div class="meta">${contractRows}</div>`);
    const firstRemaining=payment||doc.querySelector('.section');
    if(firstRemaining)documentRoot.insertBefore(contractSection,firstRemaining);else documentRoot.appendChild(contractSection);

    const boq=[...doc.querySelectorAll('.section')].find(s=>/3\. BOQ Current Bill \/ Valuation/i.test(s.querySelector('.section-title')?.textContent||''));
    if(boq){
      boq.querySelector('.section-title').textContent='3. Bill of Quantities';
      boq.querySelector('.section-note')?.remove();
      const qty=boq.querySelector('.qty-table'),amount=boq.querySelector('.amount-table');
      if(qty&&amount){
        const qRows=[...qty.querySelectorAll('tbody tr')].filter(r=>r.cells.length===8);
        const aRows=[...amount.querySelectorAll('tbody tr')].filter(r=>r.cells.length===7);
        const rows=qRows.map((qr,i)=>{
          const ar=aRows[i];
          if(!ar)return '';
          return `<tr>${qr.cells[0].outerHTML}${qr.cells[1].outerHTML}${qr.cells[2].outerHTML}${qr.cells[3].outerHTML}${qr.cells[4].outerHTML}${qr.cells[5].outerHTML}${qr.cells[6].outerHTML}${qr.cells[7].outerHTML}${ar.cells[2].outerHTML}${ar.cells[4].outerHTML}${ar.cells[5].outerHTML}</tr>`;
        }).join('');
        const totalRow=amount.querySelector('tbody tr.grand-total');
        const total=totalRow?`<tr class="grand-total"><td colspan="9">Totals</td>${totalRow.cells[4]?.outerHTML||'<td></td>'}${totalRow.cells[5]?.outerHTML||'<td></td>'}</tr>`:'';
        const wrap=doc.createElement('div');
        wrap.className='table-wrap';
        wrap.innerHTML=`<table class="ipc-boq-table"><thead><tr><th>Item No.</th><th>Description</th><th>Unit</th><th class="num">BOQ Qty</th><th class="num">Previous Qty</th><th class="num">Current Qty</th><th class="num">Cumulative Qty</th><th class="num">Balance Qty</th><th class="num">Rate</th><th class="num">Current Amount</th><th class="num">Cumulative Amount</th></tr></thead><tbody>${rows||'<tr><td colspan="11">No BOQ items are available.</td></tr>'}${total}</tbody></table>`;
        qty.parentElement.replaceWith(wrap);
        amount.remove();
      }
    }

    const evidence=[...doc.querySelectorAll('.section')].find(s=>/4\. Measurement \/ MB Verification/i.test(s.querySelector('.section-title')?.textContent||''));
    if(evidence){
      evidence.querySelector('.section-title').textContent='4. Measurement / MB';
      evidence.querySelector('.section-note')?.remove();
      const groups=[...evidence.querySelectorAll('.evidence-group')];
      const certTable=doc.createElement('div');
      certTable.className='table-wrap';
      certTable.innerHTML=`<table class="ipc-measure-cert-table"><thead><tr><th>Item No.</th><th class="num">Previous Certified Qty</th><th class="num">Current Certified Qty</th><th>Measurement Evidence</th></tr></thead><tbody>${[...doc.querySelectorAll('.qty-table tbody tr')].filter(r=>r.cells.length===8).map(r=>`<tr><td>${r.cells[0].textContent.trim()}</td><td class="num">${r.cells[4].textContent.trim()}</td><td class="num">${r.cells[5].textContent.trim()}</td><td>See Measurement / MB records</td></tr>`).join('')}</tbody></table>`;
      const simple=doc.createElement('div');
      simple.className='table-wrap';
      let rows='';
      groups.forEach(g=>{
        const item=g.querySelector('.evidence-head>div:nth-child(1) span')?.textContent?.trim()||'—';
        const refs=[...g.querySelectorAll('.evidence-record-table tbody tr')];
        if(!refs.length){rows+=`<tr><td>${item}</td><td>—</td><td>—</td><td>—</td><td>—</td><td class="num">—</td><td class="num">—</td><td>No saved measurement evidence</td></tr>`;return;}
        refs.forEach(r=>{const c=r.cells;rows+=`<tr><td>${item}</td><td>${c[0]?.textContent?.trim()||'—'}</td><td>${c[1]?.textContent?.trim()||'—'}</td><td>${c[2]?.textContent?.trim()||'—'}</td><td>${c[3]?.textContent?.trim()||'—'}</td><td class="num">${c[4]?.textContent?.trim()||'—'}</td><td class="num">${c[5]?.textContent?.trim()||'—'}</td><td>${c[6]?.textContent?.trim()||'—'}</td></tr>`});
      });
      simple.innerHTML=`<table class="ipc-measure-table"><thead><tr><th>Item No.</th><th>Measurement/MB Ref.</th><th>Date</th><th>Location</th><th>Drawing/MB Ref.</th><th class="num">Measured Qty</th><th class="num">Approved Qty</th><th>Remarks</th></tr></thead><tbody>${rows||'<tr><td colspan="8">No saved measurement evidence is available.</td></tr>'}</tbody></table>`;
      evidence.querySelectorAll('.evidence-group').forEach(g=>g.remove());
      evidence.appendChild(certTable);
      evidence.appendChild(simple);
    }

    const variation=[...doc.querySelectorAll('.section')].find(s=>/5\. Variation \/ Extra \/ Substituted Work/i.test(s.querySelector('.section-title')?.textContent||''));
    if(variation){
      variation.querySelector('.section-title').textContent='5. Variation / Extra / Substituted Work';
      const headers=['Item No.','Type','Reference No.','Status','Revised Qty','Approval / Instruction','Remarks'];
      variation.querySelectorAll('thead th').forEach((th,i)=>{if(headers[i])th.textContent=headers[i]});
    }
    const adjustment=[...doc.querySelectorAll('.section')].find(s=>/6\. Deductions \/ Adjustments/i.test(s.querySelector('.section-title')?.textContent||''));
    if(adjustment){
      adjustment.querySelector('.section-title').textContent='6. Deductions / Adjustments';
      adjustment.querySelectorAll('.summary td:first-child').forEach(td=>{if(td.textContent.trim()==='Other Deduction')td.textContent='Other Deductions';if(td.textContent.trim()==='Other Addition / Adjustment')td.textContent='Other Additions'});
    }
    const certSection=[...doc.querySelectorAll('.section')].find(s=>/7\. Net Payment \/ Certification/i.test(s.querySelector('.section-title')?.textContent||''));
    const certValues=['preparedBy','checkedBy','recommendedBy','approvedBy','designation','date','note'].map(k=>String(cert?.querySelector(`.summary tr td:first-child`)?.textContent||''));
    const hasCertData=cert? [...cert.querySelectorAll('.summary tr')].some(row=>{const cells=row.querySelectorAll('td');return cells.length===2&&['Prepared By','Checked By','Recommended By','Approved By','Designation','Certification / Approval Date','Reference / Note'].includes(cells[0].textContent.trim())&&cells[1].textContent.trim()&&cells[1].textContent.trim()!=='—'}):false;
    if(certSection){
      certSection.querySelector('.section-title').textContent='7. Net Payment';
      certSection.querySelectorAll('.summary tr').forEach(row=>{const cell=row.querySelector('td:first-child');if(cell&&['Prepared By','Checked By','Recommended By','Approved By','Designation','Certification / Approval Date','Reference / Note'].includes(cell.textContent.trim()))row.remove()});
      certSection.querySelector('.callout')?.remove();
      certSection.querySelector('.signatures')?.remove();
      if(!hasCertData)certSection.remove();
    }
    if(hasCertData&&certSection){
      const certApproval=makeSection('8. Certification / Approval',`<div class="table-wrap"><table class="summary"><tbody>${[...cert.querySelectorAll('.summary tr')].filter(row=>{const k=row.querySelector('td:first-child')?.textContent.trim();return ['Prepared By','Checked By','Recommended By','Approved By','Designation','Certification / Approval Date','Reference / Note'].includes(k)}).map(row=>row.outerHTML).join('')}</tbody></table></div>`);
      certSection.after(certApproval);
    }
    const docs=[...doc.querySelectorAll('.section')].find(s=>/8\. Supporting Document \/ Attachment Register/i.test(s.querySelector('.section-title')?.textContent||''));
    if(docs){docs.querySelector('.section-title').textContent='9. Supporting Documents';}
    const attachment=[...doc.querySelectorAll('.section')].find(s=>/9\. Evidence Index/i.test(s.querySelector('.section-title')?.textContent||''));
    if(attachment){
      const hasEvidence=groups.length>0;
      if(!hasEvidence&&!docs)attachment.remove();
      else {attachment.querySelector('.section-title').textContent='10. Attachment / Evidence Index';attachment.querySelectorAll('td').forEach(td=>{td.textContent=td.textContent.replace(/Section 4; saved measurement references and reconciliation only\./,'Measurement / MB references.').replace(/Print separately from the application; detailed calculations are not duplicated in IPC\./,'Detailed Measurement Sheet — separate document.')});}
    }
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
      .ipc-boq-table{font-size:6.6pt}
      .ipc-boq-table th:nth-child(1){width:5%}.ipc-boq-table th:nth-child(2){width:25%}.ipc-boq-table th:nth-child(3){width:5%}.ipc-boq-table th:nth-child(4){width:7%}.ipc-boq-table th:nth-child(5){width:7%}.ipc-boq-table th:nth-child(6){width:7%}.ipc-boq-table th:nth-child(7){width:8%}.ipc-boq-table th:nth-child(8){width:7%}.ipc-boq-table th:nth-child(9){width:9%}.ipc-boq-table th:nth-child(10){width:10%}.ipc-boq-table th:nth-child(11){width:10%}
      .ipc-measure-cert-table,.ipc-measure-table{font-size:7.2pt;margin-bottom:7pt}.ipc-measure-cert-table th:nth-child(1){width:12%}.ipc-measure-cert-table th:nth-child(2){width:22%}.ipc-measure-cert-table th:nth-child(3){width:22%}.ipc-measure-cert-table th:nth-child(4){width:44%}.ipc-measure-table th:nth-child(1){width:8%}.ipc-measure-table th:nth-child(2){width:14%}.ipc-measure-table th:nth-child(3){width:9%}.ipc-measure-table th:nth-child(4){width:20%}.ipc-measure-table th:nth-child(5){width:18%}.ipc-measure-table th:nth-child(6){width:10%}.ipc-measure-table th:nth-child(7){width:10%}.ipc-measure-table th:nth-child(8){width:11%}
      @media print{.ipc-cover{min-height:245mm;break-after:page;page-break-after:always}.ipc-page-two-start{break-before:page;page-break-before:always}}
    `;
    doc.head.appendChild(style);
    return '<!doctype html>'+doc.documentElement.outerHTML;
  }
})();