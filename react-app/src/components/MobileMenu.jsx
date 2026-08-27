import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function MobileMenu() {
  const { isMenuOpen, setIsMenuOpen } = useStore();

  const close = () => setIsMenuOpen(false);

  return (
    <div
      className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}
      data-mobile-menu
      id="mobile-menu"
    >
      <div className="mobile-menu__links">
        <Link to="/" onClick={close}>
          Home
        </Link>
        <Link to="/shop" onClick={close}>
          Shop
        </Link>
        <Link to="/about" onClick={close}>
          About
        </Link>
        <Link to="/contact" onClick={close}>
          Contact
        </Link>
        <Link to="/wishlist" onClick={close}>
          ♡ Wishlist
        </Link>
        <Link to="/policies" onClick={close}>
          Policies
        </Link>
      </div>
      <p>Premium eyewear for everyday extraordinary.</p>
    </div>
  );
}
