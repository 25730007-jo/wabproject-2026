const sites = [
  {id:"unsplash", name:"Unsplash", category:"사진", type:"사진 · 배경 이미지", description:"사진과 배경 이미지를 탐색할 수 있는 사이트", url:"https://unsplash.com/", free:"무료 이용 가능 여부와 세부 조건은 공식 라이선스에서 확인", tags:["사진","배경 이미지","무료 이용 정보"]},
  {id:"pexels", name:"Pexels", category:"사진", type:"사진 · 동영상", description:"사진과 동영상 리소스를 탐색할 수 있는 사이트", url:"https://www.pexels.com/", free:"무료 이용 범위 및 제한은 원본 사이트에서 확인", tags:["사진","동영상","무료 이용 정보"]},
  {id:"undraw", name:"unDraw", category:"일러스트", type:"일러스트 · SVG", description:"디자인 프로젝트에 활용할 수 있는 일러스트 리소스 사이트", url:"https://undraw.co/", free:"무료 리소스 제공 여부 및 사용 조건은 공식 안내 확인", tags:["일러스트","SVG","라이선스 확인"]},
  {id:"opendoodles", name:"Open Doodles", category:"일러스트", type:"캐릭터 · 일러스트", description:"캐릭터와 일러스트 리소스를 탐색할 수 있는 사이트", url:"https://www.opendoodles.com/", free:"무료 이용 범위와 사용 조건은 공식 안내 확인", tags:["캐릭터","일러스트","라이선스 확인"]},
  {id:"heroicons", name:"Heroicons", category:"아이콘", type:"아이콘 · UI", description:"웹 인터페이스에 활용하는 아이콘 모음", url:"https://heroicons.com/", free:"프로젝트 적용 전 공식 라이선스 확인", tags:["아이콘","UI","오픈소스"]},
  {id:"fonts", name:"Google Fonts", category:"폰트", type:"폰트 · 타이포그래피", description:"웹과 디자인 작업에 사용할 글꼴을 탐색하는 사이트", url:"https://fonts.google.com/", free:"글꼴별 라이선스 및 사용 조건 확인", tags:["폰트","타이포그래피","라이선스 확인"]}
];
let activeCategory = "전체";
let currentSiteId = "undraw";

const $ = (selector) => document.querySelector(selector); const $$ = (selector) => [...document.querySelectorAll(selector)];

