require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');
const { Product, sequelize } = require('../../src/models');

beforeAll(async () => await sequelize.sync({ force: true }));
afterAll(async () => await sequelize.close());

describe('Product API Integration', () => {
  it('should create a product', async () => {
    const res = await request(app)
      .post('/products')
      .send({ name: 'New Product', price: 99.99 });
    expect(res.statusCode).toBe(201);
    const productInDb = await Product.findOne({ where: { name: 'New Product' } });
    expect(productInDb.price).toBeCloseTo(99.99);
  });
});
