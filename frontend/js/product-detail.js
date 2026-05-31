const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const productDetail = document.getElementById("productDetail");

const withCategorySection = document.getElementById("withCategorySection");
const withCategoryLoading = document.getElementById("withCategoryLoading");
const withCategoryGrid = document.getElementById("withCategoryGrid");

const compareControls = document.getElementById("compareControls");

const showWithoutCategoryBtn = document.getElementById("showWithoutCategoryBtn");
const withoutCategorySection = document.getElementById("withoutCategorySection");
const withoutCategoryLoading = document.getElementById("withoutCategoryLoading");
const withoutCategoryGrid = document.getElementById("withoutCategoryGrid");

const showHybridBtn = document.getElementById("showHybridBtn");
const hybridSection = document.getElementById("hybridSection");
const hybridLoading = document.getElementById("hybridLoading");
const hybridGrid = document.getElementById("hybridGrid");

let currentProductId = null;
let hasLoadedWithoutCategory = false;
let hasLoadedHybrid = false;

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("product_id");
}

function getDisplayCategory(product) {
  const cat4 = String(product.cat_level_4 ?? "").trim();
  const cat3 = String(product.cat_level_3 ?? "").trim();

  const invalidValues = ["", "nan", "none", "null", "undefined", "Unknown"];

  if (!invalidValues.includes(cat4.toLowerCase())) {
    return cat4;
  }

  if (!invalidValues.includes(cat3.toLowerCase())) {
    return cat3;
  }

  return "Unknown";
}

function truncateText(text, maxLength = 78) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function formatScore(score) {
  if (score === undefined || score === null) return "N/A";
  return Number(score).toFixed(4);
}

function renderProductDetail(product) {
  const category = getDisplayCategory(product);

  productDetail.innerHTML = `
    <div class="detail-image-wrap">
      <img
        class="detail-image"
        src="${product.img_link || ""}"
        alt="${product.product_name || "Product image"}"
        onerror="this.src='https://via.placeholder.com/420x360?text=Neko+Shop'"
      />
    </div>

    <div class="detail-content">
      <span class="detail-category">${category}</span>

      <h2 class="detail-title">${product.product_name || "No name"}</h2>

      <div class="detail-meta">
        <span class="meta-pill">Rating: ${product.rating || "N/A"}</span>
        <span class="meta-pill">Reviews: ${product.rating_count || "N/A"}</span>
      </div>

      <p class="detail-description">
        ${product.about_product || "No description available."}
      </p>

      <div class="detail-actions">
        <a class="source-btn" href="${product.product_link || "#"}" target="_blank">
          View Source
        </a>
      </div>
    </div>
  `;

  productDetail.classList.remove("hidden");
}

