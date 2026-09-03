(function(){
'use strict';
function el(id){return document.getElementById(id)}
function num(id){return Number(el(id).value)}
function fmt(v,d){return Number(v).toLocaleString(undefined,{maximumFractionDigits:d||1})}
function showError(id,msg){var e=el(id);e.textContent=msg;e.hidden=false}
function clearError(id){var e=el(id);e.hidden=true;e.textContent=''}
function setText(id,value){el(id).textContent=value}
var phiTable=[0,5,10,15,20,25,30,35,40,45],ncTable=[5.14,6.49,8.35,10.98,14.83,20.72,30.14,46.12,75.31,133.88],nqTable=[1,1.57,2.47,3.94,6.40,10.66,18.40,33.30,64.20,134.88],ngTable=[0,.45,1.22,2.65,5.39,10.88,22.40,48.03,109.41,271.76];
function interp(x,xs,ys){if(x<=xs[0])return ys[0];if(x>=xs[xs.length-1])return ys[ys.length-1];for(var i=1;i<xs.length;i++){if(x<=xs[i]){var t=(x-xs[i-1])/(xs[i]-xs[i-1]);return ys[i-1]+t*(ys[i]-ys[i-1])}}}
var bf=el('bearingForm');
if(bf){bf.addEventListener('submit',function(ev){ev.preventDefault();clearError('bearingError');var B=num('bWidth'),L=num('bLength'),Df=num('bDepth'),gamma=num('bGamma'),c=num('bCohesion'),phi=num('bPhi'),fs=num('bFS'),water=el('bWater').value;if(!(B>0&&L>=B&&Df>=0&&gamma>0&&c>=0&&phi>=0&&phi<=45&&fs>1)){showError('bearingError','Check the inputs: use L ≥ B, φ between 0° and 45°, and a factor of safety greater than 1.');return}var Nc=interp(phi,phiTable,ncTable),Nq=interp(phi,phiTable,nqTable),Ng=interp(phi,phiTable,ngTable),rad=phi*Math.PI/180,tanTerm=Math.tan(Math.PI/4+rad/2),sc=1+.2*B/L,sq=1+.2*B/L,sg=1-.4*B/L,dc=1+.2*(Df/B)*tanTerm,dq=phi>10?1+.1*(Df/B)*tanTerm:1,dg=dq,gammaN=gamma,qGamma=gamma*Df,waterNote='No groundwater correction applied.';if(water==='base'){gammaN=Math.max(gamma-9.81,0);waterNote='Simplified base-level water correction: γ′ used in the Nγ term; surcharge above the base remains γDf.'}if(water==='ground'){gammaN=Math.max(gamma-9.81,0);qGamma=gammaN*Df;waterNote='Simplified ground-level water correction: γ′ used for both surcharge and Nγ terms.'}var qult=c*Nc*sc*dc+qGamma*Nq*sq*dq+.5*gammaN*B*Ng*sg*dg,qall=qult/fs;setText('bQu',fmt(qult,1)+' kPa');setText('bQa',fmt(qall,1)+' kPa');setText('bFactors','Nc '+fmt(Nc,2)+' · Nq '+fmt(Nq,2)+' · Nγ '+fmt(Ng,2));setText('bShape','Sc '+fmt(sc,2)+' · Sq '+fmt(sq,2)+' · Sγ '+fmt(sg,2));setText('bWater',waterNote);el('bearingResult').hidden=false;el('bearingStatus').className='geo-status '+(qall>0?'':'warn');setText('bearingStatus',qall>0?'CALCULATED':'CHECK INPUTS')})}
var sf=el('soilSearch');
var soilRows=[
['GW','Well-graded gravel','20 ± 2.5','40 ± 5','0','>10⁻²','Good bearing value'],
['GP','Poorly graded gravel','19 ± 3','38 ± 6','0','>10⁻²','Good bearing value'],
['GM','Silty gravel','21 ± 2.5','36 ± 4','0','10⁻³–10⁻⁶','Guidance only; test required'],
['GC','Clayey gravel','20.5 ± 2','34 ± 4','0','10⁻⁶–10⁻⁸','Guidance only; test required'],
['SW','Well-graded sand','19.6 ± 2','38 ± 5','0','>10⁻³','Good bearing value in IS 1498 guidance'],
['SP','Poorly graded sand','18.5 ± 2.5','36 ± 6','0','>10⁻³','Guidance only; test required'],
['SM','Silty sand','20 ± 2.5','34 ± 3','0','10⁻³–10⁻⁶','Guidance only; drainage dependent'],
['SC','Clayey sand','19.6 ± 2','32 ± 4','0','10⁻⁶–10⁻⁸','Guidance only; test required'],
['ML','Silt','19 ± 2.5','33 ± 4','0','10⁻³–10⁻⁶','Poor to variable; test required'],
['CL','Clay / low-plasticity clay','20 ± 1.5','27 ± 4','20 ± 10','10⁻⁶–10⁻⁸','Bearing and settlement are site dependent'],
['CH','High-plasticity clay','17.5 ± 1.5','22 ± 4','25 ± 10','10⁻⁶–10⁻⁸','Settlement and compressibility concern'],
['OH','Organic clay','15.6 ± 1.5','22 ± 4','10 ± 5','10⁻⁶–10⁻⁸','Poor; compressibility concern']
];
function renderSoil(filter){var body=el('soilBody');if(!body)return;body.innerHTML='';var q=(filter||'').trim().toLowerCase(),count=0;soilRows.forEach(function(r){if(q&&r.join(' ').toLowerCase().indexOf(q)<0)return;var tr=document.createElement('tr');r.forEach(function(v,i){var td=document.createElement('td');td.textContent=v;if(i>=2&&i<=4)td.className='num';tr.appendChild(td)});body.appendChild(tr);count++});setText('soilCount',count+' reference entr'+(count===1?'y':'ies'))}
if(sf){sf.addEventListener('input',function(){renderSoil(sf.value)});renderSoil('')}
var ff=el('foundationForm');
if(ff){ff.addEventListener('submit',function(ev){ev.preventDefault();clearError('foundationError');var P=num('fLoad'),B=num('fWidth'),L=num('fLength'),qa=num('fQa'),Df=num('fDepth');if(!(P>0&&B>0&&L>0&&qa>0&&Df>=0)){showError('foundationError','Enter positive load, footing dimensions and allowable bearing pressure.');return}var area=B*L,required=P/qa,pressure=P/area,pass=pressure<=qa;setText('fRequired',fmt(required,2)+' m²');setText('fProvided',fmt(area,2)+' m²');setText('fPressure',fmt(pressure,1)+' kPa');setText('fQaOut',fmt(qa,1)+' kPa');setText('fRatio',fmt(pressure/qa,2));setText('fDepthOut',fmt(Df,2)+' m');el('foundationResult').hidden=false;el('foundationStatus').className='geo-status '+(pass?'':'warn');setText('foundationStatus',pass?'PRELIMINARY PASS':'BEARING PRESSURE EXCEEDS ALLOWABLE')})}
})();