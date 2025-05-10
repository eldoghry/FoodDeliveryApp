CREATE TABLE transaction (
    transaction_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    payment_method_id INT NOT NULL REFERENCES payment_method(payment_method_id),
    order_id INT NOT NULL REFERENCES "order"(order_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_status_id INT NOT NULL REFERENCES payment_status(payment_status_id),
    transaction_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAM
);
