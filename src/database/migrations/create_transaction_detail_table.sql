CREATE TABLE transaction_detail (
    trans_detail_id SERIAL PRIMARY KEY,
    -- transaction_id INT NOT NULL REFERENCES transaction(transaction_id),
    detail_key VARCHAR(50) NOT NULL,
    detail_value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);