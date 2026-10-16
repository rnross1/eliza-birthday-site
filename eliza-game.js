(()=>{
 const canvas=document.getElementById('eliza-runner'),ctx=canvas.getContext('2d'),scoreEl=document.getElementById('runner-score'),bestEl=document.getElementById('runner-best'),status=document.getElementById('runner-status'),startButton=document.getElementById('runner-start'),pauseButton=document.getElementById('runner-pause'),duckButton=document.getElementById('runner-duck');
 const art=new Image(),cloud=new Image();art.src='assets/oc-right.png';cloud.src='assets/cloud-blue.png';
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),floor=282,playerX=92,BEST='eliza-runner-best';
 let best=Math.max(0,Number(localStorage.getItem(BEST))||0),state='ready',score=0,distance=0,speed=265,obstacles=[],spawnIn=1.6,obstacleCount=0,y=0,vy=0,last=performance.now(),accumulator=0;
 const held=new Set();bestEl.textContent=best;
 if(!found.has('elizaArrival'))addSecret('elizaArrival');
 function ducking(){return held.size>0&&y===0}
 function pose(){duckButton.setAttribute('aria-pressed',String(held.size>0));canvas.dataset.pose=ducking()?'duck':y>0?'jump':'run'}
 function setState(next){state=next;canvas.dataset.state=state;pauseButton.disabled=state==='ready'||state==='over';pauseButton.textContent=state==='paused'?'resume':'pause';startButton.textContent=state==='ready'?'start running →':state==='paused'?'resume →':'restart ↻'}
 function reset(){score=0;distance=0;speed=265;obstacles=[];spawnIn=1.6;obstacleCount=0;y=0;vy=0;held.clear();scoreEl.textContent=0;pose();setState('running');status.textContent='Jump the beans. Duck the low clouds. You have this.';accumulator=0;last=performance.now()}
 function jump(){if(state==='paused')return;if(state!=='running')reset();if(y===0&&!held.size){vy=635;y=.1;pose()}}
 function setDuck(key,active){if(active&&state==='running')held.add(key);else held.delete(key);pose()}
 function pause(){if(state==='running'){held.clear();pose();setState('paused');status.textContent='Paused. The beans can wait.'}else if(state==='paused'){setState('running');last=performance.now();accumulator=0;status.textContent='And she keeps going.'}}
 function finish(){setState('over');held.clear();pose();const total=Math.floor(score);if(total>best){best=total;bestEl.textContent=best;localStorage.setItem(BEST,String(best))}status.textContent=`${total} points. It is what it is. Another run?`}
 function playerRect(){return{x:playerX+9,y:floor-y-(ducking()?27:61),w:ducking()?51:32,h:ducking()?27:58}}
 function spawn(){
   // The first obstacle is always a bean; later spacing leaves time to land and react.
   const choice=obstacleCount++===0?0:Math.random(),type=choice<.52?'bean':choice<.82?'low-cloud':'high-cloud';
   if(type==='bean'){const h=36+Math.random()*15;obstacles.push({type,x:830,y:floor-h,w:35+Math.random()*13,h})}
   else obstacles.push({type,x:830,y:floor-(type==='low-cloud'?89:151),w:90,h:45});
   spawnIn=1.45+Math.random()*.6;
 }
 function obstacleRect(o){return o.type==='bean'?{x:o.x+3,y:o.y+4,w:o.w-6,h:o.h-4}:{x:o.x+10,y:o.y+8,w:o.w-20,h:o.h-13}}
 function overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
 function simulate(dt){
   if(state!=='running')return;
   speed=score<=400?Math.min(420,265+score*.19):341+90*Math.log1p((score-400)/600);distance+=speed*dt;
   if(y>0||vy>0){vy-=(held.size?2450:1700)*dt;y+=vy*dt;if(y<=0){y=0;vy=0}}
   spawnIn-=dt;if(spawnIn<=0)spawn();
   for(const o of obstacles)o.x-=speed*dt;
   obstacles=obstacles.filter(o=>o.x+o.w>-20);pose();
   if(obstacles.some(o=>overlaps(playerRect(),obstacleRect(o)))){finish();return}
   score+=12*dt;scoreEl.textContent=Math.floor(score);
   if(Math.floor(score)>400&&!found.has('eliza400')){addSecret('eliza400');status.textContent='SECRET UNLOCKED: over 400. Still becoming. Still going.'}
 }
 function draw(){
   ctx.clearRect(0,0,800,340);ctx.strokeStyle='#877b65';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(22,floor);ctx.lineTo(778,floor);ctx.stroke();
   if(!motion.matches){ctx.strokeStyle='#b5a78b';for(let i=0;i<12;i++){const x=((i*79-distance*.45)%840+840)%840;ctx.beginPath();ctx.moveTo(x,300+i%3*6);ctx.lineTo(x+12,300+i%3*6);ctx.stroke()}}
   ctx.fillStyle='#7e6b9d';ctx.font='18px "Patrick Hand", sans-serif';ctx.fillText('a change of scenery',26,38);
   for(const o of obstacles){
     if(o.type==='bean'){ctx.save();ctx.translate(o.x+o.w/2,o.y+o.h/2);ctx.rotate(-.2);ctx.fillStyle='#f1dbb2';ctx.strokeStyle='#73624e';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,o.w/2,o.h/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(4,-o.h*.25);ctx.quadraticCurveTo(-9,0,3,o.h*.23);ctx.stroke();ctx.restore()}
     else if(cloud.complete&&cloud.naturalWidth)ctx.drawImage(cloud,150,370,1000,560,o.x,o.y,o.w,o.h);
   }
   ctx.save();const bob=state==='running'&&y===0&&!ducking()&&!motion.matches?Math.sin(distance*.1)*1.7:0;
   if(ducking()){ctx.translate(playerX+35,floor-10);ctx.scale(1,.5);ctx.rotate(-Math.PI/2);if(art.complete&&art.naturalWidth)ctx.drawImage(art,-36,-36,72,72)}
   else if(art.complete&&art.naturalWidth)ctx.drawImage(art,playerX-10,floor-y-78+bob,74,78);
   ctx.restore();
   if(state!=='running'){ctx.fillStyle='rgba(251,244,223,.92)';ctx.fillRect(225,85,350,105);ctx.strokeStyle='#7e6b9d';ctx.strokeRect(225,85,350,105);ctx.fillStyle='#5b4d70';ctx.textAlign='center';ctx.font='27px "Patrick Hand", sans-serif';ctx.fillText(state==='over'?'it is what it is.':state==='paused'?'the beans can wait.':'ready for a little becoming?',400,124);ctx.font='18px "Patrick Hand", sans-serif';ctx.fillText(state==='paused'?'press P or resume':'press Space or start below',400,160);ctx.textAlign='left'}
 }
 function frame(t){const elapsed=Math.min(.05,(t-last)/1000);last=t;if(state==='running'){accumulator+=elapsed;while(accumulator>=1/120){simulate(1/120);accumulator-=1/120}}draw();requestAnimationFrame(frame)}
 startButton.addEventListener('click',()=>{if(state==='paused')pause();else reset();canvas.focus({preventScroll:true})});pauseButton.addEventListener('click',pause);
 document.getElementById('runner-jump').addEventListener('click',jump);
 duckButton.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;e.preventDefault();duckButton.setPointerCapture(e.pointerId);setDuck('pointer',true)});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])duckButton.addEventListener(event,()=>setDuck('pointer',false));
 document.addEventListener('keydown',e=>{
   if(e.target.closest('a,input')||e.altKey||e.ctrlKey||e.metaKey)return;
   if(e.target===duckButton&&[' ','Enter'].includes(e.key)){e.preventDefault();setDuck('button',true);return}
   if(['ArrowUp','ArrowDown',' '].includes(e.key)){if(e.key===' '&&e.target.tagName==='BUTTON')return;e.preventDefault();if(e.key==='ArrowDown')setDuck('keyboard',true);else if(!e.repeat)jump()}
   if(e.key.toLowerCase()==='p'&&!e.repeat)pause();
 });
 document.addEventListener('keyup',e=>{if(e.key==='ArrowDown')setDuck('keyboard',false);if([' ','Enter'].includes(e.key))setDuck('button',false)});
 function autoPause(){if(state==='running')pause();held.clear();pose()}
 window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();last=performance.now();accumulator=0});
 setState('ready');pose();requestAnimationFrame(frame);
})();
