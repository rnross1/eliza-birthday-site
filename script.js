const toast=document.getElementById('toast');
const REQUIRED=8;
const STORAGE='eliza-birthday-secrets-v04';
let found=new Set(JSON.parse(localStorage.getItem(STORAGE)||'[]'));
const page=document.body.dataset.page||'intro';

const PAGE_SECRETS={
 archive:['classified','archiveVine','archiveEye','devilHeart','oc','curatorDizzy','beanVanished'],
 metaphysics:['isRepetition','constitutive','becoming'],
 beans:['beanRain','shyBean','beanQuiz','specialBean'],
 'bean-supremacy':['memeInspection','supremacyDoctrine'],
 bean404:['bean404'],
 irk:['taxonomy','bugPun','tickPun','cloudRider'],
 'cloud-rider':['cloudRider'],
 spectrum:['buddyConnection','tismTeam','starDrift','buddyPortal','buddyDisconnect','spectrumDistance'],
 'buddy-flight':['buddyReunion'],
 'eliza-game':['elizaArrival','eliza400'],
 memories:['memoryHeart','leastNormative'],
 museum:['museumEye','museumLabel','curatorTurn'],
 final:[]
};
const msg={
 cloudRider:'SECRET: between an irk and an ick, she found a little lift. Cloud Rider discovered.',
 elizaArrival:'SECRET: it is what it is. Apparently, it is a space detour.',eliza400:'SECRET: over 400. Still becoming. Still going.',
 buddyDisconnect:'really, bro?',spectrumDistance:'SECRET: different coordinates. Same wavelength. Friendship spans the whole spectrum.',
 buddyPortal:'SECRET: a shortcut through the spectrum.',buddyReunion:'SECRET: spectrum buddies reunited. Distance has been peer-reviewed.',
 beanVanished:'she has bean vanished from existence',
 classified:'SECRET: the research really is classified.', archiveVine:'SECRET: botanical curls inspected.', archiveEye:'SECRET: the archives blinked back.', devilHeart:'SECRET: morally ambiguous heart identified.', oc:'SECRET: curator poked.', curatorDizzy:'SECRET: curator motion sickness. The beans are in danger.',
 isRepetition:'SECRET: repeated observation has failed to alter what it is.', constitutive:'SECRET: change has entered the metaphysics.', becoming:'SECRET: IS has been subjected to change.',
 beanRain:'SECRET: bean precipitation initiated.', shyBean:'SECRET: evasive bean apprehended through patience.', beanQuiz:'SECRET: bean classification complete.', specialBean:'SECRET: one bean in the rain was not like the others.',
 buddyConnection:'SECRET: spectrum buddies linked by independent observation.', tismTeam:'SECRET: later terminology entered the record.', starDrift:'SECRET: constellation destabilized.',
 bugPun:'SECRET: pun intended.', tickPun:'SECRET: subsequent pun also intended.',
 memoryHeart:'SECRET: morally ambiguous marginalia found.', leastNormative:'SECRET: hidden normative premise recovered.', museumEye:'SECRET: the museum is watching back.', museumLabel:'SECRET: the label was suspicious.', curatorTurn:'SECRET: curator completed a full rotation.',
 becoming:'SECRET: being has become becoming.'
};
function save(){localStorage.setItem(STORAGE,JSON.stringify([...found]))}
function showToast(t){if(!toast)return;toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2600)}
function addSecret(id,custom){if(!id)return false;if(found.has(id)){showToast('already discovered — scholarly replication successful.');return false}const before=totalFound();found.add(id);save();const discovered=custom||msg[id]||'SECRET FOUND.';const crossed=before<REQUIRED&&totalFound()>=REQUIRED;showToast(crossed?`${discovered} ✦ FINAL ANALYSIS UNLOCKED — return to the archives when you're ready.`:discovered);updateAll();return true}
function totalFound(){return found.size}
function pageFound(){return (PAGE_SECRETS[page]||[]).filter(x=>found.has(x)).length}
function updateAll(){
 const req=Math.min(totalFound(),REQUIRED);
 const rc=document.getElementById('required-count');if(rc)rc.textContent=req;
 const rt=document.getElementById('required-total');if(rt)rt.textContent=REQUIRED;
 const fill=document.getElementById('progress-fill');if(fill)fill.style.width=`${req/REQUIRED*100}%`;
 const all=document.getElementById('all-found-count');if(all)all.textContent=totalFound();
 const fp=document.querySelector('[data-page-progress]');const ids=PAGE_SECRETS[page]||[];if(fp&&ids.length)fp.innerHTML=`${page==='archive'?'Archive':'Page'} secrets: <strong>${pageFound()} / ${ids.length}</strong>${fp.dataset.pageProgress==='local'?'':` · global: ${req}/${REQUIRED} required`}`;
 const pc=document.getElementById('page-clear');if(pc&&ids.length&&pageFound()===ids.length)pc.classList.add('show');
 const finalLink=document.getElementById('final-link');if(finalLink){const lab=document.getElementById('final-label');if(totalFound()>=REQUIRED){finalLink.classList.remove('locked');finalLink.setAttribute('aria-disabled','false');lab.textContent='FINAL ANALYSIS — unlocked'}else{finalLink.classList.add('locked');finalLink.setAttribute('aria-disabled','true');lab.textContent=`FINAL ANALYSIS — ${REQUIRED-totalFound()} more discovery${REQUIRED-totalFound()===1?'':'ies'}`}}
 const locked=document.getElementById('final-locked-message'),content=document.getElementById('final-content');if(locked&&content&&totalFound()>=REQUIRED){locked.classList.add('hidden');content.classList.remove('hidden')}
}

