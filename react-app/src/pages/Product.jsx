import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "../context/StoreContext";
import { loadProductById } from "../services/catalogue";
import ProductCard from "../components/ProductCard";

export default function Product() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const targetId = routeId || queryId;

  const {
    products,
    getProduct,
    addToCart,
    isInCart,
    currency,
    checkoutWhatsApp
  } = useStore();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function resolve() {
      setLoading(true);
      const found = getProduct(targetId);
      if (found) {
        if (mounted) {
          setProduct(found);
          setLoading(false);
        }
        return;
      }

      if (targetId) {
        const fetched = await loadProductById(targetId, products);
        if (mounted) {
          setProduct(fetched);
          setLoading(false);
        }
      } else if (products.length > 0) {
        if (mounted) {
          setProduct(products[0]);
          setLoading(false);
        }
      } else {
        if (mounted) {
          setProduct(null);
          setLoading(false);
        }
      }
    }

    resolve();
    return () => {
      mounted = false;
    };
  }, [targetId, products, getProduct]);

  if (loading) {
    return (
      <section className="product-detail-section">
        <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
          <p>Loading frame details...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Frame not found — VINVERTH Eyewear</title>
        </Helmet>
        <section className="product-detail-section">
          <div className="container">
            <div className="empty-state">
              <h1>Frame not found.</h1>
              <p>That product may have moved or is no longer available.</p>
              <Link className="button button--dark" to="/shop">
                Browse the collection <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const inCart = isInCart(product.id);
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const fallbackRelated = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const finalRelated =
    relatedProducts.length > 0 ? relatedProducts : fallbackRelated;

  return (
    <>
      <Helmet>
        <title>{`${product.name} — VINVERTH Eyewear`}</title>
        <meta
          name="description"
          content={`${product.name}: ${
            product.description || "Premium VINVERTH eyewear frame."
          } Shop online.`}
        />
      </Helmet>

      <section className="product-detail-section">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <span data-detail-breadcrumb>{product.name}</span>
          </div>

          <div className="product-detail" data-product-detail>
            <div className="product-detail__media">
              <img
                src={product.image}
                alt={product.name}
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="product-detail__content">
              <p className="eyebrow">
                {product.category} · {product.gender}
              </p>
              <h1>{product.name}</h1>

              <div className="product-detail__price">
                <span>{currency(product.price)}</span>
                {product.oldPrice ? (
                  <del>{currency(product.oldPrice)}</del>
                ) : null}
              </div>

              <p className="product-detail__description">
                {product.description}
              </p>

              {(product.material ||
                product.uv ||
                product.size ||
                product.stock) && (
                <div className="detail-features">
                  {product.material ? (
                    <div>
                      <strong>Material</strong>
                      <span>{product.material}</span>
                    </div>
                  ) : null}
                  {product.uv ? (
                    <div>
                      <strong>UV Protection</strong>
                      <span>{product.uv}</span>
                    </div>
                  ) : null}
                  {product.size ? (
                    <div>
                      <strong>Size</strong>
                      <span>{product.size}</span>
                    </div>
                  ) : null}
                  {product.stock ? (
                    <div>
                      <strong>Availability</strong>
                      <span>{product.stock}</span>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="product-detail__buttons">
                <div className="quantity">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <input
                    value={quantity}
                    min="1"
                    max="10"
                    type="number"
                    aria-label="Quantity"
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(10, Number(e.target.value) || 1))
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  >
                    +
                  </button>
                </div>

                {inCart ? (
                  <button className="button is-added" disabled>
                    Added <span>✓</span>
                  </button>
                ) : (
                  <button
                    className="button button--dark"
                    type="button"
                    onClick={() => addToCart(product.id, quantity)}
                  >
                    Add to bag <span>+</span>
                  </button>
                )}

                <button
                  className="button button--blue"
                  type="button"
                  onClick={() =>
                    checkoutWhatsApp([{ id: product.id, quantity }])
                  }
                >
                  Buy on WhatsApp <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {finalRelated.length > 0 && (
        <section className="section-pad related-section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">You may also like</p>
                <h2>Complete the edit.</h2>
              </div>
              <Link className="text-link" to="/shop">
                View all products <span>→</span>
              </Link>
            </div>
            <div className="product-grid" id="related-products">
              {finalRelated.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