function getSaved() {
  try { return JSON.parse(localStorage.getItem("assetFavorites") || "[]"); }
  catch { return []; }
}
function setSaved(ids) { localStorage.setItem("assetFavorites", JSON.stringify(ids)); updateSavedBadge(); }
function updateSavedBadge() {
  const badge = $("#savedBadge");
  if (badge) badge.textContent = getSaved().length ? `(${getSaved().length})` : "";
}
function toggleSave(id) {
  const saved = getSaved();
  const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
  setSaved(next);
  renderExplore();
  renderSaved();
  updateDetailSaveButton();
}
function showPage(name) {
  $$(".page").forEach(page => page.classList.remove("active"));
  const page = $(`#${name}Page`);
  if (page) page.classList.add("active");
  $$(".tab-link").forEach(link => link.classList.toggle("active", link.dataset.page === name || (name === "detail" && link.dataset.page === "explore")));
  if (name === "explore") renderExplore();
  if (name === "my") renderSaved();
  window.scrollTo({top:0, behavior:"instant"});
}
function cardMarkup(site, showSave = false) {
  const saved = getSaved().includes(site.id);
  return `<article class="site-card">
    <div class="thumb">사이트 썸네일</div>
    <div class="site-body">
      <div class="inline-between"><h3>${site.name}</h3>${showSave ? `<button class="small-button" data-save="${site.id}">${saved ? "★ 저장됨" : "☆ 저장"}</button>` : ""}</div>
      <p class="muted">${site.type}</p>
      <div class="tags">${site.tags.slice(0,2).map(tag=>`<span class="tag">${tag}</span>`).join("")}</div>
      <button class="btn" data-detail="${site.id}">상세 보기 →</button>
    </div>
  </article>`;
}
function bindCardActions(container) {
  container.querySelectorAll("[data-save]").forEach(button => button.addEventListener("click", () => toggleSave(button.dataset.save)));
  container.querySelectorAll("[data-detail]").forEach(button => button.addEventListener("click", () => openDetail(button.dataset.detail)));
}
function renderRecommended() {
  const container = $("#recommendedSites");
  if (!container) return;
  container.innerHTML = sites.filter(site => ["unsplash","undraw","heroicons"].includes(site.id)).map(site=>cardMarkup(site)).join("");
  bindCardActions(container);
}
function renderExplore() {
  const query = ($("#searchQuery")?.value || "").trim().toLowerCase();
  const filtered = sites.filter(site => {
    const matchesCategory = activeCategory === "전체" || site.category === activeCategory;
    const matchesQuery = !query || `${site.name} ${site.type} ${site.description} ${site.tags.join(" ")}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
  if ($("#sortSelect")?.value === "name") filtered.sort((a,b)=>a.name.localeCompare(b.name));
  $("#siteResults").innerHTML = filtered.map(site=>cardMarkup(site,true)).join("");
  $("#resultCount").textContent = `사이트 ${filtered.length}개`;
  $("#emptyState").hidden = filtered.length > 0;
  $("#siteResults").hidden = filtered.length === 0; $$("#categoryChips .chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === activeCategory));
  bindCardActions($("#siteResults"));
}
function setCategory(category) { activeCategory = category; renderExplore(); }
function openDetail(id) {
  const site = sites.find(item=>item.id===id);
  if (!site) return;
  currentSiteId = id;
  $("#detailName").textContent = site.name;
  $("#detailDescription").textContent = site.description;
  $("#detailType").textContent = site.type;
  $("#detailFree").textContent = site.free;
  $("#detailUrl").textContent = site.url;
  $("#detailTags").innerHTML = site.tags.map(tag=>`<span class="tag">${tag}</span>`).join("");
  $("#externalLink").href = site.url;
  updateDetailSaveButton();
  showPage("detail");
}
function updateDetailSaveButton() {
  const button = $("#detailSaveButton");
  if (!button) return;
  const saved = getSaved().includes(currentSiteId);
  button.textContent = saved ? "★ 저장됨" : "☆ 저장";
}
function renderSaved() {
  const savedSites = sites.filter(site => getSaved().includes(site.id));
  $("#savedSites").innerHTML = savedSites.map(site=>cardMarkup(site,true)).join("");
  $("#savedCount").textContent = `${savedSites.length}개 저장`;
  $("#emptySaved").hidden = savedSites.length > 0;
  bindCardActions($("#savedSites"));
}
function resetSearch() {
  $("#searchQuery").value = "";
  activeCategory = "전체";
  $("#sortSelect").value = "relevance";
  renderExplore();
}
function applySearch(query) {
  showPage("explore");
  $("#searchQuery").value = query;
  activeCategory = "전체";
  renderExplore();
}
function init() {
  renderRecommended();
  renderExplore();
  renderSaved();
  updateSavedBadge();
  $$("[data-page]").forEach(button => button.addEventListener("click", () => showPage(button.dataset.page))); $$
("[data-category-link]").forEach(button => button.addEventListener("click", () => { showPage("explore"); setCategory(button.dataset.categoryLink); }));
  $("#homeSearchForm").addEventListener("submit", event => { event.preventDefault(); applySearch($("#homeQuery").value); });
  $("#searchForm").addEventListener("submit", event => { event.preventDefault(); renderExplore(); });
  $("#searchQuery").addEventListener("input", renderExplore);
  $("#categoryChips").addEventListener("click", event => { const button = event.target.closest("[data-category]"); if (button) setCategory(button.dataset.category); });
  $("#sortSelect").addEventListener("change", renderExplore);
  $("#resetSearch").addEventListener("click", resetSearch);
  $("#detailSaveButton").addEventListener("click", () => toggleSave(currentSiteId));
}
document.addEventListener("DOMContentLoaded", init);