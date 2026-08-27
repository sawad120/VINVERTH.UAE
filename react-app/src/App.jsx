import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { StoreProvider } from "./context/StoreContext";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Policies from "./pages/Policies";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <StoreProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin — no store Layout */}
            <Route path="/admin" element={<Admin />} />
            {/* Store routes — wrapped in Layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/product" element={<Product />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  {/* Fallback to Home */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </HelmetProvider>
  );
}
