const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const productGrid = document.getElementById("productGrid");
const adminMessage = document.getElementById("adminMessage");

const editPanel = document.getElementById("editPanel");
const editProductId = document.getElementById("editProductId");
const editProductName = document.getElementById("editProductName");
const editImgLink = document.getElementById("editImgLink");
const editProductLink = document.getElementById("editProductLink");
const editAboutProduct = document.getElementById("editAboutProduct");
const editRating = document.getElementById("editRating");
const editRatingCount = document.getElementById("editRatingCount");

const saveProductBtn = document.getElementById("saveProductBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Các phần mới trong editPanel đẹp
const cancelEditTopBtn = document.getElementById("cancelEditTopBtn");
const editImagePreview = document.getElementById("editImagePreview");
const editPreviewProductId = document.getElementById("editPreviewProductId");

let currentProducts = [];

const FALLBACK_IMAGE = "https://via.placeholder.com/420x320?text=Neko+Shop";

function checkManagerPermission() {
  const token = getAuthToken();
  const role = getCurrentUserRole();

  if (!token || role !== "manager") {
    window.location.href = "./login.html";
  }
}

function showMessage(message, isError = false) {
  if (!adminMessage) {
    return;
  }

  adminMessage.textContent = message;
  adminMessage.classList.remove("hidden");
  adminMessage.style.color = isError ? "red" : "green";

  setTimeout(() => {
    adminMessage.classList.add("hidden");
  }, 2500);
}

function createAdminProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${product.img_link || ""}"
          alt="${product.product_name || "Product image"}"
          onerror="this.src='https://via.placeholder.com/320x220?text=Image+Error'"
        />
      </div>

      <div class="product-content">
        <h3 class="product-title">${product.product_name || "No name"}</h3>

        <p class="product-meta">
          ID: ${product.product_id}
        </p>

        <p class="product-meta">
          Rating: ${product.rating || "N/A"} | Reviews: ${product.rating_count || "N/A"}
        </p>

        <div class="product-actions">
          <button class="detail-btn" onclick="openEditForm('${product.product_id}')">
            Edit
          </button>

          <a class="link-btn" href="./product-detail.html?product_id=${product.product_id}">
            View
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

  productGrid.innerHTML = products.map(createAdminProductCard).join("");
}

async function loadAdminProducts() {
  try {
    const params = {
      limit: 30,
      offset: 0
    };

    const searchValue = searchInput.value.trim();

    if (searchValue) {
      params.search = searchValue;
    }

    const data = await fetchProducts(params);
    currentProducts = data.products || [];

    renderProducts(currentProducts);
  } catch (error) {
    console.error("Load admin products error:", error);
    showMessage("Không thể tải danh sách sản phẩm.", true);
  }
}

function openEditForm(productId) {
  const product = currentProducts.find(item => item.product_id === productId);

  if (!product) {
    return;
  }

  editProductId.value = product.product_id;
  editProductName.value = product.product_name || "";
  editImgLink.value = product.img_link || "";
  editProductLink.value = product.product_link || "";
  editAboutProduct.value = product.about_product || "";
  editRating.value = product.rating || "";
  editRatingCount.value = product.rating_count || "";

  if (editImagePreview) {
    editImagePreview.src = product.img_link || FALLBACK_IMAGE;
  }

  if (editPreviewProductId) {
    editPreviewProductId.textContent = product.product_id || "N/A";
  }

  editPanel.classList.remove("hidden");
  editPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeEditPanel() {
  editPanel.classList.add("hidden");
}

saveProductBtn.addEventListener("click", async () => {
  try {
    const productId = editProductId.value;

    const payload = {
      product_name: editProductName.value.trim(),
      img_link: editImgLink.value.trim(),
      product_link: editProductLink.value.trim(),
      about_product: editAboutProduct.value.trim(),
      rating: editRating.value ? Number(editRating.value) : null,
      rating_count: editRatingCount.value ? Number(editRatingCount.value) : null
    };

    await updateProduct(productId, payload);

    showMessage("Lưu sản phẩm thành công. Dữ liệu đã cập nhật vào MySQL.");

    closeEditPanel();

    await loadAdminProducts();
  } catch (error) {
    console.error("Save product error:", error);
    showMessage("Lưu sản phẩm thất bại.", true);
  }
});

cancelEditBtn.addEventListener("click", closeEditPanel);

if (cancelEditTopBtn) {
  cancelEditTopBtn.addEventListener("click", closeEditPanel);
}

if (editImgLink && editImagePreview) {
  editImgLink.addEventListener("input", () => {
    const newImageUrl = editImgLink.value.trim();
    editImagePreview.src = newImageUrl || FALLBACK_IMAGE;
  });
}

searchBtn.addEventListener("click", loadAdminProducts);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loadAdminProducts();
  }
});

async function initAdminPage() {
  checkManagerPermission();
  await loadAdminProducts();
}

initAdminPage();