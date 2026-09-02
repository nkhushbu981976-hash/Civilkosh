const services=[
 {title:'Citizenship Certificate',desc:'Understand the basic process, documents and where to start.',category:'Identity & Documents',icon:'ID'},
 {title:'Passport Services',desc:'Find passport-related guidance and application information.',category:'Travel & Documents',icon:'PA'},
 {title:'Driving Licence',desc:'A clear starting point for licence applications and renewals.',category:'Transport',icon:'DL'},
 {title:'Birth Registration',desc:'Learn what to prepare for birth registration and related records.',category:'Civil Registration',icon:'BR'},
 {title:'National ID',desc:'Explore information about Nepal’s national identity services.',category:'Identity & Documents',icon:'NI'},
 {title:'PAN Registration',desc:'Get oriented around personal tax identification and registration.',category:'Tax & Finance',icon:'PN'}
];
const categories=[['Identity & Documents','3 services'],['Civil Registration','1 service'],['Travel & Documents','1 service'],['Transport','1 service'],['Tax & Finance','1 service'],['Education','Coming soon'],['Health','Coming soon'],['Local Government','Coming soon']];
const grid=document.querySelector('#serviceGrid'), count=document.querySelector('#resultCount'), empty=document.querySelector('#emptyState'), search=document.querySelector('#search');
function render(items){grid.innerHTML=items.map((s,i)=>`<article class="service-card"><div class="service-icon">${s.icon}</div><h3>${s.title}</h3><p>${s.desc}</p><div class="service-meta">${s.category} <span aria-hidden="true">→</span></div></article>`).join('');count.textContent=`${items.length} ${items.length===1?'service':'services'}`;empty.hidden=items.length!==0;}
function filter(query){const q=query.trim().toLowerCase();render(services.filter(s=>!q||[s.title,s.desc,s.category].join(' ').toLowerCase().includes(q)));document.querySelector('#services').scrollIntoView({behavior:'smooth',block:'start'});}
render(services);
document.querySelector('#searchButton').addEventListener('click',()=>filter(search.value));
search.addEventListener('keydown',e=>{if(e.key==='Enter')filter(search.value)});
document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{search.value=b.dataset.query;filter(b.dataset.query)}));
document.querySelector('#categoryGrid').innerHTML=categories.map(([name,total])=>`<button class="category" data-category="${name}"><strong>${name}</strong><span>${total}</span></button>`).join('');
document.querySelectorAll('.category').forEach(b=>b.addEventListener('click',()=>{const name=b.dataset.category;if(name==='Coming soon')return;search.value=name;filter(name)}));
