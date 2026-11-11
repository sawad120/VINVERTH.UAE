import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDirectory = resolve(projectRoot, "dist");
const publicFiles = [
  "index.html",
  "shop.html",
  "product.html",
  "about.html",
  "contact.html",
  "policies.html",
  "wishlist.html",
  "style.css",
  "script.js",
  "products.js",
  "robots.txt",
];

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });
for (const file of publicFiles) {
  cpSync(resolve(projectRoot, file), resolve(outputDirectory, file));
}
cpSync(resolve(projectRoot, "assets"), resolve(outputDirectory, "assets"), {
  recursive: true,
});

console.log(`Static site built in ${outputDirectory}`);
