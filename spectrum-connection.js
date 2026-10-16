function initSpectrumConnection(){
 const scene=document.getElementById('constellation'),stars=[document.getElementById('buddy-star-a'),document.getElementById('buddy-star-b')],line=document.getElementById('constellation-line'),status=document.getElementById('buddy-status'),drift=document.getElementById('star-drift'),page=document.querySelector('.spectrum-page');
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)'),STATE='eliza-spectrum-connected',COUNT='eliza-spectrum-drifts';
 let connected=found.has('buddyConnection')&&localStorage.getItem(STATE)!=='false',displaced=false,count=found.has('starDrift')?Math.max(0,Number(localStorage.getItem(COUNT))||0):0,variant=0,tracking=0,trackUntil=0,effectTimer;
 const variants=[[-.09,-48,.09,48,-22,24],[.03,62,-.03,-62,28,-28],[-.1,40,.06,-30,-32,18],[.02,-65,.1,12,20,-34]];
 const captions=['different coordinates. same wavelength.','opposite directions. still on the same spectrum.','distance is not a disconnection.','the universe can stretch. this connection stays.'];
 function alignLine(){
   const r=scene.getBoundingClientRect(),a=stars[0].getBoundingClientRect(),b=stars[1].getBoundingClientRect(),x=a.left+a.width/2-r.left,y=a.top+a.height/2-r.top,dx=b.left+b.width/2-r.left-x,dy=b.top+b.height/2-r.top-y;
   Object.assign(line.style,{left:x+'px',top:y+'px',width:Math.hypot(dx,dy)+'px',transform:`rotate(${Math.atan2(dy,dx)}rad)`});
 }
 function track(){alignLine();if(performance.now()<trackUntil)tracking=requestAnimationFrame(track);else tracking=0}
 function follow(){trackUntil=performance.now()+1000;if(!tracking)tracking=requestAnimationFrame(track)}
 function placeStars(){
   const v=displaced?variants[variant]:[0,0,0,0,0,0];
   stars.forEach((star,i)=>{star.style.setProperty('--dx',v[i*2]*scene.clientWidth+'px');star.style.setProperty('--dy',v[i*2+1]+'px');star.style.setProperty('--turn',v[4+i]+'deg')});follow();
 }
 function stopEffects(){clearTimeout(effectTimer);page.classList.remove('connection-burst');scene.querySelectorAll('.connection-spark').forEach(el=>el.remove())}
 function celebrate(){
   stopEffects();void page.offsetWidth;page.classList.add('connection-burst');
   if(!motion.matches){
     const a=stars[0].getBoundingClientRect(),b=stars[1].getBoundingClientRect(),r=scene.getBoundingClientRect();
     for(let i=0;i<12;i++){const spark=document.createElement('span'),t=i*Math.PI/6;spark.className='connection-spark';spark.textContent=i%3?'✦':'♡';spark.setAttribute('aria-hidden','true');Object.assign(spark.style,{left:((a.left+a.width/2+b.left+b.width/2)/2-r.left)+'px',top:((a.top+a.height/2+b.top+b.height/2)/2-r.top)+'px'});spark.style.setProperty('--sx',Math.cos(t)*95+'px');spark.style.setProperty('--sy',Math.sin(t)*85+'px');scene.append(spark)}
   }
   effectTimer=setTimeout(stopEffects,1400);follow();
 }
 function render(){
   scene.dataset.connected=String(connected);line.classList.toggle('active',connected);
   stars.forEach(star=>star.setAttribute('aria-pressed',String(star.classList.contains('active'))));
   status.textContent=connected?(displaced?captions[variant]:'tism team — connection established ✦'):'spectrum buddies';
   follow();
 }
 if(connected)stars.forEach(star=>star.classList.add('active'));render();
 stars.forEach(star=>star.addEventListener('click',()=>{
   const before=connected;star.classList.toggle('active');connected=stars.every(el=>el.classList.contains('active'));render();
   localStorage.setItem(STATE,String(connected));
   if(before!==connected){
     scene.dispatchEvent(new CustomEvent('buddyconnectionchange',{detail:{connected}}));
     if(connected){if(!found.has('buddyConnection'))addSecret('buddyConnection');celebrate()}
     else{stopEffects();status.textContent='really, bro?';if(!found.has('buddyDisconnect'))addSecret('buddyDisconnect');else showToast('really, bro?')}
   }
 }));
 drift.addEventListener('click',()=>{
   displaced=!displaced;
   if(displaced){variant=count%variants.length;count++;localStorage.setItem(COUNT,String(count));if(!found.has('starDrift'))addSecret('starDrift');if(count>=3&&!found.has('spectrumDistance'))addSecret('spectrumDistance')}
   drift.textContent=displaced?'stabilize the constellation':'destabilize the constellation';drift.setAttribute('aria-pressed',String(displaced));scene.dataset.variant=displaced?String(variant):'stable';placeStars();render();
 });
 new ResizeObserver(placeStars).observe(scene);
 motion.addEventListener('change',()=>{stopEffects();placeStars()});
 document.getElementById('portal-discovery-note').querySelector('a').addEventListener('click',e=>{
   const portal=document.getElementById('buddy-portal');if(!connected||!portal)return;e.preventDefault();portal.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'center'});portal.focus({preventScroll:true});
 });
}
