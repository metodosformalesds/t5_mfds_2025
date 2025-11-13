import React from "react";
import Navbar from "../Shared/components/Navbar";
import Footer from "../Shared/components/Footer";
import HomePage from "../features/catalogo/pages/HomePage";
import "../Shared/styles/global.css";

export default function App() {
  return (
    <>
      <Navbar />
      <HomePage />
      <Footer />
    </>
  );
}



