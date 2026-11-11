# VINVERTH Eyewear

VINVERTH is a static, multi-page storefront built with HTML, CSS, and vanilla JavaScript. Pages, styles, scripts, catalogue data, and images are served directly from this project. There is no admin panel, authentication, database, or backend runtime.

## Run locally

```sh
npm start
```

Open the local address printed by the server. To create a deployment-ready static output, run:

```sh
npm run build
```

The build copies the public pages and their local assets into `dist/`. Vercel is configured to build this directory.

## Update the catalogue and images

1. Add or replace image files in `assets/images/`.
2. Add product objects to the `products` array in `products.js` and set `image` to a project-relative path, such as `assets/images/amber-frame.jpg`.

Each product uses this shape:

```js
{
  id: "frame-001",
  name: "Frame name",
  category: "Sunglasses",
  gender: "Unisex",
  image: "assets/images/frame-001.jpg",
  price: 120,
  oldPrice: null,
  badge: "",
  isFeatured: true,
  description: "Product description.",
  material: "Acetate",
  uv: "UV400",
  size: "Medium",
  stock: "In stock"
}
```

Cart, wishlist, filters, product details, and WhatsApp checkout use this local catalogue. Contact and newsletter forms send through the existing EmailJS service; they do not write to a database. Update its service/template settings in `script.js` if the email service changes.

## Public pages

- `index.html` — homepage and collection sections
- `shop.html` — searchable and filterable catalogue
- `product.html` — product details
- `about.html` — company story
- `contact.html` — contact form and support information
- `policies.html` — privacy, terms, shipping, and returns
- `wishlist.html` — saved frames in browser storage
