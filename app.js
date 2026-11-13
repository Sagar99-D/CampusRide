const $=s=>document.querySelector(s),sl=ms=>new Promise(r=>setTimeout(r,ms)),NS="http://www.w3.org/2000/svg";
// Demo campus: id:[name,icon,x,y]
const ST={gate:["Main Gate","🚪",90,260],lib:["Library","📚",250,140],cse:["CSE Department","💻",430,100],mech:["Mechanical Dept","⚙️",610,140],admin:["Admin Block","🏛️",640,290],aud:["Auditorium","🎭",430,260],
med:["Medical Centre","🏥",110,420],can:["Canteen","🍽️",270,440],bh:["Boys Hostel","🏠",450,440],gh:["Girls Hostel","🏡",630,440],spo:["Sports Ground","⚽",810,360]};
const RT={A:{n:"Academic Line",c:"#14b8a6",s:["gate","lib","cse","mech","admin","aud"]},B:{n:"Hostel Line",c:"#facc15",s:["gate","med","can","bh","gh","spo"]}};
const DEF=[{id:"CR-101",r:"A",cap:40,pass:27,p:0,v:.012,run:1},{id:"CR-102",r:"A",cap:40,pass:8,p:5,v:.011,run:1},{id:"CR-201",r:"B",cap:30,pass:30,p:1,v:.012,run:1},{id:"CR-202",r:"B",cap:50,pass:44,p:6,v:.010,run:1}];
let BUS=JSON.parse(localStorage.getItem("cr2")||"null")||DEF,sel=0,view="home",busy=false,irlog=[],pick=0,tk=0;const save=()=>localStorage.setItem("cr2",JSON.stringify(BUS));
const pathOf=b=>{const s=RT[b.r].s;return s.concat(s.slice(1,-1).reverse())};
const free=b=>b.cap-b.pass,cls=b=>free(b)<=0?"r":free(b)<=b.cap*.25?"y":"g",txt=b=>free(b)<=0?"FULL":free(b)<=b.cap*.25?"Few seats":"Seats free";
const badge=b=>`<span class="bdg ${cls(b)}">${txt(b)} · ${free(b)}</span>`,col={g:"#4ade80",y:"#facc15",r:"#f87171"};
function where(b){const P=pathOf(b),m=P.length,i=Math.floor(b.p)%m,f=b.p%1,a=ST[P[i]],c=ST[P[(i+1)%m]];return{x:a[2]+(c[2]-a[2])*f,y:a[3]+(c[3]-a[3])*f,next:c[0],eta:Math.max(1,Math.ceil((1-f)/b.v/10))}}
const steps=(P,st,id)=>{for(let k=1;k<=P.length;k++)if(P[(st+k)%P.length]==id)return k;return 0};
function go(v){view=v;document.querySelectorAll(".view").forEach(e=>e.classList.toggle("show",e.id==v));document.querySelectorAll("#nav button").forEach(e=>e.classList.toggle("on",e.dataset.v==v));render()}
document.querySelectorAll("#nav button").forEach(e=>e.onclick=()=>go(e.dataset.v));
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
function drawMap(){const m=$("#map");m.innerHTML="";el("rect",{width:900,height:520,fill:"#0d3340"},m);
 [[20,20,200,90],[700,40,170,70],[300,330,150,40],[520,360,90,40],[740,440,140,60]].forEach(a=>el("rect",{x:a[0],y:a[1],width:a[2],height:a[3],rx:30,fill:"#115a4a",opacity:.5},m));
 Object.values(RT).forEach(r=>{const pts=r.s.map(i=>ST[i][2]+","+ST[i][3]).join(" ");el("polyline",{points:pts,fill:"none",stroke:"#284a73","stroke-width":18,"stroke-linecap":"round","stroke-linejoin":"round"},m);
  el("polyline",{points:pts,fill:"none",stroke:r.c,"stroke-width":3,"stroke-dasharray":"10 8"},m)});
 Object.entries(ST).forEach(([id,s])=>{const g=el("g",{class:"bl",transform:`translate(${s[2]},${s[3]})`,"data-id":id},m);el("rect",{x:-46,y:-24,width:92,height:48,rx:14,fill:"#e8fff1"},g);
  const i=el("text",{y:6,"text-anchor":"middle","font-size":24},g);i.textContent=s[1];const t=el("text",{y:42,"text-anchor":"middle",fill:"#fff","font-size":12,"font-weight":600},g);t.textContent=s[0];
  g.onclick=()=>{if(pick==0){$("#from").value=id;pick=1}else{$("#to").value=id;pick=0}render()}});
 BUS.forEach((b,i)=>{const g=el("g",{id:"b"+i,style:"cursor:pointer"},m);el("circle",{r:17,fill:"#0b1d3a","stroke-width":5},g);const t=el("text",{y:6,"text-anchor":"middle","font-size":18},g);t.textContent="🚌";
  const l=el("text",{y:-24,"text-anchor":"middle",fill:"#b8f5c8","font-size":11,"font-weight":700},g);l.textContent=b.id;g.onclick=()=>{sel=i;render()}})}
