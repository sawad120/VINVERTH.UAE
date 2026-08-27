import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Header() {
  const {
    config,
    totalCartCount,
    setIsCartOpen,
    isSearchOpen,
    setIsSearchOpen,
    isMenuOpen,
    setIsMenuOpen
  } = useStore();

  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isCurrent = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`site-header ${isScrolled ? "is-scrolled" : ""}`}
      id="site-header"
    >
      <div className="container nav-wrap">
        <Link className="brand" to="/" aria-label="VINVERTH home">
          <img
            src={config.logoUrl}
            alt="VINVERTH Eyewear logo"
            decoding="async"
          />
          <span className="brand-text">VINVERTH</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link
            className={`nav-link ${isCurrent("/") ? "is-active" : ""}`}
            data-nav="home"
            to="/"
          >
            Home
          </Link>
          <Link
            className={`nav-link ${isCurrent("/shop") ? "is-active" : ""}`}
            data-nav="shop"
            to="/shop"
          >
            Shop
          </Link>
          <div className="nav-dropdown">
            <button
              className="nav-link nav-link--button"
              type="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Collections <span>⌄</span>
            </button>
            <div className="dropdown-menu">
              <Link to="/shop?gender=Men">Men's Collection</Link>
              <Link to="/shop?gender=Women">Women's Collection</Link>
              <Link to="/shop?category=Sunglasses">Sunglasses</Link>
              <Link to="/shop?category=Optical">Optical Frames</Link>
            </div>
          </div>
          <Link
            className={`nav-link ${isCurrent("/about") ? "is-active" : ""}`}
            data-nav="about"
            to="/about"
          >
            About
          </Link>
          <Link
            className={`nav-link ${isCurrent("/contact") ? "is-active" : ""}`}
            data-nav="contact"
            to="/contact"
          >
            Contact
          </Link>
          <Link
            className={`nav-link ${isCurrent("/wishlist") ? "is-active" : ""}`}
            data-nav="wishlist"
            to="/wishlist"
          >
            ♡ Wishlist
          </Link>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            type="button"
            data-search-toggle
            aria-label={isSearchOpen ? "Close search" : "Search"}
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen((prev) => !prev)}
          >
            ⌕
          </button>
          <Link
            className="icon-button"
            to="/contact"
            aria-label="Contact"
            title="Contact"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: "block" }}
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <button
            className="icon-button cart-trigger"
            type="button"
            data-cart-open
            aria-label="Open shopping cart"
            onClick={() => setIsCartOpen(true)}
          >
            ♧
            <b className="cart-count">{totalCartCount}</b>
          </button>
          <button
            className="menu-toggle"
            type="button"
            data-menu-toggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
