const CATS=["Lei","Históricos","Poesia e sabedoria","Profetas","Evangelhos e Atos","Cartas e Apocalipse"];
const B=[["Gênesis",50,0],["Êxodo",40,0],["Levítico",27,0],["Números",36,0],["Deuteronômio",34,0],
["Josué",24,1],["Juízes",21,1],["Rute",4,1],["1 Samuel",31,1],["2 Samuel",24,1],["1 Reis",22,1],["2 Reis",25,1],["1 Crônicas",29,1],["2 Crônicas",36,1],["Esdras",10,1],["Neemias",13,1],["Ester",10,1],
["Jó",42,2],["Salmos",150,2],["Provérbios",31,2],["Eclesiastes",12,2],["Cantares",8,2],
["Isaías",66,3],["Jeremias",52,3],["Lamentações",5,3],["Ezequiel",48,3],["Daniel",12,3],["Oseias",14,3],["Joel",3,3],["Amós",9,3],["Obadias",1,3],["Jonas",4,3],["Miqueias",7,3],["Naum",3,3],["Habacuque",3,3],["Sofonias",3,3],["Ageu",2,3],["Zacarias",14,3],["Malaquias",4,3],
["Mateus",28,4],["Marcos",16,4],["Lucas",24,4],["João",21,4],["Atos",28,4],
["Romanos",16,5],["1 Coríntios",16,5],["2 Coríntios",13,5],["Gálatas",6,5],["Efésios",6,5],["Filipenses",4,5],["Colossenses",4,5],["1 Tessalonicenses",5,5],["2 Tessalonicenses",3,5],["1 Timóteo",6,5],["2 Timóteo",4,5],["Tito",3,5],["Filemom",1,5],["Hebreus",13,5],["Tiago",5,5],["1 Pedro",5,5],["2 Pedro",3,5],["1 João",5,5],["2 João",1,5],["3 João",1,5],["Judas",1,5],["Apocalipse",22,5]];
const TOTAL=B.reduce((s,b)=>s+b[1],0),DAYS=30,MIN_CH=3;
let off=0;const OFF=B.map(b=>{const o=off;off+=b[1];return o});
const dayRange=d=>[Math.floor((d-1)*TOTAL/DAYS),Math.floor(d*TOTAL/DAYS)];
function segs(d){const [s,e]=dayRange(d),out=[];
  B.forEach((b,i)=>{const a=Math.max(s,OFF[i]),z=Math.min(e,OFF[i]+b[1]);
    if(z>a){const n=z-a,from=a-OFF[i]+1,to=z-OFF[i];
      out.push({i,n,t:n===b[1]?b[0]+(b[1]>1?" (completo)":""):from===to?b[0]+" "+from:b[0]+" "+from+"–"+to})}});
  return out}
