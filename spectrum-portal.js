function initSpectrumPortal({lane,walker,img,unlocked,dragging,settle,enter}){
 const portal=document.createElement('a');portal.className='buddy-portal';portal.id='buddy-portal';portal.href='buddy-flight.html';
 portal.setAttribute('aria-label','Enter the buddy portal');portal.innerHTML='<span class="portal-ring" aria-hidden="true">✦</span><span>buddy portal</span>';
 const hint=document.createElement('p');hint.className='portal-hint';hint.textContent='drag her into the portal →';
 lane.append(portal,hint);lane.classList.add('spectrum-lane');
 let drag=null,entering=false,enterTimer;
 function unlock(){unlocked=true;lane.classList.add('portal-open');walker.title='Drag me into the portal';img.draggable=false;document.getElementById('portal-discovery-note').classList.remove('hidden')}
 if(unlocked)unlock();
 document.getElementById('constellation').addEventListener('buddyconnectionchange',e=>{
   if(e.detail.connected){unlock();return}
   unlocked=false;if(drag)release({pointerId:drag.id},true);
   clearTimeout(enterTimer);entering=false;walker.classList.remove('portal-entering');dragging(false);
   lane.classList.remove('portal-open');portal.classList.remove('portal-ready');walker.title='';
   document.getElementById('portal-discovery-note').classList.add('hidden');
 });
 function go(){if(!unlocked||entering)return;entering=true;dragging(true);enter();walker.classList.add('portal-entering');enterTimer=setTimeout(()=>{location.href=portal.href},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:400)}
 // The link is also a keyboard alternative to dragging.
 portal.addEventListener('click',e=>{e.preventDefault();go()});
 walker.addEventListener('pointerdown',e=>{
   if(!unlocked||entering||!e.isPrimary||e.button!==0)return;
   const r=walker.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,moved:false};
   walker.setPointerCapture(e.pointerId);dragging(true);
 });
 walker.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==drag.id)return;
   if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;
   drag.moved=true;walker.classList.add('portal-dragging');
   const r=lane.getBoundingClientRect();
   walker.style.left=Math.max(0,Math.min(lane.clientWidth-walker.offsetWidth,e.clientX-r.left-drag.dx))+'px';
   walker.style.top=Math.max(0,Math.min(lane.clientHeight-walker.offsetHeight,e.clientY-r.top-drag.dy))+'px';walker.style.bottom='auto';
   const a=walker.getBoundingClientRect(),b=portal.getBoundingClientRect();
   portal.classList.toggle('portal-ready',a.right>b.left+12&&a.left<b.right-12&&a.bottom>b.top&&a.top<b.bottom);
 });
 function release(e,cancelled=false){
   if(!drag||e.pointerId!==drag.id)return;
   const moved=drag.moved,id=drag.id;drag=null;
   if(walker.hasPointerCapture(id))walker.releasePointerCapture(id);
   const accepted=!cancelled&&moved&&portal.classList.contains('portal-ready');
   walker.classList.remove('portal-dragging');portal.classList.remove('portal-ready');
   if(accepted){go();return}
   const max=Math.max(12,lane.clientWidth-walker.offsetWidth-130);
   settle(Math.max(12,Math.min(max,parseFloat(walker.style.left)||12)));dragging(false);
   if(!moved&&!cancelled){walker.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:0}))}
 }
 walker.addEventListener('pointerup',e=>release(e));
 walker.addEventListener('pointercancel',e=>release(e,true));
 walker.addEventListener('lostpointercapture',e=>release(e,true));
 window.addEventListener('resize',()=>{if(drag)release({pointerId:drag.id},true)});
}
