import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>Our Story — VINVERTH Eyewear</title>
        <meta
          name="description"
          content="The VINVERTH eyewear story — crafting frames for the way you move through the world."
        />
      </Helmet>

      <section className="page-hero page-hero--about">
        <div className="container">
          <p className="eyebrow">Our story</p>
          <h1>
            See beyond.<br />
            <em>Live beyond.</em>
          </h1>
          <p>We make eyewear for the way you move through the world.</p>
        </div>
      </section>

      <section className="about-intro section-pad">
        <div className="container about-intro__grid">
          <div>
            <p className="eyebrow">The VINVERTH point of view</p>
            <h2>
              More than just<br />
              eyewear.
            </h2>
          </div>
          <div>
            <p>
              VINVERTH began with a simple belief: the right frame can shift the
              way you see yourself and the way the world sees you.
            </p>
            <p>
              Every silhouette is considered for comfort, proportion, and
              character. We pair premium materials with a relaxed sense of style,
              so your eyewear feels like a natural extension of who you are.
            </p>
            <Link className="button button--dark" to="/shop">
              Explore the collection <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="about-image about-company">
        <div className="about-company__images">
          <img
            src="https://res.cloudinary.com/davogn4xk/image/upload/v1785657199/fa7bb595-039a-45e7-9cc6-bf42345c1457_jy7c84.png"
            alt="VINVERTH company image"
            loading="lazy"
            decoding="async"
          />
          <img
            src="https://res.cloudinary.com/davogn4xk/image/upload/v1785658037/13901f4b-c44c-45ec-ad4b-85134f69486e_hjmvxu.png"
            alt="VINVERTH company image"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="about-image__caption">
          <p className="eyebrow">The VINVERTH company</p>
          <strong>Built for the way you see the world.</strong>
        </div>
      </section>

      <section className="section-pad values">
        <div className="container">
          <div className="section-title-center">
            <p className="eyebrow">What matters to us</p>
            <h2>Designed with intention.</h2>
          </div>
          <div className="values-grid">
            <article>
              <span>01</span>
              <h3>Comfort, always.</h3>
              <p>
                Frames that feel good from the first coffee to the last train
                home.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Quality, quietly.</h3>
              <p>
                Finishes and materials chosen for daily wear, not a single season.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Style, your way.</h3>
              <p>
                Thoughtful shapes that give you space to make the look your own.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
