import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function ProductCard({ product }) {
  const {
    currency,
    addToCart,
    toggleWishlist,
    isInCart,
    isWishlisted,
    checkoutWhatsApp
  } = useStore();

  if (!product) return null;

  const inCart = isInCart(product.id);
  const saved = isWishlisted(product.id);
  const linkParam = encodeURIComponent(product.id || product.slug || product.sku || product.rawId);

  return (
    <article className="product-card">
      <Link className="product-card__image" to={`/product/${linkParam}`}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
        {product.badge ? (
          <span className="product-card__badge">{product.badge}</span>
        ) : null}
      </Link>

      <button
        className={`product-card__wish ${saved ? "is-wishlisted" : ""}`}
        type="button"
        data-wishlist={product.id}
        aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${
          saved ? "from" : "to"
        } wishlist`}
        onClick={() => toggleWishlist(product.id)}
      >
        <span className="heart-icon" aria-hidden="true">
          {saved ? "♥" : "♡"}
        </span>
      </button>

      <div className="product-card__body">
        <Link to={`/product/${linkParam}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>
          {product.category} · {product.gender}
        </p>

        <div className="product-card__price">
          <span>{currency(product.price)}</span>
          {product.oldPrice ? (
            <del className="product-card__old">{currency(product.oldPrice)}</del>
          ) : null}
        </div>

        <div className="product-card__actions">
          {inCart ? (
            <button className="button is-added" disabled aria-pressed="true">
              Added <span>✓</span>
            </button>
          ) : (
            <button
              className="button button--dark"
              type="button"
              data-add-to-cart={product.id}
              onClick={() => addToCart(product.id, 1)}
            >
              Add to bag <span>+</span>
            </button>
          )}

          <button
            className="button button--outline"
            type="button"
            data-buy-now={product.id}
            onClick={() => checkoutWhatsApp([{ id: product.id, quantity: 1 }])}
          >
            Buy <span>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
