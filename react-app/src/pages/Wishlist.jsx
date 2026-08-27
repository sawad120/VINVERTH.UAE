import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlist, getProduct } = useStore();

  const savedProducts = wishlist
    .map((id) => getProduct(id))
    .filter(Boolean);

  return (
    <>
      <Helmet>
        <title>Wishlist — VINVERTH Eyewear</title>
        <meta
          name="description"
          content="Your saved frames — VINVERTH wishlist."
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Saved frames</p>
          <h1>Your wishlist</h1>
          <p data-wishlist-count>
            {savedProducts.length} saved frame
            {savedProducts.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          {savedProducts.length > 0 ? (
            <div className="product-grid" data-wishlist-grid>
              {savedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state" data-wishlist-empty>
              <span>♡</span>
              <h2>Your wishlist is empty</h2>
              <p>Save frames to your wishlist to view them here later.</p>
              <Link className="text-link" to="/shop">
                Continue shopping <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
