// ---------- Model: a tiny, transparent pass/fail predictor ----------
const F=[
 {k:'study',n:'Study hours / day',min:0,max:10,step:.5,u:' h',w:2.2,hint:'Regular study time'},
 {k:'attend',n:'Attendance',min:0,max:100,step:1,u:'%',w:1.8,hint:'Classes attended'},
 {k:'prev',n:'Previous marks',min:0,max:100,step:1,u:'%',w:3.0,hint:'Last exam score'},
 {k:'sleep',n:'Sleep hours / night',min:4,max:10,step:.5,u:' h',w:0.7,hint:'Rest before exams'},
 {k:'assign',n:'Assignments done',min:0,max:100,step:1,u:'%',w:1.3,hint:'Homework submitted'}
];
const PRESETS={A:{study:6,attend:92,prev:78,sleep:7.5,assign:95},B:{study:2,attend:55,prev:48,sleep:5,assign:40},C:{study:7,attend:60,prev:55,sleep:6,assign:80}};
let S={...PRESETS.A};
const BIAS=0.4;
const norm=(f,v)=>(v-f.min)/(f.max-f.min);
function predict(){
 const parts=F.map(f=>({f,v:S[f.k],c:f.w*(norm(f,S[f.k])-0.5)*10}));
 const logit=BIAS+parts.reduce((a,p)=>a+p.c/10,0);
 const prob=1/(1+Math.exp(-logit*1.2));
 return {parts,prob,pass:prob>=.5};
}
const pct=x=>Math.round(x*100);
const fmt=(f,v)=>v+f.u;

// ---------- Pages ----------
const PAGES=[['home','Home'],['what','What is XAI?'],['predict','AI Prediction'],['explain','Explanation'],['viz','Visualization'],['about','About Project']];
const nav=document.getElementById('nav'),app=document.getElementById('app');
function go(id){location.hash=id;}
function render(){
 const id=(location.hash||'#home').slice(1);
 const cur=PAGES.some(p=>p[0]===id)?id:'home';
 nav.innerHTML=PAGES.map(p=>`<button data-go="${p[0]}" ${p[0]===cur?'aria-current="page"':''}>${p[1]}</button>`).join('');
 app.innerHTML=V[cur]();
 if(V[cur+'_init'])V[cur+'_init']();
 window.scrollTo(0,0);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go);});
window.addEventListener('hashchange',render);

const V={};
V.home=()=>`
<h1>Don’t just trust AI.<br>Ask it “why?”</h1>
<p class="lead">Explainable AI (XAI) helps you see the reasons behind an AI’s answer. This short path takes you from the idea to a live example, step by step.</p>
<div class="boxes">
 <div class="bx black"><b>Black box AI</b>Student result:<br><span class="ans">FAIL</span><br><span style="opacity:.7">…but why? Nobody can tell.</span></div>
 <div class="bx glass"><b>Explainable AI</b>Student result:<br><span class="ans">FAIL</span><br>Because attendance is low (−14 pts) and study time is short (−9 pts).</div>
</div>
<div class="row"><button class="cta" data-go="what">Start learning</button><button class="cta alt" data-go="predict">Jump to the demo</button></div>
<h2 style="margin-top:40px">Your learning path</h2>
<div class="grid">
 <div class="card"><h3>1. What is XAI?</h3><p>The idea in plain words.</p></div>
 <div class="card"><h3>2. AI Prediction</h3><p>Change a student’s data and watch the AI react.</p></div>
 <div class="card"><h3>3. Explanation</h3><p>Read why the AI made that call.</p></div>
 <div class="card"><h3>4. Visualization</h3><p>See which factors matter most in a chart.</p></div>
</div>`;

V.what=()=>`
<h2>What is XAI?</h2>
<p class="lead">XAI means Explainable Artificial Intelligence: AI that can show the reasons for its decisions in a way people understand.</p>
<div class="card"><h3>An everyday example</h3><p>Imagine a teacher who only says “You failed.” You learn nothing. Now imagine a teacher who says “You failed because you missed many classes and skipped assignments.” Now you know what to fix. XAI makes AI behave like the second teacher.</p></div>
<div class="grid">
 <div class="card"><h3>Trust</h3><p>People accept a decision more when they can see the reason.</p></div>
 <div class="card"><h3>Fairness</h3><p>Explanations reveal if an AI is using something it should not, like a name or a postcode.</p></div>
 <div class="card"><h3>Debugging</h3><p>If the reason looks wrong, developers know what to fix.</p></div>
 <div class="card"><h3>Learning</h3><p>A student can act on the advice, not just receive a grade.</p></div>
</div>
<div class="card"><h3>Words you will meet</h3>
<details open><summary>Black box model</summary><p>A model whose inner working is too complex to read, like a deep neural network.</p></details>
<details><summary>Feature</summary><p>One input fact the AI looks at, such as attendance or study hours.</p></details>
<details><summary>Feature importance</summary><p>A score for how strongly each feature pushes the result.</p></details>
<details><summary>Local explanation</summary><p>The reason for one single prediction, for one student.</p></details>
</div>
<div class="row"><button class="cta" data-go="predict">Try a prediction</button></div>`;

