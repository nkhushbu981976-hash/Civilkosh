const tools=[
 {title:'Nepal Land Unit Converter',desc:'Convert Ropani, Aana, Paisa, Daam, Bigha, Kattha and Dhur using Nepal-specific land units.',category:'Land & Survey',icon:'LU'},
 {title:'Concrete Calculator',desc:'Estimate concrete volume and material quantities for common construction work.',category:'Estimation',icon:'CC'},
 {title:'Brick Masonry Calculator',desc:'Calculate brick count and mortar requirements for masonry work.',category:'Estimation',icon:'BM'},
 {title:'Cement & Sand Calculator',desc:'Estimate cement and sand quantities for mortar and plaster mixes.',category:'Materials',icon:'CS'},
 {title:'Civil Unit Converter',desc:'Convert common civil engineering units for length, area, volume, weight and more.',category:'Units',icon:'UC'},
 {title:'Construction Cost Estimator',desc:'Build a quick preliminary estimate from quantities, materials and unit rates.',category:'Estimation',icon:'CE'}
];
const categories=[['Land & Survey','1 tool'],['Estimation','3 tools'],['Materials','1 tool'],['Units','1 tool'],['Structural','Coming soon'],['Geotechnical','Coming soon'],['Hydraulics','Coming soon'],['Resources','Reference guides']];
const grid=document.querySelector('#toolGrid'),count=document.querySelector('#resultCount'),empty=document.querySelector('#emptyState'),search=document.querySelector('#search');
function render(items){grid.innerHTML=items.map(t=>`<article class="tool-card"><div class="tool-icon">${t.icon}</div><h3>${t.title}</h3><p>${t.desc}</p><div class="tool-meta">${t.category} <span aria-hidden="true">→</span></div></article>`).join('');count.textContent=`${items.length} ${items.length===1?'tool':'tools'}`;empty.hidden=items.length!==0;}
function filter(query,scroll=true){const q=query.trim().toLowerCase();render(tools.filter(t=>!q||[t.title,t.desc,t.category].join(' ').toLowerCase().includes(q)));if(scroll)document.querySelector('#tools').scrollIntoView({behavior:'smooth',block:'start'});}
render(tools);
document.querySelector('#searchButton').addEventListener('click',()=>filter(search.value));
search.addEventListener('keydown',e=>{if(e.key==='Enter')filter(search.value)});
document.querySelector('#categoryGrid').innerHTML=categories.map(([name,total])=>`<button class="category" data-category="${name}"><strong>${name}</strong><span>${total}</span></button>`).join('');
document.querySelectorAll('.category').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.category;if(name==='Resources'||name==='Structural'||name==='Geotechnical'||name==='Hydraulics')return;search.value=name;filter(name)}));
