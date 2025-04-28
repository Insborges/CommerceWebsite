"use strict";

// Inicialização dos contadores e carrinho (compartilhado entre páginas)
let cartCount = localStorage.getItem("cartCount")
  ? parseInt(localStorage.getItem("cartCount"))
  : 0;
let wishlistCount = localStorage.getItem("wishlistCount")
  ? parseInt(localStorage.getItem("wishlistCount"))
  : 0;
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// Função utilitária para adicionar eventos
const addEventOnElem = function (elem, type, callback) {
  if (elem.length > 1) {
    for (let i = 0; i < elem.length; i++) {
      elem[i].addEventListener(type, callback);
    }
  } else {
    elem.addEventListener(type, callback);
  }
};

// Funções compartilhadas ======================================================

/**
 * Atualiza os badges da wishlist (apenas para o ícone da navbar)
 */
function updateWishlistBadges(count) {
  const wishlistBadges = document.querySelectorAll(
    '[aria-label="Wishlist"] .btn-badge' // Apenas o ícone da navbar
  );
  wishlistBadges.forEach((badge) => {
    badge.textContent = count > 0 ? count : "";
    badge.classList.add("animate");
    setTimeout(() => badge.classList.remove("animate"), 500);
  });
  localStorage.setItem("wishlistCount", count.toString());
}

/**
 * Atualiza o badge do carrinho
 */
function updateCartBadge(count) {
  const cartBadges = document.querySelectorAll(
    '.bagage-btn .btn-badge, [aria-label="add to the bagage"] .btn-badge, .header-action-btn .btn-badge'
  );
  cartBadges.forEach((badge) => {
    badge.textContent = count > 0 ? count : "";
    badge.classList.add("animate");
    setTimeout(() => badge.classList.remove("animate"), 500);
  });
  localStorage.setItem("cartCount", count.toString());
}

/**
 * Atualiza o modal do carrinho
 */
