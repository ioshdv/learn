const { Order, Product, User } = require('../models');

exports.createOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    let total = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) return res.status(400).json({ error: 'Product not found' });
      total += product.price * item.quantity;
    }

    const order = await Order.create({ userId, total, status: 'pending' });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
