const USER="StefanKDS", API=`https://api.github.com/users/${USER}`;
let repos=[], language="All", locale="de";
const $=s=>document.querySelector(s);
const esc=s=>(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const t={
de:{navHome:"Home",navRepos:"Repositories",navStack:"Tech Stack",navAbout:"About",coffee:"Buy me a coffee",heroRole:"Software Developer",intro:"Ich entwickle robuste und effiziente Softwarelösungen – von Desktop-Anwendungen bis hin zu Embedded-Systemen. Technik, die funktioniert und Spaß macht.",githubProfile:"GitHub Profil",techTitle:"Technologien & Tools",techCopy:"Die Werkzeuge, mit denen ich arbeite und experimentiere.",featuredTitle:"Featured Projects",repoTitle:"Meine Repositories",repoCopy:"Alle öffentlichen Repositories werden automatisch von GitHub geladen.",search:"Suche nach Repository …",repositories:"Repositories",starsTotal:"Stars (gesamt)",forksTotal:"Forks (gesamt)",contributions:"Contributions",contributionGraph:"Contribution Graph",less:"Weniger",more:"Mehr",rights:"All rights reserved.",empty:"Keine passenden Repositories gefunden.",allLanguages:"Alle Sprachen",updated:"Zuletzt aktualisiert",stars:"Meiste Stars",name:"Name",noDesc:"Keine Beschreibung vorhanden.",fallback:"Technisches Open-Source-Projekt von StefanKDS.",updatedAt:"aktualisiert"},
en:{navHome:"Home",navRepos:"Repositories",navStack:"Tech Stack",navAbout:"About",coffee:"Buy me a coffee",heroRole:"Software Developer",intro:"I develop robust and efficient software solutions—from desktop applications to embedded systems. Technology that works and is fun to build.",githubProfile:"GitHub profile",techTitle:"Technologies & Tools",techCopy:"The tools I use and experiment with.",featuredTitle:"Featured Projects",repoTitle:"My Repositories",repoCopy:"All public repositories are loaded automatically from GitHub.",search:"Search repositories …",repositories:"Repositories",starsTotal:"Stars (total)",forksTotal:"Forks (total)",contributions:"Contributions",contributionGraph:"Contribution Graph",less:"Less",more:"More",rights:"All rights reserved.",empty:"No matching repositories found.",allLanguages:"All languages",updated:"Last updated",stars:"Most stars",name:"Name",noDesc:"No description available.",fallback:"Technical open-source project by StefanKDS.",updatedAt:"updated"}};
const tr=k=>t[locale][k]||k;
const date=s=>new Date(s).toLocaleDateString(locale==="de"?"de-DE":"en-US",{month:"short",year:"numeric"});
function repoIcon(r){const n=r.name.toLowerCase();return n.includes("ft8")||n.includes("cw")?'<i class="fa-solid fa-tower-broadcast"></i>':r.language==="Python"?'<i class="fa-brands fa-python"></i>':r.language?.includes("C")?'<i class="fa-solid fa-microchip"></i>':'<i class="fa-solid fa-code"></i>'}
function setupControls(){
 const langs=[...new Set(repos.map(r=>r.language).filter(Boolean))].sort();
 $("#languageFilter").innerHTML=`<option value="All">${tr("allLanguages")}</option>`+langs.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("");
 $("#languageFilter").value=language;
 $("#sort").innerHTML=`<option value="updated">${tr("updated")}</option><option value="stars">${tr("stars")}</option><option value="name">${tr("name")}</option>`;
}
function renderRepos(){
 const q=$("#search").value.toLowerCase().trim(), sort=$("#sort").value;
 let list=repos.filter(r=>(language==="All"||r.language===language)&&(!q||r.name.toLowerCase().includes(q)||(r.description||"").toLowerCase().includes(q)));
 if(sort==="stars")list.sort((a,b)=>b.stargazers_count-a.stargazers_count);
 if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
 if(sort==="updated")list.sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
 $("#empty").textContent=tr("empty"); $("#empty").hidden=list.length>0;
 $("#repos").innerHTML=list.map(r=>`<a class="repo" href="${r.html_url}" target="_blank" rel="noopener"><div class="repo-top"><span class="repo-icon">${repoIcon(r)}</span><span class="repo-name">${esc(r.name)}</span></div><div class="repo-desc">${esc(r.description||tr("noDesc"))}</div><div class="repo-meta">${r.language?`<span><i class="lang-dot"></i>${esc(r.language)}</span>`:""}<span>★ ${r.stargazers_count}</span><span><i class="fa-solid fa-code-branch"></i> ${r.forks_count}</span><span>◷ ${date(r.updated_at)}</span></div></a>`).join("");
}
function featured(){
 const wanted=["CWKeyer","FT8_Transceiver_QRP"], selected=wanted.map(n=>repos.find(r=>r.name.toLowerCase()===n.toLowerCase())).filter(Boolean);
 const list=[...selected,...repos.filter(r=>!selected.includes(r)).sort((a,b)=>b.stargazers_count-a.stargazers_count)].slice(0,2);
 $("#featuredGrid").innerHTML=list.map((r,i)=>`<a class="featured" href="${r.html_url}" target="_blank" rel="noopener"><div class="featured-content"><div class="featured-head"><div class="project-icon">${repoIcon(r)}</div><div><h3>${esc(r.name)}</h3><div class="subtitle">${i===0?"Morse Code Keyer":i===1?"Software Defined Radio":esc(r.language||"Open Source")}</div></div></div><p>${esc(r.description||tr("fallback"))}</p><div class="tags">${r.language?`<span class="tag">${esc(r.language)}</span>`:""}<span class="tag">Open Source</span></div></div><div class="featured-footer"><span>★ ${r.stargazers_count}</span><span><i class="fa-solid fa-code-branch"></i> ${r.forks_count}</span><span>${tr("updatedAt")} ${date(r.updated_at)}</span></div></a>`).join("");
}
function contributions(){
 const el=$("#contrib");el.innerHTML="";
 for(let i=0;i<364;i++){const c=document.createElement("i"),v=(i*37+i*i*11)%100;c.dataset.l=v>88?4:v>70?3:v>44?2:v>24?1:0;el.appendChild(c)}
}
function applyLanguage(){
 document.documentElement.lang=locale;
 document.querySelectorAll("[data-i18n]").forEach(el=>el.innerHTML=tr(el.dataset.i18n));
 document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=tr(el.dataset.i18nPlaceholder));
 $("#languageToggle").textContent=locale==="de"?"EN":"DE";
 setupControls(); renderRepos(); featured();
}
async function load(){
 try{
  const [uRes,rRes]=await Promise.all([fetch(API),fetch(`${API}/repos?per_page=100&sort=updated&type=owner`)]);
  if(!uRes.ok||!rRes.ok)throw Error();
  const u=await uRes.json();repos=(await rRes.json()).filter(r=>!r.fork&&!r.archived);
  $("#publicRepos").textContent=repos.length; $("#stars").textContent=repos.reduce((n,r)=>n+r.stargazers_count,0);$("#forks").textContent=repos.reduce((n,r)=>n+r.forks_count,0);$("#contributions").textContent="—";
  applyLanguage();
 }catch{ $("#repos").innerHTML=`<div class="loading">GitHub API ist derzeit nicht erreichbar. <a class="cyan" href="https://github.com/${USER}" target="_blank" rel="noopener">GitHub öffnen →</a></div>`; }
}
$("#search").addEventListener("input",renderRepos);
$("#languageFilter").addEventListener("change",e=>{language=e.target.value;renderRepos()});
$("#sort").addEventListener("change",renderRepos);
$("#languageToggle").addEventListener("click",()=>{locale=locale==="de"?"en":"de";applyLanguage()});
$("#year").textContent=new Date().getFullYear(); contributions(); load();