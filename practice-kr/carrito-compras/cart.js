// Usamos constantes para evitar "Magic Numbers" y mejorar legibilidad
const MIN_DISCOUNT = 0;
const MAX_DISCOUNT = 100;

export const calculateTotal = (items, discount = 0) => {
  if (discount < MIN_DISCOUNT || discount > MAX_DISCOUNT) {
    throw new Error('Invalid discount');
  }
  
  const subtotal = items.reduce((acc, { price, quantity, name }) => {
    if (quantity <= 0) throw new Error(`Invalid quantity for ${name}`);
    return acc + (price * quantity);
  }, 0);
  
  return subtotal * (1 - discount / 100);
};

export const processOrder = async (items, stockService) => {
  // Validación temprana de stock en paralelo para optimizar performance
  await Promise.all(items.map(async (item) => {
    const isAvailable = await stockService.checkStock(item.id);
    if (!isAvailable) throw new Error(`Out of stock: ${item.name}`);
  }));

  return { 
    status: 'success', 
    total: calculateTotal(items) 
  };
};