function moveBuses(){BUS.forEach((b,i)=>{const g=$("#b"+i);if(!g)return;const w=where(b);g.setAttribute("transform",`translate(${w.x},${w.y})`);const c=g.firstChild;c.setAttribute("stroke",col[cls(b)]);c.setAttribute("r",i==sel?21:17)})}
setInterval(()=>{BUS.forEach(b=>{if(b.run)b.p=(b.p+b.v)%pathOf(b).length});if(view=="track")moveBuses();if(++tk%5==0&&!busy)render()},100);
const stat=(a,b)=>`<div class="stat"><b>${a}</b><span>${b}</span></div>`;
function plan(){const f=$("#from").value,t=$("#to").value;document.querySelectorAll(".bl").forEach(g=>g.classList.toggle("pick",g.dataset.id==f||g.dataset.id==t));
 if(f==t)return $("#plan").innerHTML=`<div class="res">Choose two different places.</div>`;
 const R=[];BUS.forEach(b=>{const P=pathOf(b);if(!b.run||!P.includes(f)||!P.includes(t))return;const m=P.length,i=Math.floor(b.p)%m,k=steps(P,i,f),w=k-b.p%1,ride=steps(P,(i+k)%m,t),sp=b.v*10;
  R.push({b,wait:Math.ceil(w/sp),tot:Math.ceil((w+ride)/sp)})});R.sort((a,b)=>a.wait-b.wait);
 $("#plan").innerHTML=R.map(r=>`<div class="res">🚌 <b>${r.b.id}</b> · ${RT[r.b.r].n} ${badge(r.b)}<br>Arrives at <b>${ST[f][0]}</b> in <b>${r.wait} min</b> · reaches <b>${ST[t][0]}</b> in about <b>${r.tot} min</b></div>`).join("")||`<div class="res">No direct bus between these stops. Tip: change buses at <b>Main Gate</b> (both lines stop there).</div>`}
function render(){const T=BUS;
 if(view=="home")$("#hStats").innerHTML=stat(T.filter(b=>b.run).length+"/"+T.length,"Buses running now")+stat(T.reduce((a,b)=>a+free(b),0),"Free seats on campus")+stat(Object.keys(ST).length,"Campus stops");
 if(view=="track"){plan();if(sel>=T.length)sel=0;const b=T[sel];if(b){const w=where(b);$("#busInfo").innerHTML=`<div class="res"><b>🚌 ${b.id}</b> · ${RT[b.r].n} ${badge(b)}<br>Next stop: <b>${w.next}</b> · ETA <b>${w.eta} min</b> · ${b.pass}/${b.cap} onboard<br><small style="color:#9fb3d1">Tap any bus on the map to follow it.</small></div>`}moveBuses()}
 if(view=="ir")irUI();if(view=="admin")admin()}
function irUI(){const b=BUS.find(x=>x.id==$("#irBus").value)||BUS[0];if(!b)return;
 $("#irNums").innerHTML=stat(b.cap,"Capacity")+stat(b.pass,"Passengers")+stat(free(b),"Seats free")+`<div class="stat">${badge(b)}<span>Status</span></div>`;
 $("#irLog").innerHTML=irlog.map(l=>`<li>${l}</li>`).join("")||"<li>No events yet.</li>"}