document.querySelectorAll('.secret-trigger:not(#oc-home)').forEach(el=>el.addEventListener('click',()=>addSecret(el.dataset.secret,el.dataset.secretMessage)));
document.querySelectorAll('[data-toggle]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.toggle)?.classList.toggle('open')));
const finalLink=document.getElementById('final-link');if(finalLink)finalLink.addEventListener('click',e=>{if(totalFound()<REQUIRED){e.preventDefault();showToast(`final analysis sealed — ${REQUIRED-totalFound()} more discovery${REQUIRED-totalFound()===1?'':'ies'} needed`)}});
const reset=document.getElementById('reset-progress');if(reset)reset.addEventListener('click',()=>{if(!window.confirm('Reset every discovered secret and all birthday-site progress on this browser?'))return;found=new Set();localStorage.removeItem(STORAGE);document.getElementById('page-clear')?.classList.remove('show');updateAll();showToast('discovery progress reset')});

// Intro curator: autonomous blinking while idle; clicking runs a short jump animation.
(function initIntroCurator(){
 if(page!=='intro')return;
 const btn=document.getElementById('intro-oc'),img=document.getElementById('intro-oc-img'),note=document.getElementById('intro-oc-note');
 if(!btn||!img)return;
 const open='assets/oc-front.png',blink='assets/oc-front-happy.png';
 const jumpFrames=[
   'assets/oc-jump-01.png',
   'assets/oc-jump-02.png',
   'assets/oc-jump-03.png',
   'assets/oc-jump-04.png',
   'assets/oc-jump-05.png',
   'assets/oc-jump-06.png'
 ];
 // Warm the browser cache before the first click so the short frame timings do not outrun network loading.
 jumpFrames.forEach(src=>{const preload=new Image();preload.decoding='async';preload.src=src});
 const jumpDurations=[115,90,90,95,125,115];
 let busy=false,blinkTimer;
 function scheduleBlink(){
   clearTimeout(blinkTimer);
   blinkTimer=setTimeout(()=>{
     if(!busy){
       img.src=blink;
       btn.classList.add('intro-oc-smiling');
       setTimeout(()=>{
         if(!busy){
           img.src=open;
           btn.classList.remove('intro-oc-smiling');
         }
       },180);
     }
     scheduleBlink();
   },2500+Math.random()*2600);
 }
 function runJump(){
   if(busy)return;
   busy=true;
   clearTimeout(blinkTimer);
   btn.classList.add('intro-oc-jumping');
   const jumpLines=['boing','that was unnecessary','archival enthusiasm','i can do that again'];
   if(note)note.textContent=jumpLines[Math.floor(Math.random()*jumpLines.length)];
   let i=0;
   const advance=()=>{
     if(i<jumpFrames.length){
       img.src=jumpFrames[i];
       setTimeout(()=>{i++;advance()},jumpDurations[i]);
     }else{
       img.src=open;
       btn.classList.remove('intro-oc-jumping','intro-oc-smiling');
       setTimeout(()=>{
         busy=false;
         if(note)note.textContent='...';
         scheduleBlink();
       },110);
     }
   };
   advance();
 }
 btn.addEventListener('click',runJump);
 scheduleBlink();
})();

// Archive bespoke art interactions
const eye=document.getElementById('archive-eye');if(eye)eye.addEventListener('click',()=>{eye.classList.remove('eye-blink');void eye.offsetWidth;eye.classList.add('eye-blink')});
const devil=document.getElementById('devil-heart');if(devil)devil.addEventListener('click',()=>{devil.classList.remove('devil-wiggle');void devil.offsetWidth;devil.classList.add('devil-wiggle')});
// Keep the original directional art and gentle CSS bob until new frames are ready.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function curatorFrames(img){
 return direction=>{
   const source=`assets/oc-${direction}.png`;
   if(img.getAttribute('src')!==source)img.src=source;
 };
}

