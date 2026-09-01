const priceOptions = [160, 320, 480, 650, 800, 1000, 1100, 1200, 1500, 1600, 2000, 2400, 2800, 3200];
let entries = Array.isArray(window.KUKIO_SKINS) ? window.KUKIO_SKINS : [];

const $ = (id) => document.getElementById(id);

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function yen(value) {
  return `${Number(value).toLocaleString("ja-JP")}円`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function renderOptions() {
  $("priceFilter").innerHTML =
    `<option value="all">すべての価格</option>` +
    priceOptions.map((value) => `<option value="${value}">${yen(value)}</option>`).join("");

  renderPriceStrip();
}

function renderPriceStrip() {
  const selected = $("priceFilter").value || "all";
  $("priceStrip").innerHTML =
    `<button class="${selected === "all" ? "active" : ""}" data-price="all">ALL</button>` +
    priceOptions
      .map((value) => `<button class="${selected === String(value) ? "active" : ""}" data-price="${value}">${yen(value)}</button>`)
      .join("");

  document.querySelectorAll("#priceStrip button").forEach((button) => {
    button.addEventListener("click", () => {
      $("priceFilter").value = button.dataset.price;
      render();
    });
  });
}

function filteredEntries() {
  const needle = normalizeText($("queryInput").value);
  const price = $("priceFilter").value || "all";
  const sort = $("sortSelect").value;

  const list = entries.filter((entry) => {
    const haystack = normalizeText([entry.name, (entry.items || []).join(" "), entry.note].join(" "));
    const queryOk = !needle || haystack.includes(needle);
    const priceOk = price === "all" || Number(entry.price) === Number(price);
    return queryOk && priceOk;
  });

  return list.sort((a, b) => {
    if (sort === "price-low") return Number(a.price) - Number(b.price) || a.name.localeCompare(b.name);
    if (sort === "price-high") return Number(b.price) - Number(a.price) || a.name.localeCompare(b.name);
    if (sort === "name") return a.name.localeCompare(b.name);
    return Number(b.createdAt || 0) - Number(a.createdAt || 0);
  });
}

function renderCard(entry) {
  const images = Array.isArray(entry.images) ? entry.images.filter(Boolean) : [];
  const imageHtml =
    images.length > 0
      ? `<div class="image-grid" data-count="${Math.min(images.length, 4)}">${images
          .slice(0, 4)
          .map((image, index) => `<img src="${escapeAttr(image)}" alt="${escapeHtml(entry.name)} ${index + 1}" loading="lazy">`)
          .join("")}</div>`
      : `<div class="image-placeholder">${escapeHtml(String(entry.name || "?").slice(0, 2).toUpperCase())}</div>`;

  return `
    <article class="skin-card">
      <div class="image-stack">
        ${imageHtml}
        <span>${escapeHtml(entry.name)}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h2>${escapeHtml(entry.name)}</h2>
          <div class="price-pill">${yen(entry.price)}</div>
        </div>
        <div class="chips">${(entry.items || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        ${entry.note ? `<p class="note">${escapeHtml(entry.note)}</p>` : ""}
      </div>
    </article>
  `;
}

function render() {
  renderPriceStrip();
  const list = filteredEntries();
  $("summary").innerHTML = `<strong>${list.length}</strong> 件表示中 <span>スキン画像、セット内容、価格をまとめています。</span>`;
  $("skinList").innerHTML = list.length ? list.map(renderCard).join("") : `<div class="empty-state">まだ登録がありません。</div>`;
}

function bindEvents() {
  $("queryInput").addEventListener("input", render);
  $("priceFilter").addEventListener("change", render);
  $("sortSelect").addEventListener("change", render);
  $("clearQuery").addEventListener("click", () => {
    $("queryInput").value = "";
    render();
  });
}

renderOptions();
bindEvents();
render();
