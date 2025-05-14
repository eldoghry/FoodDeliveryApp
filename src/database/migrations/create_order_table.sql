CREATE TABLE "order" (
    order_id SERIAL PRIMARY KEY,
    order_status_id INT NOT NULL REFERENCES order_status(order_status_id),
    cart_id INT NOT NULL REFERENCES cart(cart_id),
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    delivery_address_id INT NOT NULL REFERENCES address(address_id),
    customer_instructions TEXT DEFAULT '',
    delivery_fees DECIMAL(5,2) NOT NULL CHECK (delivery_fees >= 0.00),
    service_fees DECIMAL(5,2) NOT NULL CHECK (service_fees >= 0.00),
    discount DECIMAL(10,2) NOT NULL CHECK (discount >= 0.00),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0.00),
    placed_at TIMESTAMP NOT NULL,
    delivered_at TIMESTAMP NOT NULL,
    cancellation_info JSONB, -- {cancelled_by: 'customer', cancellation_reason: 'reason', cancelled_at: 'timestamp'}
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
