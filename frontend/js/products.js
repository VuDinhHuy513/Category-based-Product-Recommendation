const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const searchBtn = document.getElementById("searchBtn");

const resultCount = document.getElementById("resultCount");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const productGrid = document.getElementById("productGrid");
const authArea = document.getElementById("authArea");

function renderAuthArea() {
  if (!authArea) {
    return;
  }

  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("user_role");

  if (!token || !username) {
    authArea.innerHTML = `
      <a href="./login.html" class="auth-login-link">
        Login
      </a>
    `;
    return;
  }

  const firstLetter = username.charAt(0).toUpperCase();
  const roleLabel = role === "manager" ? "Manager" : "Customer";

  authArea.innerHTML = `
    <div class="auth-user-box">
      <div class="auth-avatar">${firstLetter}</div>

      <div class="auth-info">
        <span class="auth-label">${roleLabel}</span>
        <span class="auth-username">${username}</span>
      </div>

      ${
        role === "manager"
          ? `
            <a href="./admin-products.html" class="auth-edit-link">
              Edit
            </a>
          `
          : ""
      }

      <button id="logoutBtn" class="auth-logout-btn">
        Login out
      </button>
    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");

    renderAuthArea();
  });
}

async function loadCategories() {
  try {
    const data = await fetchCategories();
    const categories = data.cat_level_1 || [];

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Load categories error:", error);
  }
}

function truncateText(text, maxLength = 110) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
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

function createProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${product.img_link || ""}"
          alt="${product.product_name || "Product image"}"
          onerror="this.src='https://via.placeholder.com/320x220?text=Neko+Shop'"
        />
      </div>

      <div class="product-content">
        <span class="category-tag">${getDisplayCategory(product)}</span>

        <h3 class="product-title">${product.product_name || "No name"}</h3>

        <p class="product-meta">
          Rating: ${product.rating || "N/A"} | Reviews: ${product.rating_count || "N/A"}
        </p>

        <p class="product-description">
          ${truncateText(product.about_product || "No description", 120)}
        </p>

        <div class="product-actions">
          <a class="detail-btn" href="./product-detail.html?product_id=${product.product_id}">
            View Detail
          </a>
          <a class="link-btn" href="${product.product_link || "#"}" target="_blank">
            Source
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(products) {
  if (!products || products.length === 0) {
    productGrid.innerHTML = `
      <div class="state-box empty-card">
        No products found.
      </div>
    `;
    return;
  }

  productGrid.innerHTML = products.map(createProductCard).join("");
}

async function loadProducts() {
  try {
    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");
    productGrid.classList.add("hidden");

    const params = {
      limit: 20,
      offset: 0
    };

    const searchValue = searchInput.value.trim();
    const categoryValue = categorySelect.value.trim();

    if (searchValue) {
      params.search = searchValue;
    }

    if (categoryValue) {
      params.category = categoryValue;
    }

    const data = await fetchProducts(params);

    resultCount.textContent = `Found ${data.total} products`;
    renderProducts(data.products);

    loadingState.classList.add("hidden");
    productGrid.classList.remove("hidden");
  } catch (error) {
    console.error("Load products error:", error);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
}

function bindEvents() {
  searchBtn.addEventListener("click", loadProducts);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadProducts();
    }
  });

  categorySelect.addEventListener("change", loadProducts);
}

async function initPage() {
  renderAuthArea();
  await loadCategories();
  await loadProducts();
  bindEvents();
}

initPage();