function createRecommendCard(product) {
  const category = getDisplayCategory(product);
  const score = formatScore(product.final_score ?? product.similarity_score);

  return `
    <div class="recommend-card">
      <div class="recommend-image-wrap">
        <img
          class="recommend-image"
          src="${product.img_link || ""}"
          alt="${product.product_name || "Product image"}"
          onerror="this.src='https://via.placeholder.com/260x190?text=Neko+Shop'"
        />
      </div>

      <div class="recommend-content">
        <span class="recommend-category">${category}</span>

        <h3 class="recommend-title">
          ${truncateText(product.product_name || "No name", 78)}
        </h3>

        <p class="recommend-meta">
          Rating: ${product.rating || "N/A"} | Reviews: ${product.rating_count || "N/A"}
        </p>

        <p class="score-text">
          Score: ${score}
        </p>

        <div class="recommend-actions">
          <a class="small-btn" href="./product-detail.html?product_id=${product.product_id}">
            View Detail
          </a>

          <a class="small-btn secondary" href="${product.product_link || "#"}" target="_blank">
            Source
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderRecommendations(gridElement, recommendations) {
  if (!recommendations || recommendations.length === 0) {
    gridElement.innerHTML = `
      <div class="state-box">
        No recommendations found.
      </div>
    `;
    return;
  }

  gridElement.innerHTML = recommendations.map(createRecommendCard).join("");
}

async function loadWithCategoryRecommendations(productId) {
  withCategorySection.classList.remove("hidden");
  withCategoryLoading.classList.remove("hidden");
  withCategoryGrid.classList.add("hidden");

  const data = await fetchRecommendations(productId, true, 8, "content");

  renderRecommendations(withCategoryGrid, data.recommendations);

  withCategoryLoading.classList.add("hidden");
  withCategoryGrid.classList.remove("hidden");
  compareControls.classList.remove("hidden");
}

async function loadWithoutCategoryRecommendations(productId) {
  withoutCategorySection.classList.remove("hidden");
  withoutCategoryLoading.classList.remove("hidden");
  withoutCategoryGrid.classList.add("hidden");

  const data = await fetchRecommendations(productId, false, 8, "content");

  renderRecommendations(withoutCategoryGrid, data.recommendations);

  withoutCategoryLoading.classList.add("hidden");
  withoutCategoryGrid.classList.remove("hidden");

  hasLoadedWithoutCategory = true;
  showWithoutCategoryBtn.textContent = "Hide Recommendations Without Category";
}

async function loadHybridRecommendations(productId) {
  hybridSection.classList.remove("hidden");
  hybridLoading.classList.remove("hidden");
  hybridGrid.classList.add("hidden");

  const data = await fetchRecommendations(productId, true, 8, "hybrid");

  renderRecommendations(hybridGrid, data.recommendations);

  hybridLoading.classList.add("hidden");
  hybridGrid.classList.remove("hidden");

  hasLoadedHybrid = true;
  showHybridBtn.textContent = "Hide Hybrid Recommendations";
}

function bindEvents() {
  showWithoutCategoryBtn.addEventListener("click", async () => {
    if (!hasLoadedWithoutCategory) {
      try {
        await loadWithoutCategoryRecommendations(currentProductId);
      } catch (error) {
        console.error("Load without category recommendations error:", error);
        withoutCategoryLoading.classList.add("hidden");
        withoutCategoryGrid.innerHTML = `
          <div class="state-box error">
            Failed to load recommendations without category.
          </div>
        `;
        withoutCategoryGrid.classList.remove("hidden");
      }
      return;
    }

    if (withoutCategorySection.classList.contains("hidden")) {
      withoutCategorySection.classList.remove("hidden");
      showWithoutCategoryBtn.textContent = "Hide Recommendations Without Category";
    } else {
      withoutCategorySection.classList.add("hidden");
      showWithoutCategoryBtn.textContent = "Show Recommendations Without Category";
    }
  });

  showHybridBtn.addEventListener("click", async () => {
    if (!hasLoadedHybrid) {
      try {
        await loadHybridRecommendations(currentProductId);
      } catch (error) {
        console.error("Load hybrid recommendations error:", error);
        hybridLoading.classList.add("hidden");
        hybridGrid.innerHTML = `
          <div class="state-box error">
            Failed to load hybrid recommendations.
          </div>
        `;
        hybridGrid.classList.remove("hidden");
      }
      return;
    }

    if (hybridSection.classList.contains("hidden")) {
      hybridSection.classList.remove("hidden");
      showHybridBtn.textContent = "Hide Hybrid Recommendations";
    } else {
      hybridSection.classList.add("hidden");
      showHybridBtn.textContent = "Show Hybrid Recommendations";
    }
  });
}

async function initPage() {
  try {
    currentProductId = getProductIdFromUrl();

    if (!currentProductId) {
      throw new Error("Missing product_id in URL");
    }

    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");

    const product = await fetchProductDetail(currentProductId);
    renderProductDetail(product);

    loadingState.classList.add("hidden");

    await loadWithCategoryRecommendations(currentProductId);

    bindEvents();
  } catch (error) {
    console.error("Product detail page error:", error);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
}

initPage();