(() => {
  const getClient = () => window.VinverthSupabase?.client;
  const imagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 700'%3E%3Crect width='800' height='700' fill='%23f2f0ed'/%3E%3Cpath d='M180 360h440l-45-65-82 52-78-105-155 178z' fill='%23d9dfd8'/%3E%3Ccircle cx='520' cy='240' r='42' fill='%23c2cec5'/%3E%3C/svg%3E";

  async function resolveImage(product) {
    const externalUrl = String(product.primary_image_url || "").trim();
    if (externalUrl) return externalUrl;
    let storagePath = String(product.primary_image_path || "").trim();
    if (!storagePath) return imagePlaceholder;
    if (/^https?:\/\//i.test(storagePath)) {
      try {
        const url = new URL(storagePath);
        const marker = "/storage/v1/object/";
        const markerIndex = url.pathname.indexOf(marker);
        if (markerIndex < 0) return storagePath;
        const objectPath = decodeURIComponent(url.pathname.slice(markerIndex + marker.length).replace(/^\/+/, ""));
        if (objectPath.startsWith("public/product-media/")) return storagePath;
        storagePath = objectPath.replace(/^sign\/product-media\//, "");
      } catch {
        return imagePlaceholder;
      }
    }
    storagePath = storagePath.replace(/^\/+/, "").replace(/^product-media\//, "");
    if (!storagePath) return imagePlaceholder;
    const client = getClient();
    if (!client) return imagePlaceholder;
    try {
      const { data, error } = await client.storage.from("product-media").createSignedUrl(storagePath, 3600);
      if (error) return imagePlaceholder;
      return data?.signedUrl || imagePlaceholder;
    } catch {
      return imagePlaceholder;
    }
  }

  function mapProductRecord(product, resolvedImageUrl) {
    const id = product.sku || product.slug || product.id;
    return {
      id: id,
      rawId: product.id,
      sku: product.sku || "",
      slug: product.slug || "",
      name: product.name,
      category: product.product_categories?.name || "General",
      gender: product.gender || "Unisex",
      image: resolvedImageUrl,
      price: Number(product.price),
      oldPrice: product.compare_at_price == null ? null : Number(product.compare_at_price),
      badge: product.badge || "",
      isFeatured: Boolean(product.is_featured),
      description: product.description || "",
      uv: product.uv || "",
      material: product.material || "",
      size: product.size || "",
      createdAt: product.sort_order || 0,
      stock: product.stock_quantity > 0 ? "In stock" : "In Stock"
    };
  }

  async function loadProducts() {
    const client = getClient();
    let supabaseProducts = [];
    if (client) {
      try {
        const { data, error } = await client
          .from("products")
          .select("*, product_images(*), product_categories(name)")
          .eq("status", "published")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false })
          .order("name", { ascending: true });
        if (!error && data?.length) {
          supabaseProducts = await Promise.all(data.map(async (product) => {
            const primaryImage = product.product_images?.find((image) => image.is_primary) || product.product_images?.[0];
            const imageUrl = await resolveImage({
              ...product,
              primary_image_url: primaryImage?.external_url,
              primary_image_path: primaryImage?.storage_path
            });
            return mapProductRecord(product, imageUrl);
          }));
        }
      } catch (error) {
        console.warn("Supabase catalogue request failed", error);
      }
    }

    const fallbackList = (window.VinverthProducts?.products || []).map((p) => ({
      id: p.id,
      rawId: p.id,
      sku: p.id,
      slug: p.id.toLowerCase(),
      name: p.name,
      category: p.category || "General",
      gender: p.gender || "Unisex",
      image: p.image || imagePlaceholder,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      badge: p.badge || "",
      isFeatured: Boolean(p.isFeatured),
      description: p.description || "",
      uv: p.uv || "",
      material: p.material || "",
      size: p.size || "",
      createdAt: p.createdAt || 0,
      stock: p.stock || "In stock"
    }));

    if (supabaseProducts.length > 0) {
      const existingIds = new Set(supabaseProducts.map((p) => String(p.id).toLowerCase()));
      const uniqueFallbacks = fallbackList.filter((p) => !existingIds.has(String(p.id).toLowerCase()));
      return [...supabaseProducts, ...uniqueFallbacks];
    }

    return fallbackList;
  }

  async function loadProductById(idOrSlug) {
    const queryTerm = String(idOrSlug || "").trim();
    if (!queryTerm) return null;

    const normalizedTerm = queryTerm.toLowerCase();

    // 1. Check direct Supabase query if client is available
    const client = getClient();
    if (client) {
      try {
        let productRecord = null;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

        let query = client
          .from("products")
          .select("*, product_images(*), product_categories(name)")
          .eq("status", "published");

        if (isUuid) {
          query = query.or(`id.eq.${queryTerm},sku.eq.${queryTerm},slug.eq.${queryTerm}`);
        } else {
          query = query.or(`sku.eq.${queryTerm},slug.eq.${queryTerm},name.ilike.${queryTerm}`);
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          productRecord = data;
        }

        if (!productRecord) {
          const { data: aliasData } = await client
            .from("product_aliases")
            .select("product_id")
            .eq("alias", queryTerm)
            .maybeSingle();

          if (aliasData?.product_id) {
            const { data: aliasProduct } = await client
              .from("products")
              .select("*, product_images(*), product_categories(name)")
              .eq("id", aliasData.product_id)
              .eq("status", "published")
              .maybeSingle();
            if (aliasProduct) productRecord = aliasProduct;
          }
        }

        if (productRecord) {
          const primaryImage = productRecord.product_images?.find((img) => img.is_primary) || productRecord.product_images?.[0];
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
    }

    // 2. Fallback: Search in full combined catalogue list
    const allProducts = await loadProducts();
    return allProducts.find(
      (p) =>
        String(p.id).toLowerCase() === normalizedTerm ||
        String(p.rawId || "").toLowerCase() === normalizedTerm ||
        String(p.sku || "").toLowerCase() === normalizedTerm ||
        String(p.slug || "").toLowerCase() === normalizedTerm ||
        String(p.name || "").toLowerCase() === normalizedTerm
    ) || null;
  }

  async function loadSettings() {
    const client = getClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) console.warn("Could not load Supabase settings", error.message);
      return error ? null : data;
    } catch (error) {
      console.warn("Supabase settings request failed", error);
      return null;
    }
  }

  window.VinverthCatalogueApi = { loadProducts, loadProductById, loadProduct: loadProductById, loadSettings };
})();
