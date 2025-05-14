CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id),
    total_items INT NOT NULL DEFAULT 0 CHECK (total_items >=0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
