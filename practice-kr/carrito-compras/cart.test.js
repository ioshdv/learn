import { calculateTotal, processOrder } from './cart';
import { stockService } from './stockService';

jest.mock('./stockService');

describe('Shopping Cart Unit Tests', () => {
  const mockItems = [
    { id: 1, name: 'Laptop', price: 1000, quantity: 1 },
    { id: 2, name: 'Mouse', price: 50, quantity: 2 }
  ];

  describe('calculateTotal', () => {
    test('should calculate total without discount', () => {
      expect(calculateTotal(mockItems)).toBe(1100);
    });

    test('should apply 10% discount correctly', () => {
      expect(calculateTotal(mockItems, 10)).toBe(990);
    });

    test('should throw error on invalid discount', () => {
      expect(() => calculateTotal(mockItems, 110)).toThrow('Invalid discount');
    });

    // Nuevo test para cubrir la rama de cantidad <= 0
    test('should throw error if quantity is zero or negative', () => {
      const invalidItems = [{ id: 3, name: 'Teclado', price: 100, quantity: 0 }];
      expect(() => calculateTotal(invalidItems)).toThrow('Invalid quantity for Teclado');
    });
  });

  describe('processOrder (Async & Mocks)', () => {
    test('should process order when stock is available', async () => {
      stockService.checkStock.mockResolvedValue(true);
      const result = await processOrder(mockItems, stockService);
      expect(result.status).toBe('success');
    });

    test('should throw error when item is out of stock', async () => {
      stockService.checkStock.mockResolvedValue(false);
      await expect(processOrder(mockItems, stockService))
        .rejects.toThrow('Out of stock: Laptop');
    });
  });
});