function updateCartModal() {
  const cartModal = document.getElementById("cartModal");
  if (!cartModal) return;

  const cartItemsContainer = cartModal.querySelector(".cart-items-container");
  const emptyCartMessage = cartModal.querySelector(".empty-cart-message");
  const cartFooter = cartModal.querySelector(".cart-footer");

  if (cartItems.length === 0) {
    if (emptyCartMessage) emptyCartMessage.style.display = "block";
    if (cartItemsContainer) cartItemsContainer.innerHTML = "";
    if (cartFooter) cartFooter.style.display = "none";
  } else {
    if (emptyCartMessage) emptyCartMessage.style.display = "none";
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = "";
      if (cartFooter) cartFooter.style.display = "block";

      cartItems.forEach((item, index) => {
        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cart-item";
        cartItemElement.innerHTML = `
          <div class="cart-item-content">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
              <h4 class="cart-item-title">${item.name}</h4>
              <div class="cart-item-controls">
                <p class="cart-item-price">${item.price}</p>
                <div class="cart-item-quantity">
                  <button class="qty-btn minus" data-index="${index}">−</button>
                  <span class="qty-value">${item.quantity}</span>
                  <button class="qty-btn plus" data-index="${index}">+</button>
                </div>
              </div>
            </div>
            <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
      });
    }
  }
}

/**
 * Adiciona um item ao carrinho
 */
function addToCart(productId, productName, productPrice, productImage) {
  const existingItemIndex = cartItems.findIndex(
    (item) => item.id === productId
  );

  if (existingItemIndex >= 0) {
    cartItems[existingItemIndex].quantity += 1;
  } else {
    cartItems.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: 1,
    });
  }

  cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  updateCartBadge(cartCount);
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  updateCartModal();

  // Mostrar feedback visual
  const cartBadges = document.querySelectorAll(".bagage-btn .btn-badge");
  cartBadges.forEach((badge) => {
    badge.classList.add("pulse");
    setTimeout(() => badge.classList.remove("pulse"), 1000);
  });
}

/**
 * Remove um item do carrinho
 */
function removeFromCart(index) {
  if (index >= 0 && index < cartItems.length) {
    cartItems.splice(index, 1);
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    updateCartBadge(cartCount);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartModal();
  }
}

/**
 * Atualiza a quantidade de um item no carrinho
 */
function updateCartItemQuantity(index, change) {
  if (index >= 0 && index < cartItems.length) {
    const newQuantity = cartItems[index].quantity + change;

    if (newQuantity > 0) {
      cartItems[index].quantity = newQuantity;
    } else {
      removeFromCart(index);
      return;
    }

    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    updateCartBadge(cartCount);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartModal();
  }
}

/**
 * Limpa todos os itens do carrinho
 */
function clearCart() {
  if (cartItems.length > 0) {
    cartItems = [];
    cartCount = 0;
    updateCartBadge(cartCount);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartModal();
  }
}

// Configurações da Navbar ====================================================

const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("active");
};

const closeNavbar = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("active");
};

// Configurações do Carrinho ==================================================

function setupCartEvents() {
  // Abrir modal do carrinho
  document
    .querySelectorAll('.bagage-btn, [aria-label="add to the bagage"]')
    .forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const cartModal = document.getElementById("cartModal");
        if (cartModal) cartModal.classList.add("active");
      });
    });

  // Fechar modal do carrinho
  document
    .querySelector(".modal-close-btn")
    ?.addEventListener("click", function () {
      const cartModal = document.getElementById("cartModal");
      if (cartModal) cartModal.classList.remove("active");
    });

  // Fechar modal clicando fora
  document.getElementById("cartModal")?.addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.remove("active");
    }
  });

  // Event delegation para botões do carrinho
  document
    .querySelector(".cart-items-container")
    ?.addEventListener("click", function (e) {
      const index = parseInt(
        e.target.closest("[data-index]")?.getAttribute("data-index")
      );

      if (e.target.closest(".cart-item-remove")) {
        removeFromCart(index);
      } else if (e.target.closest(".qty-btn.minus")) {
        updateCartItemQuantity(index, -1);
      } else if (e.target.closest(".qty-btn.plus")) {
        updateCartItemQuantity(index, 1);
      }
    });

  // Limpar carrinho
  document
    .querySelector(".clear-cart-btn")
    ?.addEventListener("click", clearCart);

  // Adicionar ao carrinho (para o index.html)
  document.querySelectorAll('[aria-label="add to cart"]').forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const productCard = this.closest(".product-card");
      if (!productCard) return;

      const productId =
        productCard
          .querySelector("[data-product-id]")
          ?.getAttribute("data-product-id") ||
        Math.random().toString(36).substr(2, 9);
      const productName = productCard.querySelector(".card-title").textContent;
      const productPrice = productCard.querySelector(".price").textContent;
      const productImage = productCard.querySelector(".img-cover").src;

      addToCart(productId, productName, productPrice, productImage);
    });
  });

  // Adicionar ao carrinho (para product.html)
  document.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const productCard = this.closest(".product-card");
      if (!productCard) return;

      const productId =
        this.getAttribute("data-product-id") ||
        Math.random().toString(36).substr(2, 9);
      const productName =
        productCard.querySelector(".product-title").textContent;
      const productPrice =
        productCard.querySelector(".product-price").textContent;
      const productImage = productCard.querySelector(".img-cover").src;

      // Mostrar modal de confirmação se existir
      const confirmationModal = document.getElementById("confirmationModal");
      if (confirmationModal) {
        confirmationModal.querySelector(
          "p"
        ).textContent = `Add "${productName}" (${productPrice}) to cart?`;
        confirmationModal.classList.add("active");

        // Configurar botão de confirmação
        const confirmBtn =
          confirmationModal.querySelector(".modal-btn.confirm");
        if (confirmBtn) {
          confirmBtn.onclick = () => {
            addToCart(productId, productName, productPrice, productImage);
            confirmationModal.classList.remove("active");
          };
        }
      } else {
        // Se não houver modal, adiciona diretamente
        addToCart(productId, productName, productPrice, productImage);
      }
    });
  });

  // Fechar modal de confirmação
  document
    .querySelector(".modal-btn.cancel")
    ?.addEventListener("click", function () {
      const confirmationModal = document.getElementById("confirmationModal");
      if (confirmationModal) confirmationModal.classList.remove("active");
    });

  // Fechar modal de confirmação clicando fora
  document
    .getElementById("confirmationModal")
    ?.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active");
      }
    });
}

// Configurações da Wishlist ==================================================

function setupWishlistEvents() {
  // Verifica se estamos na página index (onde queremos os corações)
  if (!document.querySelector(".product-list")) return;

  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      // Alternar estado ativo
      this.classList.toggle("active");

      // Atualizar contador baseado nos botões ativos
      wishlistCount = document.querySelectorAll(".wishlist-btn.active").length;

      // Atualizar apenas o badge da navbar
      updateWishlistBadges(wishlistCount);
      localStorage.setItem("wishlistCount", wishlistCount.toString());

      // Atualizar ícones visuais (mantendo o design original)
      const heartOutline = this.querySelector(".heart-icon");
      const heartFilled = this.querySelector(".heart-filled-icon");
      if (heartOutline && heartFilled) {
        const isActive = this.classList.contains("active");
        heartOutline.style.display = isActive ? "none" : "block";
        heartFilled.style.display = isActive ? "block" : "none";

        // Efeito visual (opcional)
        this.classList.add("pulse");
        setTimeout(() => this.classList.remove("pulse"), 300);
      }
    });
  });

  // Restaurar estado dos botões ao carregar a página
  document.querySelectorAll(".wishlist-btn").forEach((btn, index) => {
    if (index < wishlistCount) {
      btn.classList.add("active");
      const heartOutline = btn.querySelector(".heart-icon");
      const heartFilled = btn.querySelector(".heart-filled-icon");
      if (heartOutline && heartFilled) {
        heartOutline.style.display = "none";
        heartFilled.style.display = "block";
      }
    }
  });
}

// Configurações da Barra de Pesquisa =========================================

function setupSearchBar() {
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  if (!searchInput || !searchBtn) return;

  function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) return;

    const productCards = document.querySelectorAll(".product-card");
    let foundResults = false;

    productCards.forEach((card) => {
      const productName = card
        .querySelector(".card-title, .product-title")
        ?.textContent.toLowerCase();
      if (productName && productName.includes(searchTerm)) {
        card.style.display = "block";
        foundResults = true;

        // Rolagem suave para o produto
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        card.style.display = "none";
      }
    });

    // Mostrar mensagem se nenhum resultado for encontrado
    const noResultsMsg = document.querySelector(".no-results-message");
    if (!foundResults) {
      if (!noResultsMsg) {
        const msg = document.createElement("p");
        msg.className = "no-results-message";
        msg.textContent = "No products found matching your search.";
        document
          .querySelector(".product-grid, .product-list")
          ?.appendChild(msg);
      }
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }

  // Evento de clique no botão de pesquisa
  searchBtn.addEventListener("click", performSearch);

  // Evento de pressionar Enter no input
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Limpar pesquisa quando o input estiver vazio
  searchInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      document.querySelectorAll(".product-card").forEach((card) => {
        card.style.display = "block";
      });
      const noResultsMsg = document.querySelector(".no-results-message");
      if (noResultsMsg) noResultsMsg.remove();
    }
  });
}

// Configurações do Carrossel de Produtos (para index.html) ===================

function setupProductCarousel() {
  const productList = document.querySelector(".product-list");
  if (!productList) return;

  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const productItems = document.querySelectorAll(".product-list > li");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productCarouselContainer = document.querySelector(
    ".product-carousel-container"
  );

  // Configuração do carrossel
  let position = 0;
  let moveDistance = productItems[0] ? productItems[0].offsetWidth + 30 : 310;
  let maxPosition = 0;
  const visibleItems = 4;
  let animationInterval;
  let isAutoAnimating = true;
  const animationSpeed = 3000;

  function calculateMaxPosition() {
    const visibleItemsCount = document.querySelectorAll(
      '.product-list > li[style*="display: block"]'
    ).length;
    maxPosition =
      visibleItemsCount > visibleItems
        ? -(moveDistance * (visibleItemsCount - visibleItems))
        : 0;
    updateButtons();
  }

  function updateButtons() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.classList.toggle("disabled", position >= 0);
    nextBtn.classList.toggle("disabled", position <= maxPosition);
  }

  function moveCarousel(direction) {
    stopAutoAnimation();

    if (direction === "next") {
      if (position > maxPosition) {
        position -= moveDistance;
      } else {
        position = 0;
      }
    } else if (direction === "prev") {
      if (position < 0) {
        position += moveDistance;
      } else {
        position = maxPosition;
      }
    }

    productList.style.transform = `translateX(${position}px)`;
    updateButtons();
  }

  function startAutoAnimation() {
    if (!isAutoAnimating) return;
    stopAutoAnimation();
    animationInterval = setInterval(() => {
      if (position > maxPosition) {
        position -= moveDistance;
      } else {
        position = 0;
      }
      productList.style.transform = `translateX(${position}px)`;
      updateButtons();
    }, animationSpeed);
  }

  function stopAutoAnimation() {
    clearInterval(animationInterval);
  }

  function filterProducts(category) {
    stopAutoAnimation();
    isAutoAnimating = category === "all";

    productItems.forEach((item) => {
      if (category === "all" || item.classList.contains(category)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    position = 0;
    moveDistance = productItems[0] ? productItems[0].offsetWidth + 30 : 310;
    calculateMaxPosition();
    productList.style.transform = `translateX(${position}px)`;
    updateButtons();

    if (category === "all") {
      startAutoAnimation();
    }
  }

  function initializeCarousel() {
    filterButtons.forEach((button) => {
      if (button.getAttribute("data-filter-btn") === "all") {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
    filterProducts("all");
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filterValue = button.getAttribute("data-filter-btn");
      filterProducts(filterValue);
    });
  });

  if (prevBtn && nextBtn) {
    prevBtn.style.left = "20px";
    nextBtn.style.right = "20px";

    prevBtn.addEventListener("click", () => {
      moveCarousel("prev");
    });

    nextBtn.addEventListener("click", () => {
      moveCarousel("next");
    });
  }

  productCarouselContainer?.addEventListener("mouseenter", () => {
    stopAutoAnimation();
  });

  productCarouselContainer?.addEventListener("mouseleave", () => {
    if (isAutoAnimating) {
      startAutoAnimation();
    }
  });

  window.addEventListener("resize", () => {
    moveDistance = productItems[0] ? productItems[0].offsetWidth + 30 : 310;
    calculateMaxPosition();
    productList.style.transform = `translateX(${position}px)`;
  });

  initializeCarousel();
}

// Configurações do Carrossel de Testemunhos (para index.html) ================

function setupTestimonialCarousel() {
  const testimonialGrid = document.getElementById("testimonial-grid");
  if (!testimonialGrid) return;

  const testimonialCards = Array.from(testimonialGrid.children);
  const testimonialPrevBtn = document.querySelector(".testimonial-btn.prev");
  const testimonialNextBtn = document.querySelector(".testimonial-btn.next");

  let currentIndex = 0;
  const cardsPerPage = 3;
  let autoScrollInterval;
  const scrollDelay = 5000;

  function updateGridPosition() {
    const cardWidth = testimonialCards[0]?.offsetWidth + 20 || 300;
    const offset = -currentIndex * cardWidth * cardsPerPage;
    testimonialGrid.style.transform = `translateX(${offset}px)`;

    if (testimonialPrevBtn) {
      testimonialPrevBtn.classList.toggle("hidden", currentIndex === 0);
    }
    if (testimonialNextBtn) {
      testimonialNextBtn.classList.toggle(
        "hidden",
        currentIndex >= Math.ceil(testimonialCards.length / cardsPerPage) - 1
      );
    }
  }

  function nextSlide() {
    const maxIndex = Math.ceil(testimonialCards.length / cardsPerPage) - 1;
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateGridPosition();
  }

  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = Math.ceil(testimonialCards.length / cardsPerPage) - 1;
    }
    updateGridPosition();
  }

  function startAutoScroll() {
    autoScrollInterval = setInterval(nextSlide, scrollDelay);
  }

  function resetAutoScroll() {
    clearInterval(autoScrollInterval);
    startAutoScroll();
  }

  if (testimonialNextBtn) {
    testimonialNextBtn.addEventListener("click", () => {
      nextSlide();
      resetAutoScroll();
    });
  }

  if (testimonialPrevBtn) {
    testimonialPrevBtn.addEventListener("click", () => {
      prevSlide();
      resetAutoScroll();
    });
  }

  startAutoScroll();

  const testimonialContainer = document.querySelector(".testimonial-container");
  if (testimonialContainer) {
    testimonialContainer.addEventListener("mouseenter", () => {
      clearInterval(autoScrollInterval);
    });

    testimonialContainer.addEventListener("mouseleave", () => {
      startAutoScroll();
    });
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateGridPosition();
    }, 250);
  });

  updateGridPosition();
}

// Configurações dos Filtros de Produtos (para product.html) ==================

function applyFilters() {
  const sizeFilters = Array.from(
    document.querySelectorAll('input[name="size"]:checked')
  ).map((el) => el.value);
  const priceFilter = document.querySelector(
    'input[name="price"]:checked'
  )?.value;
  const orderBy = document.querySelector('input[name="order"]:checked')?.value;
  const sortBy = document.querySelector('input[name="sort"]:checked')?.value;

  const products = Array.from(document.querySelectorAll(".product-card"));

  products.forEach((product) => {
    let shouldShow = true;

    // Size filter
    if (sizeFilters.length > 0) {
      const productSize =
        product.querySelector(".detail-value")?.textContent.toLowerCase() || "";
      shouldShow =
        shouldShow && sizeFilters.some((size) => productSize.includes(size));
    }

    // Price filter
    if (priceFilter) {
      const [min, max] = priceFilter.split("-").map(Number);
      const priceText =
        product.querySelector(".product-price")?.textContent || "0";
      const productPrice = Number(priceText.replace(/[^\d.]/g, ""));

      shouldShow = shouldShow && productPrice >= min && productPrice <= max;
    }

    // Show/hide product based on filters
    product.style.display = shouldShow ? "block" : "none";
  });

  // Sorting
  if (orderBy || sortBy) {
    const productGrid = document.querySelector(".product-grid");
    if (!productGrid) return;

    const products = Array.from(productGrid.querySelectorAll(".product-card"));

    products.sort((a, b) => {
      // Price sorting
      if (orderBy === "product-price") {
        const priceA = Number(
          a
            .querySelector(".product-price")
            ?.textContent.replace(/[^\d.]/g, "") || 0
        );
        const priceB = Number(
          b
            .querySelector(".product-price")
            ?.textContent.replace(/[^\d.]/g, "") || 0
        );
        return sortBy === "a-z" ? priceA - priceB : priceB - priceA;
      }

      // Name sorting (default)
      const nameA =
        a.querySelector(".product-title")?.textContent.toLowerCase() || "";
      const nameB =
        b.querySelector(".product-title")?.textContent.toLowerCase() || "";
      return sortBy === "a-z"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    // Reorder products in DOM
    products.forEach((product) => productGrid.appendChild(product));
  }
}

function setupProductFilters() {
  // Filter dropdown toggle
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const group = this.closest(".filter-group");
      if (group) group.classList.toggle("active");
    });
  });

  // Apply filters
  document.querySelectorAll(".filter-apply").forEach((btn) => {
    btn.addEventListener("click", applyFilters);
  });

  // Reset filters
  document.querySelectorAll(".filter-reset").forEach((btn) => {
    btn.addEventListener("click", function () {
      const filterGroup = this.closest(".filter-dropdown");
      if (!filterGroup) return;

      filterGroup
        .querySelectorAll('input[type="checkbox"]')
        .forEach((input) => {
          input.checked = false;
        });
      filterGroup.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.checked = input.value === "none" || input.value === "a-z";
      });
      applyFilters();
    });
  });
}

// Inicialização quando o DOM estiver pronto ===================================

document.addEventListener("DOMContentLoaded", function () {
  // Atualiza os badges quando a página carrega
  updateCartBadge(cartCount);
  updateWishlistBadges(wishlistCount);
  updateCartModal();

  // Configurar eventos da navbar
  addEventOnElem(navTogglers, "click", toggleNavbar);
  addEventOnElem(navbarLinks, "click", closeNavbar);

  // Fechar navbar quando o tamanho da tela aumenta
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      closeNavbar();
    }
  });

  // Configurações específicas da página inicial
  if (document.querySelector(".product-list")) {
    setupProductCarousel();
    setupTestimonialCarousel();
  }

  // Configurações específicas da página de produtos
  if (document.querySelector(".product-page")) {
    setupProductFilters();

    // Aplicar filtros se algum estiver ativo
    const activeFilters = document.querySelectorAll(
      'input[type="checkbox"]:checked, input[type="radio"]:checked'
    );
    if (activeFilters.length > 0) {
      applyFilters();
    }
  }

  // Configurar eventos comuns
  setupCartEvents();
  setupWishlistEvents();
  setupSearchBar();
});
