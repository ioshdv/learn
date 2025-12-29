/* Sample data to test the database */

-- Users
INSERT INTO app_users (first_name, last_name, email, password)
VALUES
('Ana', 'Lopez', 'ana@shop.com', 'hash'),
('Luis', 'Perez', 'luis@shop.com', 'hash'),
('Maria', 'Gomez', 'maria@shop.com', 'hash'),
('Carlos', 'Diaz', 'carlos@shop.com', 'hash'),
('Sofia', 'Ruiz', 'sofia@shop.com', 'hash');


-- Categories
INSERT INTO categories (name, description)
VALUES
('Electronics', 'Devices and gadgets'),
('Books', 'Books and magazines'),
('Clothing', 'Men and women clothing'),
('Home', 'Home and kitchen'),
('Sports', 'Sports equipment');

-- Products
INSERT INTO products (name, description, price, stock, category_id)
VALUES
('Laptop Pro', '15 inch laptop', 1500, 20, 1),
('Smartphone X', 'Latest smartphone', 999, 50, 1),
('SQL Mastery', 'Advanced SQL book', 45, 100, 2),
('T-Shirt', 'Cotton t-shirt', 20, 200, 3),
('Running Shoes', 'Comfort shoes', 120, 80, 5),
('Coffee Maker', 'Automatic coffee machine', 90, 40, 4);

-- Adress
INSERT INTO shipping_addresses (user_id, street, city, state, postal_code, country)
VALUES
(1, 'Street 1', 'Madrid', 'Madrid', '28001', 'Spain'),
(2, 'Street 2', 'Barcelona', 'Catalonia', '08001', 'Spain'),
(3, 'Street 3', 'Valencia', 'Valencia', '46001', 'Spain'),
(4, 'Street 4', 'Sevilla', 'Andalusia', '41001', 'Spain'),
(5, 'Street 5', 'Bilbao', 'Basque', '48001', 'Spain');

-- Payment methods
INSERT INTO payment_methods (method_name)
VALUES
('Credit Card'),
('Debit Card'),
('PayPal'),
('Bank Transfer');


-- Orders (pedidos)
INSERT INTO orders (user_id, address_id, payment_method_id, status)
VALUES
(1, 1, 1, 'paid'),
(2, 2, 2, 'shipped'),
(3, 3, 3, 'pending'),
(4, 4, 1, 'paid'),
(5, 5, 4, 'cancelled');


-- Order Items (Item de pedidos - carrito)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES
(1, 1, 1, 1500),
(1, 3, 2, 45),
(2, 2, 1, 999),
(2, 4, 3, 20),
(3, 6, 1, 90),
(4, 5, 2, 120),
(5, 4, 1, 20);

-- Reviews
INSERT INTO product_reviews (product_id, user_id, rating, comment)
VALUES
(1, 1, 5, 'Excellent laptop'),
(2, 2, 4, 'Very good phone'),
(3, 3, 5, 'Best SQL book'),
(4, 4, 3, 'Good quality'),
(5, 5, 4, 'Comfortable shoes');




-- Purchased products
SELECT product_id, quantity, unit_price
FROM order_items;

/* Simple list of products */
SELECT product_id, name, price
FROM products;

/* Simple list of users */
SELECT user_id, first_name, last_name, email
FROM app_users;


