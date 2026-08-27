(() => {
  const client = window.VinverthSupabase?.client;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const state = { categories: [], products: [] };
  const imagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 700'%3E%3Crect width='800' height='700' fill='%23f2f0ed'/%3E%3Cpath d='M180 360h440l-45-65-82 52-78-105-155 178z' fill='%23d9dfd8'/%3E%3Ccircle cx='520' cy='240' r='42' fill='%23c2cec5'/%3E%3C/svg%3E";
  const notice = (message, isError = false) => { const target = $("[data-notice]"); if (target) { target.textContent = message; target.style.color = isError ? "#9b3d32" : ""; } };

  if (!client) { $("[data-login-message]").textContent = "Supabase configuration could not be loaded."; return; }

  async function isAdmin() { const { data } = await client.rpc("is_admin"); return data === true; }
  async function hasMfa() { return true; }
  function show(name) { ["login", "mfa", "app"].forEach((key) => { $("[data-" + key + "]").hidden = key !== name; }); }
  function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

  async function gate() {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return show("login");
    if (!(await isAdmin())) { await client.auth.signOut(); $("[data-login-message]").textContent = "This account is not an active VINVERTH administrator."; return show("login"); }
    $("[data-admin-email]").textContent = session.user.email;
    show("app"); await refreshAll();
  }

  async function renderMfa() {
    show("mfa"); const holder = $("[data-mfa-content]");
    const { data } = await client.auth.mfa.listFactors();
    const factor = data?.totp?.find((item) => item.status === "verified");
    if (!factor) {
      holder.innerHTML = `<p>Enroll an authenticator app before accessing the dashboard.</p><button class="button button--dark" data-enroll-mfa>Set up authenticator <span>→</span></button>`;
      $("[data-enroll-mfa]").onclick = enrollMfa;
    } else holder.innerHTML = `<p>Enter the six-digit code from your authenticator app.</p><form data-verify-mfa><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" required /><button class="button button--dark">Verify <span>→</span></button></form>`;
    $("[data-verify-mfa]")?.addEventListener("submit", verifyMfa);
  }

  async function enrollMfa() {
    const { data: factors, error: listError } = await client.auth.mfa.listFactors();
    if (listError) return $("[data-mfa-message]").textContent = listError.message;
    const existingFactors = factors?.all?.filter((factor) => factor.factor_type === "totp") || [];
    for (const factor of existingFactors) {
      const { error: unenrollError } = await client.auth.mfa.unenroll({ factorId: factor.id });
      if (unenrollError) return $("[data-mfa-message]").textContent = `Could not remove the existing authenticator: ${unenrollError.message}`;
    }
    const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "VINVERTH Admin" });
    if (error) return $("[data-mfa-message]").textContent = `Enrollment failed: ${error.message}`;
    $("[data-mfa-content]").innerHTML = `<p>Scan this QR code, then enter the code from your app.</p><img class="mfa-qr" src="${data.totp.qr_code}" alt="Authenticator QR code" /><form data-verify-mfa><input name="factorId" type="hidden" value="${data.id}" /><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" required /><button class="button button--dark">Verify <span>→</span></button></form>`;
    $("[data-verify-mfa]").addEventListener("submit", verifyMfa);
  }
  async function verifyMfa(event) {
    event.preventDefault(); const form = event.currentTarget; const code = new FormData(form).get("code");
    let factorId = new FormData(form).get("factorId");
    if (!factorId) { const { data } = await client.auth.mfa.listFactors(); factorId = data?.totp?.find((item) => item.status === "verified")?.id; }
    const { data: challenge, error } = await client.auth.mfa.challenge({ factorId }); if (error) return $("[data-mfa-message]").textContent = error.message;
    const { error: verifyError } = await client.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (verifyError) return $("[data-mfa-message]").textContent = verifyError.message;
    await client.auth.refreshSession(); gate();
  }

  async function refreshAll() {
    const [categories, products, messages, subscribers, settings, audit] = await Promise.all([
      client.from("product_categories").select("*").order("sort_order").order("name"),
      client.from("products").select("*, product_categories(name), product_images(*)").order("updated_at", { ascending: false }),
      client.from("contact_messages").select("*").order("submitted_at", { ascending: false }).limit(50),
      client.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }).limit(100),
      client.from("site_settings").select("*").eq("id", 1).single(),
      client.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100)
    ]);
    state.categories = categories.data || []; state.products = products.data || [];
      renderDashboard(messages.data || [], subscribers.data || []); await renderProducts(); renderCategories(); renderMessages(messages.data || []); renderSubscribers(subscribers.data || []); renderSettings(settings.data); renderAudit(audit.data || []);
  }
  function renderDashboard(messages, subscribers) { const drafts = state.products.filter((p) => p.status === "draft").length; const low = state.products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length; $("[data-stats]").innerHTML = [["Products", state.products.length], ["Drafts", drafts], ["Low stock", low], ["New messages", messages.filter((m) => m.status === "new").length], ["Subscribers", subscribers.length]].map(([label, value]) => `<article class="admin-stat"><span>${label}</span><strong>${value}</strong></article>`).join(""); }
  function renderProducts() { $("[data-product-list]").innerHTML = state.products.map((p) => `<article class="admin-card"><div class="admin-card__main">${p.product_images?.[0]?.external_url ? `<img src="${escape(p.product_images[0].external_url)}" alt="" />` : ""}<div><h3>${escape(p.name)}</h3><p>${escape(p.sku)} · ${escape(p.status)} · ${p.currency} ${p.price} · ${p.stock_quantity} in stock</p></div></div><div><button data-edit-product="${p.id}">Edit</button><button data-archive-product="${p.id}">Archive</button><button data-delete-product="${p.id}">Delete</button></div></article>`).join("") || "<p>No products in Supabase yet. Import the existing fallback catalogue from Dashboard.</p>"; }
    async function renderProducts() { const items = await Promise.all(state.products.map(async (p) => { const image = p.product_images?.find((item) => item.is_primary) || p.product_images?.[0]; let imageUrl = image?.external_url || ""; const storagePath = String(image?.storage_path || "").trim().replace(/^\/+/, "").replace(/^product-media\//, ""); if (!imageUrl && storagePath && !/^https?:\/\//i.test(storagePath)) { const signed = await client.storage.from("product-media").createSignedUrl(storagePath, 3600); imageUrl = signed.data?.signedUrl || imagePlaceholder; if (signed.error) console.warn(`Could not resolve admin product image for ${p.id} at ${storagePath}: ${signed.error.message}`); } imageUrl ||= imagePlaceholder; return `<article class="admin-card"><div class="admin-card__main"><img src="${escape(imageUrl)}" alt="" /><div><h3>${escape(p.name)}</h3><p>${escape(p.sku)} · ${escape(p.status)} · ${p.currency} ${p.price} · ${p.stock_quantity} in stock</p></div></div><div><button data-edit-product="${p.id}">Edit</button><button data-archive-product="${p.id}">Archive</button><button data-delete-product="${p.id}">Delete</button></div></article>`; })); $("[data-product-list]").innerHTML = items.join("") || "<p>No products in Supabase yet.</p>"; }
  function renderCategories() { $("[data-category-list]").innerHTML = (state.categories.length ? state.categories : ALLOWED_CATEGORIES.map((name) => ({ name, slug: slugify(name), is_active: true }))).map((c) => `<article class="admin-card"><div><h3>${escape(c.name)}</h3><p>${escape(c.slug)} · ${c.is_active !== false ? "Active" : "Hidden"}</p></div>${c.id ? `<button data-toggle-category="${c.id}">${c.is_active ? "Hide" : "Activate"}</button>` : ""}</article>`).join(""); }
  function renderMessages(items) { $("[data-message-list]").innerHTML = items.map((m) => `<article class="admin-card"><div><h3>${escape(m.full_name)} · ${escape(m.email)}</h3><p>${escape(m.message)}</p><p>${new Date(m.submitted_at).toLocaleString()} · ${escape(m.status)}</p></div><select data-message-status="${m.id}">${["new","in_progress","resolved","archived"].map((s) => `<option ${s === m.status ? "selected" : ""}>${s}</option>`).join("")}</select></article>`).join("") || "<p>No contact messages yet.</p>"; }
  function renderSubscribers(items) { $("[data-subscriber-list]").innerHTML = items.map((s) => `<article class="admin-card"><div><h3>${escape(s.email)}</h3><p>${escape(s.status)} · ${new Date(s.subscribed_at).toLocaleString()}</p></div><select data-subscriber-status="${s.id}"><option ${s.status === "subscribed" ? "selected" : ""}>subscribed</option><option ${s.status === "unsubscribed" ? "selected" : ""}>unsubscribed</option></select></article>`).join("") || "<p>No subscribers yet.</p>"; }
  function renderAudit(items) { $("[data-audit-list]").innerHTML = items.map((a) => `<article class="admin-card"><div><h3>${escape(a.entity_type)} · ${escape(a.action)}</h3><p>${new Date(a.created_at).toLocaleString()} · ${escape(a.entity_id)}</p></div></article>`).join("") || "<p>No audited changes yet.</p>"; }
  function renderSettings(settings) { if (!settings) return; $("[data-settings-form]").innerHTML = ["store_name","support_email","whatsapp_number","instagram_url","logo_url","announcement_text","default_currency","default_seo_title","default_seo_description"].map((key) => `<label>${key.replaceAll("_", " ")}<input name="${key}" value="${escape(settings[key])}" /></label>`).join("") + `<div class="wide actions"><button class="button button--dark">Save settings</button></div>`; }
  const ALLOWED_CATEGORIES = [
    "Men's Collection",
    "Women's Collection",
    "Sunglasses",
    "Optical Frames"
  ];

  function productForm(product = {}) {
    const stockQty = product.stock_quantity != null ? Number(product.stock_quantity) : 20;
    const availability = stockQty === 0 ? "out" : stockQty <= 5 ? "low" : "in";
    const currentCategory = product.product_categories?.name || product.category || "Men's Collection";
    return `<h2>${product.id ? "Edit product" : "New product"}</h2><input type="hidden" name="id" value="${product.id || ""}" /><label>Name<input name="name" value="${escape(product.name || "")}" required minlength="2" maxlength="160" /></label><label>Price<input name="price" type="number" min="0" step="0.01" value="${product.price || ""}" required /></label><label>Category<select name="category_name" required>${ALLOWED_CATEGORIES.map((val) => `<option value="${escape(val)}" ${val === currentCategory ? "selected" : ""}>${escape(val)}</option>`).join("")}</select></label><label>Gender<select name="gender" required>${["Men", "Women", "Unisex"].map((value) => `<option ${value === (product.gender || "Unisex") ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>Availability<select name="availability" required><option value="in" ${availability === "in" ? "selected" : ""}>In Stock</option><option value="low" ${availability === "low" ? "selected" : ""}>Low Stock</option><option value="out" ${availability === "out" ? "selected" : ""}>Out of Stock</option></select></label><label class="wide">Description<textarea name="description" maxlength="5000" required>${escape(product.description || "")}</textarea></label><fieldset class="wide image-source"><legend>Product image</legend><div class="image-source__tabs"><label><input type="radio" name="image_source" value="url" checked /> Image URL</label><label><input type="radio" name="image_source" value="file" /> Upload Image</label></div><label data-image-url>Image URL<input name="external_url" type="url" placeholder="https://example.com/frame.jpg" /></label><label data-image-file hidden>Image file<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" /></label></fieldset><div class="wide actions"><button class="button button--dark">Save product</button><button class="button" type="button" data-cancel-product>Cancel</button></div>`;
  }
  async function saveProduct(event) {
    event.preventDefault(); const form = event.target; if (!(form instanceof HTMLFormElement)) return notice("Product form could not be read.", true);
    const data = new FormData(form); const id = data.get("id"); const name = String(data.get("name") || "").trim(); const price = Number(data.get("price")); const categoryName = String(data.get("category_name") || "Men's Collection").trim(); const gender = data.get("gender"); const description = String(data.get("description") || "").trim(); const availabilityValue = data.get("availability"); const stockQuantity = availabilityValue === "out" ? 0 : availabilityValue === "low" ? 2 : 20; const urlInput = $("[name='external_url']", form); const fileInput = $("[name='image_file']", form); const externalUrl = urlInput.value.trim(); const file = fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null;
    if (name.length < 2 || name.length > 160 || !Number.isFinite(price) || price < 0 || !["Men", "Women", "Unisex"].includes(gender) || !description || description.length > 5000) return notice("Enter a valid name, price, category, gender, and description.", true);
    const hasFile = fileInput.files && fileInput.files.length > 0;
    const hasUrl = urlInput.value.trim() !== "";
    if (!id && !hasFile && !hasUrl) return notice("Add an external image URL or upload an image file.", true);
    let targetCategory = state.categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
    let categoryId = targetCategory?.id;
    if (!categoryId) {
      const catSlug = slugify(categoryName);
      const catResult = await client.from("product_categories").upsert({ name: categoryName, slug: catSlug, is_active: true }, { onConflict: "slug" }).select("id").maybeSingle();
      if (catResult.data?.id) categoryId = catResult.data.id;
    }
    const payload = { name, price, gender, description, stock_quantity: stockQuantity, status: "published", is_featured: false, category_id: categoryId, sku: id ? undefined : `ADMIN-${crypto.randomUUID()}`, slug: id ? undefined : `admin-${crypto.randomUUID()}` };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const result = id ? await client.from("products").update(payload).eq("id", id).select() : await client.from("products").insert(payload).select().single(); if (result.error) return notice(result.error.message, true); if (id && !result.data?.length) return notice("Product was not found or could not be updated.", true); const product = id ? result.data[0] : result.data;
    if (externalUrl) { await client.from("product_images").update({ is_primary: false }).eq("product_id", product.id); const imageResult = await client.from("product_images").insert({ product_id: product.id, external_url: externalUrl, alt_text: product.name, is_primary: true }); if (imageResult.error) return notice(imageResult.error.message, true); }
    if (file?.size) { const requestedPath = `products/${product.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`; const upload = await client.storage.from("product-media").upload(requestedPath, file, { upsert: false, contentType: file.type, cacheControl: "3600" }); if (upload.error) return notice(`Image upload failed: ${upload.error.message}`, true); const storagePath = String(upload.data?.path || requestedPath).replace(/^\/+/, "").replace(/^product-media\//, ""); console.log("Uploaded product image path:", { productId: product.id, bucket: "product-media", requestedPath, storagePath }); await client.from("product_images").update({ is_primary: false }).eq("product_id", product.id); const imageResult = await client.from("product_images").insert({ product_id: product.id, storage_path: storagePath, alt_text: product.name, is_primary: true }); if (imageResult.error) { await client.storage.from("product-media").remove([storagePath]); return notice(`Image record failed: ${imageResult.error.message}`, true); } console.log("Saved product image record:", { productId: product.id, storagePath }); }
    $("[data-product-form]").hidden = true; notice("Product saved."); refreshAll();
  }
  async function deleteProduct(productId) {
    if (!productId) return;
    if (!confirm("Permanently delete this product and its images?")) return;
    try {
      notice("Deleting product...");

      // Clean up storage media files first
      const targetProduct = state.products.find((p) => p.id === productId);
      if (targetProduct?.product_images?.length) {
        const storagePaths = targetProduct.product_images
          .map((img) => String(img.storage_path || "").trim().replace(/^\/+/, "").replace(/^product-media\//, ""))
          .filter(Boolean);
        if (storagePaths.length > 0) {
          try {
            await client.storage.from("product-media").remove(storagePaths);
          } catch (storageErr) {
            console.warn("Storage media removal warning:", storageErr);
          }
        }
      }

      // Delete from Supabase — use .select() so PostgREST confirms the row was actually deleted
      const { data: deleted, error } = await client
        .from("products")
        .delete()
        .eq("id", productId)
        .select("id");

      if (error) {
        console.error("Supabase delete error:", error);
        return notice(`Delete failed: ${error.message} (code: ${error.code})`, true);
      }

      if (!deleted || deleted.length === 0) {
        // 0 rows deleted — RLS blocked it silently (MFA policy still active on server)
        console.error("Delete returned 0 rows — RLS blocked the operation. Apply the migration SQL in Supabase SQL Editor.");
        return notice(
          "Delete was blocked by database security policy. Please run the migration SQL in your Supabase SQL Editor to fix this permanently.",
          true
        );
      }

      // Purge any cached wishlist entries for this product
      try {
        const wishlist = JSON.parse(localStorage.getItem("vinverth_wishlist") || "[]");
        const updated = wishlist.filter((id) => id !== productId);
        localStorage.setItem("vinverth_wishlist", JSON.stringify(updated));
      } catch { /* ignore */ }

      // Full re-fetch from Supabase — ensures no stale local state
      await refreshAll();
      notice("Product deleted successfully.");
    } catch (err) {
      console.error("Delete product error:", err);
      notice(`Failed to delete product: ${err.message || err}`, true);
    }
  }

  async function importFallback() { if (!confirm("Import the current products.js catalogue into Supabase?")) return; const fallback = window.VinverthProducts?.products || []; if (!fallback.length) return notice("Fallback catalogue was not found.", true); const names = [...new Set(fallback.map((p) => p.category))]; for (const name of names) await client.from("product_categories").upsert({ name, slug: slugify(name), is_active: true }, { onConflict: "slug" }); const { data: categories } = await client.from("product_categories").select("id,name"); const categoryMap = Object.fromEntries((categories || []).map((c) => [c.name, c.id])); for (const item of fallback) { const slug = slugify(item.name + "-" + item.id); const { data: product, error } = await client.from("products").upsert({ sku: item.id, slug, name: item.name, category_id: categoryMap[item.category], gender: item.gender, price: item.price, compare_at_price: item.oldPrice, status: "published", stock_quantity: item.stock === "Low stock" ? 2 : 20, badge: item.badge || "", description: item.description || "", uv: item.uv || "", material: item.material || "", size: item.size || "", is_featured: fallback.indexOf(item) < 12 }, { onConflict: "sku" }).select().single(); if (error) return notice(error.message, true); await client.from("product_images").update({ is_primary: false }).eq("product_id", product.id); const { data: existingImage } = await client.from("product_images").select("id").eq("product_id", product.id).eq("external_url", item.image).maybeSingle(); if (existingImage) await client.from("product_images").update({ alt_text: item.name, is_primary: true }).eq("id", existingImage.id); else await client.from("product_images").insert({ product_id: product.id, external_url: item.image, alt_text: item.name, is_primary: true }); await client.from("product_aliases").upsert([{ alias: item.id, product_id: product.id }, { alias: item.name, product_id: product.id }]); } notice("Fallback catalogue imported."); refreshAll(); }
  document.addEventListener("submit", async (event) => { if (event.target.matches("[data-login-form]")) { event.preventDefault(); const d = new FormData(event.target); const { error } = await client.auth.signInWithPassword({ email: d.get("email"), password: d.get("password") }); if (error) $("[data-login-message]").textContent = error.message; else gate(); } if (event.target.matches("[data-product-form]")) saveProduct(event); if (event.target.matches("[data-category-form]")) { event.preventDefault(); const d = new FormData(event.target); const { error } = await client.from("product_categories").insert({ name: d.get("name"), slug: d.get("slug") }); if (error) notice(error.message, true); else { event.target.reset(); refreshAll(); } } if (event.target.matches("[data-settings-form]")) { event.preventDefault(); const d = Object.fromEntries(new FormData(event.target)); const { error } = await client.from("site_settings").update(d).eq("id", 1); notice(error ? error.message : "Settings saved.", !!error); if (!error) refreshAll(); } });
  document.addEventListener("click", async (event) => { const tab = event.target.closest("[data-tab]"); if (tab) { document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-active", b === tab)); document.querySelectorAll("[data-panel]").forEach((p) => p.hidden = p.dataset.panel !== tab.dataset.tab); } if (event.target.matches("[data-sign-out]")) { await client.auth.signOut(); show("login"); } if (event.target.matches("[data-import-catalogue]")) importFallback(); if (event.target.matches("[data-new-product]")) { const form = $("[data-product-form]"); form.innerHTML = productForm(); form.hidden = false; } const edit = event.target.closest("[data-edit-product]"); if (edit) { const form = $("[data-product-form]"); form.innerHTML = productForm(state.products.find((p) => p.id === edit.dataset.editProduct)); form.hidden = false; } if (event.target.matches("[data-cancel-product]")) $("[data-product-form]").hidden = true; const archive = event.target.closest("[data-archive-product]"); if (archive) { const { error } = await client.from("products").update({ status: "archived" }).eq("id", archive.dataset.archiveProduct); if (error) notice(error.message, true); else { notice("Product archived."); refreshAll(); } } const remove = event.target.closest("[data-delete-product]"); if (remove) { await deleteProduct(remove.dataset.deleteProduct); } const category = event.target.closest("[data-toggle-category]"); if (category) { const item = state.categories.find((p) => p.id === category.dataset.toggleCategory); const { error } = await client.from("product_categories").update({ is_active: !item.is_active }).eq("id", item.id); if (error) notice(error.message, true); else refreshAll(); } });
  document.addEventListener("change", async (event) => { if (event.target.matches("[name='image_source']")) { const form = event.target.form; const useUrl = event.target.value === "url"; const urlField = $("[data-image-url]", form); const fileField = $("[data-image-file]", form); urlField.hidden = !useUrl; fileField.hidden = useUrl; $("[name='external_url']", form).disabled = !useUrl; $("[name='image_file']", form).disabled = useUrl; } if (event.target.matches("[data-message-status]")) { await client.from("contact_messages").update({ status: event.target.value }).eq("id", event.target.dataset.messageStatus); refreshAll(); } if (event.target.matches("[data-subscriber-status]")) { await client.from("newsletter_subscribers").update({ status: event.target.value }).eq("id", event.target.dataset.subscriberStatus); refreshAll(); } });
  client.auth.onAuthStateChange(() => setTimeout(gate, 0)); gate();
})();
