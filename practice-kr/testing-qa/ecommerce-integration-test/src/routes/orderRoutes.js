const express = require('express');
const router = express.Router();
const { User, Product, Order, sequelize } = require('../models');

router.post('/', async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({ message: 'userId and items are required' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const order = await Order.create({ userId });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) continue;
      await order.addProduct(product, { through: { quantity: item.quantity } });
    }

    const orderWithProducts = await Order.findByPk(order.id, {
      include: Product
    });

    res.status(201).json(orderWithProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
