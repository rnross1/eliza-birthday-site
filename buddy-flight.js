(()=>{
 const canvas=document.getElementById('buddy-game'),ctx=canvas.getContext('2d');
 const status=document.getElementById('game-status'),angle=document.getElementById('launch-angle'),power=document.getElementById('launch-power'),launchButton=document.getElementById('launch-button');
 const art=new Image(),portrait=new Image(),cloudArt=new Image();art.src='assets/oc-front-happy.png';portrait.src='assets/buddy-portrait.png';cloudArt.src='assets/cloud-blue.png';
 const ocSize=84,portraitHeight=ocSize*2/3;
 const start={x:145,y:420},target={x:848,y:434,w:portraitHeight*1099/1431,h:portraitHeight},floor=490,gravity=700,radius=22;
 const names=['01 / the paper gate','02 / unreasonable shelving','03 / the friendship fortress'];
 const BEST='eliza-buddy-launch-best';let best;try{best=JSON.parse(localStorage.getItem(BEST)||'{}')}catch{best={}}
 let layout=0,shots=0,blocks=[],fragments=[],trail=[],ball={...start,vx:0,vy:0},state='ready',aim=null,pointer=null,flightTime=0,settleTime=0,last=performance.now(),accumulator=0;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let clouds=[],sceneTime=0,cloudTouched=false,overshot=false;
 function cloudPosition(c,time=sceneTime){return{x:c.x+(motion.matches?0:Math.sin(time*c.speed+c.phase)*c.travel),y:c.y+(motion.matches?0:Math.sin(time*.7+c.phase)*8)}}
 function inCloud(p,c,time=sceneTime){const center=cloudPosition(c,time);return ((p.x-center.x)/(c.w*.43+radius*.6))**2+((p.y-center.y)/(c.h*.4+radius*.6))**2<1}
 function cloudDrag(p,dt,time=sceneTime){if(!clouds.some(c=>inCloud(p,c,time)))return false;const drag=Math.exp(-3.2*dt);p.vx*=drag;p.vy*=drag;return true}
 function setState(next){state=next;canvas.dataset.state=next;launchButton.disabled=next==='flying'||next==='won';angle.disabled=power.disabled=next==='flying'||next==='won'}
 function label(){document.getElementById('layout-name').textContent=names[layout];document.getElementById('shot-count').textContent=shots;document.getElementById('best-count').textContent=best[layout]||'—'}
 function cancelPointer(){if(pointer!==null&&canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);pointer=null;aim=null}
 function resetShot(){cancelPointer();ball={...start,vx:0,vy:0};trail=[];flightTime=0;settleTime=0;setState('ready');status.textContent='Pull her back, aim, and let go. The remaining blocks remember your last attempt.'}
 function block(x,y,w,h){const strength=w>h?420:340;blocks.push({x,y,w,h,vy:0,broken:false,health:strength,strength})}
 function gate(x,levels,width=116){
   for(let i=0;i<levels;i++){const bottom=floor-i*84;block(x,bottom-66,18,66);block(x+width-18,bottom-66,18,66);block(x-6,bottom-84,width+12,18)}
 }
 function rebuild(){
   blocks=[];fragments=[];shots=0;sceneTime=0;resetShot();
   target.x=[680,795,885][layout];target.y=[380,180,374][layout];
   clouds=[{x:265,y:155,w:190,h:100,travel:24,speed:.65,phase:0},
     {x:[530,585,675][layout],y:[195,170,175][layout],w:165,h:88,travel:48,speed:.5,phase:1.4}];
   if(layout===0)gate(492,2);
   if(layout===1){gate(440,1,100);gate(625,2,100);block(532,386,115,16)}
   if(layout===2){gate(482,2,96);gate(655,1,106);block(544,306,142,16);block(621,322,18,84)}
   status.textContent='Pull her back, aim, and let go. Reach the portrait to connect the buddies.';label();
 }
 function velocity(){const radians=+angle.value*Math.PI/180,speed=900*+power.value/100;return{vx:Math.cos(radians)*speed,vy:-Math.sin(radians)*speed}}
 function syncControls(){document.getElementById('angle-value').textContent=angle.value+'°';document.getElementById('power-value').textContent=power.value+'%'}
 function launch(){
   if(state!=='ready'&&state!=='aiming')return;
   const v=velocity();cancelPointer();ball={...start,...v};shots++;flightTime=0;settleTime=0;cloudTouched=false;overshot=false;trail=[];setState('flying');label();status.textContent='Friendship is in flight.';
 }
 function win(){
   setState('won');ball={x:target.x-36,y:target.y+target.h-30,vx:0,vy:0};
   if(!best[layout]||shots<best[layout]){best[layout]=shots;localStorage.setItem(BEST,JSON.stringify(best))}label();
   const newlyDiscovered=!found.has('buddyReunion');
   if(newlyDiscovered)addSecret('buddyReunion');
   status.textContent=`Buddies connected! ${shots} launch${shots===1?'':'es'}. ${newlyDiscovered?'SECRET UNLOCKED: buddy reunion — added to your archive discoveries.':'Buddy reunion secret already discovered.'} Try another structure!`;
 }
 function circleHits(rect){const x=Math.max(rect.x,Math.min(ball.x,rect.x+rect.w)),y=Math.max(rect.y,Math.min(ball.y,rect.y+rect.h));return Math.hypot(ball.x-x,ball.y-y)<radius}
 function breakBlock(b){
   b.broken=true;
   if(!motion.matches)for(let i=0;i<5;i++)fragments.push({x:b.x+b.w*Math.random(),y:b.y+b.h/2,vx:(Math.random()-.5)*160+ball.vx*.12,vy:-100-Math.random()*120,age:0});
   // Breaking a plank spends momentum too; a strong shot cannot plow through a stack.
   ball.vx*=.56;ball.vy*=.65;
 }
 function hitBlock(b){
   const closestX=Math.max(b.x,Math.min(ball.x,b.x+b.w)),closestY=Math.max(b.y,Math.min(ball.y,b.y+b.h));
   let dx=ball.x-closestX,dy=ball.y-closestY,distance=Math.hypot(dx,dy),nx,ny,penetration;
   if(distance>=radius)return;
   if(distance>0){nx=dx/distance;ny=dy/distance;penetration=radius-distance}
   else{
     const sides=[{d:ball.x-b.x,nx:-1,ny:0},{d:b.x+b.w-ball.x,nx:1,ny:0},{d:ball.y-b.y,nx:0,ny:-1},{d:b.y+b.h-ball.y,nx:0,ny:1}].sort((a,b)=>a.d-b.d);
     ({nx,ny}=sides[0]);penetration=radius+sides[0].d;
   }
   const normalSpeed=ball.vx*nx+(ball.vy-b.vy)*ny,impact=Math.max(0,-normalSpeed);
   if(impact>70)b.health-=impact*.75;
   if(b.health<=0){breakBlock(b);return}
   // Solid contact: push out of the block and reflect the incoming normal velocity.
   ball.x+=nx*(penetration+.1);ball.y+=ny*(penetration+.1);
   if(normalSpeed<0){
     const tangentX=ball.vx-normalSpeed*nx,tangentY=ball.vy-b.vy-normalSpeed*ny;
     ball.vx=tangentX*.78-normalSpeed*.28*nx;
     ball.vy=tangentY*.78-normalSpeed*.28*ny+b.vy;
   }
 }
 function simulate(dt){
   sceneTime+=dt;
   // Upright paper pieces fall when their supports are removed.
   for(const b of [...blocks].filter(b=>!b.broken).sort((a,b)=>(b.y+b.h)-(a.y+a.h))){
     b.vy+=gravity*dt;let next=b.y+b.vy*dt,ground=floor;
     for(const other of blocks)if(other!==b&&!other.broken&&b.x<other.x+other.w&&b.x+b.w>other.x&&other.y>=b.y+b.h-1)ground=Math.min(ground,other.y);
     if(next+b.h>=ground){next=ground-b.h;b.vy=0}b.y=next;
   }
   for(const f of fragments){f.age+=dt;f.vy+=gravity*dt;f.x+=f.vx*dt;f.y+=f.vy*dt}fragments=fragments.filter(f=>f.age<1&&f.y<floor+20);
   if(state!=='flying')return;
   flightTime+=dt;ball.vy+=gravity*dt;
   if(cloudDrag(ball,dt)&&!cloudTouched){cloudTouched=true;status.textContent='Cloud fluff! She loses momentum while passing through.'}
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
   if(ball.x>target.x+target.w+radius)overshot=true;
   if(circleHits(target)){win();return}
   for(const b of blocks)if(!b.broken)hitBlock(b);
   if(ball.y+radius>floor){ball.y=floor-radius;ball.vy=-Math.abs(ball.vy)*.28;ball.vx*=.84;if(Math.abs(ball.vy)<35)ball.vy=0}
   if(Math.hypot(ball.vx,ball.vy)<55)settleTime+=dt;else settleTime=0;
   if(ball.x>1000||ball.x<-60||flightTime>6||settleTime>.65){resetShot();status.textContent=(overshot?'Overshot! Try less power or a different angle. ':cloudTouched?'The clouds stole some momentum. Try a lower arc or time your launch. ':'Adjust the arc and try again. ')+'Cracks and broken blocks carry over to your next shot.'}
 }
 function drawImage(image,x,y,w,h){if(image.complete&&image.naturalWidth)ctx.drawImage(image,x,y,w,h)}
 function draw(){
   ctx.clearRect(0,0,960,560);ctx.lineWidth=2;ctx.strokeStyle='#2e2c2a';ctx.fillStyle='#2e2c2a';ctx.font='16px "Patrick Hand", sans-serif';
   ctx.setLineDash([4,7]);ctx.strokeStyle='rgba(126,107,157,.2)';ctx.beginPath();ctx.moveTo(55,floor);ctx.lineTo(935,floor);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#7e6b9d';ctx.fillText('a small leap of friendship',42,65);
   for(const c of clouds){const p=cloudPosition(c);if(cloudArt.complete&&cloudArt.naturalWidth)ctx.drawImage(cloudArt,150,370,1000,560,p.x-c.w/2,p.y-c.h/2,c.w,c.h)}
   // Slingshot and a paper launch platform.
   ctx.strokeStyle='#8a6845';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(145,489);ctx.lineTo(145,446);ctx.lineTo(125,409);ctx.moveTo(145,446);ctx.lineTo(164,409);ctx.stroke();
   if(state==='ready'||state==='aiming'){
     const preview={...start,...velocity()};ctx.fillStyle='rgba(126,107,157,.55)';
     // Preview only the initial arc, using the same drag and integration as flight.
     for(let i=1;i<=162;i++){preview.vy+=gravity/120;cloudDrag(preview,1/120,sceneTime+i/120);preview.x+=preview.vx/120;preview.y+=preview.vy/120;if(preview.y>floor||preview.x>955)break;if(i%6===0){ctx.beginPath();ctx.arc(preview.x,preview.y,2.3,0,Math.PI*2);ctx.fill()}}
     const p=aim||start;ctx.strokeStyle='#7e6b9d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(125,409);ctx.lineTo(p.x,p.y);ctx.lineTo(164,409);ctx.stroke();
   }
   for(const b of blocks){
     if(b.broken)continue;ctx.fillStyle=b.w>b.h?'#e9d9c0':'#ece5d6';ctx.strokeStyle='#746958';ctx.lineWidth=2;
     ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeRect(b.x,b.y,b.w,b.h);ctx.strokeStyle='rgba(116,105,88,.3)';ctx.beginPath();ctx.moveTo(b.x+5,b.y+5);ctx.lineTo(b.x+b.w-5,b.y+b.h-5);ctx.stroke();
     if(b.health<b.strength){ctx.strokeStyle='#9b644b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(b.x+b.w*.25,b.y+b.h*.2);ctx.lineTo(b.x+b.w*.65,b.y+b.h*.45);ctx.lineTo(b.x+b.w*.35,b.y+b.h*.65);ctx.lineTo(b.x+b.w*.7,b.y+b.h*.85);ctx.stroke()}
   }
   for(const f of fragments){ctx.globalAlpha=1-f.age;ctx.fillStyle='#cdb895';ctx.fillRect(f.x,f.y,8,4)}ctx.globalAlpha=1;
   if(target.y+target.h<floor-10){ctx.strokeStyle='#aaa18d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(target.x+4,floor);ctx.lineTo(target.x+target.w/2,target.y+target.h-4);ctx.lineTo(target.x+target.w-4,floor);ctx.stroke()}
   drawImage(portrait,target.x,target.y,target.w,target.h);
   if(!motion.matches){ctx.fillStyle='rgba(126,107,157,.3)';for(const p of trail){ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fill()}}
   const p=state==='aiming'?aim:ball;ctx.save();ctx.translate(p.x,p.y);
   if(state==='flying'&&!motion.matches)ctx.rotate(Math.atan2(ball.vy,ball.vx)*.35);
   drawImage(art,-ocSize/2,-ocSize/2,ocSize,ocSize);ctx.restore();
   if(state==='won'){ctx.fillStyle='#5f9d74';ctx.font='24px "Patrick Hand", sans-serif';ctx.fillText('connected ♡',target.x-80,target.y-60);ctx.strokeStyle='#5f9d74';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(ball.x+22,ball.y-20);ctx.lineTo(target.x+20,ball.y-20);ctx.stroke();ctx.setLineDash([])}
   ctx.fillStyle='#746958';ctx.font='14px "Patrick Hand", sans-serif';ctx.fillText('pull back here ↖',68,532);
 }
 function frame(t){accumulator+=Math.min(.05,(t-last)/1000);last=t;while(accumulator>=1/120){simulate(1/120);accumulator-=1/120}if(state==='flying'){trail.push({x:ball.x,y:ball.y});if(trail.length>35)trail.shift()}draw();requestAnimationFrame(frame)}
 function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*960/r.width,y:(e.clientY-r.top)*560/r.height}}
 function dragAim(e){
   const p=point(e);let dx=start.x-p.x,dy=p.y-start.y;
   const distance=Math.min(100,Math.hypot(dx,dy));
   const degrees=Math.max(10,Math.min(70,Math.atan2(Math.max(0,dy),Math.max(1,dx))*180/Math.PI));
   angle.value=Math.round(degrees);power.value=Math.round(Math.max(25,distance));syncControls();
   const radians=degrees*Math.PI/180;aim={x:start.x-Math.cos(radians)*distance,y:start.y+Math.sin(radians)*distance};
 }
 canvas.addEventListener('pointerdown',e=>{if(state!=='ready'||!e.isPrimary||e.button!==0)return;const p=point(e);if(Math.hypot(p.x-start.x,p.y-start.y)>60)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);aim={...start};setState('aiming')});
 canvas.addEventListener('pointermove',e=>{if(e.pointerId===pointer&&state==='aiming')dragAim(e)});
 canvas.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;const distance=Math.hypot(aim.x-start.x,aim.y-start.y);if(distance<8)resetShot();else launch()});
 canvas.addEventListener('pointercancel',()=>{if(state==='aiming')resetShot()});
 canvas.addEventListener('lostpointercapture',()=>{if(state==='aiming')resetShot()});
 canvas.addEventListener('keydown',e=>{if(state!=='ready')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='ArrowUp')angle.stepUp();if(e.key==='ArrowDown')angle.stepDown();if(e.key==='ArrowRight')power.stepUp();if(e.key==='ArrowLeft')power.stepDown();if(e.key===' ')launch();syncControls()});
 angle.addEventListener('input',syncControls);power.addEventListener('input',syncControls);launchButton.addEventListener('click',launch);
 document.getElementById('retry-shot').addEventListener('click',()=>{if(state==='won')rebuild();else resetShot()});
 document.getElementById('rebuild-layout').addEventListener('click',rebuild);
 document.getElementById('new-layout').addEventListener('click',()=>{layout=(layout+1)%names.length;rebuild()});
 document.addEventListener('visibilitychange',()=>{last=performance.now();accumulator=0});
 rebuild();syncControls();requestAnimationFrame(frame);
})();