// Work in board coordinates, including the rotated cards' actual bounding boxes.
// Prefer a nearby clear spot; search obstacle edges if all four adjacent spots are busy.
function clearBubblePosition(anchor,size,bounds,obstacles){
 const gap=10,pad=8;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const fit=p=>({x:clamp(p.x,pad,bounds.width-size.width-pad),y:clamp(p.y,pad,bounds.height-size.height-pad)});
 const blocked=p=>[anchor,...obstacles].some(r=>p.x<r.x+r.width+gap&&p.x+size.width>r.x-gap&&p.y<r.y+r.height+gap&&p.y+size.height>r.y-gap);
 const centerX=anchor.x+(anchor.width-size.width)/2,centerY=anchor.y+(anchor.height-size.height)/2;
 const candidates=[{x:centerX,y:anchor.y-size.height-gap},{x:centerX,y:anchor.y+anchor.height+gap},{x:anchor.x+anchor.width+gap,y:centerY},{x:anchor.x-size.width-gap,y:centerY}].map(fit);
 const nearby=candidates.find(p=>!blocked(p));if(nearby)return nearby;
 const xs=[pad,bounds.width-size.width-pad,centerX],ys=[pad,bounds.height-size.height-pad,centerY];
 for(const r of [anchor,...obstacles]){xs.push(r.x-size.width-gap,r.x+r.width+gap);ys.push(r.y-size.height-gap,r.y+r.height+gap)}
 const clear=xs.flatMap(x=>ys.map(y=>fit({x,y}))).filter(p=>!blocked(p));
 clear.sort((a,b)=>Math.hypot(a.x-centerX,a.y-centerY)-Math.hypot(b.x-centerX,b.y-centerY));
 return clear[0]||null;
}

// Project a drop onto the nearest segment, retaining direction when segments overlap.
function nearestTrackPoint(pos,points,preferred=0){
 let best;
 for(let i=0;i<points.length-1;i++){
   const a=points[i],b=points[i+1],dx=b.x-a.x,dy=b.y-a.y;
   const progress=Math.max(0,Math.min(1,((pos.x-a.x)*dx+(pos.y-a.y)*dy)/(dx*dx+dy*dy||1)));
   const point={x:a.x+dx*progress,y:a.y+dy*progress};
   const distance=Math.hypot(point.x-pos.x,point.y-pos.y);
   if(!best||distance<best.distance-.01||(Math.abs(distance-best.distance)<.01&&i===preferred))best={...point,distance,index:i};
 }
 return best;
}

