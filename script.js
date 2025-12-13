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
const clearSearchBtn = document.getElementById("clearSearch");
const searchEmpty = document.getElementById("searchEmpty");
const productCards = Array.from(document.querySelectorAll(".product-card"));

const toggleProductModal = (show, dataset = null) => {
    if (show && dataset) {
        detailTitle.textContent = dataset.name;
        detailPrice.textContent = dataset.price;
        detailDescription.textContent = dataset.description;
        detailImage.src = dataset.image;
        detailImage.alt = dataset.name;
        detailFeatures.innerHTML = "";
        if (dataset.features) {
            dataset.features.split("|").forEach((feature) => {
                const li = document.createElement("li");
                li.textContent = feature.trim();
                detailFeatures.appendChild(li);
            });
        }
        productModal.dataset.productName = dataset.name;
        productModal.classList.add("active");
        productModal.setAttribute("aria-hidden", "false");
    } else {
        productModal.classList.remove("active");
        productModal.setAttribute("aria-hidden", "true");
    }
};

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

// WhatsApp redirect function
const redirectToWhatsApp = (productName) => {
    const phone = "918300299492"; // WhatsApp number: +91 9384589894
    const message = `Hello, I would like to order: ${productName}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
};

// Event listeners
document.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");
        if (card) {
            toggleProductModal(true, card.dataset);
        }
    });
});

document.querySelectorAll("[data-info]").forEach((btn) => {
    btn.addEventListener("click", () => toggleInfoModal(btn.dataset.info));
});

closeInfoBtn.addEventListener("click", () => toggleInfoModal());

infoModal.addEventListener("click", (event) => {
    if (event.target === infoModal) {
        toggleInfoModal();
    }
});

closeProductBtn.addEventListener("click", () => toggleProductModal(false));
detailCloseBtn.addEventListener("click", () => toggleProductModal(false));

productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
        toggleProductModal(false);
    }
});

// Order Now button - redirects to WhatsApp
detailOrderBtn.addEventListener("click", () => {
    const productName = productModal.dataset.productName || detailTitle.textContent;
    if (productName) {
        redirectToWhatsApp(productName);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll(".nav-links a, .hero-actions a, .nav-cta").forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (targetId.startsWith("#")) {
            event.preventDefault();
            document.querySelector(targetId)?.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Close modals with Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (infoModal.classList.contains("active")) toggleInfoModal();
        if (productModal.classList.contains("active")) toggleProductModal(false);
    }
});

// Product search / filter
const filterProducts = () => {
    const query = productSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    productCards.forEach((card) => {
        const haystack = `${card.dataset.name} ${card.dataset.description} ${card.dataset.features || ""} ${card.dataset.price}`.toLowerCase();
        const isMatch = !query || haystack.includes(query);
        card.style.display = isMatch ? "" : "none";
        if (isMatch) visibleCount += 1;
    });

    if (!visibleCount && query) {
        searchEmpty.hidden = false;
        searchEmpty.textContent = `No products match "${query}".`;
    } else {
        searchEmpty.hidden = true;
    }
};

if (productSearch) {
    productSearch.addEventListener("input", filterProducts);
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
        productSearch.value = "";
        productSearch.focus();
        filterProducts();
    });
}

filterProducts();