const lt=(id,on)=>$("#"+id).classList.toggle("hit",on),setP=(x,a=1)=>{const p=$("#per");p.style.transition=a?"":"none";p.style.left=x+"%"};
async function pass(dir){if(busy)return;const b=BUS.find(x=>x.id==$("#irBus").value),st=$("#irStat");
 if(dir=="in"&&b.pass>=b.cap)return st.textContent="⛔ Bus is FULL — count can't exceed capacity.";
 if(dir=="out"&&b.pass<=0)return st.textContent="⛔ Bus is empty — count can't go below zero.";
 busy=1;$("#bIn").disabled=$("#bOut").disabled=true;const pts=dir=="in"?[["A",35],["B",65]]:[["B",65],["A",35]];setP(dir=="in"?5:92,0);await sl(60);
 for(const[n,x]of pts){setP(x);await sl(550);lt("s"+n,1);st.textContent=`Sensor ${n} DETECTED`;await sl(400);lt("s"+n,0)}
 setP(dir=="in"?92:5);b.pass+=dir=="in"?1:-1;save();const seq=pts.map(p=>p[0]).join(" → ");
 irlog.unshift(`${new Date().toLocaleTimeString()} — ${b.id}: ${seq} = ${dir=="in"?"ENTER +1":"EXIT −1"} → ${b.pass} onboard`);irlog.length=Math.min(irlog.length,15);
 st.textContent=`✅ ${seq}: ${dir=="in"?"passenger boarded":"passenger got off"}. Seats = ${b.cap} − ${b.pass} = ${free(b)}`;busy=0;$("#bIn").disabled=$("#bOut").disabled=false;irUI()}
$("#bIn").onclick=()=>pass("in");$("#bOut").onclick=()=>pass("out");$("#irBus").onchange=irUI;$("#from").onchange=$("#to").onchange=render;
function fill(){const o=Object.entries(ST).map(([k,s])=>`<option value="${k}">${s[1]} ${s[0]}</option>`).join("");$("#from").innerHTML=o;$("#to").innerHTML=o;$("#from").value="gate";$("#to").value="lib";
 const v=$("#irBus").value;$("#irBus").innerHTML=BUS.map(b=>`<option>${b.id}</option>`).join("");if(v)$("#irBus").value=v;
 $("#nRoute").innerHTML=Object.entries(RT).map(([k,r])=>`<option value="${k}">${r.n}</option>`).join("");$("#places").innerHTML=Object.values(ST).map(s=>`<span>${s[1]} ${s[0]}</span>`).join("")}
function admin(){if(document.activeElement&&document.activeElement.tagName=="INPUT")return;const c=BUS.reduce((a,b)=>a+b.cap,0),p=BUS.reduce((a,b)=>a+b.pass,0);
 $("#aStats").innerHTML=stat(BUS.length,"Total buses")+stat(p+"/"+c,"Passengers / seats")+stat(c?Math.round(p/c*100)+"%":"0%","Utilisation")+stat(BUS.filter(b=>b.run).length,"Running");
 $("#aTbl").innerHTML="<tr><th>Bus</th><th>Route</th><th>Capacity</th><th>Onboard</th><th>Seats</th><th>Next stop</th><th></th></tr>"+BUS.map((b,i)=>`<tr><td>${b.id}</td><td>${RT[b.r].n}</td><td><input type=number min=1 value=${b.cap} style="width:70px" onchange="BUS[${i}].cap=+this.value;BUS[${i}].pass=Math.min(BUS[${i}].pass,+this.value);save();render()"></td><td>${b.pass}</td><td>${badge(b)}</td><td>${where(b).next}</td>
 <td><button class="btn sm" onclick="BUS[${i}].run^=1;save();render()">${b.run?"Stop":"Start"}</button> <button class="btn sm red" onclick="BUS.splice(${i},1);save();fill();drawMap();render()">Remove</button></td></tr>`).join("")}
$("#addBus").onclick=()=>{const r=$("#nRoute").value,n=Math.max(100,...BUS.map(b=>+b.id.slice(3)))+1;BUS.push({id:"CR-"+n,r,cap:+$("#nCap").value||40,pass:0,p:0,v:.011,run:1});save();fill();drawMap();render()};
fill();drawMap();render();
