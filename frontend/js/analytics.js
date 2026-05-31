const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const analyticsContent = document.getElementById("analyticsContent");

const totalProductsEl = document.getElementById("totalProducts");
const totalCat1El = document.getElementById("totalCat1");
const totalDeepCategoriesEl = document.getElementById("totalDeepCategories");
const avgRatingEl = document.getElementById("avgRating");

const ratingBars = document.getElementById("ratingBars");
const categoryBars = document.getElementById("categoryBars");
const categoryTableBody = document.getElementById("categoryTableBody");

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getDisplayCategory(product) {
  const cat4 = String(product.cat_level_4 ?? "").trim();
  const cat3 = String(product.cat_level_3 ?? "").trim();
  const invalidValues = ["", "nan", "none", "null", "undefined"];

  if (!invalidValues.includes(cat4.toLowerCase())) {
    return cat4;
  }

  if (!invalidValues.includes(cat3.toLowerCase())) {
    return cat3;
  }

  return "Unknown";
}

function buildBarRows(items, maxValue) {
  return items.map((item) => {
    const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

    return `
      <div class="bar-row">
        <div class="bar-label" title="${item.label}">${item.label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${widthPercent}%"></div>
        </div>
        <div class="bar-value">${item.value}</div>
      </div>
    `;
  }).join("");
}

function renderCategoryTable(items) {
  categoryTableBody.innerHTML = items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.label}</td>
      <td>${item.value}</td>
    </tr>
  `).join("");
}

async function loadAnalytics() {
  try {
    loadingState.classList.remove("hidden");
    errorState.classList.add("hidden");
    analyticsContent.classList.add("hidden");

    const [productsData, categoriesData] = await Promise.all([
      fetchProducts({ limit: 100, offset: 0 }),
      fetchCategories()
    ]);

    const products = productsData.products || [];
    const cat1List = categoriesData.cat_level_1 || [];

    totalProductsEl.textContent = products.length;
    totalCat1El.textContent = cat1List.length;

    const deepCategorySet = new Set();
    let ratingSum = 0;
    let ratingCount = 0;

    const categoryCounter = {};
    const ratingCounter = {};

    products.forEach((product) => {
      const category = getDisplayCategory(product);
      deepCategorySet.add(category);

      categoryCounter[category] = (categoryCounter[category] || 0) + 1;

      const rating = safeNumber(product.rating, null);
      if (rating !== null) {
        ratingSum += rating;
        ratingCount += 1;

        const rounded = Math.round(rating);
        ratingCounter[rounded] = (ratingCounter[rounded] || 0) + 1;
      }
    });

    totalDeepCategoriesEl.textContent = deepCategorySet.size;
    avgRatingEl.textContent = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : "0.00";

    const topCategories = Object.entries(categoryCounter)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const maxCategoryValue = topCategories.length ? topCategories[0].value : 0;
    categoryBars.innerHTML = buildBarRows(topCategories, maxCategoryValue);
    renderCategoryTable(topCategories);

    const ratingItems = [1, 2, 3, 4, 5].map((value) => ({
      label: `${value} stars`,
      value: ratingCounter[value] || 0
    }));

    const maxRatingValue = Math.max(...ratingItems.map(item => item.value), 0);
    ratingBars.innerHTML = buildBarRows(ratingItems, maxRatingValue);

    loadingState.classList.add("hidden");
    analyticsContent.classList.remove("hidden");
  } catch (error) {
    console.error("Analytics page error:", error);
    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
}

loadAnalytics();