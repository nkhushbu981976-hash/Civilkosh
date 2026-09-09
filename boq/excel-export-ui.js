(function(){
  'use strict';
  if(window.__civilKoshExcelExportUiInstalled)return;
  window.__civilKoshExcelExportUiInstalled=true;
  function install(){
    const body=document.getElementById('ck-sheet-body');
    const workspace=document.getElementById('ck-workbookWorkspace');
    const title=workspace?.querySelector('.ck-sheet-title')?.textContent?.trim()||'';
    if(!body||!workspace||title!=='REPORTS / PRINT')return;
    const bar=body.querySelector('.ck-sheet-toolbar');
    if(!bar||bar.querySelector('[data-civilkosh-excel]'))return;
    const b=document.createElement('button');
    b.type='button';b.className='ck-sheet-btn';b.dataset.civilkoshExcel='1';
    b.textContent='Download Excel (.xlsx)';
    b.onclick=()=>{if(typeof window.downloadCivilKoshExcel==='function')window.downloadCivilKoshExcel();else alert('Excel export is not available yet. Please try again when the Excel module has loaded.');};
    bar.appendChild(b);
  }
  const run=()=>setTimeout(install,0);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();