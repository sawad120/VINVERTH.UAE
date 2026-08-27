import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loadProducts,
  loadSettings,
  DEFAULT_CONFIG,
  IMAGE_PLACEHOLDER
} from "../services/catalogue";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(DEFAULT_CONFIG.storageKey) || "[]");
      return Array.isArray(stored)
        ? stored.map((item) => ({
            id: String(item?.id || ""),
            quantity: Math.max(1, Math.min(10, Math.floor(Number(item?.quantity) || 1)))
          }))
        : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(DEFAULT_CONFIG.wishlistKey) || "[]");
      return Array.isArray(stored) ? [...new Set(stored.map(String))] : [];
    } catch {
      return [];
    }
  });

  // Drawer and UI states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [mailPopup, setMailPopup] = useState(null);

  // Hydrate storefront data
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const [loadedProducts, loadedSettings] = await Promise.all([
          loadProducts(),
          loadSettings()
        ]);
        if (!mounted) return;

        if (Array.isArray(loadedProducts) && loadedProducts.length > 0) {
          setProducts(loadedProducts);
        }

        if (loadedSettings) {
          setConfig((prev) => ({
            ...prev,
            whatsappNumber: loadedSettings.whatsapp_number || prev.whatsappNumber,
            contactEmail: loadedSettings.support_email || prev.contactEmail,
            instagramUrl: loadedSettings.instagram_url || prev.instagramUrl,
            logoUrl: loadedSettings.logo_url || prev.logoUrl
          }));
        }
      } catch (err) {
        console.error("Store hydration error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(cart));
    } catch (e) {
      console.warn("Storage unavailable", e);
    }
  }, [cart, config.storageKey]);

  // Save wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(config.wishlistKey, JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Storage unavailable", e);
    }
  }, [wishlist, config.wishlistKey]);

  // Handle body scroll when cart or mobile menu is open
  useEffect(() => {
    if (isCartOpen || isMenuOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [isCartOpen, isMenuOpen]);

  // ESC key listener for overlays
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const showPopup = useCallback((msg) => {
    setMailPopup(msg);
  }, []);

  const hidePopup = useCallback(() => {
    setMailPopup(null);
  }, []);

  const currency = useCallback((value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }, []);

  const getProduct = useCallback(
    (id) => {
      const normalizedId = String(id || "").toLowerCase().trim();
      if (!normalizedId) return null;
      return (
        products.find(
          (product) =>
            String(product.id || "").toLowerCase() === normalizedId ||
            String(product.rawId || "").toLowerCase() === normalizedId ||
            String(product.sku || "").toLowerCase() === normalizedId ||
            String(product.slug || "").toLowerCase() === normalizedId ||
            String(product.name || "").toLowerCase() === normalizedId
        ) || null
      );
    },
    [products]
  );

  const addToCart = useCallback(
    (id, quantity = 1) => {
      const product = getProduct(id);
      if (!product) return;

      setCart((prev) => {
        const existing = prev.find((item) => item.id === String(id));
        if (existing) {
          return prev.map((item) =>
            item.id === String(id)
              ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
              : item
          );
        }
        return [...prev, { id: String(id), quantity }];
      });

      showToast(`${product.name} added to your bag.`);
    },
    [getProduct, showToast]
  );

  const updateCartItem = useCallback((id, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== String(id));
      }
      return prev.map((item) =>
        item.id === String(id)
          ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) }
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback(
    (id) => {
      const product = getProduct(id);
      setCart((prev) => prev.filter((item) => item.id !== String(id)));
      showToast(
        product ? `Removed ${product.name} from your bag.` : "Removed from your bag."
      );
    },
    [getProduct, showToast]
  );

  const toggleWishlist = useCallback(
    (id) => {
      const stringId = String(id);
      const isSaved = wishlist.includes(stringId);
      if (isSaved) {
        setWishlist((prev) => prev.filter((item) => item !== stringId));
        showToast("Removed from wishlist.");
      } else {
        setWishlist((prev) => [...prev, stringId]);
        showToast("Added to wishlist.");
      }
    },
    [wishlist, showToast]
  );

  const isInCart = useCallback(
    (id) => {
      const stringId = String(id).toLowerCase();
      const product = getProduct(id);
      const sku = product?.sku ? String(product.sku).toLowerCase() : "";
      return cart.some(
        (c) =>
          String(c.id).toLowerCase() === stringId ||
          (sku && String(c.id).toLowerCase() === sku)
      );
    },
    [cart, getProduct]
  );

  const isWishlisted = useCallback(
    (id) => {
      const stringId = String(id).toLowerCase();
      const product = getProduct(id);
      const sku = product?.sku ? String(product.sku).toLowerCase() : "";
      return wishlist.some(
        (w) =>
          String(w).toLowerCase() === stringId ||
          (sku && String(w).toLowerCase() === sku)
      );
    },
    [wishlist, getProduct]
  );

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const totalCartPrice = cart.reduce((total, item) => {
    const product = getProduct(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const buildWhatsAppMessage = useCallback(
    (items) => {
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
        lines.push(
          `Product page: ${window.location.origin}/product/${encodeURIComponent(
            product.id
          )}`
        );
        lines.push("");
      });
      lines.push("Please share availability and delivery details. Thank you!");
      return lines.join("\n");
    },
    [getProduct, currency]
  );

  const checkoutWhatsApp = useCallback(
    (items = cart) => {
      if (!items.length) {
        showToast("Add a frame to your bag first.");
        return;
      }
      const text = buildWhatsAppMessage(items);
      const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [cart, config.whatsappNumber, buildWhatsAppMessage, showToast]
  );

  return (
    <StoreContext.Provider
      value={{
        config,
        products,
        setProducts,
        loading,
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isMenuOpen,
        setIsMenuOpen,
        toastMessage,
        showToast,
        hideToast,
        mailPopup,
        showPopup,
        hidePopup,
        currency,
        getProduct,
        addToCart,
        updateCartItem,
        removeFromCart,
        toggleWishlist,
        isInCart,
        isWishlisted,
        totalCartCount,
        totalCartPrice,
        checkoutWhatsApp
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
