const API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbwyHm9GFEtn4fZen6cuUwAVvdRHHRc3rFn0G4KwJhFjxHWIDvTGbgN7ZLkJr11YNj_U/exec";

const infoModal = document.getElementById("infoModal");
const infoTitle = document.getElementById("infoTitle");
const infoLabel = document.getElementById("infoLabel");
const infoList = document.getElementById("infoList");
const closeInfoBtn = document.getElementById("closeInfo");
const productModal = document.getElementById("productModal");
const closeProductBtn = document.getElementById("closeProduct");
const detailImage = document.getElementById("detailImage");
const detailTitle = document.getElementById("detailTitle");
const detailPrice = document.getElementById("detailPrice");
const detailDescription = document.getElementById("detailDescription");
const detailFeatures = document.getElementById("detailFeatures");
const detailOrderBtn = document.getElementById("detailOrder");
const detailCloseBtn = document.getElementById("detailClose");
const productSearch = document.getElementById("productSearch");
const searchEmpty = document.getElementById("searchEmpty");
const productContainer = document.getElementById("productsContainer");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

let products = [];
let activeCategory = "all";
let searchQuery = "";
let currentProduct = null;

const infoCopy = {
    terms: {
        label: "Policy Insights",
        title: "Terms & Conditions",
        items: [
            "1) Authentic sourcing: Every gadget is procured from vetted partners and verified by our Coimbatore quality pod before it is listed.",
            "2) Ordering & payment: Orders are accepted through the instant form only; secure payment links are shared directly after confirmation.",
            "3) Pricing clarity: All listed prices fall between ₹250 - ₹10,000 and include GST unless explicitly mentioned.",
            "4) Communication consent: Placing an order lets our team reach you via call, SMS, WhatsApp, or email for fulfilment updates.",
            "5) Order discretion: Minha Shopping may pause or cancel suspicious orders or unavailable inventory with a full update to the customer."
        ]
    },
    returns: {
        label: "Care Promise",
        title: "Return / Refund Policy",
        items: [
            "1) Eligibility: Only products damaged in transit or dead-on-arrival qualify for a refund or replacement.",
            "2) Timeline: Share photos or an unboxing clip within 3 calendar days from delivery to initiate the request.",
            "3) Inspection: Our support crew arranges pickup/drop and inspects the gadget with all accessories and packaging.",
            "4) Refunds: Once approved, the amount is reversed via the original payment mode within 5-7 business days.",
            "5) Exchanges: Variant swaps depend on stock availability; refunds are declined for general wear or change of mind."
        ]
    },
    address: {
        label: "Minha Shopping HQ",
        title: "Storefront & Support Desk",
        items: [
            "1) 226/1 GM Nagar, Bypass Road, South Ukkadam, Coimbatore.",
            "2) Landmark: Beside GM Nagar Bus Stop, opposite River View Apartments.",
            "3) Open hours: 10:00 AM – 8:30 PM (Mon-Sat), 11:00 AM – 6:00 PM (Sun).",
            "4) Pickup window: Self-collection available with prior confirmation call.",
            "5) Courier hub: Dispatches for Tamil Nadu and Kerala originate from this address."
        ]
    }
};

const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "Price on request";
    return `₹${value}`;
};

const normalizeProduct = (product, index) => ({
    id: product.ID ?? product.id ?? index + 1,
    name: product.Name ?? product.name ?? `Product ${index + 1}`,
    price: product.Price ?? product.price ?? "",
    description: product.Description ?? product.description ?? "No description available.",
    image: product.Image ?? product.image ?? "",
    features: product.Features ?? product.features ?? "",
    category: product.Category ?? product.category ?? "General"
});

const setLoadingState = () => {
    if (!productContainer) return;
    productContainer.innerHTML = '<div class="loading-state">Loading products from your Google Sheet…</div>';
    if (syncStatus) {
        syncStatus.textContent = "Syncing with Google Sheet…";
    }
};

const populateCategories = () => {
    if (!categoryFilter) return;
    const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
    const currentValue = categoryFilter.value || "all";
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    if (categories.includes(currentValue)) {
        categoryFilter.value = currentValue;
    } else {
        categoryFilter.value = "all";
    }
};

