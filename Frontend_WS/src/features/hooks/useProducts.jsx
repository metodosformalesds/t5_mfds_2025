// src/features/hooks/useProducts.jsx
import { createContext, useContext, useState } from "react";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);

  const createProduct = (data) => {
    const newProduct = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      ...data,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id, partial) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...partial } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const value = { products, createProduct, updateProduct, deleteProduct };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx)
    throw new Error("useProducts must be used dentro de un <ProductsProvider>");
  return ctx;
}
