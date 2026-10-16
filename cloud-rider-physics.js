/* Fixed-step, rendering-independent Cloud Rider simulation. */
class CloudRiderFlight{
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.y=300;this.vy=0;this.x=104;this.time=0;this.distance=0;this.score=0;this.speed=112;this.gates=[];this.spawnIn=1;this.count=0;this.lastCenter=300;this.over=false;this.cause='';this.nextId=0}
 flap(){if(!this.over)this.vy=-285}
 gap(gate){return gate.base+Math.sin(this.time*gate.frequency+gate.phase)*gate.amplitude}
 spawn(){
   const first=this.count++===0;
   const base=first?300:Math.max(180,Math.min(420,this.lastCenter+(this.random()-.5)*160));this.lastCenter=base;
   this.gates.push({id:this.nextId++,x:510,w:76,base,size:Math.max(174,210-this.score*1.2),amplitude:first?14:18+this.random()*12,frequency:.7+this.random()*.25,phase:this.random()*Math.PI*2,top:this.count%2?'IRK':'ICK',passed:false});
 }
 step(dt){
   if(this.over)return;
   this.time+=dt;this.speed=Math.min(158,112+this.score*1.2);this.distance+=this.speed*dt;
   this.vy=Math.min(430,this.vy+870*dt);this.y+=this.vy*dt;
   this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=Math.max(2.35,2.8-this.score*.012)}
   if(this.y<29||this.y>571){this.over=true;this.cause=this.y<29?'ceiling':'ground';return}
   for(const gate of this.gates){
     gate.x-=this.speed*dt;const center=this.gap(gate),left=this.x-22,right=this.x+22;
     if(right>gate.x&&left<gate.x+gate.w&&(this.y-28<center-gate.size/2||this.y+28>center+gate.size/2)){this.over=true;this.cause='words';return}
     if(!gate.passed&&gate.x+gate.w<left){gate.passed=true;this.score++}
   }
   this.gates=this.gates.filter(g=>g.x+g.w>-10);
 }
}
if(typeof module!=='undefined')module.exports=CloudRiderFlight;