const applyFilters = () => {
    const query = (productSearch?.value || "").trim().toLowerCase();
    searchQuery = query;
    const selectedCategory = categoryFilter?.value || "all";
    activeCategory = selectedCategory;

    const filtered = products.filter((product) => {
        const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase();
        const haystack = `${product.name} ${product.description} ${product.features} ${product.category} ${product.price}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        return matchesCategory && matchesQuery;
    });

    renderProducts(filtered);
};

const renderProducts = (items) => {
    if (!productContainer) return;

    productContainer.innerHTML = "";

    if (!items.length) {
        searchEmpty.hidden = false;
        searchEmpty.textContent = searchQuery
            ? `No products match "${searchQuery}".`
            : "No products are available right now.";
        return;
    }

    searchEmpty.hidden = true;
    const fragment = document.createDocumentFragment();

    items.forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
            <div class="card-media">
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
            </div>
            <div class="card-body">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="price">${escapeHtml(formatPrice(product.price))}</p>
                <p class="description">${escapeHtml(product.description)}</p>
                <button class="details-btn" type="button">View Details</button>
            </div>
        `;

        card.querySelector(".details-btn").addEventListener("click", () => openProduct(product));
        fragment.appendChild(card);
    });

    productContainer.appendChild(fragment);
};

const toggleProductModal = (show, product = null) => {
    if (show && product) {
        currentProduct = product;
        detailTitle.textContent = product.name;
        detailPrice.textContent = formatPrice(product.price);
        detailDescription.textContent = product.description;
        detailImage.src = product.image;
        detailImage.alt = product.name;
        detailFeatures.innerHTML = "";
        productModal.dataset.productName = product.name;

        if (product.features) {
            product.features.split("|").forEach((feature) => {
                const li = document.createElement("li");
                li.textContent = feature.trim();
                detailFeatures.appendChild(li);
            });
        }

        productModal.classList.add("active");
        productModal.setAttribute("aria-hidden", "false");
    } else {
        currentProduct = null;
        productModal.classList.remove("active");
        productModal.setAttribute("aria-hidden", "true");
    }
};

const toggleInfoModal = (key = null) => {
    if (key) {
        const data = infoCopy[key];
        if (!data) return;
        infoLabel.textContent = data.label;
        infoTitle.textContent = data.title;
        infoList.innerHTML = "";
        data.items.forEach((text) => {
            const li = document.createElement("li");
            li.textContent = text;
            infoList.appendChild(li);
        });
        infoModal.classList.add("active");
        infoModal.setAttribute("aria-hidden", "false");
    } else {
        infoModal.classList.remove("active");
        infoModal.setAttribute("aria-hidden", "true");
    }
};

const openProduct = (product) => toggleProductModal(true, product);

const redirectToWhatsApp = (productName) => {
    const phone = "918300299492";
    const message = `Hello, I would like to order: ${productName}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
};

const loadProducts = async () => {
    setLoadingState();

    try {
        const response = await fetch(API_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

        const data = await response.json();
        products = Array.isArray(data) ? data.map(normalizeProduct) : [];

        populateCategories();
        applyFilters();

        if (syncStatus) {
            const now = new Date();
            syncStatus.textContent = `Live from Google Sheet • Updated ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
        }
    } catch (error) {
        console.error(error);
        if (productContainer) {
            productContainer.innerHTML = '<div class="error-state">Unable to load products right now. Please refresh or check your Google Sheet connection.</div>';
        }
        if (syncStatus) {
            syncStatus.textContent = "Unable to sync right now.";
        }
    }
};

// Event listeners
if (productSearch) {
    productSearch.addEventListener("input", applyFilters);
}

if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters);
}


detailOrderBtn.addEventListener("click", () => {
    const productName = productModal.dataset.productName || detailTitle.textContent;
    if (productName) {
        redirectToWhatsApp(productName);
    }
});

document.querySelectorAll(".nav-links a, .hero-actions a, .nav-cta").forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (targetId?.startsWith("#")) {
            event.preventDefault();
            document.querySelector(targetId)?.scrollIntoView({ behavior: "smooth" });
        }
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (infoModal.classList.contains("active")) toggleInfoModal();
        if (productModal.classList.contains("active")) toggleProductModal(false);
    }
});

loadProducts();
window.setInterval(() => {
    if (document.visibilityState === "visible") {
        loadProducts();
    }
}, 15000);

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        loadProducts();
    }
});
