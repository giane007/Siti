// Carica i dati JSON
let data;
let cart = [];

async function loadData() {
  const response = await fetch("data.json");
  data = await response.json();
  initializePage();
}

function initializePage() {
  const path = window.location.pathname;
  if (path.includes("index.html") || path === "/") {
    renderHomePage();
  } else if (path.includes("products.html")) {
    renderProductsPage();
  } else if (path.includes("product.html")) {
    renderProductDetails();
  } else if (path.includes("cart.html")) {
    renderCart();
  } else if (path.includes("checkout.html")) {
    renderCheckout();
  }
  renderNavigation();
  renderFooter();
  updateCartBadge();
  setupSearch();
  animatePage();
}

function renderNavigation() {
  const navBrand = document.querySelector(".navbar-brand");
  const navItems = document.querySelectorAll(".nav-link");

  navBrand.textContent = data.general.siteName;
  navItems[0].textContent = data.general.navHome;
  navItems[1].textContent = data.general.navProducts;
  navItems[2].textContent = data.general.navCart;
}

function renderFooter() {
  const footerText = document.querySelector("footer p");
  footerText.textContent = data.general.footerText;
}

function renderHomePage() {
  const header = document.querySelector("header");
  header.innerHTML = `
        <h1 class="display-4">${data.index.title}</h1>
        <p class="lead">${data.index.subtitle}</p>
    `;

  const featuredProducts = document.getElementById("featured-products");
  data.index.featuredProducts.forEach((id) => {
    const product = data.products.find((p) => p.id === id);
    const productCard = createProductCard(product);
    featuredProducts.appendChild(productCard);
  });
}

function renderProductsPage() {
  const productList = document.getElementById("product-list");
  const categoryFilter = document.getElementById("category-filter");

  // Popola il filtro delle categorie
  const categories = [...new Set(data.products.map((p) => p.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Event listener per filtrare
  categoryFilter.addEventListener("change", updateProductList);

  // Event listener per la ricerca
  document.getElementById("search-input").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach((card) => {
      const productName = card.querySelector(".card-title").textContent.toLowerCase();
      if (productName.includes(searchTerm)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });

  function updateProductList() {
    const selectedCategory = categoryFilter.value;

    let filteredProducts = data.products;
    if (selectedCategory) {
      filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory);
    }

    productList.innerHTML = "";
    filteredProducts.forEach((product) => {
      const productCard = createProductCard(product);
      productList.appendChild(productCard);
    });
  }

  updateProductList();
}
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const productCards = document.querySelectorAll(".product-card");

      productCards.forEach((card) => {
        const productName = card.querySelector(".card-title").textContent.toLowerCase();
        const productDescription = card.querySelector(".card-text").textContent.toLowerCase();
        if (productName.includes(searchTerm) || productDescription.includes(searchTerm)) {
          card.style.display = "block";
          card.style.animation = "slideIn 0.5s ease-out";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
}

// Aggiungi animazioni al caricamento della pagina
function animatePage() {
  const elements = document.querySelectorAll(".animate-on-load");
  elements.forEach((element, index) => {
    element.style.animation = `fadeIn 0.5s ease-out ${index * 0.2}s forwards`;
  });
}

// Aggiorna il badge del carrello
function updateCartBadge() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartBadge = document.getElementById("cart-badge");

  if (cartCount > 0) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = "inline-block";
  } else {
    cartBadge.style.display = "none";
  }
}

function createProductCard(product) {
  const productCard = document.createElement("div");
  productCard.className = "col-md-4 mb-4";
  productCard.innerHTML = `
        <div class="card product-card">
            <img src="${product.image}" class="card-img-top product-image" alt="${product.name}">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text"><strong>€${product.price.toFixed(2)}</strong></p>
                <a href="product.html?id=${product.id}" class="btn btn-primary">Dettagli</a>
            </div>
        </div>
    `;
  return productCard;
}

function renderProductDetails() {
  const productDetails = document.getElementById("product-details");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number.parseInt(urlParams.get("id"));
  const product = data.products.find((p) => p.id === productId);

  if (product) {
    productDetails.innerHTML = `
            <div class="col-md-6">
                <img src="${product.image}" class="img-fluid" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p class="h3 mb-4">€${product.price.toFixed(2)}</p>
                <h4>Caratteristiche:</h4>
                <ul>
                    ${product.features.map((feature) => `<li>${feature}</li>`).join("")}
                </ul>
                <button class="btn btn-primary btn-lg mt-4" onclick="addToCart(${product.id})">Aggiungi al Carrello</button>
            </div>
        `;
  } else {
    productDetails.innerHTML = "<p>Prodotto non trovato.</p>";
  }
}

function addToCart(productId) {
  const product = data.products.find((p) => p.id === productId);
  if (product) {
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Prodotto aggiunto al carrello!");
    updateCartBadge();
  }
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const totalPrice = document.getElementById("total-price");
  const checkoutBtn = document.getElementById("checkout-btn");

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Il tuo carrello è vuoto.</p>";
    totalPrice.textContent = "€0.00";
    checkoutBtn.style.display = "none";
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
            <div class="card mb-3">
                <div class="card-body d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="img-thumbnail">
                    <div class="ms-3">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">Prezzo: €${item.price.toFixed(2)}</p>
                        <p class="card-text">Quantità: 
                            <button class="btn btn-sm btn-secondary" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-secondary" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </p>
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">Rimuovi</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");

    updateCartTotal();
  }

  checkoutBtn.textContent = data.cart.checkoutButton;
  checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });

  // Aggiungi l'event listener per il pulsante "Applica"
  document.getElementById("apply-coupon").addEventListener("click", applyCoupon);
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity > 0) {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function updateCartTotal() {
  const totalPrice = document.getElementById("total-price");
  const discountedPrice = document.getElementById("discounted-price");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  totalPrice.textContent = `€${total.toFixed(2)}`;
  discountedPrice.style.display = "none"; // Nascondi il prezzo scontato di default
}

function applyCoupon() {
  const couponInput = document.getElementById("coupon-code");
  const couponCode = couponInput.value.trim().toUpperCase();
  const totalPrice = document.getElementById("total-price");
  const discountedPrice = document.getElementById("discounted-price");

  // Sconto del 10% se il codice è "SCONTO10"
  if (couponCode === "SCONTO10") {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountedTotal = (total * 0.9).toFixed(2);

    totalPrice.innerHTML = `<del>€${total.toFixed(2)}</del>`;
    discountedPrice.textContent = `€${discountedTotal}`;
    discountedPrice.style.display = "block";

    alert("Coupon applicato! Sconto del 10% sul tuo ordine.");
  } else {
    alert("Codice sconto non valido.");
    discountedPrice.style.display = "none";
  }
}

function renderCheckout() {
  const checkoutForm = document.getElementById("checkout-form");
  const placeOrderBtn = document.getElementById("place-order-btn");

  placeOrderBtn.textContent = data.checkout.placeOrderButton;

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Ordine confermato con successo! Grazie per il tuo acquisto.");
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  });
}

function updateCartBadge() {
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartBadge = document.getElementById("cart-badge");

  if (cartCount > 0) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = "inline-block";
  } else {
    cartBadge.style.display = "none";
  }
}

// Inizializza la pagina
loadData();