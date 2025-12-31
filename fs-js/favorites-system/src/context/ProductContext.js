import React, { createContext, useReducer, useEffect } from "react";

export const ProductContext = createContext();

const initialState = {
  products: [],
  favorites: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload || [] };
    default:
      return state;
  }
}

function readFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function writeFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Función para actualizar productos
  const setProducts = (products) => {
    dispatch({ type: "SET_PRODUCTS", payload: products });
  };

  // Agregar favorito
  const addFavorite = (product) => {
    const favs = readFavorites();
    if (!favs.find(f => f.id === product.id)) {
      const updated = [...favs, product];
      writeFavorites(updated);
      dispatch({ type: "SET_FAVORITES", payload: updated });
    }
  };

  // Remover favorito
  const removeFavorite = (productId) => {
    const updated = readFavorites().filter(f => f.id !== productId);
    writeFavorites(updated);
    dispatch({ type: "SET_FAVORITES", payload: updated });
  };

  // Inicializar favoritos al montar la pestaña
  useEffect(() => {
    dispatch({ type: "SET_FAVORITES", payload: readFavorites() });
  }, []);

  // Sincronización cross-tab
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "favorites") {
        dispatch({ type: "SET_FAVORITES", payload: readFavorites() });
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products: state.products,
        favorites: state.favorites,
        setProducts,
        addFavorite,
        removeFavorite,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
