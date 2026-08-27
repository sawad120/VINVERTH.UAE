import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

const HERO_SLIDES = [
  {
    theme: "#a8c1d3",
    image:
      "https://res.cloudinary.com/davogn4xk/image/upload/v1785655153/vin_s92g8s.png",
    eyebrow: "Premium eyewear",
    title: (
      <>
        Clarity.<br />Redefined.<br />Everyday.<br />
        <em>Extraordinary.</em>
      </>
    ),
    description:
      "Premium eyewear crafted for those who see the world differently.",
    primaryBtnText: "Explore collections",
    primaryBtnLink: "/shop",
    secondaryBtnText: "Shop now",
    secondaryBtnLink: "#arrivals"
  },
  {
    theme: "#ead7ca",
    image:
      "https://res.cloudinary.com/davogn4xk/image/upload/v1785595453/Gemini_Generated_Image_g6r1bqg6r1bqg6r1_ynfj63.png",
    eyebrow: "The new perspective",
    title: (
      <>
        Soft lines.<br />Strong point<br />
        <em>of view.</em>
      </>
    ),
    description:
      "A lighter take on statement frames, finished for long days and late nights.",
    primaryBtnText: "See optical",
    primaryBtnLink: "/shop?category=Optical",
    secondaryBtnText: "Our story",
    secondaryBtnLink: "/about"
  },
  {
    theme: "#d5c5b2",
    image:
      "https://res.cloudinary.com/davogn4xk/image/upload/v1785594670/Gemini_Generated_Image_hrqznghrqznghrqz_vq4kp4.png",
    eyebrow: "Made for movement",
    title: (
      <>
        Lightweight<br />by design.<br />
        <em>Limitless by nature.</em>
      </>
    ),
    description:
      "Comfort-first silhouettes that move with you, wherever the day takes you.",
    primaryBtnText: "Shop sunglasses",
    primaryBtnLink: "/shop?category=Sunglasses"
  },
  {
    theme: "#c4d0d7",
    image:
      "https://res.cloudinary.com/davogn4xk/image/upload/v1785595872/Gemini_Generated_Image_ynpqdsynpqdsynpq_fxvihw.png",
    eyebrow: "Quiet confidence",
    title: (
      <>
        Designed to<br />be noticed.<br />
        <em>Never loud.</em>
      </>
    ),
    description:
      "Modern classics with enough character to become your signature.",
    primaryBtnText: "Find your frame",
    primaryBtnLink: "/shop"
  },
  {
    theme: "#e6d5ce",
    image:
      "https://res.cloudinary.com/davogn4xk/image/upload/v1785596014/Gemini_Generated_Image_las5cclas5cclas5_olcfwg.png",
    eyebrow: "The everyday edit",
    title: (
      <>
        Your point<br />of view,<br />
        <em>perfected.</em>
      </>
    ),
    description:
      "Discover polished shapes that work with every version of your day.",
    primaryBtnText: "Shop the edit",
    primaryBtnLink: "/shop"
  }
];

const REVIEWS = [
  {
    quote:
      "Best quality and super comfortable. Exactly what I was looking for!",
    name: "Nada",
    city: "Dubai"
  },
  {
    quote:
      "Absolutely love the design and fit. Perfect for everyday use.",
    name: "Nada",
    city: "Abu Dhabi"
  },
  {
    quote:
      "Stylish, lightweight and worth every penny. Highly recommend!",
    name: "Nada",
    city: "Sharjah"
  }
];

