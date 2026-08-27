import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const urlGender = searchParams.get("gender") || "all";
  const urlCategory = searchParams.get("category") || "all";

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [genderFilter, setGenderFilter] = useState(urlGender);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setGenderFilter(searchParams.get("gender") || "all");
    setCategoryFilter(searchParams.get("category") || "all");
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    const g = genderFilter.toLowerCase();
    const c = categoryFilter.toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !s ||
        `${product.name} ${product.category} ${product.gender} ${product.description}`
          .toLowerCase()
          .includes(s);

      const matchesGender =
        g === "all" ||
        String(product.gender || "").toLowerCase() === g;

      const matchesCategory =
        c === "all" ||
        String(product.category || "").toLowerCase() === c;

      return matchesSearch && matchesGender && matchesCategory;
    });
  }, [products, searchTerm, genderFilter, categoryFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setGenderFilter("all");
    setCategoryFilter("all");
    setSearchParams({});
  };

  const handleGenderChange = (val) => {
    setGenderFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === "all") newParams.delete("gender");
    else newParams.set("gender", val);
    setSearchParams(newParams);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val.trim()) newParams.delete("search");
    else newParams.set("search", val.trim());
    setSearchParams(newParams);
  };

  return (
    <>
      <Helmet>
        <title>Shop — VINVERTH Eyewear</title>
        <meta
          name="description"
          content="Shop the VINVERTH eyewear collection — premium handcrafted frames."
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">The full collection</p>
          <h1>
            Find your<br />
            <em>point of view.</em>
          </h1>
          <p>Considered frames. One that feels unmistakably you.</p>
        </div>
      </section>

      <section className="shop-section">
        <div className="container">
          <div className="shop-toolbar">
            <div className="shop-toolbar__count" data-product-count>
              {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"}
            </div>
            <button
              className="filter-toggle"
              data-filter-toggle
              type="button"
              onClick={() => setIsFilterOpen(true)}
            >
              Filters <span>+</span>
            </button>
          </div>

          <div className="shop-layout">
            <aside className={`filters ${isFilterOpen ? "is-open" : ""}`} data-filters>
              <div className="filter-head">
                <strong>Filter by</strong>
                <button
                  type="button"
                  data-filter-close
                  aria-label="Close filters"
                  onClick={() => setIsFilterOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="filter-group">
                <h3>Search</h3>
                <input
                  type="search"
                  data-product-search
                  aria-label="Search frames"
                  placeholder="Search frames..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <h3>Collection</h3>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="all"
                    checked={genderFilter.toLowerCase() === "all"}
                    onChange={() => handleGenderChange("all")}
                  />{" "}
                  All collections
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Men"
                    checked={genderFilter.toLowerCase() === "men"}
                    onChange={() => handleGenderChange("Men")}
                  />{" "}
                  Men's
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Women"
                    checked={genderFilter.toLowerCase() === "women"}
                    onChange={() => handleGenderChange("Women")}
                  />{" "}
                  Women's
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Unisex"
                    checked={genderFilter.toLowerCase() === "unisex"}
                    onChange={() => handleGenderChange("Unisex")}
                  />{" "}
                  Unisex
                </label>
              </div>

              <button
                className="text-link"
                data-clear-filters
                type="button"
                onClick={handleClearFilters}
              >
                Clear all filters
              </button>
            </aside>

            <div className="shop-results">
              <div className="product-grid" id="shop-products">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="empty-state" data-empty-state>
                  <span>⌕</span>
                  <h2>No frames found</h2>
                  <p>Try a different search or clear your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
