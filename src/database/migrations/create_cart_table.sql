CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    -- customer_id INT NOT NULL REFERENCES customer(customer_id),
    -- branch_id INT NOT NULL REFERENCES branch(branch_id),
    total_items INT NOT NULL CHECK (total_items > 0),
    cart_discount DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0.00),
    restaurant_note TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
