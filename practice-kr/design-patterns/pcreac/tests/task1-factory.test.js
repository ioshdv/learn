const { VehicleFactory } = require('../src/task1-factory/vehicleFactory');

describe('Task 1 - Factory Method', () => {
  test('creates car and bike via factory', () => {
    const car = VehicleFactory.createVehicle('car', 'Toyota');
    const bike = VehicleFactory.createVehicle('bike', 'Yamaha');

    expect(car.type).toBe('car');
    expect(car.model).toBe('Toyota');

    expect(bike.type).toBe('bike');
    expect(bike.model).toBe('Yamaha');
  });

  test('throws on unknown type', () => {
    expect(() => VehicleFactory.createVehicle('truck', 'Volvo')).toThrow(
      'Unknown vehicle type'
    );
  });
});
