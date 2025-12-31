const CACHE_KEY = "products_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const fetchProducts = async () => {
  // Revisar cache
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  if (cached.data && cached.expiry > Date.now()) {
    return cached.data;
  }

  // Traer desde API
  const res = await fetch("https://fakestoreapi.com/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();

  // Guardar cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ data, expiry: Date.now() + CACHE_TTL })
  );

  return data;
};