export default function Home() {
  const { products, config } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const showSlide = useCallback((index) => {
    setActiveSlide((index + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const currentTheme = HERO_SLIDES[activeSlide].theme;
    document.documentElement.style.setProperty("--accent-color", currentTheme);
    document.documentElement.style.setProperty(
      "--soft-color",
      `${currentTheme}42`
    );
  }, [activeSlide]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") showSlide(activeSlide - 1);
      if (e.key === "ArrowRight") showSlide(activeSlide + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide, showSlide]);

  const featured = products.filter((p) => p.isFeatured);
  const displayProducts = (
    featured.length > 0 ? featured : products
  ).slice(0, 12);

  return (
    <>
      <Helmet>
        <title>VINVERTH — Premium Eyewear</title>
        <meta
          name="description"
          content="VINVERTH Eyewear — premium frames for people who see differently."
        />
      </Helmet>

      {/* Hero Carousel */}
      <section className="hero" id="home" aria-label="Featured collection">
        <div className="hero__slides" data-hero-slides>
          {HERO_SLIDES.map((slide, idx) => (
            <article
              key={idx}
              className={`hero-slide ${idx === activeSlide ? "is-active" : ""}`}
              data-theme={slide.theme}
              data-image={slide.image}
            >
              <div className="hero-slide__copy">
                <p className="eyebrow">{slide.eyebrow}</p>
                <h1>{slide.title}</h1>
                <p className="hero-slide__description">{slide.description}</p>
                <div className="button-row">
                  <Link className="button button--blue" to={slide.primaryBtnLink}>
                    {slide.primaryBtnText} <span>→</span>
                  </Link>
                  {slide.secondaryBtnText && (
                    slide.secondaryBtnLink.startsWith("#") ? (
                      <a
                        className="button button--outline"
                        href={slide.secondaryBtnLink}
                      >
                        {slide.secondaryBtnText}
                      </a>
                    ) : (
                      <Link
                        className="button button--outline"
                        to={slide.secondaryBtnLink}
                      >
                        {slide.secondaryBtnText}
                      </Link>
                    )
                  )}
                </div>
              </div>
              <div className="hero-slide__image hero-slide__image--premium">
                <img
                  src={slide.image}
                  alt="VINVERTH Eyewear premium collection"
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            </article>
          ))}
        </div>

        <div className="hero__numbers" data-hero-numbers>
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={idx === activeSlide ? "is-active" : ""}
              type="button"
              data-slide={idx}
              onClick={() => showSlide(idx)}
            >
              {`0${idx + 1}`}
            </button>
          ))}
        </div>

        <div className="hero__controls">
          <button
            type="button"
            data-hero-prev
            aria-label="Previous slide"
            onClick={() => showSlide(activeSlide - 1)}
          >
            ←
          </button>
          <button
            type="button"
            data-hero-next
            aria-label="Next slide"
            onClick={() => showSlide(activeSlide + 1)}
          >
            →
          </button>
        </div>

        <div className="scroll-cue">
          <span>⌄</span> Scroll down
        </div>
      </section>

      {/* Men & Women Collections */}
      <section className="collections" id="lookbook">
        <article className="collection-panel collection-panel--men">
          <div>
            <p className="eyebrow">Men's collection</p>
            <h2>
              Bold. Confident.<br />Timeless.
            </h2>
            <Link
              className="button button--outline button--light"
              to="/shop?gender=Men"
            >
              Shop men's <span>→</span>
            </Link>
          </div>
          <img
            src="https://res.cloudinary.com/davogn4xk/image/upload/v1785596127/Gemini_Generated_Image_t79ocmt79ocmt79o_wrgmfo.png"
            alt="Men's VINVERTH eyewear collection"
          />
        </article>
        <article className="collection-panel collection-panel--women">
          <div>
            <p className="eyebrow">Women's collection</p>
            <h2>
              Elegant. Graceful.<br />Unique.
            </h2>
            <Link
              className="button button--outline button--light"
              to="/shop?gender=Women"
            >
              Shop women's <span>→</span>
            </Link>
          </div>
          <img
            src="https://res.cloudinary.com/davogn4xk/image/upload/v1785594718/Gemini_Generated_Image_rh4oocrh4oocrh4o_dwjnqf.png"
            alt="Women's VINVERTH eyewear collection"
          />
        </article>
      </section>

      {/* New Arrivals */}
      <section className="section-pad arrivals" id="arrivals">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">New arrivals</p>
              <h2>Discover what's new</h2>
            </div>
            <Link className="text-link" to="/shop">
              View all products <span>→</span>
            </Link>
          </div>
          <div className="product-grid product-grid--home" id="home-products">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Strip */}
      <section className="section-pad" style={{ background: "var(--soft-color)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Client reviews</p>
              <h2>Trusted by clear thinkers.</h2>
            </div>
          </div>
          <div className="review-grid" id="review-grid">
            {(() => {
              let reviews = REVIEWS;
              try {
                const stored = localStorage.getItem("vinverth_reviews");
                if (stored) reviews = JSON.parse(stored);
              } catch {}
              return reviews.map((r, i) => (
                <article className="review-card" key={i}>
                  <div className="review-card__stars">★★★★★</div>
                  <blockquote>“{r.quote}”</blockquote>
                  <div className="review-card__person">
                    {r.avatarUrl ? (
                      <img
                        className="review-card__avatar"
                        src={r.avatarUrl}
                        alt={r.name}
                        style={{ width:34,height:34,borderRadius:"50%",objectFit:"cover" }}
                      />
                    ) : (
                      <span className="review-card__avatar">{r.name ? r.name[0] : "N"}</span>
                    )}
                    <div>
                      <strong>— {r.name}</strong>
                      <span>{r.city}</span>
                    </div>
                  </div>
                </article>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* Compact Journal */}
      <section className="blog-strip" id="journal">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">From the journal</p>
              <h2>Small stories, clear views.</h2>
            </div>
            <Link className="text-link" to="/about">
              Read our story <span>→</span>
            </Link>
          </div>
          <div className="blog-grid">
            <article>
              <p className="blog-number">01</p>
              <h3>How to find your everyday frame</h3>
              <p>
                Three simple things to look for when comfort matters as much as
                style.
              </p>
              <Link to="/about">
                Read more <span>→</span>
              </Link>
            </article>
            <article>
              <p className="blog-number">02</p>
              <h3>The quiet power of a good shape</h3>
              <p>
                Why proportion, fit, and the right finish make a frame feel like
                yours.
              </p>
              <Link to="/about">
                Read more <span>→</span>
              </Link>
            </article>
            <article>
              <p className="blog-number">03</p>
              <h3>Care for the frames you love</h3>
              <p>
                Easy daily habits that keep your eyewear clear, comfortable, and
                ready.
              </p>
              <Link to="/contact">
                Ask us <span>→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Simple Contact Call-to-Action */}
      <section className="contact-strip" id="contact">
        <div className="container contact-strip__inner">
          <div>
            <p className="eyebrow">Need a little help?</p>
            <h2>Find the frame that feels like you.</h2>
            <p>Tell us what you are looking for and our team will help you choose.</p>
          </div>
          <div className="contact-strip__actions">
            <Link className="button button--dark" to="/contact">
              Talk to us <span>→</span>
            </Link>
            <a
              className="contact-strip__whatsapp"
              href={`https://wa.me/${config.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
