/* =====================================
   VINVERTH STORE ENGINE
   Shared behaviour for every page.
   ===================================== */
(() => {
  "use strict";

  // ---------- Configuration ----------
  const CONFIG = {
    whatsappNumber: "971565741398",
    contactEmail: "kok.intl.llc@gmail.com",
    instagramUrl: "https://www.instagram.com/vinverth.uae?igsh=OXhkaWZmZTRybDNp",
    logoUrl: "https://res.cloudinary.com/davogn4xk/image/upload/v1778060426/ChatGPT_Image_May_6__2026__03_09_10_PM-removebg-preview_vnx4vc.png",
    wishlistKey: "vinverth-wishlist",
    emailjs: {
      serviceId: "service_kxg77na",
      templateId: "template_1o930ga",
      publicKey: "DrTzEc3or5fo9YSvf"
    },
    storageKey: "vinverth-cart"
  };

  const products = window.VinverthProducts?.products || [];
  const currency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const select = (selector, scope = document) => scope.querySelector(selector);
  const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

  // ---------- Shared utility functions ----------
  function showToast(message) {
    const toast = select("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function showMailPopup(message) {
    const existingPopup = select("[data-mail-popup]");
    existingPopup?.remove();
    const popup = document.createElement("div");
    popup.className = "mail-popup is-visible";
    popup.dataset.mailPopup = "true";
    popup.innerHTML = `<span class="mail-popup__check">✓</span><div><strong>${escapeHtml(message)}</strong><small>Thank you for reaching out to VINVERTH.</small></div><button type="button" aria-label="Close message">×</button>`;
    document.body.appendChild(popup);
    popup.querySelector("button")?.addEventListener("click", () => popup.remove());
    window.setTimeout(() => popup.remove(), 5200);
  }

  function getProduct(id) {
    const normalizedId = String(id || "");
    return products.find((product) => product.id === normalizedId || product.name === normalizedId);
  }

  function getCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "[]");
      if (!Array.isArray(stored)) return [];
      return stored
        .map((item) => ({ id: String(item?.id || ""), quantity: Math.max(1, Math.min(10, Math.floor(Number(item?.quantity) || 1))) }))
        .filter((item) => getProduct(item.id));
    } catch {
      return [];
    }
  }

  function getWishlist() {
    try {
      const stored = JSON.parse(localStorage.getItem(CONFIG.wishlistKey) || "[]");
      return Array.isArray(stored) ? [...new Set(stored.map(String).filter((id) => getProduct(id)))] : [];
    } catch {
      return [];
    }
  }

  function saveWishlist(ids) {
    try {
      localStorage.setItem(CONFIG.wishlistKey, JSON.stringify([...new Set(ids)]));
    } catch {
      showToast("Wishlist storage is unavailable in this browser.");
    }
    renderWishlist();
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart));
    } catch {
      showToast("Bag storage is unavailable in this browser.");
    }
    renderCart();
    // Update product list buttons to reflect current cart state
    updateProductButtons();
  }

  function addToCart(id, quantity = 1) {
    const product = getProduct(id);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.quantity += quantity;
    else cart.push({ id, quantity });
    saveCart(cart);
    showToast(`${product.name} added to your bag.`);
    // Immediately reflect new state in UI
    updateProductButtons();
  }

  function updateCartItem(id, quantity) {
    const cart = getCart().map((item) => item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item).filter((item) => item.quantity > 0);
    saveCart(cart);
    // reflect changes
    updateProductButtons();
  }

  // Update add-to-cart buttons across product lists and product detail to reflect cart state
  function updateProductButtons() {
    try {
      const cartIds = getCart().map((i) => i.id);
      selectAll("[data-add-to-cart]").forEach((btn) => {
        const id = btn.dataset.addToCart;
        if (cartIds.includes(id)) {
          btn.disabled = true;
          btn.classList.add("is-added");
          btn.setAttribute("aria-pressed", "true");
          btn.innerHTML = `Added <span>✓</span>`;
        } else {
          btn.disabled = false;
          btn.classList.remove("is-added");
          btn.removeAttribute("aria-pressed");
          btn.innerHTML = `Add to bag <span>+</span>`;
        }
      });
      selectAll("[data-detail-cart]").forEach((btn) => {
        const id = btn.dataset.detailCart;
        if (cartIds.includes(id)) {
          btn.disabled = true;
          btn.classList.add("is-added");
          btn.innerHTML = `Added <span>✓</span>`;
        } else {
          btn.disabled = false;
          btn.classList.remove("is-added");
          btn.innerHTML = `Add to bag <span>+</span>`;
        }
      });
    } catch (e) { /* safety */ }
  }

  function renderCart() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => {
      const product = getProduct(item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
    selectAll(".cart-count").forEach((badge) => { badge.textContent = totalItems; });
    selectAll("[data-cart-total]").forEach((total) => { total.textContent = currency(totalPrice); });
    const itemsContainer = select("[data-cart-items]");
    if (!itemsContainer) return;
    if (!cart.length) {
      itemsContainer.innerHTML = `<div class="cart-drawer__empty"><p>Your bag is waiting for something beautiful.</p><a class="text-link" href="shop.html">Explore the collection <span>→</span></a></div>`;
      return;
    }
    itemsContainer.innerHTML = cart.map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `<article class="cart-item"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" /><div><h3>${escapeHtml(product.name)}</h3><p>${currency(product.price)}</p><div class="cart-item__qty"><button type="button" data-cart-decrease="${product.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-increase="${product.id}" aria-label="Increase quantity">+</button></div></div><button class="cart-item__remove" type="button" data-cart-remove="${product.id}" aria-label="Remove ${escapeHtml(product.name)}">×</button></article>`;
    }).join("");
  }

  function toggleCart(isOpen) {
    const drawer = select("[data-cart-drawer]");
    drawer?.classList.toggle("is-open", isOpen);
    drawer?.setAttribute("aria-hidden", String(!isOpen));
    select(".drawer-overlay")?.classList.toggle("is-open", isOpen);
    selectAll("[data-cart-open]").forEach((button) => {
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute("aria-label", isOpen ? "Close shopping cart" : "Open shopping cart");
    });
    document.body.classList.toggle("no-scroll", isOpen);
  }

  function buildWhatsAppMessage(items) {
    const lines = ["Hello VINVERTH EYEWEAR,", "", "I would like to buy:", ""];
    items.forEach((item) => {
      const product = getProduct(item.id);
      if (!product) return;
      lines.push(`Product: ${product.name}`);
      lines.push(`Product ID: ${product.id}`);
      lines.push(`Category: ${product.category}`);
      lines.push(`Price: ${currency(product.price)}`);
      lines.push(`Quantity: ${item.quantity}`);
      lines.push(`Image: ${product.image}`);
      lines.push(`Product page: ${window.location.origin}/product.html?id=${product.id}`);
      lines.push("");
    });
    lines.push("Please share availability and delivery details. Thank you!");
    return lines.join("\n");
  }

  function openWhatsApp(items) {
    if (!items.length) {
      showToast("Add a frame to your bag first.");
      return;
    }
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(items))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function initBranding() {
    selectAll("img[alt='VINVERTH Eyewear logo'], img[alt='VINVERTH Eyewear']").forEach((image) => {
      image.src = CONFIG.logoUrl;
      image.decoding = "async";
    });
  }

  function initContactEmail() {
    selectAll(".site-footer p, .contact-detail strong").forEach((element) => {
      if (element.textContent.includes("support@vinverth.com")) element.textContent = element.textContent.replace("support@vinverth.com", CONFIG.contactEmail);
    });
    selectAll("a[href^='mailto:']").forEach((link) => { link.href = `mailto:${CONFIG.contactEmail}`; });
    selectAll(".site-footer p").forEach((element) => {
      if (/^Mon\s*[–-]\s*Sat:|\+971\s*56\s*574\s*1398/i.test(element.textContent.trim())) element.remove();
    });
  }

  function initFooterSocials() {
    selectAll(".socials").forEach((socials) => {
      socials.innerHTML = `<a href="${CONFIG.instagramUrl}" target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a><a href="mailto:${CONFIG.contactEmail}" aria-label="Email">Email</a>`;
    });
  }

  // ---------- Intro and navigation ----------
  function initNavigation() {
    const header = select("#site-header");
    const menu = select("[data-mobile-menu]");
    const searchPanel = select("[data-search-panel]");
    const globalSearch = select("#global-search");
    const page = document.body.dataset.page;
    selectAll('.nav-actions a[aria-label="Account"]').forEach((link) => link.remove());
    selectAll(`[data-nav="${page}"]`).forEach((link) => link.classList.add("is-active"));
    const onScroll = () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 15);
      select("[data-back-top]")?.classList.toggle("is-visible", window.scrollY > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const menuToggle = select("[data-menu-toggle]");
    const searchToggle = select("[data-search-toggle]");
    const cartDrawer = select("[data-cart-drawer]");
    if (menu) menu.id = menu.id || "mobile-menu";
    if (searchPanel) searchPanel.id = searchPanel.id || "global-search-panel";
    if (cartDrawer) {
      cartDrawer.id = cartDrawer.id || "cart-drawer";
      cartDrawer.setAttribute("role", "dialog");
      cartDrawer.setAttribute("aria-modal", "true");
    }
    menuToggle?.setAttribute("aria-controls", menu?.id || "mobile-menu");
    menuToggle?.setAttribute("aria-expanded", "false");
    searchToggle?.setAttribute("aria-controls", searchPanel?.id || "global-search-panel");
    searchToggle?.setAttribute("aria-expanded", "false");
    selectAll("[data-cart-open]").forEach((button) => {
      button.setAttribute("aria-controls", cartDrawer?.id || "cart-drawer");
      button.setAttribute("aria-expanded", "false");
    });
    selectAll("[data-cart-close]").forEach((button) => {
      if (button.tagName === "BUTTON" && !button.getAttribute("aria-label")) button.setAttribute("aria-label", "Close cart");
    });
    selectAll(".nav-link--button").forEach((button) => {
      button.setAttribute("aria-haspopup", "true");
      button.setAttribute("aria-expanded", "false");
    });
    menuToggle?.addEventListener("click", () => {
      const isOpen = menu?.classList.toggle("is-open") || false;
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    selectAll("[data-mobile-menu] a").forEach((link) => link.addEventListener("click", () => {
      menu?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", "Open menu");
    }));
    searchToggle?.addEventListener("click", () => {
      const isOpen = searchPanel?.classList.toggle("is-open") || false;
      searchToggle.setAttribute("aria-expanded", String(isOpen));
      searchToggle.setAttribute("aria-label", isOpen ? "Close search" : "Search");
      if (searchPanel?.classList.contains("is-open")) globalSearch?.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      menu?.classList.remove("is-open");
      searchPanel?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", "Open menu");
      searchToggle?.setAttribute("aria-expanded", "false");
      searchToggle?.setAttribute("aria-label", "Search");
      toggleCart(false);
    });
    globalSearch?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && globalSearch.value.trim()) window.location.href = `shop.html?search=${encodeURIComponent(globalSearch.value.trim())}`;
    });
    select("[data-back-top]")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function initContactLinks() {
    const contactInfo = select(".contact-info");
    if (!contactInfo || select(".contact-socials", contactInfo)) return;
    selectAll(".contact-detail strong", contactInfo).forEach((element) => {
      if (element.textContent.trim() === "@vinverth.eyewear") element.textContent = "@vinverth.uae";
    });
    const links = document.createElement("div");
    links.className = "contact-socials";
    links.setAttribute("aria-label", "Contact links");
    links.innerHTML = `<a href="${CONFIG.instagramUrl}" target="_blank" rel="noreferrer" aria-label="Instagram"><span aria-hidden="true">◎</span></a><a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noreferrer" aria-label="WhatsApp"><span aria-hidden="true">◉</span></a><a href="mailto:${CONFIG.contactEmail}" aria-label="Email"><span aria-hidden="true">✉</span></a>`;
    contactInfo.appendChild(links);
  }

  function initSeo() {
    const description = select("meta[name='description']")?.content || "Premium VINVERTH eyewear for everyday extraordinary.";
    const canonicalUrl = new URL(window.location.href);
    canonicalUrl.search = "";
    canonicalUrl.hash = "";
    if (window.location.pathname.endsWith("/product.html") || window.location.pathname.endsWith("product.html")) {
      const productId = new URLSearchParams(window.location.search).get("id");
      if (productId) canonicalUrl.searchParams.set("id", productId);
    }
    let canonical = select("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl.href;
    const metaTags = {
      "og:type": "website",
      "og:title": document.title,
      "og:description": description,
      "og:url": canonicalUrl.href,
      "og:image": CONFIG.logoUrl,
      "twitter:card": "summary",
      "twitter:title": document.title,
      "twitter:description": description,
      "twitter:image": CONFIG.logoUrl
    };
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = select(`meta[property='${name}'], meta[name='${name}']`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(name.startsWith("og:") ? "property" : "name", name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
    let themeColor = select("meta[name='theme-color']");
    if (!themeColor) {
      themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      document.head.appendChild(themeColor);
    }
    themeColor.content = "#faf9f7";
  }

  // ---------- Soft scroll reveal ----------
  function initScrollReveal() {
    const revealTargets = selectAll(".section-pad, .collections, .story, .contact-strip, .blog-strip, .newsletter, .site-footer, .page-hero, .about-intro, .about-image, .values, .contact-section");
    revealTargets.forEach((element) => element.classList.add("reveal"));
    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element) => observer.observe(element));
  }

  // ---------- Homepage hero ----------
  function initHero() {
    const hero = select(".hero");
    if (!hero) return;
    const slides = selectAll(".hero-slide", hero);
    const numberButtons = selectAll("[data-slide]", hero);
    let activeIndex = 0;
    let timer;
    const themeFallbacks = ["#a8c1d3", "#ead7ca", "#d5c5b2", "#c4d0d7", "#e6d5ce"];
    const setTheme = (slide, index) => {
      const fallback = slide.dataset.theme || themeFallbacks[index] || themeFallbacks[0];
      document.documentElement.style.setProperty("--accent-color", fallback);
      document.documentElement.style.setProperty("--soft-color", `${fallback}42`);
      const imageSource = slide.dataset.image;
      if (!imageSource) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, 1, 1);
          const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
          if (red + green + blue > 80) document.documentElement.style.setProperty("--accent-color", `rgb(${red}, ${green}, ${blue})`);
        } catch { /* External image CORS is optional; the slide fallback remains active. */ }
      };
      image.src = imageSource;
    };
    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeIndex));
      numberButtons.forEach((button, buttonIndex) => button.classList.toggle("is-active", buttonIndex === activeIndex));
      setTheme(slides[activeIndex], activeIndex);
      slides.forEach((slide, slideIndex) => {
        const video = select(".hero-slide__video", slide);
        if (!video) return;
        if (slideIndex === activeIndex && !document.hidden) {
          const playback = video.play();
          playback?.catch(() => {});
        } else video.pause();
      });
    };
    const restartTimer = () => {
      window.clearInterval(timer);
      if (activeIndex === 0) return;
      timer = window.setInterval(() => {
        showSlide(activeIndex + 1);
        if (activeIndex === 0) restartTimer();
      }, 6200);
    };
    numberButtons.forEach((button) => button.addEventListener("click", () => { showSlide(Number(button.dataset.slide)); restartTimer(); }));
    select("[data-hero-prev]")?.addEventListener("click", () => { showSlide(activeIndex - 1); restartTimer(); });
    select("[data-hero-next]")?.addEventListener("click", () => { showSlide(activeIndex + 1); restartTimer(); });
    hero.addEventListener("mouseenter", () => window.clearInterval(timer));
    hero.addEventListener("mouseleave", restartTimer);
    document.addEventListener("visibilitychange", () => showSlide(activeIndex));
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showSlide(activeIndex - 1);
      if (event.key === "ArrowRight") showSlide(activeIndex + 1);
    });
    showSlide(0);
    restartTimer();
  }

  // ---------- Product rendering ----------
  function productCard(product) {
    const isWishlisted = getWishlist().includes(product.id);
    const inCart = getCart().some((c) => c.id === product.id);
    const addButton = inCart
      ? `<button class="button is-added" disabled aria-pressed="true">Added <span>✓</span></button>`
      : `<button class="button button--dark" type="button" data-add-to-cart="${product.id}">Add to bag <span>+</span></button>`;
    return `<article class="product-card"><a class="product-card__image" href="product.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" /><span class="product-card__badge" ${product.badge ? "" : "hidden"}>${escapeHtml(product.badge)}</span></a><button class="product-card__wish${isWishlisted ? " is-wishlisted" : ""}" type="button" data-wishlist="${product.id}" aria-label="${isWishlisted ? "Remove" : "Add"} ${escapeHtml(product.name)} ${isWishlisted ? "from" : "to"} wishlist"><span class="heart-icon" aria-hidden="true">${isWishlisted ? "♥" : "♡"}</span></button><div class="product-card__body"><a href="product.html?id=${encodeURIComponent(product.id)}"><h3>${escapeHtml(product.name)}</h3></a><p>${escapeHtml(product.category)} · ${escapeHtml(product.gender)}</p><div class="product-card__price"><span>${currency(product.price)}</span>${product.oldPrice ? `<del class="product-card__old">${currency(product.oldPrice)}</del>` : ""}</div><div class="product-card__actions">${addButton}<button class="button button--outline" type="button" data-buy-now="${product.id}">Buy <span>→</span></button></div></div></article>`;
  }

  function renderProducts(container, collection) {
    if (!container) return;
    container.innerHTML = collection.map(productCard).join("");
  }

  function renderWishlist() {
    const grid = select("[data-wishlist-grid]");
    if (!grid) return;
    const wishlistProducts = getWishlist().map(getProduct).filter(Boolean);
    renderProducts(grid, wishlistProducts);
    const empty = select("[data-wishlist-empty]");
    if (empty) empty.hidden = wishlistProducts.length > 0;
    const count = select("[data-wishlist-count]");
    if (count) count.textContent = `${wishlistProducts.length} saved frame${wishlistProducts.length === 1 ? "" : "s"}`;
  }

  function initWishlistNavigation() {
    selectAll(".desktop-nav, .mobile-menu__links").forEach((navigation) => {
      if (select("[data-wishlist-nav]", navigation)) return;
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = "wishlist.html";
      link.dataset.nav = "wishlist";
      link.dataset.wishlistNav = "true";
      link.textContent = "♡ Wishlist";
      navigation.appendChild(link);
    });
    if (document.body.dataset.page === "wishlist") selectAll("[data-wishlist-nav]").forEach((link) => link.classList.add("is-active"));
  }

  function initHome() {
    renderProducts(select("#home-products"), window.VinverthProducts?.featured || []);
    const reviews = [
      { quote: "Best quality and super comfortable. Exactly what I was looking for!", name: "Arjun P.", city: "Bengaluru" },
      { quote: "Absolutely love the design and fit. Perfect for everyday use.", name: "Neha S.", city: "Mumbai" },
      { quote: "Stylish, lightweight and worth every penny. Highly recommend!", name: "Rohit M.", city: "Kochi" }
    ];
    const reviewGrid = select("#review-grid");
    if (reviewGrid) reviewGrid.innerHTML = reviews.map((review) => `<article class="review-card"><div class="review-card__stars">★★★★★</div><blockquote>“${escapeHtml(review.quote)}”</blockquote><div class="review-card__person"><span class="review-card__avatar">${escapeHtml(review.name[0])}</span><div><strong>— ${escapeHtml(review.name)}</strong><span>${escapeHtml(review.city)}</span></div></div></article>`).join("");
  }

  // ---------- Shop filters ----------
  function initShop() {
    const grid = select("#shop-products");
    if (!grid) return;
    const params = new URLSearchParams(window.location.search);
    const searchInput = select("[data-product-search]");
    const count = select("[data-product-count]");
    const empty = select("[data-empty-state]");
    const state = { search: params.get("search") || "", category: params.get("category") || "all", gender: params.get("gender") || "all" };
    if (searchInput) searchInput.value = state.search;
    selectAll("input[name='gender']").forEach((input) => { input.checked = input.value.toLowerCase() === state.gender.toLowerCase(); });
    const activeRadio = (name) => select(`input[name='${name}']:checked`)?.value || "all";
    const renderShop = () => {
      state.search = searchInput?.value.trim().toLowerCase() || "";
      state.gender = activeRadio("gender");
      let result = products.filter((product) => {
        const matchesSearch = !state.search || `${product.name} ${product.category} ${product.gender}`.toLowerCase().includes(state.search);
        const matchesCategory = state.category === "all" || product.category === state.category;
        const matchesGender = state.gender === "all" || product.gender === state.gender;
        return matchesSearch && matchesCategory && matchesGender;
      });
      renderProducts(grid, result);
      if (count) count.textContent = `${result.length} product${result.length === 1 ? "" : "s"}`;
      if (empty) empty.hidden = result.length > 0;
    };
    searchInput?.addEventListener("input", renderShop);
    selectAll(".filters input").forEach((input) => input.addEventListener("change", renderShop));
    select("[data-clear-filters]")?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      state.category = "all";
      selectAll("input[name='gender']").forEach((input) => { input.checked = input.value === "all"; });
      renderShop();
    });
    select("[data-filter-toggle]")?.addEventListener("click", () => select("[data-filters]")?.classList.add("is-open"));
    select("[data-filter-close]")?.addEventListener("click", () => select("[data-filters]")?.classList.remove("is-open"));
    renderShop();
  }

  // ---------- Product detail ----------
  function initProductDetail() {
    const container = select("[data-product-detail]");
    if (!container) return;
    const requestedId = new URLSearchParams(window.location.search).get("id");
    const product = getProduct(requestedId) || (!requestedId ? products[0] : null);
    if (!product) {
      document.title = "Frame not found — VINVERTH Eyewear";
      container.innerHTML = `<div class="empty-state"><h1>Frame not found.</h1><p>That product may have moved or is no longer available.</p><a class="button button--dark" href="shop.html">Browse the collection <span>→</span></a></div>`;
      return;
    }
    document.title = `${product.name} — VINVERTH Eyewear`;
    select("meta[name='description']")?.setAttribute("content", `${product.name}: ${product.description} Shop VINVERTH eyewear online.`);
    const breadcrumb = select("[data-detail-breadcrumb]");
    if (breadcrumb) breadcrumb.textContent = product.name;
    const inCart = getCart().some((c) => c.id === product.id);
    const detailAdd = inCart
      ? `<button class="button is-added" disabled data-detail-cart="${product.id}">Added <span>✓</span></button>`
      : `<button class="button button--dark" type="button" data-detail-cart="${product.id}">Add to bag <span>+</span></button>`;
    container.innerHTML = `<div class="product-detail__media"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="eager" decoding="async" /></div><div class="product-detail__content"><p class="eyebrow">${escapeHtml(product.category)} · ${escapeHtml(product.gender)}</p><h1>${escapeHtml(product.name)}</h1><div class="product-detail__price"><span>${currency(product.price)}</span>${product.oldPrice ? `<del>${currency(product.oldPrice)}</del>` : ""}</div><p class="product-detail__description">${escapeHtml(product.description)}</p><div class="product-detail__buttons"><div class="quantity"><button type="button" data-qty="decrease" aria-label="Decrease quantity">−</button><input value="1" min="1" max="10" type="number" data-detail-quantity aria-label="Quantity" /><button type="button" data-qty="increase" aria-label="Increase quantity">+</button></div>${detailAdd}<button class="button button--blue" type="button" data-detail-buy="${product.id}">Buy on WhatsApp <span>→</span></button></div></div>`;
    const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
    renderProducts(select("#related-products"), related);
  }

  // ---------- EmailJS forms ----------
  function initForms() {
    if (window.emailjs) window.emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
    const sendEmail = async (templateParams) => {
      if (window.emailjs) {
        await window.emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, templateParams, CONFIG.emailjs.publicKey);
        return;
      }
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: CONFIG.emailjs.serviceId, template_id: CONFIG.emailjs.templateId, user_id: CONFIG.emailjs.publicKey, template_params: templateParams })
      });
      if (!response.ok) throw new Error(`EmailJS request failed: ${response.status}`);
    };
    const sendForm = async (form, type) => {
      const message = select(".form-message", form);
      const submit = select("button[type='submit']", form);
      submit.disabled = true;
      if (message) message.textContent = "Sending...";
      try {
        const templateParams = type === "contact"
          ? {
              full_name: select("#fullName", form)?.value.trim() || "",
              email: select("#email", form)?.value.trim() || "",
              inquiry: select("#inquiry", form)?.value.trim() || ""
            }
          : { email: select("#newsletter-email", form)?.value.trim() || "" };
        await sendEmail(templateParams);
        form.reset();
        if (message) message.textContent = type === "newsletter" ? "You're on the list. Welcome in." : "Message sent. We will get back to you soon.";
        showMailPopup(type === "newsletter" ? "You're on the list." : "Message sent successfully.");
      } catch {
        if (message) message.textContent = "Could not connect right now. Please WhatsApp us instead.";
      } finally {
        submit.disabled = false;
      }
    };
    select("#newsletter-form")?.addEventListener("submit", (event) => { event.preventDefault(); sendForm(event.currentTarget, "newsletter"); });
    select("#contact-form")?.addEventListener("submit", (event) => { event.preventDefault(); sendForm(event.currentTarget, "contact"); });
  }

  // ---------- Delegated interactions ----------
  function initDelegatedInteractions() {
    document.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add-to-cart]");
      if (addButton) { addToCart(addButton.dataset.addToCart); return; }
      const buyButton = event.target.closest("[data-buy-now]");
      if (buyButton) { openWhatsApp([{ id: buyButton.dataset.buyNow, quantity: 1 }]); return; }
      const wishlist = event.target.closest("[data-wishlist]");
      if (wishlist) { event.preventDefault(); const id = wishlist.dataset.wishlist; const saved = getWishlist(); const isAdded = !saved.includes(id); saveWishlist(isAdded ? [...saved, id] : saved.filter((savedId) => savedId !== id)); wishlist.classList.toggle("is-wishlisted", isAdded); wishlist.setAttribute("aria-label", `${isAdded ? "Remove" : "Add"} product ${isAdded ? "from" : "to"} wishlist`); const heart = wishlist.querySelector(".heart-icon"); if (heart) heart.textContent = isAdded ? "♥" : "♡"; showToast(isAdded ? "Added to wishlist." : "Removed from wishlist."); return; }
      if (event.target.closest("[data-cart-open]")) { toggleCart(true); return; }
      if (event.target.closest("[data-cart-close]")) { toggleCart(false); return; }
      const increase = event.target.closest("[data-cart-increase]");
      if (increase) { const item = getCart().find((cartItem) => cartItem.id === increase.dataset.cartIncrease); if (item) updateCartItem(item.id, item.quantity + 1); return; }
      const decrease = event.target.closest("[data-cart-decrease]");
      if (decrease) { const item = getCart().find((cartItem) => cartItem.id === decrease.dataset.cartDecrease); if (item) updateCartItem(item.id, item.quantity - 1); return; }
      const remove = event.target.closest("[data-cart-remove]");
      if (remove) { updateCartItem(remove.dataset.cartRemove, 0); showToast("Removed from your bag."); return; }
      if (event.target.closest("[data-cart-whatsapp]")) { openWhatsApp(getCart()); return; }
      const detailCart = event.target.closest("[data-detail-cart]");
      if (detailCart) { addToCart(detailCart.dataset.detailCart, Number(select("[data-detail-quantity]")?.value || 1)); return; }
      const detailBuy = event.target.closest("[data-detail-buy]");
      if (detailBuy) { openWhatsApp([{ id: detailBuy.dataset.detailBuy, quantity: Number(select("[data-detail-quantity]")?.value || 1) }]); return; }
      const quantityButton = event.target.closest("[data-qty]");
      if (quantityButton) { const input = select("[data-detail-quantity]"); if (input) input.value = Math.max(1, Math.min(10, Number(input.value || 1) + (quantityButton.dataset.qty === "increase" ? 1 : -1))); }
    });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    initBranding();
    initContactEmail();
    initFooterSocials();
    initNavigation();
    initContactLinks();
    initWishlistNavigation();
    initScrollReveal();
    initHero();
    initHome();
    initShop();
    initProductDetail();
    initSeo();
    renderWishlist();
    initForms();
    initDelegatedInteractions();
    renderCart();
    // ensure product buttons match saved cart on load
    updateProductButtons();
  });
})();