let ocClicks=0;const oc=document.getElementById('oc-home');
if(oc){
 const img=document.getElementById('oc-home-img'),speech=document.getElementById('oc-home-speech');
 const board=oc.closest('.archive-board');
 const drawFrame=curatorFrames(img);
 let routeIndex=0,ocLast=performance.now(),ocPauseUntil=0,pos={x:0,y:0};
 let drag=null,returning=null,speechUntil=0,suppressClickUntil=0,dragTimes=[];
 let beansEaten=0,beanHeld=false,beanVanishing=false;
 const dizzyLine="STOP YOU'RE GOING TO MAKE ME THROW UP MY BEANS";
 img.draggable=false;
 oc.title='Click to chat · drag to move her';
 speech.setAttribute('aria-live','polite');
 let obstacles=[],speechSize={width:138,height:30};
 function measureSpeech(){
   const rect=board.getBoundingClientRect();
   obstacles=[...board.querySelectorAll('.hub-item,.loose-secret')].map(el=>{
     const r=el.getBoundingClientRect();
     return {x:r.left-rect.left-board.clientLeft,y:r.top-rect.top-board.clientTop,width:r.width,height:r.height};
   });
   speechSize={width:speech.offsetWidth,height:speech.offsetHeight};
 }
 // Experimental v0.7 route: a wider U around the archive contents with more inset cards.
 const route=[
   {x:.032,y:.86},{x:.032,y:.045},{x:.905,y:.045},{x:.905,y:.86},
   {x:.905,y:.045},{x:.032,y:.045},{x:.032,y:.86}
 ];
 function dims(pt){
   const maxX=Math.max(0,board.clientWidth-oc.offsetWidth-10),maxY=Math.max(0,board.clientHeight-oc.offsetHeight-10);
   return {x:Math.max(6,Math.min(maxX,pt.x*maxX)),y:Math.max(6,Math.min(maxY,pt.y*maxY))};
 }
 function setSpeechPlacement(){
   if(!speechUntil)return;
   const growth=beansEaten*.18,extraX=oc.offsetWidth*growth/2,extraY=img.offsetHeight*growth/2;
   const placement=clearBubblePosition({x:pos.x-extraX,y:pos.y-extraY,width:oc.offsetWidth+extraX*2,height:oc.offsetHeight+extraY*2},speechSize,{width:board.clientWidth,height:board.clientHeight},obstacles);
   speech.style.visibility=placement?'visible':'hidden';
   if(placement){speech.style.left=(placement.x-pos.x)+'px';speech.style.top=(placement.y-pos.y)+'px'}
 }
 function setFacing(dx,dy){
   const direction=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'front':'back');
   drawFrame(direction);
 }
 function renderPosition(){oc.style.left=pos.x+'px';oc.style.top=pos.y+'px';setSpeechPlacement()}
 function say(line,duration=2600){
   speech.textContent=line;speechUntil=performance.now()+duration;
   measureSpeech();setSpeechPlacement();oc.classList.add('talking');
 }
 function hush(){speechUntil=0;oc.classList.remove('talking');speech.style.visibility='hidden';speech.textContent=''}
 function nearest(){return nearestTrackPoint(pos,route.map(dims),routeIndex)}
 function finishReturn(){
   const destination=returning.target,complaint=returning.complaint;
   pos={x:destination.x,y:destination.y};routeIndex=destination.index;
   returning=null;oc.classList.remove('returning','paused');ocPauseUntil=0;
   faceCurrentSegment();renderPosition();
   if(complaint){drawFrame('front');say(dizzyLine,4200);ocPauseUntil=performance.now()+4200;oc.classList.add('paused')}
 }
 function returnToTrack(complaint=false,celebrate=true){
   const target=nearest();
   if(target.distance<=18||reducedMotion.matches){
     returning={target,complaint};finishReturn();
     if(!complaint&&celebrate&&target.distance>18)say('WEEEEE!');
   }else{
     returning={from:{...pos},target,start:performance.now(),duration:Math.max(750,Math.min(1500,target.distance*2)),complaint};
     oc.classList.remove('paused');oc.classList.add('returning');drawFrame('front-happy');
     if(celebrate)say('WEEEEE!',returning.duration+700);
   }
 }
 function faceCurrentSegment(){
   const target=dims(route[Math.min(routeIndex+1,route.length-1)]),dx=target.x-pos.x,dy=target.y-pos.y;
   setFacing(dx,dy);
   setSpeechPlacement();
 }
 function archiveWalk(t){
   if(!board||!img)return;
   if(speechUntil&&t>=speechUntil)hush();
   if(returning&&!drag&&!beanHeld&&!beanVanishing){
     const progress=reducedMotion.matches?1:Math.min(1,(t-returning.start)/returning.duration);
     const eased=1-Math.pow(1-progress,3);
     pos={x:returning.from.x+(returning.target.x-returning.from.x)*eased,y:returning.from.y+(returning.target.y-returning.from.y)*eased};
     renderPosition();if(progress>=1)finishReturn();
   }else if(!drag&&!returning&&!beanHeld&&!beanVanishing&&t>=ocPauseUntil&&!reducedMotion.matches&&oc.offsetWidth&&!oc.classList.contains('snack-station')){
     oc.classList.remove('paused');
     const target=dims(route[Math.min(routeIndex+1,route.length-1)]);
     let dx=target.x-pos.x,dy=target.y-pos.y,dist=Math.hypot(dx,dy);
     if(dist<2){
       routeIndex++;
       if(routeIndex>=route.length-1){routeIndex=0;pos=dims(route[0]);}
       faceCurrentSegment();
     }else{
       const dt=Math.min(.05,(t-ocLast)/1000),step=Math.min(dist,38*dt);
       pos.x+=dx/dist*step;pos.y+=dy/dist*step;
       setFacing(dx,dy);
       renderPosition();
     }
   }
   ocLast=t;requestAnimationFrame(archiveWalk);
 }
 requestAnimationFrame(()=>{
   pos=dims(route[0]);
   oc.style.left=pos.x+'px';
   oc.style.top=pos.y+'px';
   measureSpeech();
   hush();
   faceCurrentSegment();
   requestAnimationFrame(archiveWalk);
 });
 function chat(){
   if(returning||beanVanishing)return;
   addSecret('oc');
   ocClicks++;ocPauseUntil=performance.now()+2600;oc.classList.add('paused');
   drawFrame(ocClicks%3===0?'front-happy':'front');
   const lines=['why are you clicking me','again?','this is becoming an irk','possibly an ick','go investigate the beans'];
   say(lines[Math.min(ocClicks-1,lines.length-1)]);
 }
 oc.addEventListener('click',e=>{
   if(e.detail>0&&performance.now()<suppressClickUntil){e.preventDefault();return}
   chat();
 });
 oc.addEventListener('pointerdown',e=>{
   if(!e.isPrimary||e.button!==0||beanVanishing||beanHeld)return;
   const rect=oc.getBoundingClientRect();
   drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,moved:false};
   oc.setPointerCapture(e.pointerId);oc.classList.add('paused');
 });
 oc.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==drag.id)return;
   if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<6)return;
   if(!drag.moved){drag.moved=true;returning=null;oc.classList.remove('returning');oc.classList.add('dragging');hush();drawFrame('front')}
   const rect=board.getBoundingClientRect();
   pos={x:Math.max(6,Math.min(board.clientWidth-oc.offsetWidth-6,e.clientX-rect.left-board.clientLeft-drag.offsetX)),y:Math.max(6,Math.min(board.clientHeight-oc.offsetHeight-6,e.clientY-rect.top-board.clientTop-drag.offsetY))};
   renderPosition();
 });
 function releaseDrag(e,cancelled=false){
   if(!drag||e.pointerId!==drag.id)return;
   const moved=drag.moved,id=drag.id;drag=null;
   if(oc.hasPointerCapture(id))oc.releasePointerCapture(id);
   oc.classList.remove('dragging');
   if(!moved){
     if(performance.now()>=ocPauseUntil)oc.classList.remove('paused');
     // Captured touch gestures do not synthesize click consistently across browsers.
     if(!cancelled&&e.pointerType==='touch'){chat();suppressClickUntil=performance.now()+700}
     return;
   }
   suppressClickUntil=performance.now()+500;
   let complaint=false;
   if(!cancelled){
     const now=performance.now();dragTimes=dragTimes.filter(t=>now-t<20000);dragTimes.push(now);
     if(dragTimes.length>=5){complaint=true;dragTimes=[];if(!found.has('curatorDizzy'))addSecret('curatorDizzy')}
   }
   measureSpeech();returnToTrack(complaint,!cancelled);
 }
 oc.addEventListener('pointerup',e=>releaseDrag(e));
 oc.addEventListener('pointercancel',e=>releaseDrag(e,true));
 oc.addEventListener('lostpointercapture',e=>releaseDrag(e,true));
 window.addEventListener('resize',()=>{
   if(window.innerWidth>560)oc.classList.remove('snack-station');
   if(drag){const id=drag.id;drag=null;if(oc.hasPointerCapture(id))oc.releasePointerCapture(id)}
   returning=null;oc.classList.remove('returning','dragging');
   const target=nearest();pos={x:target.x,y:target.y};routeIndex=target.index;
   renderPosition();
   measureSpeech();
   if(performance.now()>=ocPauseUntil)faceCurrentSegment();else setSpeechPlacement();
 });
 document.fonts.ready.then(()=>{measureSpeech();setSpeechPlacement()});
 initArchiveBeans({board,oc,img,
   refresh:()=>{measureSpeech();setSpeechPlacement()},
   hold:(active,anchor)=>{
     beanHeld=active;
     if(active){
       oc.classList.add('paused');
       if(window.matchMedia('(max-width:560px)').matches){
         const r=board.getBoundingClientRect();oc.classList.add('snack-station');
         const side=anchor&&anchor.left+anchor.width/2>r.left+r.width/2?route[1]:route[2];
         pos={x:dims(side).x,y:Math.max(8,Math.min(board.clientHeight-oc.offsetHeight-10,(anchor?anchor.top:160)-r.top-oc.offsetHeight-25))};renderPosition();
       }else if(!oc.offsetWidth){oc.classList.add('snack-station');pos=dims(route[1]);renderPosition()}
     }else{oc.classList.remove('snack-station');if(!beanVanishing&&performance.now()>=ocPauseUntil)oc.classList.remove('paused')}
   },
   feed:()=>{
     if(beanVanishing||drag)return false;
     returning=null;oc.classList.remove('returning');
     const target=nearest();pos={x:target.x,y:target.y};routeIndex=target.index;
     beansEaten++;oc.dataset.beansEaten=beansEaten;
     drawFrame('front-happy');oc.classList.add('paused');
     if(beansEaten<5){
       oc.style.setProperty('--curator-scale',1+beansEaten*.18);
       ocPauseUntil=performance.now()+1600;renderPosition();
       say(['bean acquired.','another bean?','i contain multitudes. of beans.','one more could not possibly hurt.'][beansEaten-1],1600);
     }else{
       beanVanishing=true;hush();oc.disabled=true;oc.classList.add('bean-vanishing');
       if(!found.has('beanVanished'))addSecret('beanVanished');else showToast(msg.beanVanished);
       const vanishTime=reducedMotion.matches?180:650;
       setTimeout(()=>{
         oc.classList.add('bean-absent');
         setTimeout(()=>{
           beansEaten=0;oc.dataset.beansEaten='0';oc.style.setProperty('--curator-scale',1);
           oc.classList.remove('bean-vanishing','bean-absent');oc.disabled=false;beanVanishing=false;
           const home=nearest();pos={x:home.x,y:home.y};routeIndex=home.index;
           ocPauseUntil=performance.now()+1600;drawFrame('front');renderPosition();say('i have re-bean.',1600);
         },3000);
       },vanishTime);
     }
     return true;
   }
 });
}

