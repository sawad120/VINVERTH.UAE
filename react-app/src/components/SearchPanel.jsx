import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function SearchPanel() {
  const { isSearchOpen, setIsSearchOpen } = useStore();
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchValue.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  const handleViewShop = () => {
    setIsSearchOpen(false);
    if (searchValue.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    } else {
      navigate("/shop");
    }
  };

  return (
    <div
      className={`search-panel ${isSearchOpen ? "is-open" : ""}`}
      data-search-panel
      id="global-search-panel"
    >
      <div className="container search-panel__inner">
        <label htmlFor="global-search">Search the collection</label>
        <input
          id="global-search"
          ref={inputRef}
          type="search"
          placeholder="Try ‘aviator’ or ‘optical’"
          autoComplete="off"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="button button--dark"
          type="button"
          onClick={handleViewShop}
        >
          View shop <span>→</span>
        </button>
      </div>
    </div>
  );
}
