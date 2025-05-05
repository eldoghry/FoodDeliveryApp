CREATE TABLE transaction (
    transaction_id SERIAL PRIMARY KEY,
    -- customer_id INT NOT NULL REFERENCES customer(customer_id),
    -- payment_method_id INT NOT NULL REFERENCES payment_method(payment_method_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('order_payment', 'wallet_topup', 'refund', 'cashback', 'driver_bonus', 'store_commission')),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('order', 'wallet', 'driver', 'restaurant_branch')),
    target_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL CHECK (CHAR_LENGTH(currency) = 3),
    -- status_id INT NOT NULL REFERENCES payment_status(status_id),
    reference_code VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);