const sequelize = require('../../src/models/index');
let transaction;

const startTransaction = async () => {
  transaction = await sequelize.transaction();
  return transaction;
};

const rollbackTransaction = async () => {
  if (transaction) await transaction.rollback();
};

module.exports = { startTransaction, rollbackTransaction };
