import React, { useContext, useEffect } from "react";
import { ProductContext, ProductProvider } from "./context/ProductContext";
import ProductList from "./components/ProductList";

function AppContent() {
  const { products, setProducts, favorites, addFavorite, removeFavorite } = useContext(ProductContext);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      const dataWithId = data.map((p, i) => ({ ...p, id: p.id || i }));
      setProducts(dataWithId);
    };
    fetchProducts();
  }, [setProducts]);

  return (
    <div>
      <h1>Product Management</h1>
      <ProductList
        products={products}
        favorites={favorites}
        addFavorite={addFavorite}
        removeFavorite={removeFavorite}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <AppContent />
    </ProductProvider>
  );
}
