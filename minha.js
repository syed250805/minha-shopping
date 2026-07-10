const API_URL =
  "https://script.google.com/macros/s/AKfycbwyHm9GFEtn4fZen6cuUwAVvdRHHRc3rFn0G4KwJhFjxHWIDvTGbgN7ZLkJr11YNj_U/exec";

let products = [];
let filteredProducts = [];

const productContainer = document.getElementById("productsContainer");
const searchInput = document.getElementById("productSearch");
const emptyText = document.getElementById("searchEmpty");

// ----------------------------
// Load Products
// ----------------------------

async function loadProducts() {

    try {

        productContainer.innerHTML = `
        <div class="loading">
            Loading Products...
        </div>`;

        const response = await fetch(API_URL);

        products = await response.json();

        filteredProducts = [...products];

        renderProducts(filteredProducts);
        loadCategories();
        categoryFilter.addEventListener("change", () => {

    const selected = categoryFilter.value;

    if(selected==="all"){

        filteredProducts=[...products];

    }else{

        filteredProducts=products.filter(product=>

            product.Category===selected

        );

    }

    renderProducts(filteredProducts);

});

    } catch (err) {

        console.error(err);

        productContainer.innerHTML =
        `
        <h2 style="text-align:center;padding:40px;">
        Unable to load products
        </h2>
        `;

    }

}

loadProducts();function renderProducts(data){

productContainer.innerHTML="";

if(data.length===0){

emptyText.hidden=false;

return;

}

emptyText.hidden=true;

data.forEach(product=>{

const card=document.createElement("article");

card.className="product-card";

card.innerHTML=`

<div class="card-media">

<img src="${product.Image}" alt="${product.Name}">

</div>

<div class="card-body">

<h3>${product.Name}</h3>

<p class="price">₹${product.Price}</p>

<p class="description">

${product.Description}

</p>

<button class="details-btn">

View Details

</button>

</div>

`;

card.querySelector(".details-btn")

.addEventListener("click",()=>{

openProduct(product);

});

productContainer.appendChild(card);

});

}
// ----------------------------
// Product Details Modal
// ----------------------------

const productModal = document.getElementById("productModal");
const detailImage = document.getElementById("detailImage");
const detailTitle = document.getElementById("detailTitle");
const detailPrice = document.getElementById("detailPrice");
const detailDescription = document.getElementById("detailDescription");
const detailFeatures = document.getElementById("detailFeatures");

const closeProductBtn = document.getElementById("closeProduct");
const detailCloseBtn = document.getElementById("detailClose");
const detailOrderBtn = document.getElementById("detailOrder");

let currentProduct = null;

function openProduct(product){

    currentProduct = product;

    detailTitle.textContent = product.Name;

    detailPrice.textContent = "₹" + product.Price;

    detailDescription.textContent = product.Description;

    detailImage.src = product.Image;

    detailImage.alt = product.Name;

    detailFeatures.innerHTML = "";

    if(product.Features){

        product.Features.split("|").forEach(feature=>{

            const li=document.createElement("li");

            li.textContent=feature.trim();

            detailFeatures.appendChild(li);

        });

    }

    productModal.classList.add("active");

    productModal.setAttribute("aria-hidden","false");

}
function closeProduct(){

    productModal.classList.remove("active");

    productModal.setAttribute("aria-hidden","true");

}

closeProductBtn.onclick=closeProduct;

detailCloseBtn.onclick=closeProduct;

productModal.onclick=(e)=>{

    if(e.target===productModal){

        closeProduct();

    }

};

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeProduct();

    }

});
const WHATSAPP="918300299492";

detailOrderBtn.onclick=()=>{

    if(!currentProduct)return;

    const message=

`Hello,

I would like to order

${currentProduct.Name}

Price : ₹${currentProduct.Price}

Please provide more details.`;

window.open(

`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,

"_blank"

);

};
productContainer.innerHTML=`

<div class="loading">

Loading Products...

</div>

`;
productContainer.innerHTML=`

<h2 style="text-align:center;padding:40px;">

No Products Found

</h2>

`;
catch(error){

console.error(error);

productContainer.innerHTML=`

<h2 style="text-align:center;color:red;padding:40px;">

Unable to load products

</h2>

`;

}
const categoryFilter = document.getElementById("categoryFilter");

function loadCategories() {

    const categories = [...new Set(products.map(p => p.Category))];

    categoryFilter.innerHTML =
        `<option value="all">All Categories</option>`;

    categories.forEach(category => {

        categoryFilter.innerHTML +=
        `<option value="${category}">
            ${category}
        </option>`;

    });

}