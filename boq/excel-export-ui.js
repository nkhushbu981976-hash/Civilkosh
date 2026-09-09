(function(){
  'use strict';
  if(window.__civilKoshExcelExportUiInstalled)return;
  window.__civilKoshExcelExportUiInstalled=true;

  const SHEETJS_URL='https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  const SHEETJS_SCRIPT_ID='civilkosh-sheetjs-loader';
  const MAX_RETRIES=3;
  const LOAD_TIMEOUT_MS=10000;
  let retryCount=0;
  let retryTimer=null;
  let loading=false;
  let loadToken=0;

  function button(){return document.querySelector('[data-civilkosh-excel]');}

  function setState(state){
    const b=button();
    if(!b)return;
    if(state==='loading'){b.disabled=true;b.textContent='Loading Excel…';}
    else if(state==='ready'){b.disabled=false;b.textContent='Download Excel (.xlsx)';}
    else {b.disabled=false;b.textContent='Excel unavailable — retry';}
  }

  function existingSheetJsScript(){
    return document.getElementById(SHEETJS_SCRIPT_ID)||document.querySelector('script[src="'+SHEETJS_URL+'"]');
  }

  function clearRetryTimer(){
    if(retryTimer){clearTimeout(retryTimer);retryTimer=null;}
  }

  function scheduleRetry(){
    if(retryCount>=MAX_RETRIES){setState('failed');return;}
    clearRetryTimer();
    retryTimer=setTimeout(()=>{retryTimer=null;loadSheetJs();},1000*retryCount);
  }

  function handleFailure(token,script){
    if(token!==loadToken)return;
    if(window.XLSX){loading=false;setState('ready');return;}
    loading=false;
    if(script&&script.parentNode)script.parentNode.removeChild(script);
    retryCount++;
    scheduleRetry();
  }

  function loadSheetJs(){
    if(window.XLSX){loading=false;clearRetryTimer();setState('ready');return true;}
    if(loading)return false;
    if(retryCount>=MAX_RETRIES){setState('failed');return false;}

    loading=true;
    setState('loading');

    const token=++loadToken;
    let script=existingSheetJsScript();
    if(script){
      const finish=()=>{if(token!==loadToken)return;loading=false;if(window.XLSX){retryCount=0;setState('ready');}else handleFailure(token,script);};
      const fail=()=>handleFailure(token,script);
      script.addEventListener('load',finish,{once:true});
      script.addEventListener('error',fail,{once:true});
      setTimeout(()=>{if(token===loadToken&&loading)handleFailure(token,script);},LOAD_TIMEOUT_MS);
      return false;
    }

    script=document.createElement('script');
    script.id=SHEETJS_SCRIPT_ID;
    script.src=SHEETJS_URL;
    script.async=true;
    script.onload=()=>{if(token!==loadToken)return;loading=false;if(window.XLSX){retryCount=0;setState('ready');}else handleFailure(token,script);};
    script.onerror=()=>handleFailure(token,script);
    document.head.appendChild(script);
    setTimeout(()=>{if(token===loadToken&&loading)handleFailure(token,script);},LOAD_TIMEOUT_MS);
    return false;
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
      b.type='button';
      b.className='ck-sheet-btn';
      b.dataset.civilkoshExcel='1';
      b.onclick=()=>{
        if(window.XLSX&&typeof window.downloadCivilKoshExcel==='function'){
          window.downloadCivilKoshExcel();
          return;
        }
        retryCount=0;
        clearRetryTimer();
        loadSheetJs();
      };
      bar.appendChild(b);
    }

    if(window.XLSX)setState('ready');
    else if(!loading)loadSheetJs();
  }

  const run=()=>setTimeout(install,0);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();