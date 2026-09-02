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
const isConcrete=/concrete-calculator\.html$/.test(path);
const isBrick=/brick-masonry-calculator\.html$/.test(path);

function initConverter(){
 const units={ropani:{name:'Ropani',symbol:'ropani',sqm:508.7375622},aana:{name:'Aana',symbol:'aana',sqm:31.7961038875},paisa:{name:'Paisa',symbol:'paisa',sqm:7.949025971875},daam:{name:'Daam',symbol:'daam',sqm:1.98725649296875},bigha:{name:'Bigha',symbol:'bigha',sqm:6772.631124},kattha:{name:'Kattha',symbol:'kattha',sqm:338.6315562},dhur:{name:'Dhur',symbol:'dhur',sqm:16.93157781},sqft:{name:'Square Feet',symbol:'sq ft',sqm:0.09290304},sqm:{name:'Square Meter',symbol:'m²',sqm:1}};
 const value=document.getElementById('value'),from=document.getElementById('fromUnit'),to=document.getElementById('toUnit'),result=document.getElementById('result'),resultUnit=document.getElementById('resultUnit'),error=document.getElementById('error');
 if(!value||!from||!to||!result||!resultUnit)return;
 const fragment=document.createDocumentFragment();Object.entries(units).forEach(([key,u])=>fragment.appendChild(new Option(`${u.name} (${u.symbol})`,key)));
 from.replaceChildren(fragment.cloneNode(true));to.replaceChildren(fragment);from.value='ropani';to.value='sqm';
 const format=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n);
 function convert(){const raw=value.value.trim(),n=Number(raw);if(raw===''||!Number.isFinite(n)||n<0){result.textContent='—';error.hidden=false;return}error.hidden=true;result.textContent=format(n*units[from.value].sqm/units[to.value].sqm);resultUnit.textContent=`${units[to.value].name} (${units[to.value].symbol})`}
 value.addEventListener('input',convert);from.addEventListener('change',convert);to.addEventListener('change',convert);
 document.getElementById('swapButton')?.addEventListener('click',()=>{const old=from.value;from.value=to.value;to.value=old;convert()});
 document.getElementById('resetButton')?.addEventListener('click',()=>{value.value='1';from.value='ropani';to.value='sqm';convert();value.focus()});convert();
}

function initConcrete(){
 const fields=['length','width','depth'].map(id=>document.getElementById(id));const units={m:1,ft:0.3048,in:0.0254};const selects=['lengthUnit','widthUnit','depthUnit'].map(id=>document.getElementById(id));const m3=document.getElementById('concreteM3'),ft3=document.getElementById('concreteFt3'),error=document.getElementById('concreteError');if(fields.some(x=>!x)||selects.some(x=>!x)||!m3||!ft3||!error)return;const format=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n);
 function calculate(){const values=fields.map(x=>Number(x.value));if(fields.some(x=>x.value.trim()==='')||values.some(x=>!Number.isFinite(x)||x<=0)){m3.textContent='—';ft3.textContent='—';error.hidden=false;return}error.hidden=true;const volumeM3=values.reduce((total,n,i)=>total*n*units[selects[i].value],1);m3.textContent=format(volumeM3);ft3.textContent=format(volumeM3*35.3146667215)}
 fields.forEach(x=>x.addEventListener('input',()=>{if(x.value!=='')error.hidden=true}));selects.forEach(x=>x.addEventListener('change',()=>{if(fields.every(f=>f.value.trim()!==''))calculate()}));document.getElementById('calculateConcrete')?.addEventListener('click',calculate);document.getElementById('resetConcrete')?.addEventListener('click',()=>{fields.forEach(x=>x.value='');selects.forEach(x=>x.value='m');m3.textContent='—';ft3.textContent='—';error.hidden=true;fields[0].focus()});
}

