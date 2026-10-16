function initBeanStudies(){
 const zone=document.getElementById('bean-rain-zone'),hint=document.getElementById('rain-hint'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const rainField=document.createElement('div');rainField.className='bean-rain-field';zone.append(rainField);
 let eater,mealAnimation,mealTimer,hiddenWalker,eaten=0,missed=0;
 function rainStatus(){hint.textContent=rainField.childElementCount?`nom. ${eaten} eaten. Catch them before they fall away!`:`${eaten} eaten · ${missed} slipped away. Make it rain again for another try.`}
 function restoreWalker(){if(hiddenWalker){hiddenWalker.style.visibility='';hiddenWalker=null}eater?.remove();eater=null}
 function eat(bean){
   const r=bean.getBoundingClientRect(),z=zone.getBoundingClientRect(),destination={x:r.left-z.left-8,y:r.top-z.top-38};bean.remove();
   clearTimeout(mealTimer);const previous=eater?.getBoundingClientRect();mealAnimation?.cancel();
   if(!eater){eater=new Image();eater.src='assets/oc-front-happy.png';eater.alt='';eater.className='bean-eater';zone.append(eater);hiddenWalker=document.querySelector('.curator-walker');if(hiddenWalker)hiddenWalker.style.visibility='hidden'}
   Object.assign(eater.style,{left:destination.x+'px',top:destination.y+'px'});
   const dx=previous?previous.left-z.left-destination.x:-50,dy=previous?previous.top-z.top-destination.y:75;
   mealAnimation=eater.animate(motion.matches?[{opacity:.3},{opacity:1}]:[{transform:`translate(${dx}px,${dy}px) scale(.75)`},{transform:`translate(${dx*.5}px,${Math.min(dy*.5,-40)}px) scale(1.1)`},{transform:'translate(0,0) scale(1)'}],{duration:350,easing:'ease-out'});
   eaten++;rainStatus();
   mealTimer=setTimeout(restoreWalker,950);
 }
 document.getElementById('bean-rain-btn').addEventListener('click',()=>{
   if(!found.has('beanRain'))addSecret('beanRain');clearTimeout(mealTimer);mealAnimation?.cancel();restoreWalker();zone.querySelectorAll('.falling-bean').forEach(b=>b.remove());
   const phone=zone.clientWidth<450,count=phone?24:54,columns=Math.max(3,Math.min(8,Math.floor((zone.clientWidth-20)/76))),special=Math.floor(Math.random()*count),duration=phone?6:5.2;
   eaten=0;missed=0;hint.textContent='Catch the falling beans before they escape. One has other plans.';
   if(phone){zone.style.scrollMarginTop=(document.querySelector('.page-header')?.offsetHeight||0)+12+'px';zone.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'})}
   // Stagger spaced rows at a shared speed: beans never overtake others in their lane.
   let lanes=[];
   for(let i=0;i<count;i++){
     if(i%columns===0){lanes=Array.from({length:columns},(_,n)=>n);for(let j=lanes.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[lanes[j],lanes[k]]=[lanes[k],lanes[j]]}}
     const b=document.createElement('button'),lane=lanes[i%columns];b.className='falling-bean'+(i===special?' special-rain-bean':'');b.textContent='bean';b.disabled=true;
     b.style.left=10+(lane+.5)*(zone.clientWidth-20)/columns-29+'px';b.style.setProperty('--tilt',(Math.random()*18-9)+'deg');b.style.setProperty('--travel',rainField.clientHeight+116+'px');
     b.style.animationDuration=duration+'s';b.style.animationDelay=(Math.floor(i/columns)*1.15+Math.random()*.22)+'s';
     b.addEventListener('animationstart',()=>{b.disabled=false});
     b.addEventListener('animationend',()=>{if(!b.isConnected)return;b.remove();missed++;if(!rainField.childElementCount)rainStatus()});
     b.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0)b.setPointerCapture(e.pointerId)});
     if(i===special){b.title='this bean seems unusually self-important';b.addEventListener('click',()=>{if(!found.has('specialBean'))addSecret('specialBean');location.href='bean-supremacy.html'})}else b.addEventListener('click',()=>eat(b));rainField.append(b);
   }
 });
 let lastWidth=zone.clientWidth;new ResizeObserver(()=>{if(Math.abs(zone.clientWidth-lastWidth)>2){lastWidth=zone.clientWidth;if(rainField.childElementCount){rainField.replaceChildren();hint.textContent='The arena changed size. Make it rain again for a fresh shower.'}}}).observe(zone);

 const bean=document.getElementById('shy-bean'),play=document.getElementById('shy-playground'),message=document.getElementById('shy-message');
 const spots=[[.72,.15],[.13,.62],[.68,.59],[.4,.27],[.08,.17],[.7,.4]];
 let state='idle',escapes=0,hold=null,waitTimer,moveTimer,point=null,mouseInside=false;
 function setState(next){state=next;bean.dataset.state=next;bean.disabled=['escaping','arriving','caught'].includes(next)}
 function stopWaiting(){clearTimeout(waitTimer);waitTimer=null}
 function place(px,py){bean.style.left=Math.max(8,Math.min(play.clientWidth-bean.offsetWidth-8,px))+'px';bean.style.top=Math.max(8,Math.min(play.clientHeight-bean.offsetHeight-65,py))+'px'}
 function catchBean(){if(state!=='ready')return;setState('caught');stopWaiting();bean.textContent='caught bean';message.textContent='patience has defeated evasive bean behavior';if(!found.has('shyBean'))addSecret('shyBean')}
 function attract(){
   if(state!=='idle'||escapes<3||!point||document.hidden||(!hold&&!mouseInside))return;
   const r=play.getBoundingClientRect();if(point.x<r.left||point.x>r.right||point.y<r.top||point.y>r.bottom)return;
   setState('arriving');const old=bean.getBoundingClientRect();place(point.x-r.left-bean.offsetWidth/2,point.y-r.top-bean.offsetHeight/2);const next=bean.getBoundingClientRect();
   bean.animate(motion.matches?[{opacity:.4},{opacity:1}]:[{transform:`translate(${old.left-next.left}px,${old.top-next.top}px)`},{transform:'translate(0,0)'}],{duration:motion.matches?100:450,easing:'ease-out'}).finished.then(()=>{setState('ready');bean.classList.add('catchable');message.textContent='...the bean came to you. Tap it to catch it.'});
 }
 function wait(){stopWaiting();if(state==='idle'&&escapes>=3)waitTimer=setTimeout(attract,2400)}
 function escape(){
   if(state!=='idle')return;stopWaiting();escapes++;bean.dataset.escapes=escapes;setState('escaping');bean.classList.add('gone');
   message.textContent=escapes<3?'it escaped. Try again?':'perhaps chasing it is the problem... stay still here, or touch and hold.';
   moveTimer=setTimeout(()=>{const s=spots[(escapes-1)%spots.length];place(s[0]*(play.clientWidth-bean.offsetWidth),s[1]*(play.clientHeight-bean.offsetHeight-60));bean.classList.remove('gone');moveTimer=setTimeout(()=>{setState('idle');if(hold)wait()},motion.matches?50:220)},motion.matches?80:180);
 }
 function hitsBean(e){const r=bean.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}
 play.addEventListener('pointermove',e=>{
   if(e.pointerType==='mouse'){mouseInside=true;point={x:e.clientX,y:e.clientY};if(state==='idle'&&hitsBean(e)){escape();return}wait()}
   else if(hold&&hold.id===e.pointerId&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>12){hold=null;stopWaiting()}
 });
 play.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){mouseInside=false;stopWaiting()}});
 bean.addEventListener('click',()=>{if(state==='ready')catchBean();else if(state==='idle')escape()});
 play.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'||!e.isPrimary)return;point={x:e.clientX,y:e.clientY};hold={id:e.pointerId,x:e.clientX,y:e.clientY};play.setPointerCapture(e.pointerId);
   if(state==='ready'&&hitsBean(e)){catchBean();return}if(state==='idle'&&hitsBean(e))escape();else wait();
 });
 function release(e){if(hold?.id===e.pointerId){const catchOnRelease=state==='ready';hold=null;stopWaiting();if(e.type==='pointerup'&&catchOnRelease)catchBean()}}
 for(const event of ['pointerup','pointercancel','lostpointercapture'])play.addEventListener(event,release);
 play.addEventListener('keydown',e=>{if(e.target!==play||e.key!==' '||e.repeat)return;e.preventDefault();const r=play.getBoundingClientRect();point={x:r.left+r.width/2,y:r.top+r.height/2};hold={id:'keyboard'};wait()});
 play.addEventListener('keyup',e=>{if(e.key===' '&&hold?.id==='keyboard'){e.preventDefault();hold=null;stopWaiting();if(state==='ready')catchBean()}});
 function cancel(){hold=null;mouseInside=false;stopWaiting()}
 window.addEventListener('blur',cancel);window.addEventListener('scroll',cancel,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});play.addEventListener('focusout',e=>{if(!play.contains(e.relatedTarget))cancel()});
 new ResizeObserver(()=>{const r=bean.getBoundingClientRect(),p=play.getBoundingClientRect();place(r.left-p.left,r.top-p.top)}).observe(play);setState('idle');
}
