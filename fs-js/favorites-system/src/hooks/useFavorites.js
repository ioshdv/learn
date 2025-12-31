import { useContext } from "react";
import { ProductContext, ACTIONS } from "../context/ProductContext";

export const useFavorites = () => {
  const { state, dispatch } = useContext(ProductContext);
  const { favorites } = state;

  const toggleFavorite = (product) => {
    if (favorites.find((f) => f.id === product.id)) {
      dispatch({ type: ACTIONS.REMOVE_FAVORITE, payload: product });
    } else {
      dispatch({ type: ACTIONS.ADD_FAVORITE, payload: product });
    }
  };

  return { favorites, toggleFavorite };
};
