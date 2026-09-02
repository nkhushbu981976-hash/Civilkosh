const tools=[
 {title:'Nepal Land Unit Converter',desc:'Convert Ropani, Aana, Paisa, Daam, Bigha, Kattha and Dhur using Nepal-specific land units.',category:'Land & Survey',icon:'LU'},
 {title:'Concrete Calculator',desc:'Estimate concrete volume and material quantities for common construction work.',category:'Estimation',icon:'CC'},
 {title:'Brick Masonry Calculator',desc:'Calculate brick count and mortar requirements for masonry work.',category:'Estimation',icon:'BM'},
 {title:'Cement & Sand Calculator',desc:'Estimate cement and sand quantities for mortar and plaster mixes.',category:'Materials',icon:'CS'},
 {title:'Civil Unit Converter',desc:'Convert common civil engineering units for length, area, volume, weight and more.',category:'Units',icon:'UC'},
 {title:'Construction Cost Estimator',desc:'Build a quick preliminary estimate from quantities, materials and unit rates.',category:'Estimation',icon:'CE'}
];
const categories=[['Land & Survey','1 tool'],['Estimation','3 tools'],['Materials','1 tool'],['Units','1 tool'],['Structural','Coming soon'],['Geotechnical','Coming soon'],['Hydraulics','Coming soon'],['Resources','Reference guides']];
const path=location.pathname,isConverter=path.endsWith('land-unit-converter.html');
if(isConverter){
 const sqft=0.09290304;
 const units={
  ropani:{name:'Ropani',symbol:'ropani',sqft:5476},aana:{name:'Aana',symbol:'aana',sqft:342.25},
  paisa:{name:'Paisa',symbol:'paisa',sqft:85.5625},daam:{name:'Daam',symbol:'daam',sqft:21.390625},
  bigha:{name:'Bigha',symbol:'bigha',sqft:72900},kattha:{name:'Kattha',symbol:'kattha',sqft:3645},
  dhur:{name:'Dhur',symbol:'dhur',sqft:182.25},sqft:{name:'Square Feet',symbol:'sq ft',sqft:1},sqm:{name:'Square Meter',symbol:'m²',sqft:1/sqft}
 };
 const value=document.querySelector('#value'),from=document.querySelector('#fromUnit'),to=document.querySelector('#toUnit'),result=document.querySelector('#result'),resultUnit=document.querySelector('#resultUnit'),error=document.querySelector('#error');
 Object.entries(units).forEach(([key,u])=>{from.add(new Option(`${u.name} (${u.symbol})`,key));to.add(new Option(`${u.name} (${u.symbol})`,key));});
 from.value='ropani';to.value='sqm';
 const format=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n);
 function convert(){const n=Number(value.value);if(value.value.trim()===''||!Number.isFinite(n)||n<0){result.textContent='—';error.hidden=false;return}error.hidden=true;const converted=n*units[from.value].sqft/units[to.value].sqft;result.textContent=format(converted);resultUnit.textContent=`${units[to.value].name} (${units[to.value].symbol})`;}
 value.addEventListener('input',convert);from.addEventListener('change',convert);to.addEventListener('change',convert);
 document.querySelector('#swapButton').addEventListener('click',()=>{[from.value,to.value]=[to.value,from.value];convert()});
 document.querySelector('#resetButton').addEventListener('click',()=>{value.value='1';from.value='ropani';to.value='sqm';convert();value.focus()});convert();
}else{
 const grid=document.querySelector('#toolGrid'),count=document.querySelector('#resultCount'),empty=document.querySelector('#emptyState'),search=document.querySelector('#search');
 function render(items){grid.innerHTML=items.map(t=>`<article class="tool-card"><div class="tool-icon">${t.icon}</div><h3>${t.title}</h3><p>${t.desc}</p><div class="tool-meta">${t.category} <span aria-hidden="true">→</span></div></article>`).join('');count.textContent=`${items.length} ${items.length===1?'tool':'tools'}`;empty.hidden=items.length!==0;}
 function filter(query,scroll=true){const q=query.trim().toLowerCase();render(tools.filter(t=>!q||[t.title,t.desc,t.category].join(' ').toLowerCase().includes(q)));if(scroll)document.querySelector('#tools').scrollIntoView({behavior:'smooth',block:'start'});}
 render(tools);document.querySelector('#searchButton').addEventListener('click',()=>filter(search.value));search.addEventListener('keydown',e=>{if(e.key==='Enter')filter(search.value)});
 document.querySelector('#categoryGrid').innerHTML=categories.map(([name,total])=>`<button class="category" data-category="${name}"><strong>${name}</strong><span>${total}</span></button>`).join('');
 document.querySelectorAll('.category').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.category;if(['Resources','Structural','Geotechnical','Hydraulics'].includes(name))return;search.value=name;filter(name)}));
 document.querySelectorAll('.tool-card').forEach(card=>{if(card.querySelector('h3')?.textContent===tools[0].title){card.style.cursor='pointer';card.addEventListener('click',()=>location.href='land-unit-converter.html')}});
}
