CREATE TABLE cart_item (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES cart(cart_id),
    menu_item_id INT NOT NULL REFERENCES menu_item(menu_item_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0.00),
    discount DECIMAL(10,2) NOT NULL CHECK (price >= 0.00),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0.00),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 