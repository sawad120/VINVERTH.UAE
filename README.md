# VINVERTH Eyewear

Premium, responsive static storefront built with HTML, CSS, and vanilla JavaScript.

## Run locally

```bash
npm install
npm start
```

Then open the local URL shown by `serve` and start from `index.html`.

## Before launch

1. The WhatsApp number is configured as `+971 56 574 1398` in `script.js`; update `whatsappNumber` there if the business number changes.
2. Confirm the EmailJS service/template configuration in `script.js` and ensure the template accepts the parameter names used in the code: for the contact form use `full_name`, `email`, and `inquiry`; for the newsletter form use `email`.
3. A normal `wa.me` link sends the product image URL inside the message. It cannot attach an image file automatically; actual image attachments require a backend and WhatsApp Cloud API.
4. Replace the relative canonical/production URLs in your deployment configuration once the GitHub Pages domain is known.

## Pages

- `index.html` — animated homepage, hero carousel, featured 12 products, story, reviews, newsletter
- `shop.html` — searchable/filterable catalogue with exactly 100 products
- `product.html` — product detail page selected by `?id=VN-1091`
- `about.html` — VINVERTH story and values
- `contact.html` — contact form with EmailJS
- `policies.html` — privacy, terms, shipping, and return policies
- `wishlist.html` — saved frames stored in browser `localStorage`

Product data lives in `products.js`. Cart contents persist in browser `localStorage`.