// Metaphysics
let quoteClicks=0;const quote=document.getElementById('is-quote');if(quote)quote.addEventListener('click',()=>{quoteClicks++;const n=document.getElementById('quote-click-note');const lines=['well, you know what they say...','it remains what it is.','still is.','empirical replication successful.','okay, now this is philosophically excessive.'];n.textContent=lines[Math.min(quoteClicks-1,lines.length-1)];if(quoteClicks>=5)addSecret('isRepetition')});

// Bean rain + special bean
if(page==='beans')initBeanStudies();

// Bean quiz + delayed pun
const beanBtns=document.querySelectorAll('[data-bean]');beanBtns.forEach(btn=>btn.addEventListener('click',()=>{const o=document.getElementById('bean-result');o.textContent=btn.dataset.bean==='white'?'RESULT: WHITE BEAN. Peer review confirms excessive analysis.':'RESULT: suspiciously normal behavior. Retesting recommended.';addSecret('beanQuiz')}));if(page==='beans')setTimeout(()=>{if(!found.has('specialBean'))document.getElementById('bean-time-pun')?.classList.remove('hidden')},30000);

// Fake 404
const err=document.getElementById('error-search');if(err)err.addEventListener('click',()=>{document.getElementById('error-note').textContent='re-indexing bean ontology...';setTimeout(()=>{document.getElementById('error-bean').classList.remove('hidden');document.getElementById('error-note').textContent='wait. there it is.'},900)});