function initBrick(){
 const ids=['wallLength','wallHeight','wallThickness','brickLength','brickWidth','brickHeight','jointThickness','wastage'];const fields=ids.map(id=>document.getElementById(id));const unitIds=['wallLengthUnit','wallHeightUnit','wallThicknessUnit','brickLengthUnit','brickWidthUnit','brickHeightUnit','jointUnit'];const selects=unitIds.map(id=>document.getElementById(id));const brickCount=document.getElementById('brickCount'),mortar=document.getElementById('mortarVolume'),error=document.getElementById('brickError');if(fields.some(x=>!x)||selects.some(x=>!x)||!brickCount||!mortar||!error)return;
 const lengthUnits={m:1,ft:0.3048,in:0.0254},jointUnits={mm:.001,cm:.01,in:.0254};const format=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:3}).format(n);
 function calculate(){const v=fields.map(x=>Number(x.value));const invalid=fields.slice(0,7).some(x=>x.value.trim()==='')||v.slice(0,7).some(x=>!Number.isFinite(x)||x<=0)||fields[7].value.trim()===''||!Number.isFinite(v[7])||v[7]<0;if(invalid){brickCount.textContent='—';mortar.textContent='—';error.hidden=false;return}const wall=v.slice(0,3).map((n,i)=>n*lengthUnits[selects[i].value]);const brick=v.slice(3,6).map((n,i)=>n*lengthUnits[selects[i+3].value]);const joint=v[6]*jointUnits[selects[6].value];const unitBrickVolume=(brick[0]+joint)*(brick[1]+joint)*(brick[2]+joint);const wallVolume=wall[0]*wall[1]*wall[2];const baseCount=wallVolume/unitBrickVolume;const countWithWastage=baseCount*(1+v[7]/100);const brickSolidVolume=baseCount*brick[0]*brick[1]*brick[2];const mortarVolume=Math.max(0,wallVolume-brickSolidVolume);brickCount.textContent=format(Math.ceil(countWithWastage));mortar.textContent=format(mortarVolume);error.hidden=true}
 document.getElementById('calculateBrick')?.addEventListener('click',calculate);document.getElementById('resetBrick')?.addEventListener('click',()=>{fields[0].value='';fields[1].value='';fields[2].value='';fields.slice(3,6).forEach((x,i)=>x.value=['0.19','0.09','0.09'][i]);document.getElementById('jointThickness').value='10';document.getElementById('wastage').value='5';selects.forEach((x,i)=>x.value=i===6?'mm':'m');brickCount.textContent='—';mortar.textContent='—';error.hidden=true;fields[0].focus()});
 fields.forEach(x=>x.addEventListener('input',()=>{if(x.value!=='')error.hidden=true}));
}

function initHome(){
 const grid=document.querySelector('#toolGrid');if(!grid)return;const count=document.querySelector('#resultCount'),empty=document.querySelector('#emptyState'),search=document.querySelector('#search');
 function render(items){grid.innerHTML=items.map(t=>`<article class="tool-card"><div class="tool-icon">${t.icon}</div><h3>${t.title}</h3><p>${t.desc}</p><div class="tool-meta">${t.category} <span aria-hidden="true">→</span></div></article>`).join('');count.textContent=`${items.length} ${items.length===1?'tool':'tools'}`;empty.hidden=items.length!==0;grid.querySelectorAll('.tool-card').forEach(card=>{const title=card.querySelector('h3')?.textContent;const target=title==='Nepal Land Unit Converter'?'land-unit-converter.html':title==='Concrete Calculator'?'concrete-calculator.html':title==='Brick Masonry Calculator'?'brick-masonry-calculator.html':null;if(target){card.style.cursor='pointer';card.setAttribute('tabindex','0');const open=()=>{window.location.href=target};card.addEventListener('click',open);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')open()})}})}
 function filter(query,scroll=true){const q=query.trim().toLowerCase();render(tools.filter(t=>!q||[t.title,t.desc,t.category].join(' ').toLowerCase().includes(q)));if(scroll)document.querySelector('#tools').scrollIntoView({behavior:'smooth',block:'start'})}render(tools);document.querySelector('#searchButton')?.addEventListener('click',()=>filter(search.value));search?.addEventListener('keydown',e=>{if(e.key==='Enter')filter(search.value)});const categoryGrid=document.querySelector('#categoryGrid');if(categoryGrid){categoryGrid.innerHTML=categories.map(([name,total])=>`<button class="category" data-category="${name}"><strong>${name}</strong><span>${total}</span></button>`).join('');categoryGrid.querySelectorAll('.category').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.category;if(['Resources','Structural','Geotechnical','Hydraulics'].includes(name))return;search.value=name;filter(name)}))}
}
document.addEventListener('DOMContentLoaded',()=>{if(isConverter)initConverter();else if(isConcrete)initConcrete();else if(isBrick)initBrick();else initHome()});
