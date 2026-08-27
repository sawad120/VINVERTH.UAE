import React from "react";
import Header from "./Header";
import SearchPanel from "./SearchPanel";
import MobileMenu from "./MobileMenu";
import CartDrawer from "./CartDrawer";
import Toast from "./Toast";
import BackToTop from "./BackToTop";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <SearchPanel />
      <MobileMenu />
      <main>{children}</main>
      <Footer />
      <BackToTop />
      <CartDrawer />
      <Toast />
    </>
  );
}
