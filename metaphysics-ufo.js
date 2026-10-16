function initMetaphysicsUfo({lane,walker,img,pause}){
 const change=document.getElementById('becoming-button'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const main=lane.parentElement;
 let craft,drag=null,busy=false,scrollFrame=0,x=0,y=0,heading=1,last=performance.now(),elapsed=0,focused=false;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function position(px,py){x=clamp(px,4,main.clientWidth-116);y=clamp(py,4,main.scrollHeight-76);craft.style.left=x+'px';craft.style.top=y+'px'}
 function positionFromClient(px,py){const r=main.getBoundingClientRect();position(px-r.left,py-r.top)}
 function roam(t){const dt=Math.min(.05,(t-last)/1000);last=t;elapsed+=dt;if(craft&&!drag&&!busy&&!(focused&&craft.matches(':focus-visible'))){
   const destination=lane.offsetTop+12+(motion.matches?0:Math.sin(elapsed*.8)*10);
   if(!motion.matches){x+=heading*32*dt;const left=lane.offsetLeft+8,right=lane.offsetLeft+lane.clientWidth-120;if(x>=right){x=right;heading=-1}if(x<=left){x=left;heading=1}}
   y+=Math.sign(destination-y)*Math.min(Math.abs(destination-y),95*dt);position(x,y);
 }requestAnimationFrame(roam)}
 requestAnimationFrame(roam);
 function endDrag(){if(!drag)return;const id=drag.id;drag=null;cancelAnimationFrame(scrollFrame);if(craft.hasPointerCapture(id))craft.releasePointerCapture(id);if(!busy)pause(false)}
 function captureRange(){const u=craft.getBoundingClientRect(),w=walker.getBoundingClientRect();return Math.abs(u.left+u.width/2-w.left-w.width/2)<w.width/2+28&&u.bottom>w.top-155&&u.top<w.bottom-30&&w.top<innerHeight&&w.bottom>0}
 async function abduct(){
   if(busy||!craft)return;busy=true;endDrag();pause(true);craft.disabled=true;
   const w=walker.getBoundingClientRect();positionFromClient(w.left+w.width/2-56,w.top-125);const u=craft.getBoundingClientRect();
   const beam=document.createElement('div');beam.className='ufo-beam';Object.assign(beam.style,{left:u.left+u.width/2-70+scrollX+'px',top:u.bottom-16+scrollY+'px',width:'140px',height:Math.max(40,w.bottom-u.bottom+16)+'px'});
   const passenger=img.cloneNode();passenger.className='ufo-passenger';passenger.alt='';Object.assign(passenger.style,{left:w.left+scrollX+'px',top:w.top+scrollY+'px',width:w.width+'px',height:w.height+'px'});
   const speech=document.createElement('div');speech.className='ufo-speech';speech.setAttribute('role','status');speech.textContent='it is what it is';Object.assign(speech.style,{left:clamp(w.left+w.width+8,8,innerWidth-190)+scrollX+'px',top:w.top-10+scrollY+'px'});
   document.body.append(beam,passenger,speech);walker.style.visibility='hidden';
   const dx=u.left+u.width/2-w.left-w.width/2,dy=u.top+u.height/2-w.top-w.height/2;
   await passenger.animate(motion.matches?[{opacity:1},{opacity:0}]:[{transform:'translate(0,0) rotate(0deg) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(600deg) scale(.12)`,opacity:0}],{duration:motion.matches?1200:2100,easing:'ease-in',fill:'forwards'}).finished;
   beam.remove();passenger.remove();speech.remove();
   await craft.animate(motion.matches?[{opacity:1},{opacity:0}]:[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${innerWidth*.3}px,${-innerHeight*.45}px) scale(.04)`,opacity:0}],{duration:motion.matches?150:1000,easing:'ease-in',fill:'forwards'}).finished;
   location.href='eliza-game.html';
 }
 function scrollWhileDragging(){if(!drag)return;if(drag.y>innerHeight-70)window.scrollBy(0,7);else if(drag.y<90)window.scrollBy(0,-7);positionFromClient(drag.x-drag.dx,drag.y-drag.dy);if(drag.moved&&captureRange()){abduct();return}scrollFrame=requestAnimationFrame(scrollWhileDragging)}
 function spawn(){
   if(craft){craft.focus();return}
   craft=document.createElement('button');craft.className='metaphysics-ufo';craft.setAttribute('aria-label','UFO: drag over the curator. Keyboard: use arrow keys to fly over her.');craft.innerHTML='<svg viewBox="0 0 120 78" aria-hidden="true"><path d="M35 42 Q36 5 60 9 Q85 7 88 43" fill="#c8e8df" stroke="#575065" stroke-width="3"/><path d="M8 45 Q58 24 112 46 Q99 67 59 69 Q20 66 8 45Z" fill="#c9bbdf" stroke="#575065" stroke-width="3"/><path d="M11 46 Q58 60 108 47" fill="none" stroke="#575065" stroke-width="2"/><g fill="#ffe799" stroke="#575065" stroke-width="1.5"><circle cx="32" cy="55" r="4"/><circle cx="59" cy="59" r="4"/><circle cx="87" cy="55" r="4"/></g></svg>';main.append(craft);
   const r=document.getElementById('metaphysics-cloud').getBoundingClientRect();positionFromClient(r.left+r.width/2-56,r.top+r.height*.55);
   if(motion.matches)position(lane.offsetLeft+lane.clientWidth/2-56,lane.offsetTop+12);
   craft.addEventListener('pointerdown',e=>{if(busy||!e.isPrimary||e.button!==0)return;const r=craft.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};craft.setPointerCapture(e.pointerId);pause(true);scrollFrame=requestAnimationFrame(scrollWhileDragging)});
   craft.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;drag.x=e.clientX;drag.y=e.clientY;drag.moved ||= Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5;positionFromClient(e.clientX-drag.dx,e.clientY-drag.dy);if(drag.moved&&captureRange())abduct()});
   for(const event of ['pointerup','pointercancel','lostpointercapture'])craft.addEventListener(event,endDrag);
   craft.addEventListener('focus',()=>{focused=true});craft.addEventListener('blur',()=>{focused=false;endDrag();if(!busy)pause(false)});
   craft.addEventListener('keydown',e=>{if(busy||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();pause(true);position(x+(e.key==='ArrowLeft'?-18:e.key==='ArrowRight'?18:0),y+(e.key==='ArrowUp'?-18:e.key==='ArrowDown'?18:0));if(captureRange())abduct()});
   document.getElementById('ufo-instructions').classList.remove('hidden');
 }
 change.addEventListener('click',()=>{change.closest('.becoming-box').classList.add('changed');document.getElementById('being-word').textContent='BECOMING';document.getElementById('becoming-status').textContent='Still itself. No longer quite the same.';change.textContent='change has arrived ✦';if(!found.has('becoming'))addSecret('becoming');spawn()});
 window.addEventListener('resize',()=>{if(!craft||busy)return;endDrag();position(parseFloat(craft.style.left),parseFloat(craft.style.top))});
 window.addEventListener('blur',endDrag);
 window.addEventListener('pageshow',e=>{if(e.persisted&&busy)location.reload()});
}
