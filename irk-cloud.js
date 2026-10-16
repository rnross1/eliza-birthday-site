(()=>{
 const range=document.getElementById('irk-slider'),boundary=document.getElementById('irk-boundary'),puzzle=document.getElementById('word-sort'),scatter=document.getElementById('word-scatter'),scale=document.getElementById('word-scale'),status=document.getElementById('sort-status'),lane=document.querySelector('.curator-lane'),walker=lane.querySelector('.curator-walker');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const entries=[['irk','serious',44],['irk','moderate',33],['irk','mild',23],['ick','mild',23],['ick','moderate',33],['ick','serious',44]].map(([kind,level,size],id)=>({kind,level,size,id}));
 let selected=null,placed=new Set(),started=false,escaping=false,drag=null,suppressClickUntil=0;
 function boundaryState(){const ready=+range.value>=45&&+range.value<=55;boundary.disabled=!ready;boundary.classList.toggle('ready',ready);range.setAttribute('aria-valuetext',classify(+range.value).replace('Classification: ',''))}
 range.addEventListener('input',boundaryState);boundaryState();
 function select(id){selected=id;scatter.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.id===id)));if(id!==null){const e=entries[id];status.textContent=`Selected ${e.level} ${e.kind}. Choose its place on the scale.`}}
 function place(id,slot){
   if(id===null||placed.has(id)||!slot||slot.disabled)return;
   if(+slot.dataset.id!==id){status.textContent='Not quite. Check both the word and its intensity. Serious irks go far left; serious icks go far right.';return}
   placed.add(id);const word=scatter.querySelector(`[data-id="${id}"]`);word.disabled=true;word.setAttribute('aria-pressed','false');slot.classList.add('filled');slot.disabled=true;slot.querySelector('span').textContent=entries[id].kind.toUpperCase()+' ✓';selected=null;
   status.textContent=`${placed.size} / 6 classified.`;
   if(placed.size===6){puzzle.classList.add('complete');status.textContent='6 / 6. Perfectly classified. Unfortunately, they have noticed the curator…';escape()}
 }
 function cancelDrag(){if(!drag)return;drag.ghost?.remove();drag.word.style.opacity='';scale.querySelectorAll('.drop-ready').forEach(s=>s.classList.remove('drop-ready'));drag=null}
 function start(){
   if(started){puzzle.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'center'});return}started=true;puzzle.classList.remove('hidden');boundary.setAttribute('aria-expanded','true');
   for(const kind of ['irk','ick']){
     const group=document.createElement('div');group.className='sort-side';const heading=document.createElement('p');heading.textContent=kind==='irk'?'IRK · serious → mild':'ICK · mild → serious';const slots=document.createElement('div');slots.className='sort-slots';
     entries.filter(e=>e.kind===kind).forEach(e=>{const slot=document.createElement('button');slot.type='button';slot.className='sort-slot';slot.dataset.id=e.id;slot.setAttribute('aria-label',`Place ${e.level} ${e.kind}`);slot.innerHTML=`<span>· · ·</span>${e.level}`;slot.addEventListener('click',()=>{if(selected===null)status.textContent='Choose a word first, then its place.';else place(selected,slot)});slots.append(slot)});group.append(heading,slots);scale.append(group);
   }
   // A shuffled, contained burst keeps every word reachable on a phone.
   const shuffled=[...entries];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
   shuffled.forEach(e=>{
     const word=document.createElement('button');word.type='button';word.className='sort-word';word.dataset.id=e.id;word.dataset.kind=e.kind;word.dataset.level=e.level;word.style.setProperty('--word-size',e.size+'px');word.innerHTML=`${e.kind.toUpperCase()}<small>${e.level}</small>`;word.setAttribute('aria-label',`${e.level} ${e.kind}`);word.setAttribute('aria-pressed','false');scatter.append(word);
     word.addEventListener('click',()=>{if(performance.now()>suppressClickUntil)select(e.id)});
     word.addEventListener('pointerdown',ev=>{if(!ev.isPrimary||ev.button!==0)return;cancelDrag();word.setPointerCapture(ev.pointerId);drag={word,id:e.id,pointer:ev.pointerId,x:ev.clientX,y:ev.clientY,moved:false};select(e.id)});
     word.addEventListener('pointermove',ev=>{
       if(!drag||drag.pointer!==ev.pointerId)return;
       if(!drag.moved&&Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)>6){drag.moved=true;drag.ghost=word.cloneNode(true);drag.ghost.classList.add('is-dragging');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.tabIndex=-1;Object.assign(drag.ghost.style,{position:'fixed',width:word.offsetWidth+'px',height:word.offsetHeight+'px',margin:'0'});document.body.append(drag.ghost);word.style.opacity='.25'}
       if(drag.moved){ev.preventDefault();Object.assign(drag.ghost.style,{left:(ev.clientX-drag.word.offsetWidth/2)+'px',top:(ev.clientY-38)+'px'});const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.sort-slot');scale.querySelectorAll('.sort-slot').forEach(s=>s.classList.toggle('drop-ready',s===over));if(ev.clientY>innerHeight-60)window.scrollBy(0,12);else if(ev.clientY<100)window.scrollBy(0,-12)}
     });
     word.addEventListener('pointerup',ev=>{if(!drag||drag.pointer!==ev.pointerId)return;const moved=drag.moved;const slot=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.sort-slot');cancelDrag();if(moved){suppressClickUntil=performance.now()+450;place(e.id,slot)}});
     for(const event of ['pointercancel','lostpointercapture'])word.addEventListener(event,cancelDrag);
   });
   if(!motion.matches){const origin=boundary.getBoundingClientRect();scatter.querySelectorAll('button').forEach((word,i)=>{const r=word.getBoundingClientRect();word.animate([{transform:`translate(${origin.x+origin.width/2-r.x-r.width/2}px,${origin.y-r.y}px) scale(.15) rotate(${i%2?120:-120}deg)`,opacity:0},{transform:'translate(0,0) scale(1) rotate(0)',opacity:1}],{duration:700+i*60,easing:'cubic-bezier(.2,.8,.2,1)'})})}
   puzzle.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'nearest'});
 }
 boundary.addEventListener('click',start);
 function windPath(){
   if(lane.querySelector('.wind-path'))return;
   const link=document.createElement('a');link.href='cloud-rider.html';link.className='wind-path';link.innerHTML='follow the wind →<small>Cloud Rider · go when you’re ready</small>';lane.append(link);
 }
 function escape(){
   if(escaping)return;escaping=true;cancelDrag();lane.querySelector('.wind-path')?.remove();lane.classList.add('cloud-escape');walker.classList.remove('talking');walker.style.left=(lane.clientWidth-walker.offsetWidth)/2+'px';
   for(const kind of ['irk','ick']){const word=document.createElement('span');word.className='escape-word escape-word--'+kind;word.textContent=kind.toUpperCase();word.setAttribute('aria-hidden','true');lane.append(word)}
   const speech=document.createElement('p');speech.className='escape-speech';speech.textContent='a little space, please.';lane.append(speech);
   const summon=document.createElement('button');summon.type='button';summon.className='summon-cloud';summon.setAttribute('aria-label','Summon a cloud to help the curator escape');summon.innerHTML='<img src="assets/cloud-blue.png" alt="" draggable="false"/><span>summon a cloud ↑</span>';lane.append(summon);
   requestAnimationFrame(()=>{lane.classList.add('closing-in');lane.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'center'});summon.focus({preventScroll:true})});
   summon.addEventListener('click',async()=>{
     summon.disabled=true;summon.remove();speech.textContent='above this, actually.';walker.style.visibility='hidden';
     const rider=document.createElement('div');rider.className='escape-rider';rider.setAttribute('aria-hidden','true');rider.innerHTML='<img class="escape-cloud" src="assets/cloud-blue.png" alt=""/><img class="escape-oc" src="assets/oc-right.png" alt=""/>';lane.append(rider);
     if(!motion.matches){await rider.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:'translate(0,-135px) rotate(-8deg)',opacity:1,offset:.45},{transform:`translate(${lane.clientWidth*.7}px,-220px) rotate(7deg)`,opacity:0}],{duration:2300,easing:'ease-in-out',fill:'forwards'}).finished}
     rider.remove();speech.remove();lane.querySelectorAll('.escape-word').forEach(el=>el.remove());windPath();if(!found.has('cloudRider'))addSecret('cloudRider');status.textContent='The curator found a way through. Follow the wind below whenever you’re ready.';lane.querySelector('.wind-path').focus({preventScroll:true});
   },{once:true});
 }
 if(found.has('cloudRider')){lane.classList.add('cloud-path-known');windPath()}
 window.addEventListener('blur',cancelDrag);
 window.addEventListener('resize',()=>{cancelDrag();if(escaping)walker.style.left=(lane.clientWidth-walker.offsetWidth)/2+'px'});
})();
