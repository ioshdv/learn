const { Payment, Order, User } = require('../models');

exports.createPayment = async (req, res) => {
  try {
    const { userId, orderId, amount, method } = req.body;
    const user = await User.findByPk(userId);
    const order = await Order.findByPk(orderId);
    if (!user || !order) return res.status(400).json({ error: 'User or Order not found' });

    const payment = await Payment.create({ userId, orderId, amount, method, status: 'pending' });
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
