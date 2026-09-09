(function(){
  'use strict';
  if(window.__civilKoshExcelExportUiInstalled)return;
  window.__civilKoshExcelExportUiInstalled=true;
  const SHEETJS_URL='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  const MAX_RETRIES=3;
  let retryCount=0;
  let retryTimer=null;
  let loading=false;
  function button(){return document.querySelector('[data-civilkosh-excel]');}
  function setState(state){
    const b=button();
    if(!b)return;
    if(state==='loading'){b.disabled=true;b.textContent='Loading Excel…';}
    else if(state==='ready'){b.disabled=false;b.textContent='Download Excel (.xlsx)';}
    else {b.disabled=false;b.textContent='Excel unavailable — retry';}
  }
  function loadSheetJs(){
    if(window.XLSX){setState('ready');return true;}
    if(loading)return false;
    if(retryCount>=MAX_RETRIES){setState('failed');return false;}
    loading=true;setState('loading');
    const s=document.createElement('script');
    s.src=SHEETJS_URL;
    s.async=true;
    s.onload=()=>{loading=false;if(window.XLSX){setState('ready');return}handleFailure()};
    s.onerror=()=>{loading=false;handleFailure()};
    document.head.appendChild(s);
    return false;
  }
  function handleFailure(){
    if(window.XLSX){setState('ready');return}
    retryCount++;
    if(retryCount>=MAX_RETRIES){setState('failed');return}
    clearTimeout(retryTimer);
    retryTimer=setTimeout(loadSheetJs,1000*retryCount);
  }
  function install(){
    const body=document.getElementById('ck-sheet-body');
    const workspace=document.getElementById('ck-workbookWorkspace');
    const title=workspace?.querySelector('.ck-sheet-title')?.textContent?.trim()||'';
    if(!body||!workspace||title!=='REPORTS / PRINT')return;
    const bar=body.querySelector('.ck-sheet-toolbar');
    if(!bar)return;
    let b=bar.querySelector('[data-civilkosh-excel]');
    if(!b){
      b=document.createElement('button');
      b.type='button';b.className='ck-sheet-btn';b.dataset.civilkoshExcel='1';
      b.onclick=()=>{
        if(window.XLSX&&typeof window.downloadCivilKoshExcel==='function'){window.downloadCivilKoshExcel();return}
        retryCount=0;loadSheetJs();
      };
      bar.appendChild(b);
    }
    if(window.XLSX)setState('ready');
    else loadSheetJs();
  }
  const run=()=>setTimeout(install,0);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();