const DS=Array.from({length:DAYS},(_,k)=>segs(k+1));
let S={done:{},notes:{},start:"",pages:1300};
try{const r=localStorage.getItem("biblia30");if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const save=()=>{try{localStorage.setItem("biblia30",JSON.stringify(S))}catch(e){}};
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pgs=n=>Math.max(1,Math.round(n*S.pages/TOTAL));
const tm=n=>{const m=n*MIN_CH,h=Math.floor(m/60);return h?h+"h"+String(Math.round(m%60)).padStart(2,"0"):Math.round(m)+" min"};
const dayCh=d=>dayRange(d)[1]-dayRange(d)[0];
function todayN(){if(!S.start)return 0;const a=new Date(S.start+"T00:00:00"),n=new Date();n.setHours(0,0,0,0);return Math.floor((n-a)/864e5)+1}
function render(){
  let readCh=0,doneN=0;
  for(let d=1;d<=DAYS;d++)if(S.done[d]){doneN++;readCh+=dayCh(d)}
  const p=Math.round(readCh/TOTAL*100);
  $("pct").textContent=p+"%";$("fill").style.width=p+"%";
  $("stat").textContent=doneN+" de "+DAYS+" dias · "+readCh+" de "+TOTAL+" capítulos";
  const tn=todayN(),left=TOTAL-readCh;let pace="";
  if(left===0)pace="Leitura completa. Parabéns!";
  else if(tn>=1&&tn<=DAYS){const late=[...Array(tn-1)].filter((_,k)=>!S.done[k+1]).length,rem=DAYS-tn+1;
    pace=late>0?"Você está com "+late+" dia"+(late>1?"s":"")+" em atraso. Para terminar no dia 30, leia cerca de "+Math.ceil(left/rem)+" capítulos por dia (≈ "+tm(Math.ceil(left/rem))+").":"Você está em dia. Hoje é o dia "+tn+": "+DS[tn-1].map(s=>s.t).join(", ")+"."}
  else if(tn>DAYS)pace="O prazo de 30 dias passou. Faltam "+left+" capítulos.";
  $("pace").innerHTML=pace?'<div class="msg">'+pace+"</div>":"";
  $("plan").innerHTML=DS.map((sg,k)=>{const d=k+1,n=dayCh(d),open=S.notes[d]?" open":"";
    return '<div class="day'+(S.done[d]?" done":"")+(d===tn?" today":"")+'"><div class="row"><input type="checkbox" data-d="'+d+'" id="c'+d+'" aria-label="Marcar dia '+d+' como lido"'+(S.done[d]?" checked":"")+'><div style="flex:1"><label for="c'+d+'" style="margin:0;color:inherit"><span class="dn">Dia '+d+'</span>'+(d===tn?'<span class="tag">hoje</span>':"")+'</label><div class="segs">'+sg.map(s=>s.t).join(" · ")+'</div><div class="meta">'+n+" capítulos · ≈ "+pgs(n)+" páginas · ≈ "+tm(n)+'</div><details'+open+'><summary>Anotações</summary><textarea data-n="'+d+'" placeholder="O que chamou sua atenção hoje?">'+esc(S.notes[d]||"")+"</textarea></details></div></div></div>"}).join("");
  renderBooks()}
let filt=-1;
function renderBooks(){
  const rd=B.map(()=>0);
  for(let d=1;d<=DAYS;d++)if(S.done[d])DS[d-1].forEach(s=>rd[s.i]+=s.n);
  let h='<div class="chips"><button data-f="-1" aria-pressed="'+(filt===-1)+'">Todos</button>'+CATS.map((c,i)=>'<button data-f="'+i+'" aria-pressed="'+(filt===i)+'">'+c+"</button>").join("")+"</div>";
  CATS.forEach((c,ci)=>{if(filt!==-1&&filt!==ci)return;
    const bs=B.map((b,i)=>[b,i]).filter(x=>x[0][2]===ci),tc=bs.reduce((s,x)=>s+x[0][1],0),rc=bs.reduce((s,x)=>s+rd[x[1]],0);
    h+='<div class="cat">'+c+' <span class="meta">'+rc+" de "+tc+" capítulos</span></div>";
    bs.forEach(([b,i])=>{h+='<div class="book"><div><strong>'+b[0]+'</strong></div><div class="cnt">'+rd[i]+"/"+b[1]+'</div><div class="meta">'+b[1]+" capítulo"+(b[1]>1?"s":"")+" · ≈ "+pgs(b[1])+" página"+(pgs(b[1])>1?"s":"")+'</div><div class="mini"><i style="width:'+Math.round(rd[i]/b[1]*100)+'%"></i></div></div>'})});
  $("books").innerHTML=h}
$("plan").addEventListener("change",e=>{const d=e.target.dataset.d;if(d){S.done[d]=e.target.checked||undefined;if(!e.target.checked)delete S.done[d];save();render()}});
$("plan").addEventListener("input",e=>{const d=e.target.dataset.n;if(d){S.notes[d]=e.target.value;save()}});
$("books").addEventListener("click",e=>{const f=e.target.dataset.f;if(f!==undefined){filt=+f;renderBooks()}});
function tab(n){$("plan").hidden=n!==1;$("books").hidden=n!==2;$("t1").setAttribute("aria-selected",n===1);$("t2").setAttribute("aria-selected",n===2)}
$("t1").onclick=()=>tab(1);$("t2").onclick=()=>tab(2);
$("start").value=S.start;$("pages").value=S.pages;
$("start").onchange=e=>{S.start=e.target.value;save();render()};
$("pages").onchange=e=>{S.pages=Math.min(4000,Math.max(300,+e.target.value||1300));e.target.value=S.pages;save();render()};
$("reset").onclick=()=>{if(confirm("Apagar todo o progresso e as anotações?")){S={done:{},notes:{},start:"",pages:1300};save();$("start").value="";$("pages").value=1300;render()}};
render();