V.predict=()=>{
 return `<h2>AI Prediction</h2>
<p class="lead">This sample AI predicts if a student will pass. Move the sliders or pick a sample student.</p>
<div class="row" style="margin-bottom:14px">
 <button class="cta alt" data-p="A">Sample: steady student</button>
 <button class="cta alt" data-p="B">Sample: struggling student</button>
 <button class="cta alt" data-p="C">Sample: mixed student</button>
</div>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
 <div class="card" id="inputs">${F.map(f=>`
  <div class="field"><label for="${f.k}">${f.n} <output id="o_${f.k}"></output></label>
  <input type="range" id="${f.k}" min="${f.min}" max="${f.max}" step="${f.step}"></div>`).join('')}</div>
 <div class="card" aria-live="polite"><h3>Prediction</h3><div id="res"></div>
  <div class="row"><button class="cta" data-go="explain">Why this result?</button></div></div>
</div>
<p class="note">This is a simple demo model made for learning. It is not trained on real student records.</p>`;
};
V.predict_init=()=>{
 function upd(){
  F.forEach(f=>{document.getElementById(f.k).value=S[f.k];document.getElementById('o_'+f.k).textContent=fmt(f,S[f.k]);});
  const r=predict();
  document.getElementById('res').innerHTML=`<div class="result"><div class="big">${pct(r.prob)}%</div>
  <div><span class="pill ${r.pass?'pass':'fail'}">${r.pass?'Likely to PASS':'At risk of FAIL'}</span><div class="note">chance of passing</div></div></div>
  <div class="meter" style="margin-top:14px;width:100%"><i style="width:${pct(r.prob)}%"></i></div>`;
 }
 F.forEach(f=>document.getElementById(f.k).addEventListener('input',e=>{S[f.k]=+e.target.value;upd();}));
 document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{S={...PRESETS[b.dataset.p]};upd();});
 upd();
};

V.explain=()=>{
 const r=predict();
 const sorted=[...r.parts].sort((a,b)=>Math.abs(b.c)-Math.abs(a.c));
 const up=sorted.filter(p=>p.c>0),dn=sorted.filter(p=>p.c<0);
 const line=p=>`<li><b>${p.f.n}</b> is ${fmt(p.f,p.v)}, which ${p.c>0?'<span class="pos">helps</span>':'<span class="neg">hurts</span>'} by ${Math.abs(p.c).toFixed(1)} points. <span class="note">(${p.f.hint})</span></li>`;
 const top=sorted[0];
 return `<h2>Explanation</h2>
<div class="card"><h3>The result</h3>
<p style="margin:0">The AI predicts <b>${pct(r.prob)}% chance of passing</b>, so it says <b>${r.pass?'PASS':'FAIL risk'}</b>.</p></div>
<div class="card"><h3>Why did it say that?</h3>
<p>The biggest factor was <b>${top.f.n.toLowerCase()}</b>, which ${top.c>0?'pushed the result up':'pulled the result down'}. Each factor is compared with an average student (the middle of its range). Above average adds points, below average removes points.</p>
${up.length?`<h3 class="pos">Pushing toward PASS</h3><ul class="why">${up.map(line).join('')}</ul>`:''}
${dn.length?`<h3 class="neg">Pushing toward FAIL</h3><ul class="why">${dn.map(line).join('')}</ul>`:''}</div>
<div class="card"><h3>What could change the result?</h3>
<p style="margin:0">${dn.length?`Improving <b>${dn[0].f.n.toLowerCase()}</b> would help most, because it is the biggest negative factor right now.`:'Every factor is above average. Keeping these habits protects the result.'}</p></div>
<div class="row"><button class="cta" data-go="viz">See it as a chart</button><button class="cta alt" data-go="predict">Change student data</button></div>`;
};

V.viz=()=>{
 const r=predict();
 const maxAbs=Math.max(...F.map(f=>f.w*5));
 const local=[...r.parts].sort((a,b)=>Math.abs(b.c)-Math.abs(a.c)).map(p=>{
  const w=Math.abs(p.c)/maxAbs*50;
  const st=p.c>=0?`left:50%;width:${w}%;background:var(--pos)`:`left:${50-w}%;width:${w}%;background:var(--neg)`;
  return `<div class="br"><span>${p.f.n}</span><div class="track div"><i style="${st}"></i></div><span class="${p.c>=0?'pos':'neg'}">${p.c>=0?'+':''}${p.c.toFixed(1)}</span></div>`;}).join('');
 const tot=F.reduce((a,f)=>a+f.w,0);
 const glob=[...F].sort((a,b)=>b.w-a.w).map(f=>`<div class="br"><span>${f.n}</span><div class="track"><i style="left:0;width:${f.w/3*100}%;background:var(--teal)"></i></div><span>${Math.round(f.w/tot*100)}%</span></div>`).join('');
 return `<h2>Visualization</h2>
<div class="card"><h3>This student: what moved the result</h3>
<p class="note">Green bars push toward pass. Red bars push toward fail. The centre line is an average student.</p>${local}</div>
<div class="card"><h3>Overall: how important is each factor to the AI?</h3>
<p class="note">Longer bar = this factor has more say in every prediction.</p>${glob}</div>
<div class="row"><button class="cta alt" data-go="predict">Change student data</button><button class="cta" data-go="about">About this project</button></div>`;
};

V.about=()=>`
<h2>About Project</h2>
<p class="lead">A beginner-friendly website that teaches Explainable AI through one small, hands-on example.</p>
<div class="grid">
 <div class="card"><h3>Purpose</h3><p>Show that AI predictions come with reasons, and help beginners read those reasons.</p></div>
 <div class="card"><h3>Audience</h3><p>Students and first-time learners with no machine learning background.</p></div>
</div>
<div class="card"><h3>How it works</h3>
<p>A small weighted-score model rates five student factors. Each factor’s contribution is its weight multiplied by how far the value is from average. Because the maths is open, the explanation is exact, not a guess.</p>
<p style="margin:0">Real systems use bigger models and tools such as SHAP or LIME to produce similar explanations.</p></div>
<div class="card"><h3>Built with</h3><p style="margin:0">HTML, CSS and plain JavaScript. No backend. All data stays in your browser.</p></div>
<div class="card"><h3>Limits</h3><p style="margin:0">The model is a teaching demo with made-up weights. Never use it to judge real students.</p></div>`;

render();