// Irk / Ick and pun chain
const slider=document.getElementById('irk-slider'),irkOut=document.getElementById('irk-result');
function classify(v){if(v<16)return'Classification: serious irk. Documentation advised.';if(v<29)return'Classification: moderate irk.';if(v<45)return'Classification: mild irk.';if(v<=55)return'Classification: neither quite an irk nor an ick. There is something in between…';if(v<72)return'Classification: mild ick.';if(v<85)return'Classification: moderate ick.';return'Classification: serious ICK. The distinction has become operationally significant.'}
if(slider){irkOut.textContent=classify(+slider.value);slider.addEventListener('input',e=>irkOut.textContent=classify(+e.target.value))}
const bug=document.getElementById('bugged-word');if(bug)bug.addEventListener('click',()=>{addSecret('bugPun');document.getElementById('tick-line').classList.remove('hidden');document.getElementById('pun-verdict').textContent='pun intended.'});const tick=document.getElementById('ticked-word');if(tick)tick.addEventListener('click',()=>{addSecret('tickPun');document.getElementById('pun-verdict').textContent='pun subsequently and deliberately escalated.';document.getElementById('pun-aside').classList.remove('hidden')});

// Spectrum buddies
if(page==='spectrum')initSpectrumConnection();


// Updated OC curator: confined to a dedicated lane at the bottom of each isolated page.
// This prevents the character from walking over buttons/text and guarantees that, after talking,
// she resumes facing the direction of travel instead of walking sideways while facing the viewer.
(function initCuratorWalker(){
 if(['archive','intro','buddy-flight','eliza-game','cloud-rider'].includes(page)||(reducedMotion.matches&&!['spectrum','metaphysics','irk'].includes(page)))return;
 const main=document.querySelector('.isolated-page');if(!main)return;
 const lane=document.createElement('div');lane.className='curator-lane';lane.setAttribute('aria-label','curator walking lane');
 const walker=document.createElement('button');walker.className='curator-walker';walker.type='button';walker.setAttribute('aria-label','wandering curator');
 const img=document.createElement('img');img.alt='OC curator wandering along the bottom of the page';
 const bubble=document.createElement('span');bubble.className='curator-bubble';
 walker.append(img,bubble);lane.appendChild(walker);main.appendChild(lane);
 const drawFrame=curatorFrames(img);
 const comments={metaphysics:'still is.',beans:'i see the beans have escaped.',irk:'this is becoming an irk.',spectrum:'tism team fieldwork.',memories:'you remembered that?',museum:'please do not touch the exhibits.',final:'okay, sincerity zone.','bean-supremacy':'the doctrine has been located.',bean404:'where did the bean go?'};
 let dir=1,x=12,last=performance.now(),pauseUntil=0,clicks=0,talkTimer,portalDragging=false,portalClickUntil=0;
 function face(){drawFrame(dir>0?'right':'left')}
 function placeBubble(){
   bubble.style.left=Math.max(8,Math.min(lane.clientWidth-bubble.offsetWidth-8,x+walker.offsetWidth)) - x+'px';
   bubble.style.right='auto';
 }
 function step(t){
   const max=Math.max(14,lane.clientWidth-walker.offsetWidth-(lane.classList.contains('portal-open')?130:14));
   if(t>=pauseUntil&&!portalDragging&&!lane.classList.contains('cloud-escape')&&!reducedMotion.matches){
     walker.classList.remove('paused');
     const dt=Math.min(.05,(t-last)/1000);x+=dir*32*dt;
     if(x>=max){x=max;dir=-1;face()}
     if(x<=12){x=12;dir=1;face()}
     walker.style.left=x+'px';
     face();
   }
   last=t;requestAnimationFrame(step);
 }
 face();requestAnimationFrame(step);
 if(page==='metaphysics')initMetaphysicsUfo({lane,walker,img,pause:active=>{portalDragging=active;walker.classList.toggle('paused',active);if(active){walker.classList.remove('talking');clearTimeout(talkTimer)}}});
 walker.addEventListener('click',e=>{
   if(lane.classList.contains('cloud-escape')||portalDragging||(e.detail>0&&performance.now()<portalClickUntil))return;
   clicks++;pauseUntil=performance.now()+1900;walker.classList.add('paused','talking');
   drawFrame(clicks%4===0?'front-happy':'front');bubble.textContent=comments[page]||'curatorial fieldwork.';placeBubble();
   clearTimeout(talkTimer);talkTimer=setTimeout(()=>{walker.classList.remove('talking')},1900);
 });
 window.addEventListener('resize',()=>{x=Math.min(x,Math.max(12,lane.clientWidth-walker.offsetWidth-14));walker.style.left=x+'px';placeBubble();if(performance.now()>=pauseUntil)face()});
 if(page==='spectrum')initSpectrumPortal({lane,walker,img,unlocked:document.getElementById('constellation').dataset.connected==='true',
   dragging:active=>{portalDragging=active;walker.classList.toggle('paused',active);if(active){walker.classList.remove('talking');clearTimeout(talkTimer)}else{portalClickUntil=performance.now()+700;face()}},
   settle:left=>{x=left;walker.style.left=x+'px';walker.style.top='';walker.style.bottom='2px'},
   enter:()=>{if(!found.has('buddyPortal'))addSecret('buddyPortal')}
 });
})();

