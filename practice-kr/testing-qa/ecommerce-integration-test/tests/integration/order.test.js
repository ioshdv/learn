require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');
const { User, Product, Order, sequelize } = require('../../src/models');

beforeAll(async () => await sequelize.sync({ force: true }));
afterAll(async () => await sequelize.close());

describe('Order API Integration', () => {
  it('should create an order', async () => {
    const user = await User.create({ name: 'John', email: 'john@test.com', password: '123456' });
    const product = await Product.create({ name: 'Test Product', price: 50 });

    const res = await request(app)
      .post('/orders')
      .send({ userId: user.id, items: [{ productId: product.id, quantity: 2 }] });

    expect(res.statusCode).toBe(201);
    const orderInDb = await Order.findOne({ where: { id: res.body.id } });
    expect(orderInDb.userId).toBe(user.id);
  });
});
