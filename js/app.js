let sites = [];

const categoryMap = {
  font: "폰트",
  icon: "아이콘",
  photo: "사진",
  illustration: "일러스트",
  vector: "벡터",
  "ui-kit": "UI 키트"
};

// JSON 데이터 불러오기
async function loadSites() {
  try {
    const response = await fetch("data/asset_hub_data.json");

    if (!response.ok) {
      throw new Error("데이터 파일을 불러오지 못했습니다.");
    }

    const data = await response.json();

    sites = data.map((item, index) => {
      const category = categoryMap[item.category] || item.category;

      return {
        id: `${item.category}-${item.name}-${index}`,
        name: item.name,
        category: category,
        type: category,
        description: item.description,
        url: item.url,
        free: item.description,
        tags: [category, item.source || "에셋 사이트"],
        keywords: item.keywords || [],
        aliases: item.aliases || []
      };
    });

  } catch (error) {
    console.error("사이트 데이터 로딩 오류:", error);
    alert("사이트 데이터를 불러오지 못했습니다. 데이터 파일 경로를 확인해주세요.");
  }
}
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

  const recommendedNames = ["Unsplash", "unDraw", "Heroicons"];

  container.innerHTML = sites
    .filter(site => recommendedNames.includes(site.name))
    .map(site => cardMarkup(site))
    .join("");

  bindCardActions(container);
}
function renderExplore() {
  const query = ($("#searchQuery")?.value || "").trim().toLowerCase();
  const filtered = sites.filter(site => {
    const matchesCategory = activeCategory === "전체" || site.category === activeCategory;
    const searchText = [
      site.name,
      site.type,
      site.description,
      ...site.tags,
      ...site.keywords,
      ...site.aliases
    ].join(" ").toLowerCase();

    const matchesQuery = !query || searchText.includes(query);
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
async function init() {
  await loadSites();

  renderRecommended();
  renderExplore();
  renderSaved();
  updateSavedBadge();

  $$("[data-page]").forEach(button =>
    button.addEventListener("click", () => showPage(button.dataset.page))
  );

  $$("[data-category-link]").forEach(button =>
    button.addEventListener("click", () => {
      showPage("explore");
      setCategory(button.dataset.categoryLink);
    })
  );

  $("#homeSearchForm").addEventListener("submit", event => {
    event.preventDefault();
    applySearch($("#homeQuery").value);
  });

  $("#searchForm").addEventListener("submit", event => {
    event.preventDefault();
    renderExplore();
  });

  $("#searchQuery").addEventListener("input", renderExplore);

  $("#categoryChips").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (button) setCategory(button.dataset.category);
  });

  $("#sortSelect").addEventListener("change", renderExplore);
  $("#resetSearch").addEventListener("click", resetSearch);
  $("#detailSaveButton").addEventListener("click", () => toggleSave(currentSiteId));
}
document.addEventListener("DOMContentLoaded", init);