import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Footer() {
  const { config } = useStore();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img
            src={config.logoUrl}
            alt="VINVERTH Eyewear"
            decoding="async"
          />
          <p>
            Simple frames for clear days.
            <br />
            See beyond. Live beyond.
          </p>
          <div className="socials">
            <a
              href={config.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a href={`mailto:${config.contactEmail}`} aria-label="Email">
              Email
            </a>
          </div>
        </div>

        <div>
          <h3>Quick links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div>
          <h3>Customer service</h3>
          <Link to="/policies#shipping">Shipping policy</Link>
          <Link to="/policies#returns">Return policy</Link>
          <Link to="/policies">Privacy & policies</Link>
        </div>

        <div>
          <h3>Help & support</h3>
          <p>✉ {config.contactEmail}</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 VINVERTH Eyewear. All rights reserved.</span>
        <span>Visa &nbsp; Mastercard &nbsp; UPI &nbsp; RuPay</span>
      </div>
    </footer>
  );
}
