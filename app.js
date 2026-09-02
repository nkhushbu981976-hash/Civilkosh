const tools=[
 {title:'Nepal Land Unit Converter',desc:'Convert Ropani, Aana, Paisa, Daam, Bigha, Kattha and Dhur using Nepal-specific land units.',category:'Land & Survey',icon:'LU'},
 {title:'Concrete Calculator',desc:'Estimate concrete volume and material quantities for common construction work.',category:'Estimation',icon:'CC'},
 {title:'Brick Masonry Calculator',desc:'Calculate brick count and mortar requirements for masonry work.',category:'Estimation',icon:'BM'},
 {title:'Cement & Sand Calculator',desc:'Estimate cement and sand quantities for mortar and plaster mixes.',category:'Materials',icon:'CS'},
 {title:'Civil Unit Converter',desc:'Convert common civil engineering units for length, area, volume, weight and more.',category:'Units',icon:'UC'},
 {title:'Construction Cost Estimator',desc:'Build a quick preliminary estimate from quantities, materials and unit rates.',category:'Estimation',icon:'CE'}
];
const categories=[['Land & Survey','1 tool'],['Estimation','3 tools'],['Materials','1 tool'],['Units','1 tool'],['Structural','Coming soon'],['Geotechnical','Coming soon'],['Hydraulics','Coming soon'],['Resources','Reference guides']];
const path=window.location.pathname;
const isConverter=/land-unit-converter\.html$/.test(path);

function initConverter(){
 const units={
  ropani:{name:'Ropani',symbol:'ropani',sqm:508.7375622},
  aana:{name:'Aana',symbol:'aana',sqm:31.7961038875},
  paisa:{name:'Paisa',symbol:'paisa',sqm:7.949025971875},
  daam:{name:'Daam',symbol:'daam',sqm:1.98725649296875},
  bigha:{name:'Bigha',symbol:'bigha',sqm:6772.631124},
  kattha:{name:'Kattha',symbol:'kattha',sqm:338.6315562},
  dhur:{name:'Dhur',symbol:'dhur',sqm:16.93157781},
  sqft:{name:'Square Feet',symbol:'sq ft',sqm:0.09290304},
  sqm:{name:'Square Meter',symbol:'m²',sqm:1}
 };
 const value=document.getElementById('value');
 const from=document.getElementById('fromUnit');
 const to=document.getElementById('toUnit');
 const result=document.getElementById('result');
 const resultUnit=document.getElementById('resultUnit');
 const error=document.getElementById('error');
 if(!value||!from||!to||!result||!resultUnit)return;
 const fragment=document.createDocumentFragment();
 Object.entries(units).forEach(([key,u])=>{fragment.appendChild(new Option(`${u.name} (${u.symbol})`,key));});
 from.replaceChildren(fragment.cloneNode(true));
 to.replaceChildren(fragment);
 from.value='ropani';to.value='sqm';
 const format=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n);
 function convert(){
  const raw=value.value.trim();
  const n=Number(raw);
  if(raw===''||!Number.isFinite(n)||n<0){result.textContent='—';error.hidden=false;return;}
  error.hidden=true;
  const converted=n*units[from.value].sqm/units[to.value].sqm;
  result.textContent=format(converted);
  resultUnit.textContent=`${units[to.value].name} (${units[to.value].symbol})`;
 }
 value.addEventListener('input',convert);
 from.addEventListener('change',convert);
 to.addEventListener('change',convert);
 document.getElementById('swapButton')?.addEventListener('click',()=>{const old=from.value;from.value=to.value;to.value=old;convert();});
 document.getElementById('resetButton')?.addEventListener('click',()=>{value.value='1';from.value='ropani';to.value='sqm';convert();value.focus();});
 convert();
}

function initHome(){
 const grid=document.querySelector('#toolGrid');
 if(!grid)return;
 const count=document.querySelector('#resultCount'),empty=document.querySelector('#emptyState'),search=document.querySelector('#search');
 function render(items){grid.innerHTML=items.map(t=>`<article class="tool-card"><div class="tool-icon">${t.icon}</div><h3>${t.title}</h3><p>${t.desc}</p><div class="tool-meta">${t.category} <span aria-hidden="true">→</span></div></article>`).join('');count.textContent=`${items.length} ${items.length===1?'tool':'tools'}`;empty.hidden=items.length!==0;}
 function filter(query,scroll=true){const q=query.trim().toLowerCase();render(tools.filter(t=>!q||[t.title,t.desc,t.category].join(' ').toLowerCase().includes(q)));if(scroll)document.querySelector('#tools').scrollIntoView({behavior:'smooth',block:'start'});}
 render(tools);
 document.querySelector('#searchButton')?.addEventListener('click',()=>filter(search.value));
 search?.addEventListener('keydown',e=>{if(e.key==='Enter')filter(search.value)});
 const categoryGrid=document.querySelector('#categoryGrid');
 if(categoryGrid){categoryGrid.innerHTML=categories.map(([name,total])=>`<button class="category" data-category="${name}"><strong>${name}</strong><span>${total}</span></button>`).join('');categoryGrid.querySelectorAll('.category').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.category;if(['Resources','Structural','Geotechnical','Hydraulics'].includes(name))return;search.value=name;filter(name)}));}
 grid.querySelectorAll('.tool-card').forEach(card=>{if(card.querySelector('h3')?.textContent===tools[0].title){card.style.cursor='pointer';card.setAttribute('tabindex','0');const open=()=>{window.location.href='land-unit-converter.html';};card.addEventListener('click',open);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')open();});}});
}

document.addEventListener('DOMContentLoaded',()=>{if(isConverter)initConverter();else initHome();});
