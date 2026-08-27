import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import emailjs from "@emailjs/browser";
import { useStore } from "../context/StoreContext";

export default function Contact() {
  const { config, showPopup, showToast } = useStore();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    inquiry: ""
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("Sending...");

    try {
      await emailjs.send(
        config.emailjs.serviceId,
        config.emailjs.templateId,
        {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          inquiry: formData.inquiry.trim()
        },
        config.emailjs.publicKey
      );

      setFormData({ full_name: "", email: "", inquiry: "" });
      setStatusMessage("Message sent. We will get back to you soon.");
      showPopup("Message sent successfully.");
      showToast("Thank you for reaching out.");
    } catch (err) {
      console.error("EmailJS sending error:", err);
      setStatusMessage(
        "Could not connect right now. Please WhatsApp us instead."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact — VINVERTH Eyewear</title>
        <meta
          name="description"
          content="Contact VINVERTH Eyewear — customer support, frame consultations, and inquiries."
        />
      </Helmet>

      <section className="page-hero page-hero--contact">
        <div className="container">
          <p className="eyebrow">We'd love to hear from you</p>
          <h1>
            Let's talk<br />
            <em>eyewear.</em>
          </h1>
          <p>
            Questions about a frame, an order, or just finding your fit? We're
            here.
          </p>
        </div>
      </section>

      <section className="section-pad contact-section">
        <div className="container contact-grid">
          <div className="contact-info">
            <p className="eyebrow">Get in touch</p>
            <h2>Come say hello.</h2>
            <p>
              Our support team is available Monday to Saturday, 10AM to 7PM GST.
            </p>

            <div className="contact-detail">
              <span>WhatsApp</span>
              <strong>+{config.whatsappNumber}</strong>
            </div>
            <div className="contact-detail">
              <span>Email</span>
              <strong>{config.contactEmail}</strong>
            </div>
            <div className="contact-detail">
              <span>Instagram</span>
              <strong>@vinverth.uae</strong>
            </div>

            <div className="contact-socials" aria-label="Contact links">
              <a
                href={config.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <span aria-hidden="true">◎</span>
              </a>
              <a
                href={`https://wa.me/${config.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <span aria-hidden="true">◉</span>
              </a>
              <a href={`mailto:${config.contactEmail}`} aria-label="Email">
                <span aria-hidden="true">✉</span>
              </a>
            </div>
          </div>

          <form
            className="contact-form"
            id="contact-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="fullName">Your name</label>
            <input
              id="fullName"
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <label htmlFor="inquiry">How can we help?</label>
            <textarea
              id="inquiry"
              name="inquiry"
              rows={5}
              required
              value={formData.inquiry}
              onChange={(e) =>
                setFormData({ ...formData, inquiry: e.target.value })
              }
            ></textarea>

            <button
              className="button button--dark"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send message"} <span>→</span>
            </button>

            {statusMessage && (
              <small className="form-message" aria-live="polite">
                {statusMessage}
              </small>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
