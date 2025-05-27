CREATE TABLE payment_method_config (
    payment_method_config_id SERIAL PRIMARY KEY,
    payment_method_id INT NOT NULL REFERENCES payment_method(payment_method_id),
    gateway_config JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);