module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
  });

  return Order;
};
