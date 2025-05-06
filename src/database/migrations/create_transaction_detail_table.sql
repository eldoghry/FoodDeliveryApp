CREATE TABLE transaction_detail (
    transaction_detail_id SERIAL PRIMARY KEY,
    -- transaction_id INT NOT NULL REFERENCES transaction(transaction_id),
    detail_key JSONB NOT NULL,
    detail_value JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
