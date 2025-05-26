CREATE TABLE "order" (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    delivery_address_id INT NOT NULL REFERENCES address(address_id),
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id),
    status VARCHAR(6) NOT NULL CHECK (status IN ('initiated', 'pending', 'confirmed', 'onTheWay', 'delivered', 'canceled', 'failed')),
    customer_instructions TEXT DEFAULT '',
    delivery_fees DECIMAL(5,2) NOT NULL CHECK (delivery_fees >= 0.00),
    service_fees DECIMAL(5,2) NOT NULL CHECK (service_fees >= 0.00),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0.00),
    placed_at TIMESTAMP NOT NULL,
    delivered_at TIMESTAMP NOT NULL,
    cancellation_info JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);