require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');
const { User, Order, Payment, sequelize } = require('../../src/models');

beforeAll(async () => await sequelize.sync({ force: true }));
afterAll(async () => await sequelize.close());

describe('Payment API Integration', () => {
  it('should create a payment', async () => {
    const user = await User.create({ name: 'John', email: 'john@test.com', password: '123456' });
    const order = await Order.create({ userId: user.id });

    const res = await request(app)
      .post('/payments')
      .send({ userId: user.id, orderId: order.id, amount: 100, method: 'card' });

    expect(res.statusCode).toBe(201);
    const paymentInDb = await Payment.findOne({ where: { id: res.body.id } });
    expect(paymentInDb.amount).toBe(100);
  });
});
