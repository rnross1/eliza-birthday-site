(()=>{
 const canvas=document.getElementById('cloud-game'),ctx=canvas.getContext('2d'),scoreEl=document.getElementById('cloud-score'),bestEl=document.getElementById('cloud-best'),status=document.getElementById('cloud-status'),start=document.getElementById('cloud-start'),pauseButton=document.getElementById('cloud-pause');
 const flight=new CloudRiderFlight(),oc=new Image(),cloud=new Image(),motion=matchMedia('(prefers-reduced-motion: reduce)');oc.src='assets/oc-right.png';cloud.src='assets/cloud-blue.png';
 const BEST='eliza-cloud-rider-best';let best=Math.max(0,Number(localStorage.getItem(BEST))||0),state='ready',last=performance.now(),accumulator=0,lastScore=0,pointAt=-10;
 bestEl.textContent=best;if(!found.has('cloudRider'))addSecret('cloudRider');
 function setState(next){state=next;canvas.dataset.state=state;pauseButton.disabled=['ready','over'].includes(state);pauseButton.textContent=state==='paused'?'resume':'pause';start.textContent=state==='ready'?'take off ↑':state==='paused'?'resume →':'try again ↻'}
 function reset(){flight.reset();lastScore=0;pointAt=-10;scoreEl.textContent='0';canvas.dataset.score='0';accumulator=0;last=performance.now();setState('playing');status.textContent='Easy taps. Aim for the moving gap.';canvas.scrollIntoView({behavior:'instant',block:'center'})}
 function flap(){if(state==='paused')return;if(state!=='playing')reset();flight.flap()}
 function pause(){if(state==='playing'){setState('paused');status.textContent='Paused. A moment above it all.'}else if(state==='paused'){setState('playing');last=performance.now();accumulator=0;status.textContent='Find the space between.'}}
 function finish(){setState('over');status.textContent=flight.cause==='words'?`Caught between words. ${flight.score} ${flight.score===1?'gap':'gaps'} crossed. Try again?`:`A little ${flight.cause==='ceiling'?'too much':'more'} lift. ${flight.score} ${flight.score===1?'gap':'gaps'} crossed. Try again?`}
 function update(dt){flight.step(dt);if(flight.score!==lastScore){lastScore=flight.score;pointAt=flight.time;scoreEl.textContent=lastScore;canvas.dataset.score=lastScore;if(lastScore>best){best=lastScore;bestEl.textContent=best;localStorage.setItem(BEST,String(best))}if(lastScore>=5&&!found.has('cloudFive')){addSecret('cloudFive');status.textContent='SECRET UNLOCKED: five gaps! You rose above the distinction.'}}if(flight.over)finish()}
 function wordColumn(x,y,w,h,word){
   if(h<=0)return;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle=word==='IRK'?'#7e6b9d0d':'#b9694f0d';ctx.fillRect(x,y,w,h);
   ctx.fillStyle=word==='IRK'?'#74608f':'#a45641';ctx.textAlign='center';ctx.font='bold 27px "Short Stack",sans-serif';
   for(let row=0;row<h+30;row+=32)ctx.fillText(word,x+w/2,y+row+26,w-4);
   ctx.restore();ctx.strokeStyle=word==='IRK'?'#74608f':'#a45641';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y===0?h:y);ctx.lineTo(x+w,y===0?h:y);ctx.stroke();
 }
 function draw(){
   ctx.clearRect(0,0,480,600);
   if(cloud.complete&&cloud.naturalWidth){ctx.save();ctx.globalAlpha=.17;for(let i=0;i<4;i++){const x=motion.matches?i*160-70:((i*170-flight.distance*.22)%680+680)%680-140;ctx.drawImage(cloud,150,370,1000,560,x,70+i*132,110,62)}ctx.restore()}
   for(const gate of flight.gates){const center=flight.gap(gate),top=center-gate.size/2,bottom=center+gate.size/2;wordColumn(gate.x,0,gate.w,top,gate.top);wordColumn(gate.x,bottom,gate.w,600-bottom,gate.top==='IRK'?'ICK':'IRK')}
   ctx.save();ctx.translate(flight.x,flight.y);if(!motion.matches)ctx.rotate(Math.max(-.18,Math.min(.3,flight.vy/1700)));
   if(cloud.complete&&cloud.naturalWidth)ctx.drawImage(cloud,150,370,1000,560,-36,9,72,36);
   if(oc.complete&&oc.naturalWidth)ctx.drawImage(oc,-29,-42,58,67);ctx.restore();
   if(state==='playing'&&flight.time-pointAt<.8){ctx.fillStyle='#527952';ctx.font='24px "Short Stack",sans-serif';ctx.textAlign='center';ctx.fillText('+1',flight.x,flight.y-58-(motion.matches?0:(flight.time-pointAt)*20))}
   if(state!=='playing'){
     ctx.fillStyle='#fbf4dff2';ctx.fillRect(38,215,404,150);ctx.strokeStyle='#4f87a6';ctx.lineWidth=1.5;ctx.strokeRect(38,215,404,150);ctx.textAlign='center';ctx.fillStyle='#426981';ctx.font='29px "Patrick Hand",sans-serif';ctx.fillText(state==='ready'?'above this, actually.':state==='paused'?'a little breathing room.':'a categorical collision.',240,260);ctx.font='20px "Patrick Hand",sans-serif';ctx.fillText(state==='paused'?'press P or resume':state==='over'?`${flight.score} gaps · tap for another flight`:'tap the sky or press Space',240,301);ctx.font='17px "Patrick Hand",sans-serif';ctx.fillText(state==='ready'?'small taps, open skies':`best flight: ${best}`,240,336);
   }
   ctx.textAlign='left';
 }
 function frame(t){const elapsed=Math.min(.05,(t-last)/1000);last=t;if(state==='playing'){accumulator+=elapsed;while(accumulator>=1/120&&state==='playing'){update(1/120);accumulator-=1/120}}draw();requestAnimationFrame(frame)}
 canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});flap()});
 document.getElementById('cloud-flap').addEventListener('click',flap);start.addEventListener('click',()=>{if(state==='paused')pause();else{reset();flight.flap()}canvas.focus({preventScroll:true})});pauseButton.addEventListener('click',pause);
 document.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey||e.target.closest('a,input'))return;if(e.key.toLowerCase()==='p'&&!e.repeat){e.preventDefault();pause()}if([' ','ArrowUp'].includes(e.key)&&!(e.key===' '&&e.target.tagName==='BUTTON')){e.preventDefault();if(!e.repeat)flap()}});
 const autoPause=()=>{if(state==='playing')pause();last=performance.now();accumulator=0};window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause()});
 setState('ready');requestAnimationFrame(frame);
})();
