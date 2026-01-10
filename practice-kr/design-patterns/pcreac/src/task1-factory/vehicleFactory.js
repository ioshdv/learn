const { Car, Bike } = require('./vehicles');

class VehicleFactory {
  static createVehicle(type, model) {
    switch (type) {
      case 'car':
        return new Car(model);
      case 'bike':
        return new Bike(model);
      default:
        throw new Error('Unknown vehicle type');
    }
  }
}

module.exports = { VehicleFactory };