// Museum rotation study: front → right → back → left → front.
const curatorTurn=document.getElementById('curator-turntable'),curatorTurnImg=document.getElementById('curator-turn-img');
if(curatorTurn&&curatorTurnImg){
 const views=[['assets/oc-front.png','updated OC curator, front view'],['assets/oc-right.png','updated OC curator, right side view'],['assets/oc-back.png','updated OC curator, back view'],['assets/oc-left.png','updated OC curator, left side view']];
 let viewIndex=0,turnClicks=0;
 curatorTurn.addEventListener('click',()=>{viewIndex=(viewIndex+1)%views.length;turnClicks++;curatorTurnImg.src=views[viewIndex][0];curatorTurnImg.alt=views[viewIndex][1];if(turnClicks>=4)addSecret('curatorTurn')});
}

updateAll();

// Ordinary card art shares the page with discoveries; an illustration alone is not a clue.
(function decorateBirthdayPages(){
 const art={green:'flower-green',purple:'flower-purple',pointed:'card-flower-pointed',yellow:'card-star-yellow',bunny:'card-bunny-face',heart:'heart-pink',cloud:'cloud-blue',sparkle:'sparkle-teal'};
 const palettes={
   intro:['pointed','yellow','heart','bunny','purple'],
   archive:['green','yellow','bunny','heart','purple'],
   metaphysics:['cloud','sparkle','pointed','yellow','cloud'],
   beans:['pointed','yellow','bunny','green','heart'],
   'bean-supremacy':['yellow','green','bunny','pointed','yellow'],
   bean404:['cloud','yellow','bunny','sparkle','cloud'],
   irk:['green','yellow','pointed','purple','heart'],
   spectrum:['sparkle','cloud','heart','yellow','sparkle'],
   memories:['purple','heart','pointed'],
   museum:['pointed','yellow','bunny','purple','green'],
   final:['purple','heart','green'],
   'buddy-flight':['cloud','yellow','heart','sparkle','cloud'],
   'eliza-game':['pointed','cloud','yellow','green','bunny'],
   'cloud-rider':['cloud','sparkle','yellow','heart','cloud']
 };
 const palette=palettes[page];if(!palette)return;
 function picture(name){const img=document.createElement('img');img.src='assets/'+art[name]+'.png';img.alt='';img.draggable=false;img.decoding='async';return img}
 function layer(host,className,items){
   const el=document.createElement('div');el.className=className;el.setAttribute('aria-hidden','true');
   items.forEach(([name,x,y,size,turn,opacity])=>{const img=picture(name);img.style.cssText=`--art-x:${x}%;--art-y:${y}%;--art-size:${size}px;--art-turn:${turn}deg;--art-opacity:${opacity}`;el.append(img)});
   host.prepend(el);
 }
 function garland(host,names,closing=false){
   const el=document.createElement('div');el.className='card-garland'+(closing?' card-garland--closing':'');el.setAttribute('aria-hidden','true');
   names.forEach((name,i)=>{const img=picture(name);img.style.setProperty('--doodle-turn',[-12,9,-4,14,-8][i%5]+'deg');el.append(img)});
   if(closing)host.append(el);else host.prepend(el);
 }
 layer(document.body,'page-art',[
   [palette[0],5,8,150,-18,.65],[palette[palette.length-1],95,19,136,15,.62],
   ['yellow',10,27,65,12,.7],['heart',91,37,72,-16,.6],
   [palette[1],4,48,140,-8,.6],['pointed',97,60,155,22,.6],
   ['purple',7,78,125,-15,.58],['yellow',91,88,80,8,.65],
   ['heart',14,96,60,12,.55]
 ]);
 const paper=document.querySelector('.page-card,.intro-card,.launch-paper,.runner-paper,.cloud-paper');
 if(paper){garland(paper,palette);garland(paper,[palette[0],'heart',palette[palette.length-1]],true)}
 if(page==='archive'){
   const hero=document.querySelector('.archive-hero');
   garland(hero,['pointed','yellow','heart','purple']);hero.append(hero.querySelector('.card-garland'));
   layer(document.querySelector('.archive-board'),'archive-art',[
     ['pointed',24,9,92,-12,.85],['yellow',48,10,59,9,.8],['purple',73,11,83,14,.8],
     ['bunny',50,96.5,44,-5,.8],['heart',11,40,68,-15,.7],['green',89,44,88,10,.75],
     ['cloud',35,43,96,-6,.65],['yellow',64,45,55,-14,.8],['pointed',10,69,90,18,.7],
     ['purple',86,71,85,-18,.72],['heart',33,76,52,9,.75],['sparkle',65,77,45,12,.75]
   ]);
 }
 // Reflow decorative images into clear space after fonts, reveals, and viewport changes.
 // Keep intentional game compositions (the rider on her cloud, for example) untouched.
 function arrangeArt(){
   const intersects=(a,b,gap=10)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
   const visible=el=>getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().width>0;
   const fixed=[...document.querySelectorAll('.page-card,.intro-card,.launch-paper,.runner-paper,.cloud-paper,.global-progress-card,.hero-vine,.museum-vine,.memory-corner-heart,.intro-doodle,.archive-hero h1,.archive-hero .subtitle,.archive-hero .archive-subtitle,.curator-lane')].filter(visible).map(el=>el.getBoundingClientRect());
   function placeImages(layer,obstacles,board=false){
     if(!layer)return;const bounds=layer.getBoundingClientRect();
     for(const img of layer.children){
       img.style.translate='0 0';img.style.visibility='';if(!visible(img))continue;
       const base=img.getBoundingClientRect(),candidates=[[0,0]];
       for(let step=1;step<=6;step++){const d=step*36;candidates.push([0,d],[0,-d],[d,0],[-d,0]);if(board)candidates.push([d,d],[-d,d],[d,-d],[-d,-d])}
       const spot=candidates.find(([dx,dy])=>{const r={left:base.left+dx,right:base.right+dx,top:base.top+dy,bottom:base.bottom+dy};return r.left>=bounds.left+8&&r.right<=bounds.right-8&&r.top>=bounds.top+8&&r.bottom<=bounds.bottom-8&&!obstacles.some(o=>intersects(r,o))});
       if(spot){img.style.translate=spot[0]+'px '+spot[1]+'px';obstacles.push(img.getBoundingClientRect())}else img.style.visibility='hidden';
     }
   }
   const board=document.querySelector('.archive-board');
   const boardObstacles=board?[...board.querySelectorAll('.hub-item,.loose-secret')].filter(visible).map(el=>el.getBoundingClientRect()):[];
   placeImages(document.querySelector('.archive-art'),boardObstacles,true);
   fixed.push(...boardObstacles);
   placeImages(document.querySelector('.page-art'),fixed);
 }
 let artFrame=0;
 function scheduleArt(){if(!artFrame)artFrame=requestAnimationFrame(()=>{artFrame=0;arrangeArt()})}
 const artObserver=new ResizeObserver(scheduleArt);
 [document.body,...document.querySelectorAll('.page-card,.intro-card,.launch-paper,.runner-paper,.cloud-paper,.hub-item,.archive-board')].forEach(el=>artObserver.observe(el));
 window.addEventListener('resize',scheduleArt);window.addEventListener('load',scheduleArt);
 document.fonts.ready.then(scheduleArt);
 scheduleArt();
})();
