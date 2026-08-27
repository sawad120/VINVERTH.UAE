import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    getProduct,
    updateCartItem,
    removeFromCart,
    currency,
    totalCartPrice,
    checkoutWhatsApp
  } = useStore();

  const close = () => setIsCartOpen(false);

  return (
    <>
      <aside
        className={`cart-drawer ${isCartOpen ? "is-open" : ""}`}
        data-cart-drawer
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isCartOpen}
        aria-label="Shopping cart"
      >
        <div className="cart-drawer__head">
          <h2>Your bag</h2>
          <button
            type="button"
            data-cart-close
            aria-label="Close cart"
            onClick={close}
          >
            ×
          </button>
        </div>

        <div className="cart-drawer__items" data-cart-items>
          {cart.length === 0 ? (
            <div className="cart-drawer__empty">
              <p>Your bag is waiting for something beautiful.</p>
              <Link className="text-link" to="/shop" onClick={close}>
                Explore the collection <span>→</span>
              </Link>
            </div>
          ) : (
            cart.map((item) => {
              const product = getProduct(item.id);
              if (!product) return null;
              return (
                <article className="cart-item" key={item.id}>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3>{product.name}</h3>
                    <p>{currency(product.price)}</p>
                    <div className="cart-item__qty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateCartItem(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateCartItem(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-item__remove"
                    type="button"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => removeFromCart(item.id)}
                  >
                    ×
                  </button>
                </article>
              );
            })
          )}
        </div>

        <div className="cart-drawer__foot">
          <div>
            <span>Subtotal</span>
            <strong data-cart-total>{currency(totalCartPrice)}</strong>
          </div>
          <button
            className="button button--dark button--full"
            data-cart-whatsapp
            type="button"
            onClick={() => checkoutWhatsApp(cart)}
          >
            Checkout on WhatsApp <span>→</span>
          </button>
        </div>
      </aside>

      <div
        className={`drawer-overlay ${isCartOpen ? "is-open" : ""}`}
        data-cart-close
        onClick={close}
      ></div>
    </>
  );
}
