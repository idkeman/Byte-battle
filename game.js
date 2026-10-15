(() => {
  "use strict";
  const canvas = document.getElementById("arena");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const unitInfo = {
    scout: { name:"Scout", cost:25, hp:34, speed:38, damage:8, range:18, rate:.72, size:8, color:"#64b4ff", icon:"➤" },
    tank: { name:"Tank", cost:60, hp:125, speed:13, damage:19, range:22, rate:1.25, size:12, color:"#ffc879", icon:"⬟" },
    sniper: { name:"Sniper", cost:45, hp:25, speed:18, damage:22, range:105, rate:1.55, size:7, color:"#c7a6ff", icon:"⌖" }
  };
  let state, selectedUnit = "scout", lastFrame = 0, aiTimer = 2, passiveTimer = 0, spawnTimer = 0;
  const difficulty = () => $("difficulty").value;
  function freshState() {
    return { bytes:100, incomeLevel:0, healthLevel:0, baseMax:100, playerBase:100, enemyBase:100, running:false, ended:false, units:[], shots:[], elapsed:0, match:1, aiBytes:0, nextId:1, teamMode:$("team-mode").checked };
  }
  state = freshState();
  function log(message) {
    const el = $("event-log"), p = document.createElement("p"), time = document.createElement("time");
    time.textContent = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    p.append(time, document.createTextNode(" " + message)); el.appendChild(p);
    while(el.children.length > 5) el.removeChild(el.children[1]);
  }
  function addUnit(side, type) {
    const d = unitInfo[type];
    state.units.push({id:state.nextId++,side,type,x:side==="blue"?9:91,y:state.teamMode && side==="blue"?[37,50,63][Math.floor(Math.random()*3)]:50,hp:d.hp,maxHp:d.hp,attack:Math.random()*.3,walk:Math.random()*.4});
  }
  function deploy() {
    if(!state.running || state.ended) return;
    const d=unitInfo[selectedUnit];
    if(state.bytes<d.cost){$("deploy-note").textContent="Not enough Bytes. Wait for income.";return;}
    state.bytes-=d.cost; addUnit("blue",selectedUnit); log("Deployed "+d.name+". Squad moving out."); updateUI();
  }
  function upgrade(kind) {
    if(!state.running || state.ended) return;
    if(kind==="health") {
      const cost=50+state.healthLevel*45;
      if(state.bytes<cost)return;
      state.bytes-=cost;state.healthLevel++;state.baseMax+=20;state.playerBase=Math.min(state.baseMax,state.playerBase+20);log("Core reinforced. Maximum base health increased.");
    } else {
      const cost=75+state.incomeLevel*60;
      if(state.bytes<cost)return;
      state.bytes-=cost;state.incomeLevel++;log("Byte generator upgraded. Passive income increased.");
    }
    updateUI();
  }
  function start() {
    if(state.ended) reset();
    state.running=true;$("arena-overlay").classList.add("hidden");$("status").textContent="Battle in progress";$("status").previousElementSibling.classList.add("active");$("start-button").textContent="Battle started";$("deploy-button").disabled=false;
    log("Battle started. Your base is blue; destroy the red core."); updateUI();
  }
  function reset() {
    state=freshState();aiTimer=2;passiveTimer=0;spawnTimer=0;$("arena-overlay").classList.remove("hidden");$("status").textContent="Awaiting deployment";$("status").previousElementSibling.classList.remove("active");$("start-button").innerHTML='Start battle <span>→</span>';$("deploy-button").disabled=true;$("deploy-note").textContent="Start a battle to deploy your squad.";
    $("event-log").innerHTML='<div class="log-title">COMBAT LOG <span>LIVE FEED</span></div><p><time>BOOT</time> New simulation ready. Choose your strategy.</p>';updateUI();draw();
  }
  function updateUI() {
    $("currency").textContent=Math.floor(state.bytes);$("base-health").textContent=Math.max(0,Math.ceil(state.playerBase/state.baseMax*100))+"%";
    $("friendly-count").textContent=state.units.filter(u=>u.side==="blue").length+" units";$("enemy-count").textContent=state.units.filter(u=>u.side==="red").length+" units";$("match-number").textContent=String(state.match).padStart(2,"0");
    $("health-level").textContent="Level "+state.healthLevel+" · "+(50+state.healthLevel*45)+" Bytes";$("income-level").textContent="Level "+state.incomeLevel+" · "+(75+state.incomeLevel*60)+" Bytes";
    $("health-upgrade").textContent=(50+state.healthLevel*45)+" B";$("income-upgrade").textContent=(75+state.incomeLevel*60)+" B";
    $("health-upgrade").disabled=!state.running||state.bytes<50+state.healthLevel*45;$("income-upgrade").disabled=!state.running||state.bytes<75+state.incomeLevel*60;
    const d=unitInfo[selectedUnit];$("deploy-button").innerHTML="Deploy "+d.name+' <span>'+d.cost+' B</span>';$("deploy-button").disabled=!state.running||state.ended||state.bytes<d.cost;
    if(state.running&&!state.ended)$("deploy-note").textContent=state.bytes<d.cost?"Waiting for Bytes...":"Click to send a "+d.name.toLowerCase()+" into battle.";
  }
  function finish(winner) {
    state.ended=true;state.running=false;$("status").textContent=winner==="blue"?"Victory!":"Your base was destroyed";$("status").previousElementSibling.classList.remove("active");
    $("arena-overlay").classList.remove("hidden");$("arena-overlay").innerHTML='<div class="overlay-card"><div class="big-icon">'+(winner==="blue"?"✦":"⌁")+'</div><p class="eyebrow">MATCH COMPLETE</p><h2>'+(winner==="blue"?"Core destroyed!":"Base offline.")+'</h2><p>'+(winner==="blue"?"You outplayed the AI and won the match.":"The enemy broke through your defenses. Try a different unit mix.")+'</p><button class="primary-button" id="start-button">Play again <span>→</span></button></div>';
    $("start-button").addEventListener("click",reset);log(winner==="blue"?"VICTORY: Enemy core destroyed.":"DEFEAT: Your core has fallen.");updateUI();
  }
  function resize() {
    const r=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  function draw() {
    const w=canvas.clientWidth||600,h=canvas.clientHeight||400;ctx.clearRect(0,0,w,h);
    const grd=ctx.createLinearGradient(0,0,w,h);grd.addColorStop(0,"#0b1b36");grd.addColorStop(1,"#081329");ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle="#24406440";ctx.lineWidth=1;for(let x=0;x<w;x+=26){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=26){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.fillStyle="#57a5ff0c";ctx.fillRect(0,0,w*.19,h);ctx.fillStyle="#ff6e850c";ctx.fillRect(w*.81,0,w*.19,h);
    ctx.setLineDash([5,7]);ctx.strokeStyle="#3d587d";ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();ctx.setLineDash([]);
    // bases
    drawBase(w*.075,h*.5,"blue",state.playerBase/state.baseMax);drawBase(w*.925,h*.5,"red",state.enemyBase/100);
    ctx.fillStyle="#7791b7";ctx.font="800 9px system-ui";ctx.textAlign="center";ctx.fillText("YOUR SPAWN",w*.11,h-16);ctx.fillText("ENEMY SPAWN",w*.89,h-16);
    state.units.forEach(u=>{const x=u.x/100*w,y=u.y/100*h,d=unitInfo[u.type];ctx.save();ctx.translate(x,y);ctx.fillStyle=u.side==="blue"?"#57a5ff22":"#ff6e8522";ctx.beginPath();ctx.arc(0,0,d.size+7,0,Math.PI*2);ctx.fill();ctx.fillStyle=u.side==="blue"?d.color:"#ff7187";ctx.strokeStyle=u.side==="blue"?"#b6e2ff":"#ffd0d7";ctx.lineWidth=1.5;ctx.beginPath();if(u.type==="tank"){ctx.rect(-d.size,-d.size,d.size*2,d.size*2)}else{ctx.moveTo(d.size+2,0);ctx.lineTo(-d.size,-d.size);ctx.lineTo(-d.size,d.size);ctx.closePath()}ctx.fill();ctx.stroke();ctx.fillStyle="#26364d";ctx.fillRect(-12,-d.size-8,24,3);ctx.fillStyle=u.side==="blue"?"#64e2e5":"#ff7187";ctx.fillRect(-12,-d.size-8,24*Math.max(0,u.hp/u.maxHp),3);ctx.restore();});
    state.shots.forEach(s=>{ctx.strokeStyle=s.side==="blue"?"#75d7ff":"#ff8d9f";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.x/100*w,s.y/100*h);ctx.lineTo(s.tx/100*w,s.ty/100*h);ctx.stroke();});
    if(!state.running){ctx.fillStyle="#90a9cc";ctx.font="10px system-ui";ctx.textAlign="center";ctx.fillText("DEPLOY YOUR FIRST UNIT TO BEGIN",w/2,h*.84)}
  }
  function drawBase(x,y,side,hp) {
    ctx.save();ctx.translate(x,y);ctx.fillStyle=side==="blue"?"#153a65":"#492238";ctx.strokeStyle=side==="blue"?"#5daeff":"#ff7187";ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(-23,-30,46,60,8);ctx.fill();ctx.stroke();ctx.fillStyle=side==="blue"?"#75c2ff":"#ff9baa";ctx.font="bold 24px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("◆",0,-2);
    ctx.fillStyle="#18253d";ctx.fillRect(-25,39,50,5);ctx.fillStyle=side==="blue"?"#64e2e5":"#ff7187";ctx.fillRect(-25,39,50*Math.max(0,hp),5);ctx.restore();
  }
  function tick(dt) {
    if(!state.running||state.ended)return;
    state.elapsed+=dt;passiveTimer+=dt;aiTimer-=dt;spawnTimer-=dt;state.bytes+=(1+state.incomeLevel*0.65)*dt*(difficulty()==="easy"?1.25:1);
    if(passiveTimer>=1){passiveTimer=0;state.aiBytes+=difficulty()==="hard"?8:10;}
    if(aiTimer<=0){aiTimer=difficulty()==="easy"?4.8:difficulty()==="hard"?2.3:3.4;const roll=Math.random();addUnit("red",roll>.78?"tank":roll>.48?"sniper":"scout");}
    if(state.teamMode&&spawnTimer<=0){spawnTimer=7;if(state.bytes>=25){state.bytes-=25;addUnit("blue","scout");log("Team support deployed a Scout.");}}
    for(const u of state.units){const dir=u.side==="blue"?1:-1,d=unitInfo[u.type];let target=null,dist=Infinity;
      for(const other of state.units){if(other.side===u.side)continue;const dx=other.x-u.x,dy=other.y-u.y,dd=Math.hypot(dx,dy);if(dd<dist){dist=dd;target=other}}
      const baseDist=Math.abs((u.side==="blue"?91:9)-u.x)*wScale();
      if(target&&dist<d.range/1.7){u.attack+=dt;if(u.attack>=d.rate){u.attack=0;target.hp-=d.damage;state.shots.push({side:u.side,x:u.x,y:u.y,tx:target.x,ty:target.y,life:.12});}}
      else if(target&&dist<d.range/1.7+5){u.x+=dir*d.speed*dt*.1;}
      else {const nearBase=Math.abs((u.side==="blue"?91:9)-u.x);if(nearBase<2.3){u.attack+=dt;if(u.attack>1){u.attack=0;if(u.side==="blue")state.enemyBase-=d.damage;else state.playerBase-=d.damage;}}else u.x+=dir*d.speed*dt*.1;}
    }
    state.units=state.units.filter(u=>u.hp>0&&u.x>-3&&u.x<103);state.shots=state.shots.filter(s=>(s.life=(s.life||.12)-dt)>0);
    if(state.aiBytes>=55){state.aiBytes-=55;if(Math.random()>.55)addUnit("red","tank");}
    if(state.enemyBase<=0){state.enemyBase=0;finish("blue")}else if(state.playerBase<=0){state.playerBase=0;finish("red")}
    updateUI();
  }
  function wScale(){return 1}
  function frame(ts){const dt=Math.min((ts-lastFrame)/1000||0,.05);lastFrame=ts;tick(dt);draw();requestAnimationFrame(frame)}
  document.querySelectorAll(".unit-card").forEach(b=>b.addEventListener("click",()=>{selectedUnit=b.dataset.unit;document.querySelectorAll(".unit-card").forEach(x=>x.classList.toggle("selected",x===b));updateUI()}));
  $("start-button").addEventListener("click",start);$("deploy-button").addEventListener("click",deploy);$("health-upgrade").addEventListener("click",()=>upgrade("health"));$("income-upgrade").addEventListener("click",()=>upgrade("income"));$("reset-button").addEventListener("click",reset);
  $("team-mode").addEventListener("change",()=>{state.teamMode=$("team-mode").checked;});
  window.addEventListener("resize",resize);
  resize();updateUI();requestAnimationFrame(frame);
})();