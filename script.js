const USER="StefanKDS";
const API=`https://api.github.com/users/${USER}`;
let repos=[], language="All";
const $=s=>document.querySelector(s);
const esc=s=>(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const date=(s)=>new Date(s).toLocaleDateString("de-DE",{month:"short",year:"numeric"});
function renderFilters(){
  const langs=[...new Set(repos.map(r=>r.language).filter(Boolean))].sort();
  $("#filters").innerHTML=["All",...langs].map(l=>`<button class="filter ${l===language?"active":""}" data-l="${esc(l)}">${l==="All"?"Alle":esc(l)}</button>`).join("");
  document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{language=b.dataset.l;renderFilters();renderRepos()});
}
function renderRepos(){
  const q=$("#search").value.toLowerCase().trim();
  let list=repos.filter(r=>(language==="All"||r.language===language)&&(!q||r.name.toLowerCase().includes(q)||(r.description||"").toLowerCase().includes(q)));
  const sort=$("#sort").value;
  if(sort==="stars")list.sort((a,b)=>b.stargazers_count-a.stargazers_count);
  if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="updated")list.sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
  $("#repoCount").textContent=`${list.length} / ${repos.length} repositories`;
  $("#empty").hidden=list.length>0;
  $("#repos").innerHTML=list.map(r=>`<a class="repo" href="${r.html_url}" target="_blank" rel="noopener"><div class="repo-name">${esc(r.name)} ↗</div><div class="repo-desc">${esc(r.description||"Keine Beschreibung vorhanden.")}</div><div class="repo-meta">${r.language?`<span><i class="lang-dot"></i>${esc(r.language)}</span>`:""}<span>★ ${r.stargazers_count}</span><span>⑂ ${r.forks_count}</span><span>↻ ${date(r.updated_at)}</span></div></a>`).join("");
}
function featured(){
  const wanted=["CWKeyer","FT8_Transceiver_QRP"];
  const selected=wanted.map(n=>repos.find(r=>r.name.toLowerCase()===n.toLowerCase())).filter(Boolean);
  const rest=repos.filter(r=>!selected.includes(r)).sort((a,b)=>b.stargazers_count-a.stargazers_count);
  const list=[...selected,...rest].slice(0,2);
  $("#featuredGrid").innerHTML=list.map((r,i)=>`<a class="featured" href="${r.html_url}" target="_blank" rel="noopener"><div class="featured-head"><div class="project-icon">${i===0?"⌁":"◉"}</div><div><h3>${esc(r.name)}</h3><div class="subtitle">${esc(r.language||"Open Source Project")}</div></div></div><p>${esc(r.description||"Technisches Open-Source-Projekt von StefanKDS.")}</p><div class="tags">${r.language?`<span class="tag">${esc(r.language)}</span>`:""}<span class="tag">GitHub</span><span class="tag">Open Source</span></div><div class="featured-footer"><span>★ ${r.stargazers_count}</span><span>⑂ ${r.forks_count}</span><span>↻ ${date(r.updated_at)}</span></div></a>`).join("");
}
function fakeContribution(){
  const el=$("#contrib"); el.innerHTML="";
  for(let i=0;i<364;i++){const cell=document.createElement("i");const v=Math.random();cell.dataset.l=v>.86?4:v>.68?3:v>.43?2:v>.18?1:0;el.appendChild(cell)}
}
async function load(){
 try{
  const [uRes,rRes]=await Promise.all([fetch(API),fetch(`${API}/repos?per_page=100&sort=updated&type=owner`)]);
  if(!uRes.ok||!rRes.ok)throw new Error();
  const u=await uRes.json(); repos=(await rRes.json()).filter(r=>!r.fork&&!r.archived);
  $("#publicRepos").textContent=u.public_repos;
  $("#followers").textContent=u.followers;
  $("#stars").textContent=repos.reduce((n,r)=>n+r.stargazers_count,0);
  $("#forks").textContent=repos.reduce((n,r)=>n+r.forks_count,0);
  renderFilters();renderRepos();featured();
 }catch(e){
  $("#repoCount").textContent="GitHub API nicht erreichbar";
  $("#repos").innerHTML=`<div class="loading">Repositories konnten gerade nicht geladen werden. <a href="https://github.com/${USER}" target="_blank" rel="noopener" class="cyan">GitHub öffnen →</a></div>`;
 }
}
$("#search").addEventListener("input",renderRepos);$("#sort").addEventListener("change",renderRepos);
$("#year").textContent=new Date().getFullYear();fakeContribution();load();