const USER = "StefanKDS";
const API = `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`;

const reposEl = document.getElementById("repos");
const countEl = document.getElementById("repoCount");
const searchEl = document.getElementById("search");
const filtersEl = document.getElementById("filters");
const sortEl = document.getElementById("sort");
const emptyEl = document.getElementById("empty");

let repos = [];
let language = "All";

function escapeHTML(value = "") {
  return value.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}
function dateLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {year:"numeric", month:"short", day:"numeric"});
}
function renderFilters() {
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
  filtersEl.innerHTML = ["All", ...langs].map(l =>
    `<button class="filter ${l === language ? "active":""}" data-lang="${escapeHTML(l)}">${l === "All" ? "All" : escapeHTML(l)}</button>`
  ).join("");
  filtersEl.querySelectorAll(".filter").forEach(b => b.onclick = () => {
    language = b.dataset.lang; renderFilters(); render();
  });
}
function render() {
  const q = searchEl.value.trim().toLowerCase();
  let list = repos.filter(r =>
    (language === "All" || r.language === language) &&
    (!q || r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q))
  );
  if (sortEl.value === "stars") list.sort((a,b) => b.stargazers_count - a.stargazers_count);
  if (sortEl.value === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  if (sortEl.value === "updated") list.sort((a,b) => new Date(b.updated_at)-new Date(a.updated_at));

  countEl.textContent = `${list.length} / ${repos.length} repositories`;
  emptyEl.hidden = list.length !== 0;
  reposEl.innerHTML = list.map(r => `
    <a class="repo" href="${r.html_url}" target="_blank" rel="noopener">
      <div class="repo-head">
        <div class="repo-name">${escapeHTML(r.name)}</div>
        <div class="repo-arrow">↗</div>
      </div>
      <div class="repo-desc">${escapeHTML(r.description || "No description provided.")}</div>
      <div class="repo-meta">
        ${r.language ? `<span><i class="lang-dot"></i>${escapeHTML(r.language)}</span>` : ""}
        <span>★ ${r.stargazers_count}</span>
        <span>⑂ ${r.forks_count}</span>
        <span>updated ${dateLabel(r.updated_at)}</span>
      </div>
    </a>
  `).join("");
}

async function load() {
  try {
    const [repoRes, userRes] = await Promise.all([
      fetch(API),
      fetch(`https://api.github.com/users/${USER}`)
    ]);
    if (!repoRes.ok || !userRes.ok) throw new Error("GitHub API unavailable");
    repos = (await repoRes.json()).filter(r => !r.fork && !r.archived);
    const user = await userRes.json();

    document.getElementById("publicRepos").textContent = user.public_repos;
    document.getElementById("followers").textContent = user.followers;
    document.getElementById("stars").textContent = repos.reduce((n,r) => n + r.stargazers_count, 0);

    renderFilters();
    render();
  } catch (e) {
    reposEl.innerHTML = `<div class="loading-card">Could not load repositories from GitHub. <a href="https://github.com/${USER}" target="_blank" rel="noopener">Open GitHub ↗</a></div>`;
    countEl.textContent = "GitHub API unavailable";
  }
}

searchEl.addEventListener("input", render);
sortEl.addEventListener("change", render);
document.getElementById("year").textContent = new Date().getFullYear();
load();
