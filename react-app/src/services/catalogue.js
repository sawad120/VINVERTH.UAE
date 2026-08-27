import { supabase } from "./supabase";

export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 700'%3E%3Crect width='800' height='700' fill='%23f2f0ed'/%3E%3Cpath d='M180 360h440l-45-65-82 52-78-105-155 178z' fill='%23d9dfd8'/%3E%3Ccircle cx='520' cy='240' r='42' fill='%23c2cec5'/%3E%3C/svg%3E";

export const DEFAULT_CONFIG = {
  whatsappNumber: "971565741398",
  contactEmail: "kok.intl.llc@gmail.com",
  instagramUrl: "https://www.instagram.com/vinverth.uae?igsh=OXhkaWZmZTRybDNp",
  logoUrl:
    "https://res.cloudinary.com/davogn4xk/image/upload/v1778060426/ChatGPT_Image_May_6__2026__03_09_10_PM-removebg-preview_vnx4vc.png",
  wishlistKey: "vinverth-wishlist",
  emailjs: {
    serviceId: "service_kxg77na",
    templateId: "template_1o930ga",
    publicKey: "DrTzEc3or5fo9YSvf"
  },
  storageKey: "vinverth-cart"
};

async function resolveImage(product) {
  const externalUrl = String(product.primary_image_url || "").trim();
  if (externalUrl) return externalUrl;
  let storagePath = String(product.primary_image_path || "").trim();
  if (!storagePath) return IMAGE_PLACEHOLDER;
  if (/^https?:\/\//i.test(storagePath)) {
    try {
      const url = new URL(storagePath);
      const marker = "/storage/v1/object/";
      const markerIndex = url.pathname.indexOf(marker);
      if (markerIndex < 0) return storagePath;
      const objectPath = decodeURIComponent(
        url.pathname.slice(markerIndex + marker.length).replace(/^\/+/, "")
      );
      if (objectPath.startsWith("public/product-media/")) return storagePath;
      storagePath = objectPath.replace(/^sign\/product-media\//, "");
    } catch {
      return IMAGE_PLACEHOLDER;
    }
  }
  storagePath = storagePath.replace(/^\/+/, "").replace(/^product-media\//, "");
  if (!storagePath) return IMAGE_PLACEHOLDER;
  try {
    const { data, error } = await supabase.storage
      .from("product-media")
      .createSignedUrl(storagePath, 3600);
    if (error) return IMAGE_PLACEHOLDER;
    return data?.signedUrl || IMAGE_PLACEHOLDER;
  } catch {
    return IMAGE_PLACEHOLDER;
  }
}

function mapProductRecord(product, resolvedImageUrl) {
  const id = product.sku || product.slug || product.id;
  const rawPrice = Number(product.price) || 0;
  const rawOldPrice =
    product.compare_at_price == null ? null : Number(product.compare_at_price);

  return {
    id: String(id),
    rawId: product.id,
    sku: product.sku || "",
    slug: product.slug || "",
    name: product.name || "Eyewear Frame",
    category: product.product_categories?.name || product.category || "General",
    gender: product.gender || "Unisex",
    image: resolvedImageUrl || IMAGE_PLACEHOLDER,
    price: rawPrice,
    formattedPrice: `$${rawPrice.toFixed(0)}`,
    oldPrice: rawOldPrice,
    formattedOldPrice:
      rawOldPrice !== null ? `$${rawOldPrice.toFixed(0)}` : null,
    badge: product.badge || "",
    isFeatured: Boolean(product.is_featured),
    description: product.description || "Premium eyewear frame crafted for clarity and comfort.",
    uv: product.uv || "UV400 / 100% UV Protection",
    material: product.material || "Premium Handcrafted Acetate",
    size: product.size || "Medium (50-20-145)",
    createdAt: product.sort_order || 0,
    stock: product.stock_quantity > 0 ? "In stock" : "In Stock"
  };
}

export async function loadProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*), product_categories(name)")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .order("name", { ascending: true });

    if (!error && data?.length) {
      const supabaseProducts = await Promise.all(
        data.map(async (product) => {
          const primaryImage =
            product.product_images?.find((img) => img.is_primary) ||
            product.product_images?.[0];
          const imageUrl = await resolveImage({
            ...product,
            primary_image_url: primaryImage?.external_url,
            primary_image_path: primaryImage?.storage_path
          });
          return mapProductRecord(product, imageUrl);
        })
      );
      return supabaseProducts;
    }
  } catch (error) {
    console.warn("Supabase catalogue request failed", error);
  }

  return [];
}

export async function loadProductById(idOrSlug, cachedProducts = []) {
  const queryTerm = String(idOrSlug || "").trim();
  if (!queryTerm) return null;

  const normalizedTerm = queryTerm.toLowerCase();

  // Check cache first
  const existing = cachedProducts.find(
    (p) =>
      String(p.id).toLowerCase() === normalizedTerm ||
      String(p.rawId || "").toLowerCase() === normalizedTerm ||
      String(p.sku || "").toLowerCase() === normalizedTerm ||
      String(p.slug || "").toLowerCase() === normalizedTerm ||
      String(p.name || "").toLowerCase() === normalizedTerm
  );
  if (existing) return existing;

  try {
    let productRecord = null;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        queryTerm
      );

    let query = supabase
      .from("products")
      .select("*, product_images(*), product_categories(name)")
      .eq("status", "published");

    if (isUuid) {
      query = query.or(`id.eq.${queryTerm},sku.eq.${queryTerm},slug.eq.${queryTerm}`);
    } else {
      query = query.or(
        `sku.eq.${queryTerm},slug.eq.${queryTerm},name.ilike.${queryTerm}`
      );
    }

    const { data, error } = await query.maybeSingle();
    if (!error && data) {
      productRecord = data;
    }

    if (!productRecord) {
      const { data: aliasData } = await supabase
        .from("product_aliases")
        .select("product_id")
        .eq("alias", queryTerm)
        .maybeSingle();

      if (aliasData?.product_id) {
        const { data: aliasProduct } = await supabase
          .from("products")
          .select("*, product_images(*), product_categories(name)")
          .eq("id", aliasData.product_id)
          .eq("status", "published")
          .maybeSingle();
        if (aliasProduct) productRecord = aliasProduct;
      }
    }

    if (productRecord) {
      const primaryImage =
        productRecord.product_images?.find((img) => img.is_primary) ||
        productRecord.product_images?.[0];
      const imageUrl = await resolveImage({
        ...productRecord,
        primary_image_url: primaryImage?.external_url,
        primary_image_path: primaryImage?.storage_path
      });
      return mapProductRecord(productRecord, imageUrl);
    }
  } catch (error) {
    console.warn("Direct Supabase single product query error:", error);
  }

  // Fallback to full load
  const allProducts = await loadProducts();
  return (
    allProducts.find(
      (p) =>
        String(p.id).toLowerCase() === normalizedTerm ||
        String(p.rawId || "").toLowerCase() === normalizedTerm ||
        String(p.sku || "").toLowerCase() === normalizedTerm ||
        String(p.slug || "").toLowerCase() === normalizedTerm ||
        String(p.name || "").toLowerCase() === normalizedTerm
    ) || null
  );
}

export async function loadSettings() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) console.warn("Could not load Supabase settings", error.message);
    return error ? null : data;
  } catch (error) {
    console.warn("Supabase settings request failed", error);
    return null;
  }
}
