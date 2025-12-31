import React from "react";

export default function ProductList({ products, favorites, addFavorite, removeFavorite }) {
  return (
    <div>
      {products.map(product => {
        const isFav = favorites.some(f => f.id === product.id);
        return (
          <div key={product.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
            <h3>{product.title}</h3>
            <p>${product.price}</p>
            <button onClick={() => (isFav ? removeFavorite(product.id) : addFavorite(product))}>
              {isFav ? "Remove Favorite" : "Add Favorite"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
