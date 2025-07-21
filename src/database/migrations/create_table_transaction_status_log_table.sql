CREATE TABLE transaction_status_log (
    transaction_status_log_id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES transaction(transaction_id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('initiated', 'pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'expired')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);