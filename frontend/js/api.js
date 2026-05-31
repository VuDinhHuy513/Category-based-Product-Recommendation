const API_BASE_URL = "http://127.0.0.1:8000/api";

function buildQuery(params = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString();
}

// =========================
// AUTH
// =========================

function getAuthToken() {
  return localStorage.getItem("access_token");
}

function getCurrentUserRole() {
  return localStorage.getItem("user_role");
}

function getAuthHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Login API error:", response.status, errorText);
    throw new Error("Login failed");
  }

  return response.json();
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
  localStorage.removeItem("user_role");

  window.location.href = "./login.html";
}

// =========================
// PRODUCTS
// =========================

async function fetchProducts(params = {}) {
  const query = buildQuery(params);

  const url = query
    ? `${API_BASE_URL}/products/?${query}`
    : `${API_BASE_URL}/products/`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch products error:", response.status, errorText);
    throw new Error("Fetch products failed");
  }

  return response.json();
}

async function fetchProductDetail(productId) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch product detail error:", response.status, errorText);
    throw new Error("Fetch product detail failed");
  }

  return response.json();
}

async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/products/categories`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch categories error:", response.status, errorText);
    throw new Error("Fetch categories failed");
  }

  return response.json();
}

async function updateProduct(productId, payload) {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update product error:", response.status, errorText);
    throw new Error("Update product failed");
  }

  return response.json();
}

// =========================
// RECOMMENDATION
// =========================

async function recommendSimilar(productId, useCategory = true, topK = 10, mode = "content") {
  const response = await fetch(`${API_BASE_URL}/recommend/similar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      product_id: productId,
      use_category: useCategory,
      top_k: topK,
      mode: mode
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Recommend error:", response.status, errorText);
    throw new Error("Recommend failed");
  }

  return response.json();
}
async function fetchRecommendations(productIdOrPayload, useCategory = true, topK = 10, mode = "content") {
  let payload;

  // Hỗ trợ cả 2 kiểu gọi:
  // fetchRecommendations("B002PD61Y4", true, 10, "content")
  // hoặc fetchRecommendations({ product_id: "...", use_category: true, top_k: 10, mode: "content" })
  if (typeof productIdOrPayload === "object") {
    payload = {
      product_id: productIdOrPayload.product_id || productIdOrPayload.productId,
      use_category: productIdOrPayload.use_category ?? productIdOrPayload.useCategory ?? true,
      top_k: productIdOrPayload.top_k || productIdOrPayload.topK || 10,
      mode: productIdOrPayload.mode || "content"
    };
  } else {
    payload = {
      product_id: productIdOrPayload,
      use_category: useCategory,
      top_k: topK,
      mode: mode
    };
  }

  const response = await fetch(`${API_BASE_URL}/recommend/similar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch recommendations error:", response.status, errorText);
    throw new Error("Fetch recommendations failed");
  }

  return response.json();
}

// Alias nếu file khác đang gọi recommendSimilar()
async function recommendSimilar(productId, useCategory = true, topK = 10, mode = "content") {
  return fetchRecommendations(productId, useCategory, topK, mode);
}