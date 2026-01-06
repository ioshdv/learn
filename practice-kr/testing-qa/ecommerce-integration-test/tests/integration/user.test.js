require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');
const { User, sequelize } = require('../../src/models');

beforeAll(async () => await sequelize.sync({ force: true }));
afterAll(async () => await sequelize.close());

describe('User API Integration with Transactions', () => {
  it('should create a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'John', email: 'john@test.com', password: '123456' });
    expect(res.statusCode).toBe(201);
    const userInDb = await User.findOne({ where: { email: 'john@test.com' } });
    expect(userInDb.name).toBe('John');
  });
});
