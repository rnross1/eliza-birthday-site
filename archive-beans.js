// Archive-only snacks. Pointer capture keeps mouse, pen, and touch drags together.
function initArchiveBeans({board,oc,img,refresh,hold,feed}){
 const box=board.querySelector('.bean-item'),snacks=new Set();
 let shift={x:0,y:0},active=null,lastSpill=-Infinity;
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 function bounds(el){
   const b=board.getBoundingClientRect(),r=el.getBoundingClientRect();
   return {x:r.left-b.left-board.clientLeft,y:r.top-b.top-board.clientTop,width:r.width,height:r.height};
 }
 function landingSpot(){
   const card=bounds(box),width=38,height=30;
   const obstacles=[...board.querySelectorAll('.hub-item,.loose-secret')].map(bounds);
   if(oc.offsetWidth){const r=bounds(oc);obstacles.push({x:r.x-35,y:r.y-35,width:r.width+70,height:r.height+70})}
   for(const bean of snacks)obstacles.push({x:parseFloat(bean.style.left),y:parseFloat(bean.style.top),width:38,height:30});
   // Beans settle in a free space below the box, never on a link or another bean.
   for(let y=card.y+card.height+12;y<board.clientHeight-height-8;y+=36){
     for(const offset of [0,-44,44,-88,88,-132,132,-176,176]){
       const x=clamp(card.x+card.width/2-width/2+offset,8,board.clientWidth-width-8);
       if(!obstacles.some(r=>x<r.x+r.width+5&&x+width>r.x-5&&y<r.y+r.height+5&&y+height>r.y-5))return{x,y};
     }
   }
   return null;
 }
 function spill(){
   if(performance.now()-lastSpill<250||snacks.size>=12)return;
   lastSpill=performance.now();
   for(let i=0;i<2;i++){
     if(snacks.size>=12)return;
     const spot=landingSpot();if(!spot)return;
     const bean=document.createElement('button');bean.type='button';bean.className='archive-snack';
     bean.textContent='bean';bean.title='Drag to feed her · Enter or Space also feeds';
     bean.setAttribute('aria-label','Feed this bean to the curator');
     bean.style.left=spot.x+'px';bean.style.top=spot.y+'px';
     board.append(bean);snacks.add(bean);
     if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
       const card=bounds(box),dx=card.x+card.width/2-19-spot.x,dy=card.y+card.height-20-spot.y;
       bean.animate([{transform:`translate(${dx}px,${dy}px) rotate(-25deg)`,opacity:0},{opacity:1,offset:.15},{transform:'translate(0,0) rotate(12deg)',opacity:1}],{duration:450,easing:'cubic-bezier(.3,.05,.7,1)'});
     }
     draggable(bean,false);
     bean.addEventListener('click',e=>{
       if(e.detail!==0)return;
       hold(true,bean.getBoundingClientRect());if(feed()){snacks.delete(bean);bean.remove()}hold(false);
     });
   }
 }
 function overCurator(bean){
   if(oc.disabled||!oc.offsetWidth)return false;
   const a=bean.getBoundingClientRect(),b=img.getBoundingClientRect();
   return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 }
 function draggable(el,isBox){
   let suppressUntil=0;
   el.draggable=false;
   el.addEventListener('dragstart',e=>e.preventDefault());
   el.addEventListener('click',e=>{if(e.detail>0&&performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
   el.addEventListener('pointerdown',e=>{
     if(!e.isPrimary||e.button!==0||active)return;
     const start=bounds(el);
     active={el,isBox,id:e.pointerId,start,clientX:e.clientX,clientY:e.clientY,shift:{...shift},moved:false,checkpoint:{x:e.clientX,y:e.clientY},direction:{x:0,y:0},reversals:[],suppress:()=>{suppressUntil=performance.now()+700}};
     el.setPointerCapture(e.pointerId);
     if(!isBox){el.getAnimations().forEach(a=>a.cancel());hold(true,el.getBoundingClientRect())}
   });
   el.addEventListener('pointermove',e=>{
     const a=active;if(!a||a.el!==el||e.pointerId!==a.id)return;
     const dx=e.clientX-a.clientX,dy=e.clientY-a.clientY;
     if(!a.moved&&Math.hypot(dx,dy)<6)return;
     a.moved=true;el.classList.add('snack-dragging');e.preventDefault();
     const x=clamp(a.start.x+dx,8,board.clientWidth-a.start.width-8),y=clamp(a.start.y+dy,8,board.clientHeight-a.start.height-8);
     if(isBox){
       shift={x:a.shift.x+x-a.start.x,y:a.shift.y+y-a.start.y};
       box.style.translate=`${shift.x}px ${shift.y}px`;
       const mx=e.clientX-a.checkpoint.x,my=e.clientY-a.checkpoint.y;
       if(Math.max(Math.abs(mx),Math.abs(my))>=18){
         const axis=Math.abs(mx)>=Math.abs(my)?'x':'y',sign=Math.sign(axis==='x'?mx:my),now=performance.now();
         if(a.direction[axis]&&sign!==a.direction[axis])a.reversals.push(now);
         a.direction[axis]=sign;a.checkpoint={x:e.clientX,y:e.clientY};
         a.reversals=a.reversals.filter(t=>now-t<1200);
         if(a.reversals.length>=2&&now-lastSpill>=250){spill();a.reversals=[]}
       }
       refresh();
     }else{
       el.style.left=x+'px';el.style.top=y+'px';oc.classList.toggle('bean-ready',overCurator(el));
     }
   });
   el.addEventListener('pointerup',e=>finish(e,false));
   el.addEventListener('pointercancel',e=>finish(e,true));
   el.addEventListener('lostpointercapture',e=>finish(e,true));
 }
 function finish(e,cancelled){
   const a=active;if(!a||e.pointerId!==a.id)return;
   active=null;
   if(a.el.hasPointerCapture(a.id))a.el.releasePointerCapture(a.id);
   a.el.classList.remove('snack-dragging');oc.classList.remove('bean-ready');
   if(a.moved)a.suppress();
   if(!a.isBox){
     if(!cancelled&&a.moved&&overCurator(a.el)&&feed()){snacks.delete(a.el);a.el.remove()}
     else if(cancelled){a.el.style.left=a.start.x+'px';a.el.style.top=a.start.y+'px'}
     hold(false);
   }
   refresh();
 }
 draggable(box,true);
 // Keep the responsive layout authoritative after a viewport change.
 window.addEventListener('resize',()=>{
   if(active)finish({pointerId:active.id},true);
   shift={x:0,y:0};box.style.translate='';
   for(const bean of snacks){bean.style.left=clamp(parseFloat(bean.style.left),8,board.clientWidth-46)+'px';bean.style.top=clamp(parseFloat(bean.style.top),8,board.clientHeight-38)+'px'}
   refresh();
 });
}
