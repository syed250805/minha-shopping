const API_URL = "https://script.google.com/macros/s/AKfycbwTQ4DN6BDHEjpc0X8PaUL8Qq7ow16-7h4bszZvms5FFhgGzQcYATESFPYVdlvDyuyP/exec";
const ADMIN_PASSWORD = "Minha@2026";

const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const passwordInput = document.getElementById("password");
const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");
const statusBadge = document.getElementById("statusBadge");
const productIdInput = document.getElementById("productId");

let products = [];
let filteredProducts = [];
let editIndex = null;
let localFallback = false;

loginBtn.addEventListener("click", handleLogin);
logoutBtn.addEventListener("click", handleLogout);
productForm.addEventListener("submit", handleSubmit);
cancelEdit.addEventListener("click", resetForm);
searchInput.addEventListener("input", handleSearch);

async function handleLogin() {
  if (passwordInput.value.trim() === ADMIN_PASSWORD) {
    loginBox.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    passwordInput.value = "";
    await loadProducts();
  } else {
    showStatus("Wrong password, please try again.", "error");
  }
}

function handleLogout() {
  adminPanel.classList.add("hidden");
  loginBox.classList.remove("hidden");
  resetForm();
  products = [];
  filteredProducts = [];
  productTable.innerHTML = "";
}

async function loadProducts() {
  const remoteProducts = await fetchProducts();
  if (remoteProducts && remoteProducts.length) {
    products = remoteProducts.map(normalizeProduct);
    localFallback = false;
    showStatus("Product list loaded successfully.", "success");
  } else {
    products = getLocalProducts();
    localFallback = true;
    if (products.length) {
      showStatus("Remote sync unavailable. Using saved local products.", "error");
    } else {
      showStatus("No products found yet. Add a product to get started.", "success");
    }
  }
  filteredProducts = [...products];
  renderProducts();
}

async function fetchProducts() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return Object.values(data);
    return [];
  } catch (error) {
    console.warn("Product fetch failed:", error.message);
    return [];
  }
}

function normalizeProduct(raw) {
  return {
    id: raw.id || raw.ID || raw.Id || raw.key || `${raw.Name || raw.name || "product"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: raw.Name || raw.name || "",
    price: raw.Price || raw.price || "",
    description: raw.Description || raw.description || "",
    image: raw.Image || raw.image || "",
    features: raw.Features || raw.features || ""
  };
}

function getLocalProducts() {
  const saved = localStorage.getItem("minhaAdminProducts");
  return saved ? JSON.parse(saved) : [];
}

function saveLocalProducts(items) {
  localStorage.setItem("minhaAdminProducts", JSON.stringify(items));
}

function renderProducts() {
  productTable.innerHTML = "";
  const list = filteredProducts.length ? filteredProducts : products;
  if (!list.length) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  list.forEach((product) => {
    const tr = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = product.name;
    nameCell.style.minWidth = "180px";

    const priceCell = document.createElement("td");
    priceCell.textContent = product.price ? `${product.price}` : "-";

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = product.description || "No description";

    const actionsCell = document.createElement("td");
    actionsCell.className = "actions-cell";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-button edit";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => startEdit(product.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteProduct(product.id));

    actionsCell.append(editButton, deleteButton);
    tr.append(nameCell, priceCell, descriptionCell, actionsCell);
    productTable.appendChild(tr);
  });
}

function startEdit(id) {
  const index = products.findIndex((item) => item.id === id);
  if (index < 0) return;
  const product = products[index];
  editIndex = index;
  productIdInput.value = product.id;
  document.getElementById("name").value = product.name;
  document.getElementById("price").value = product.price;
  document.getElementById("description").value = product.description;
  document.getElementById("image").value = product.image;
  document.getElementById("features").value = product.features;
  formTitle.textContent = "Edit Product";
  submitButton.textContent = "Update Product";
  cancelEdit.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editIndex = null;
  productIdInput.value = "";
  productForm.reset();
  formTitle.textContent = "Add Product";
  submitButton.textContent = "Add Product";
  cancelEdit.classList.add("hidden");
}

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  filteredProducts = products.filter((product) => {
    return [product.name, product.description, product.features, product.price]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  renderProducts();
}

async function handleSubmit(event) {
  event.preventDefault();
  const product = {
    id: productIdInput.value || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: document.getElementById("name").value.trim(),
    price: document.getElementById("price").value.trim(),
    description: document.getElementById("description").value.trim(),
    image: document.getElementById("image").value.trim(),
    features: document.getElementById("features").value.trim()
  };

  if (!product.name || !product.price) {
    showStatus("Name and price are required.", "error");
    return;
  }

  if (editIndex !== null) {
    products[editIndex] = product;
    showStatus("Product updated successfully.", "success");
    await syncWithServer({ action: "update", ...product });
  } else {
    products.unshift(product);
    showStatus("Product added successfully.", "success");
    await syncWithServer({ action: "create", ...product });
  }

  saveLocalProducts(products);
  resetForm();
  filteredProducts = [...products];
  renderProducts();
}

async function deleteProduct(id) {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  products = products.filter((item) => item.id !== id);
  saveLocalProducts(products);
  filteredProducts = filteredProducts.filter((item) => item.id !== id);
  await syncWithServer({ action: "delete", id });
  renderProducts();
  showStatus("Product removed.", "success");
}

async function syncWithServer(payload) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Sync failed:", error.message);
    localFallback = true;
    showStatus("Unable to sync with remote backend. Changes are saved locally.", "error");
    return null;
  }
}

function showStatus(message, type = "success") {
  statusBadge.textContent = message;
  statusBadge.className = `status-badge ${type}`;
  statusBadge.classList.remove("hidden");
  clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = setTimeout(() => {
    statusBadge.classList.add("hidden");
  }, 5000);
}
