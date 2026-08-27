import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Policies() {
  return (
    <>
      <Helmet>
        <title>Privacy & Policies — VINVERTH Eyewear</title>
        <meta
          name="description"
          content="VINVERTH privacy and store policies — shipping, returns, warranty, and data protection."
        />
      </Helmet>

      <section className="page-hero page-hero--about">
        <div className="container">
          <p className="eyebrow">The small print</p>
          <h1>
            Privacy &<br />
            <em>policies.</em>
          </h1>
          <p>
            Clear information about your orders, data, shipping, and returns.
          </p>
        </div>
      </section>

      <section className="section-pad policy-section">
        <div className="container policy-layout">
          <aside className="policy-nav">
            <p className="eyebrow">On this page</p>
            <a href="#privacy">Privacy policy</a>
            <a href="#terms">Terms & conditions</a>
            <a href="#shipping">Shipping policy</a>
            <a href="#returns">Return policy</a>
          </aside>

          <div className="policy-content">
            <article id="privacy">
              <p className="eyebrow">01 · Privacy</p>
              <h2>Your privacy matters.</h2>
              <p>
                We collect only the information needed to process orders, answer
                enquiries, and improve your VINVERTH experience. This may include
                your name, email address, phone number, delivery details, and the
                information you share through our contact form.
              </p>
              <p>
                We do not sell your personal information. Email enquiries are
                handled through EmailJS, and order conversations may continue
                through WhatsApp when you choose to contact us there.
              </p>
            </article>

            <article id="terms">
              <p className="eyebrow">02 · Terms</p>
              <h2>Simple, fair terms.</h2>
              <p>
                Product images, colours, and availability may vary slightly
                between screens and physical products. Prices and offers can
                change without notice, but confirmed orders will be honoured at
                the price shown at checkout.
              </p>
              <p>
                By using this website, you agree to use it lawfully and provide
                accurate information when submitting a request or placing an
                order.
              </p>
            </article>

            <article id="shipping">
              <p className="eyebrow">03 · Shipping</p>
              <h2>Delivery, made clear.</h2>
              <p>
                We confirm delivery availability and timelines with you on
                WhatsApp before finalising an order. Shipping charges, duties,
                and delivery timing may depend on your destination and will be
                shared before dispatch.
              </p>
            </article>

            <article id="returns">
              <p className="eyebrow">04 · Returns</p>
              <h2>Need a different fit?</h2>
              <p>
                Contact us within 7 days of delivery for return or exchange
                support. Items must be unused, undamaged, and returned with
                their original packaging. Our team will guide you through the
                next step.
              </p>
              <Link className="button button--dark" to="/contact">
                Talk to support <span>→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
