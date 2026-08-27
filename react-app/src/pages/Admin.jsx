import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "../services/supabase";

const ALLOWED_CATEGORIES = [
  "Men\x27s Collection",
  "Women\x27s Collection",
  "Sunglasses",
  "Optical Frames"
];

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 700'%3E%3Crect width='800' height='700' fill='%23f2f0ed'/%3E%3Cpath d='M180 360h440l-45-65-82 52-78-105-155 178z' fill='%23d9dfd8'/%3E%3Ccircle cx='520' cy='240' r='42' fill='%23c2cec5'/%3E%3C/svg%3E";

const TABS = ["dashboard","products","categories","reviews","messages","subscribers","settings","audit"];

const DEFAULT_REVIEWS = [
  { id: 1, name: "Nada", city: "Dubai",     quote: "Best quality and super comfortable. Exactly what I was looking for!", avatarUrl: "" },
  { id: 2, name: "Nada", city: "Abu Dhabi", quote: "Absolutely love the design and fit. Perfect for everyday use.",        avatarUrl: "" },
  { id: 3, name: "Nada", city: "Sharjah",   quote: "Stylish, lightweight and worth every penny. Highly recommend!",         avatarUrl: "" }
];

function slugify(v) { return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

const S = `
.adm-body{min-height:100vh;color:#1f2937;background:#eaf2f8;font-family:var(--sans,system-ui,sans-serif)}
.adm-shell{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:40px 0 80px}
.adm-login{width:min(440px,100%);margin:9vh auto;padding:36px;border:1px solid rgba(31,41,55,.14);border-radius:8px;background:#fff}
.adm-fr{display:grid;gap:12px;margin:0 0 14px}
.adm-fr label{display:grid;gap:5px;font-size:12px;color:#526174;font-weight:500}
.adm-fr input,.adm-fr select,.adm-fr textarea{padding:10px 12px;border:1px solid rgba(31,41,55,.18);border-radius:6px;background:#f7fbff;color:#1f2937;font:inherit;font-size:13px;width:100%;box-sizing:border-box}
.adm-notice{min-height:18px;margin:10px 0;font-size:12px;font-weight:600}
.adm-notice.ok{color:#2e7d32}.adm-notice.err{color:#c62828}
.adm-hdr{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-bottom:24px;border-bottom:1px solid rgba(31,41,55,.12);margin-bottom:20px}
.adm-hdr h1{margin:4px 0 0;font-size:32px}
.adm-hdr-r{display:flex;align-items:center;gap:12px;font-size:12px;color:#526174}
.adm-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px}
.adm-tabs button{padding:9px 16px;border:1px solid rgba(31,41,55,.16);border-radius:6px;background:#fff;color:#1f2937;font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
.adm-tabs button.is-active{background:#5b54bc;border-color:#5b54bc;color:#fff}
.adm-tabs button:hover:not(.is-active){background:#f0eeff}
.adm-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:24px}
.adm-stat{padding:18px;border:1px solid rgba(31,41,55,.1);border-radius:8px;background:#fff}
.adm-stat span{font-size:11px;color:#526174;font-weight:500;text-transform:uppercase;letter-spacing:.05em}
.adm-stat strong{display:block;margin-top:6px;font-size:30px;font-weight:700;color:#5b54bc}
.adm-ph{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:20px}
.adm-ph h2{margin:0;font-size:22px}
.adm-grid{display:grid;gap:10px}
.adm-card{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;border:1px solid rgba(31,41,55,.1);border-radius:8px;background:#fff}
.adm-card img.pt{width:52px;height:52px;object-fit:cover;border-radius:4px;flex-shrink:0}
.adm-cm{display:flex;align-items:center;gap:12px;min-width:0;flex:1}
.adm-card h3{margin:0 0 3px;font-size:14px}
.adm-card p{margin:0;color:#526174;font-size:11px}
.adm-ca{display:flex;gap:7px;flex-shrink:0}
.adm-ca button{padding:7px 13px;border:1px solid rgba(31,41,55,.14);border-radius:5px;background:#fff;color:#1f2937;font:inherit;font-size:11px;font-weight:600;cursor:pointer}
.adm-ca button:hover{background:#f0eeff}
.adm-ca button.danger{color:#c62828}
.adm-ca button.danger:hover{background:#fff0f0}
.adm-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px;padding:24px;border:1px solid rgba(31,41,55,.12);border-radius:8px;background:#fff}
.adm-form label{display:grid;gap:5px;font-size:12px;color:#526174;font-weight:500}
.adm-form input,.adm-form select,.adm-form textarea{padding:10px 12px;border:1px solid rgba(31,41,55,.16);border-radius:6px;background:#f7fbff;color:#1f2937;font:inherit;font-size:13px;width:100%;box-sizing:border-box}
.adm-form textarea{min-height:110px;resize:vertical}
.adm-wide{grid-column:1/-1}
.adm-fa{display:flex;gap:10px;align-items:center;margin-top:4px}
.adm-it{display:flex;gap:16px;margin-bottom:8px}
.adm-it label{display:flex;align-items:center;gap:6px;font-size:12px;color:#526174;cursor:pointer;font-weight:500}
.adm-badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
.adm-badge.published{background:#e8f5e9;color:#2e7d32}
.adm-badge.draft{background:#fff8e1;color:#f57f17}
.adm-badge.archived{background:#f5f5f5;color:#757575}
.adm-rv{display:grid;grid-template-columns:60px 1fr auto;gap:16px;align-items:start;padding:18px;border:1px solid rgba(31,41,55,.1);border-radius:8px;background:#fff}
.adm-ava{width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid rgba(91,84,188,.2)}
.adm-avp{width:50px;height:50px;border-radius:50%;background:#5b54bc;color:#fff;display:grid;place-items:center;font-size:18px;font-weight:700}
.adm-sf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:18px}
.adm-sf label{display:grid;gap:5px;font-size:12px;color:#526174;font-weight:500;text-transform:capitalize}
.adm-sf input{padding:10px 12px;border:1px solid rgba(31,41,55,.16);border-radius:6px;background:#f7fbff;color:#1f2937;font:inherit;font-size:13px;width:100%;box-sizing:border-box}
.adm-btn{padding:10px 20px;border:1px solid rgba(31,41,55,.14);border-radius:6px;background:#fff;color:#1f2937;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
.adm-btn:hover{background:#f0eeff}
.adm-btn.primary{background:#5b54bc;border-color:#5b54bc;color:#fff}
.adm-btn.primary:hover{background:#4a43a5}
.adm-btn.sm{padding:7px 14px;font-size:11px}
.adm-btn:disabled{opacity:.55;cursor:not-allowed}
.adm-cl{display:flex;align-items:center;gap:8px;padding:14px 18px;border:1px solid rgba(91,84,188,.2);border-radius:8px;background:#f8f7ff}
.adm-cl span{font-size:13px;font-weight:600;flex:1}
.adm-cl .lk{font-size:11px;color:#526174}
@media(max-width:700px){.adm-stats{grid-template-columns:repeat(2,1fr)}.adm-form,.adm-sf{grid-template-columns:1fr}.adm-rv{grid-template-columns:48px 1fr}.adm-rv>*:last-child{grid-column:1/-1}}
`;

function Btn({ children, className = "", ...props }) {
  return <button className={`adm-btn ${className}`} {...props}>{children}</button>;
}

function Notice({ msg }) {
  if (!msg.text) return <p className="adm-notice" />;
  return <p className={`adm-notice ${msg.error ? "err" : "ok"}`}>{msg.text}</p>;
}

function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error: err } = await supabase.auth.signInWithPassword({ email: fd.get("email"), password: fd.get("password") });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onLogin();
  }
  return (
    <section className="adm-login">
      <p style={{ margin:"0 0 6px",color:"#5b54bc",fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase" }}>VINVERTH</p>
      <h1 style={{ margin:"0 0 6px",fontSize:30 }}>Admin access</h1>
      <p style={{ margin:"0 0 22px",fontSize:13,color:"#526174" }}>Sign in with your administrator account.</p>
      <form onSubmit={handleSubmit}>
        <div className="adm-fr"><label>Email<input name="email" type="email" autoComplete="email" required /></label></div>
        <div className="adm-fr"><label>Password<input name="password" type="password" autoComplete="current-password" required /></label></div>
        {error && <p style={{ color:"#c62828",fontSize:12,margin:"0 0 12px" }}>{error}</p>}
        <Btn type="submit" className="primary" disabled={loading} style={{ width:"100%" }}>{loading ? "Signing in…" : "Sign in →"}</Btn>
      </form>
    </section>
  );
}

function DashboardPanel({ products, messages, subscribers }) {
  const stats = [
    ["Products", products.length],
    ["Drafts", products.filter(p => p.status === "draft").length],
    ["Low stock", products.filter(p => p.stock_quantity <= (p.low_stock_threshold ?? 5)).length],
    ["New messages", messages.filter(m => m.status === "new").length],
    ["Subscribers", subscribers.length]
  ];
  return (
    <div>
      <h2 style={{ margin:"0 0 20px" }}>Dashboard overview</h2>
      <div className="adm-stats">
        {stats.map(([label, val]) => (
          <article className="adm-stat" key={label}><span>{label}</span><strong>{val}</strong></article>
        ))}
      </div>
    </div>
  );
}

function CategoriesPanel({ categories }) {
  return (
    <div>
      <div className="adm-ph"><h2>Categories</h2></div>
      <p style={{ fontSize:12,color:"#526174",margin:"0 0 16px" }}>These 4 categories are locked to the store taxonomy. They are auto-created in Supabase when you save your first product in each category.</p>
      <div className="adm-grid">
        {ALLOWED_CATEGORIES.map(name => {
          const ex = categories.find(c => c.name === name);
          return (
            <div className="adm-cl" key={name}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b54bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>{name}</span>
              <span className="lk">{ex ? `✓ In database · ${ex.is_active ? "Active" : "Hidden"}` : "Pending first product"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewsPanel() {
  const [reviews, setReviews] = useState(() => {
    try { const s = localStorage.getItem("vinverth_reviews"); return s ? JSON.parse(s) : DEFAULT_REVIEWS; }
    catch { return DEFAULT_REVIEWS; }
  });
  const [saved, setSaved] = useState(false);

  function update(id, field, value) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setSaved(false);
  }
  function saveAll() {
    localStorage.setItem("vinverth_reviews", JSON.stringify(reviews));
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  const inputStyle = { padding:"6px 10px", border:"1px solid rgba(31,41,55,.16)", borderRadius:5, background:"#f7fbff", font:"inherit", fontSize:13, boxSizing:"border-box" };
  const lblStyle = { display:"grid", gap:4, fontSize:11, color:"#526174", fontWeight:500 };

  return (
    <div>
      <div className="adm-ph">
        <h2>Reviews</h2>
        <Btn className="primary sm" onClick={saveAll}>Save all reviews</Btn>
      </div>
      {saved && <p style={{ color:"#2e7d32",fontSize:12,fontWeight:600,margin:"0 0 12px" }}>✓ Reviews saved to localStorage (reflected on homepage)</p>}
      <p style={{ fontSize:12,color:"#526174",margin:"0 0 18px" }}>Edit name, city, quote, and paste a profile image URL. Avatar preview updates live.</p>
      <div className="adm-grid">
        {reviews.map(r => (
          <div className="adm-rv" key={r.id}>
            <div>
              {r.avatarUrl
                ? <img className="adm-ava" src={r.avatarUrl} alt={r.name} onError={e => { e.currentTarget.style.display="none"; }} />
                : <div className="adm-avp">{r.name ? r.name[0] : "N"}</div>
              }
            </div>
            <div style={{ display:"grid", gap:8 }}>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <label style={lblStyle}>Name<input value={r.name} onChange={e => update(r.id,"name",e.target.value)} style={{ ...inputStyle, width:130 }} /></label>
                <label style={lblStyle}>City<input value={r.city} onChange={e => update(r.id,"city",e.target.value)} style={{ ...inputStyle, width:130 }} /></label>
              </div>
              <label style={lblStyle}>Quote
                <textarea value={r.quote} onChange={e => update(r.id,"quote",e.target.value)} rows={2} style={{ ...inputStyle, resize:"vertical" }} />
              </label>
              <label style={lblStyle}>Profile image URL
                <input type="url" placeholder="https://example.com/photo.jpg" value={r.avatarUrl} onChange={e => update(r.id,"avatarUrl",e.target.value)} style={inputStyle} />
              </label>
            </div>
            <span style={{ color:"#e6a63e", fontSize:14, letterSpacing:2 }}>★★★★★</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsPanel({ products, categories, onRefresh, setNotice }) {
  const [showForm, setShowForm] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [imgSrc, setImgSrc] = useState("url");
  const [saving, setSaving] = useState(false);

  function openNew() { setEditProd(null); setShowForm(true); setImgSrc("url"); }
  function openEdit(p) { setEditProd(p); setShowForm(true); setImgSrc("url"); }
  function cancel() { setShowForm(false); setEditProd(null); }

  async function handleSave(e) {
    e.preventDefault(); setNotice({ text:"" }); setSaving(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const id = fd.get("id");
    const name = String(fd.get("name")||"").trim();
    const price = Number(fd.get("price"));
    const catName = String(fd.get("category_name")||"Men's Collection").trim();
    const gender = fd.get("gender");
    const description = String(fd.get("description")||"").trim();
    const av = fd.get("availability");
    const stockQty = av==="out" ? 0 : av==="low" ? 2 : 20;
    const extUrl = form.querySelector("[name='external_url']")?.value?.trim()||"";
    const fileEl = form.querySelector("[name='image_file']");
    const file = fileEl?.files?.[0]||null;
    if (!name||name.length<2||!Number.isFinite(price)||price<0||!description) {
      setSaving(false); return setNotice({ text:"Enter valid name, price, and description.", error:true });
    }
    let cat = categories.find(c => c.name.toLowerCase()===catName.toLowerCase());
    let catId = cat?.id;
    if (!catId) {
      const r = await supabase.from("product_categories").upsert({ name:catName, slug:slugify(catName), is_active:true }, { onConflict:"slug" }).select("id").maybeSingle();
      if (r.data?.id) catId = r.data.id;
    }
    const payload = { name, price, gender, description, stock_quantity:stockQty, status:"published", is_featured:false, category_id:catId,
      ...(id ? {} : { sku:`ADMIN-${crypto.randomUUID()}`, slug:`admin-${crypto.randomUUID()}` }) };
    const res = id
      ? await supabase.from("products").update(payload).eq("id",id).select()
      : await supabase.from("products").insert(payload).select().single();
    if (res.error) { setSaving(false); return setNotice({ text:res.error.message, error:true }); }
    const prod = id ? res.data[0] : res.data;
    if (extUrl) {
      await supabase.from("product_images").update({ is_primary:false }).eq("product_id",prod.id);
      await supabase.from("product_images").insert({ product_id:prod.id, external_url:extUrl, alt_text:prod.name, is_primary:true });
    }
    if (file?.size) {
      const path = `products/${prod.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;
      const up = await supabase.storage.from("product-media").upload(path, file, { upsert:false, contentType:file.type });
      if (up.error) { setSaving(false); return setNotice({ text:`Upload failed: ${up.error.message}`, error:true }); }
      const sp = String(up.data?.path||path).replace(/^\/*/, "").replace(/^product-media\//,"");
      await supabase.from("product_images").update({ is_primary:false }).eq("product_id",prod.id);
      await supabase.from("product_images").insert({ product_id:prod.id, storage_path:sp, alt_text:prod.name, is_primary:true });
    }
    setSaving(false); setShowForm(false); setEditProd(null); setNotice({ text:"✓ Product saved." }); onRefresh();
  }

  async function handleDelete(pid) {
    if (!confirm("Permanently delete this product?")) return;
    const tp = products.find(p => p.id===pid);
    const paths = tp?.product_images?.map(i => String(i.storage_path||"").trim().replace(/^\//,"").replace(/^product-media\//,"")).filter(Boolean)||[];
    if (paths.length) await supabase.storage.from("product-media").remove(paths);
    await supabase.from("product_images").delete().eq("product_id",pid);
    const { error } = await supabase.from("products").delete().eq("id",pid);
    if (error) return setNotice({ text:error.message, error:true });
    setNotice({ text:"✓ Product deleted." }); onRefresh();
  }

  async function handleArchive(pid) {
    const { error } = await supabase.from("products").update({ status:"archived" }).eq("id",pid);
    if (error) return setNotice({ text:error.message, error:true });
    setNotice({ text:"✓ Archived." }); onRefresh();
  }

  const curCat = editProd?.product_categories?.name || "Men's Collection";

  return (
    <div>
      <div className="adm-ph"><h2>Products</h2><Btn className="primary sm" onClick={openNew}>New product +</Btn></div>
      {showForm && (
        <form className="adm-form" onSubmit={handleSave}>
          <h3 className="adm-wide" style={{ margin:0,fontSize:18 }}>{editProd ? "Edit product" : "New product"}</h3>
          <input type="hidden" name="id" value={editProd?.id||""} />
          <label>Name<input name="name" required minLength={2} maxLength={160} defaultValue={editProd?.name||""} /></label>
          <label>Price (AED)<input name="price" type="number" min={0} step={0.01} required defaultValue={editProd?.price||""} /></label>
          <label>Category
            <select name="category_name" required defaultValue={curCat}>
              {ALLOWED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>Gender
            <select name="gender" required defaultValue={editProd?.gender||"Unisex"}>
              <option>Men</option><option>Women</option><option>Unisex</option>
            </select>
          </label>
          <label>Availability
            <select name="availability" required defaultValue={editProd ? (editProd.stock_quantity===0?"out":editProd.stock_quantity<=5?"low":"in") : "in"}>
              <option value="in">In Stock</option><option value="low">Low Stock</option><option value="out">Out of Stock</option>
            </select>
          </label>
          <label className="adm-wide">Description<textarea name="description" maxLength={5000} required defaultValue={editProd?.description||""} /></label>
          <fieldset className="adm-wide" style={{ border:"1px solid rgba(31,41,55,.12)",borderRadius:6,padding:"14px 16px" }}>
            <legend style={{ fontSize:12,fontWeight:600,color:"#526174",padding:"0 6px" }}>Product image</legend>
            <div className="adm-it">
              <label><input type="radio" name="image_source" value="url" checked={imgSrc==="url"} onChange={() => setImgSrc("url")} /> Image URL</label>
              <label><input type="radio" name="image_source" value="file" checked={imgSrc==="file"} onChange={() => setImgSrc("file")} /> Upload file</label>
            </div>
            {imgSrc==="url"
              ? <label style={{ display:"grid",gap:5,fontSize:12,color:"#526174" }}>External URL<input name="external_url" type="url" placeholder="https://example.com/frame.jpg" /></label>
              : <label style={{ display:"grid",gap:5,fontSize:12,color:"#526174" }}>Image file<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" /></label>
            }
            {imgSrc==="url" && <input name="image_file" type="hidden" />}
            {imgSrc==="file" && <input name="external_url" type="hidden" value="" />}
          </fieldset>
          <div className="adm-wide adm-fa">
            <Btn type="submit" className="primary" disabled={saving}>{saving ? "Saving…" : "Save product"}</Btn>
            <Btn type="button" onClick={cancel}>Cancel</Btn>
          </div>
        </form>
      )}
      <div className="adm-grid" style={{ marginTop:18 }}>
        {products.length===0
          ? <p style={{ fontSize:13,color:"#526174" }}>No products yet. Click "New product +" to add your first.</p>
          : products.map(p => {
              const img = p.product_images?.find(i => i.is_primary)||p.product_images?.[0];
              const src = img?.external_url||IMAGE_PLACEHOLDER;
              return (
                <article className="adm-card" key={p.id}>
                  <div className="adm-cm">
                    <img className="pt" src={src} alt="" onError={e => { e.currentTarget.src=IMAGE_PLACEHOLDER; }} />
                    <div>
                      <h3>{p.name}</h3>
                      <p>{p.sku} · {p.product_categories?.name||"—"} · AED {p.price} · {p.stock_quantity} in stock</p>
                      <span className={`adm-badge ${p.status}`}>{p.status}</span>
                    </div>
                  </div>
                  <div className="adm-ca">
                    <button onClick={() => openEdit(p)}>Edit</button>
                    <button onClick={() => handleArchive(p.id)}>Archive</button>
                    <button className="danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </article>
              );
            })
        }
      </div>
    </div>
  );
}

function MessagesPanel({ messages, onRefresh, setNotice }) {
  async function updateStatus(id, status) {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) setNotice({ text:error.message, error:true }); else onRefresh();
  }
  return (
    <div>
      <h2 style={{ margin:"0 0 18px" }}>Contact messages</h2>
      <div className="adm-grid">
        {messages.length===0
          ? <p style={{ fontSize:13,color:"#526174" }}>No messages yet.</p>
          : messages.map(m => (
              <article className="adm-card" key={m.id}>
                <div className="adm-cm" style={{ flexDirection:"column",alignItems:"flex-start" }}>
                  <h3>{m.full_name} · {m.email}</h3>
                  <p style={{ marginTop:4,maxWidth:600 }}>{m.message}</p>
                  <p style={{ marginTop:4 }}>{new Date(m.submitted_at).toLocaleString()}</p>
                </div>
                <select value={m.status} onChange={e => updateStatus(m.id,e.target.value)} style={{ padding:"8px 12px",border:"1px solid rgba(31,41,55,.16)",borderRadius:6,font:"inherit",fontSize:12 }}>
                  {["new","in_progress","resolved","archived"].map(s => <option key={s}>{s}</option>)}
                </select>
              </article>
            ))
        }
      </div>
    </div>
  );
}

function SubscribersPanel({ subscribers, onRefresh, setNotice }) {
  async function updateStatus(id, status) {
    const { error } = await supabase.from("newsletter_subscribers").update({ status }).eq("id", id);
    if (error) setNotice({ text:error.message, error:true }); else onRefresh();
  }
  return (
    <div>
      <h2 style={{ margin:"0 0 18px" }}>Newsletter subscribers</h2>
      <div className="adm-grid">
        {subscribers.length===0
          ? <p style={{ fontSize:13,color:"#526174" }}>No subscribers yet.</p>
          : subscribers.map(s => (
              <article className="adm-card" key={s.id}>
                <div className="adm-cm"><div><h3>{s.email}</h3><p>{new Date(s.subscribed_at).toLocaleString()}</p></div></div>
                <select value={s.status} onChange={e => updateStatus(s.id,e.target.value)} style={{ padding:"8px 12px",border:"1px solid rgba(31,41,55,.16)",borderRadius:6,font:"inherit",fontSize:12 }}>
                  <option value="subscribed">subscribed</option>
                  <option value="unsubscribed">unsubscribed</option>
                </select>
              </article>
            ))
        }
      </div>
    </div>
  );
}

function SettingsPanel({ settings, setNotice }) {
  const [saving, setSaving] = useState(false);
  const FIELDS = ["store_name","support_email","whatsapp_number","instagram_url","logo_url","announcement_text","default_currency","default_seo_title","default_seo_description"];
  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    const update = Object.fromEntries(FIELDS.map(k => [k, fd.get(k)||""]));
    const { error } = await supabase.from("site_settings").update(update).eq("id", 1);
    setSaving(false); setNotice(error ? { text:error.message, error:true } : { text:"✓ Settings saved." });
  }
  if (!settings) return <p style={{ fontSize:13,color:"#526174" }}>Loading settings…</p>;
  return (
    <div>
      <h2 style={{ margin:"0 0 18px" }}>Site settings</h2>
      <form className="adm-sf" onSubmit={handleSave}>
        {FIELDS.map(k => (
          <label key={k} style={{ display:"grid",gap:5,fontSize:12,color:"#526174",fontWeight:500,textTransform:"capitalize" }}>
            {k.replaceAll("_"," ")}
            <input name={k} defaultValue={settings[k]||""} />
          </label>
        ))}
        <div style={{ gridColumn:"1/-1" }}>
          <Btn type="submit" className="primary" disabled={saving}>{saving ? "Saving…" : "Save settings"}</Btn>
        </div>
      </form>
    </div>
  );
}

function AuditPanel({ audit }) {
  return (
    <div>
      <h2 style={{ margin:"0 0 18px" }}>Audit log</h2>
      <div className="adm-grid">
        {audit.length===0
          ? <p style={{ fontSize:13,color:"#526174" }}>No audit entries yet.</p>
          : audit.map(a => (
              <article className="adm-card" key={a.id}>
                <div><h3>{a.entity_type} · {a.action}</h3><p>{new Date(a.created_at).toLocaleString()} · {a.entity_id}</p></div>
              </article>
            ))
        }
      </div>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notice, setNotice] = useState({ text:"" });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const refreshAll = useCallback(async () => {
    const [cat, prod, msg, sub, set, aud] = await Promise.all([
      supabase.from("product_categories").select("*").order("sort_order").order("name"),
      supabase.from("products").select("*, product_categories(name), product_images(*)").order("updated_at", { ascending:false }),
      supabase.from("contact_messages").select("*").order("submitted_at", { ascending:false }).limit(50),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending:false }).limit(100),
      supabase.from("site_settings").select("*").eq("id",1).single(),
      supabase.from("audit_log").select("*").order("created_at", { ascending:false }).limit(100)
    ]);
    setCategories(cat.data||[]); setProducts(prod.data||[]); setMessages(msg.data||[]);
    setSubscribers(sub.data||[]); setSettings(set.data||null); setAudit(aud.data||[]);
  }, []);

  useEffect(() => { if (session) refreshAll(); }, [session, refreshAll]);

  async function signOut() { await supabase.auth.signOut(); setSession(null); setNotice({ text:"" }); }

  if (loading) return (
    <div className="adm-body" style={{ display:"grid",placeItems:"center",minHeight:"100vh" }}>
      <style>{S}</style>
      <p style={{ color:"#526174",fontSize:14 }}>Loading…</p>
    </div>
  );

  return (
    <div className="adm-body">
      <Helmet><title>VINVERTH Admin</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <style>{S}</style>
      <main className="adm-shell">
        {!session ? (
          <LoginScreen onLogin={() => supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))} />
        ) : (
          <>
            <header className="adm-hdr">
              <div>
                <p style={{ margin:0,fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#5b54bc" }}>VINVERTH</p>
                <h1 style={{ margin:"4px 0 0" }}>Store administration</h1>
              </div>
              <div className="adm-hdr-r">
                <span>{session.user.email}</span>
                <Btn className="sm" onClick={signOut}>Sign out</Btn>
              </div>
            </header>
            <nav className="adm-tabs" aria-label="Admin sections">
              {TABS.map(tab => (
                <button key={tab} className={activeTab===tab ? "is-active" : ""} onClick={() => { setActiveTab(tab); setNotice({ text:"" }); }} style={{ textTransform:"capitalize" }}>{tab}</button>
              ))}
            </nav>
            <Notice msg={notice} />
            {activeTab==="dashboard"   && <DashboardPanel products={products} messages={messages} subscribers={subscribers} />}
            {activeTab==="products"    && <ProductsPanel products={products} categories={categories} onRefresh={refreshAll} setNotice={setNotice} />}
            {activeTab==="categories"  && <CategoriesPanel categories={categories} />}
            {activeTab==="reviews"     && <ReviewsPanel />}
            {activeTab==="messages"    && <MessagesPanel messages={messages} onRefresh={refreshAll} setNotice={setNotice} />}
            {activeTab==="subscribers" && <SubscribersPanel subscribers={subscribers} onRefresh={refreshAll} setNotice={setNotice} />}
            {activeTab==="settings"    && <SettingsPanel settings={settings} setNotice={setNotice} />}
            {activeTab==="audit"       && <AuditPanel audit={audit} />}
          </>
        )}
      </main>
    </div>
  );
}
