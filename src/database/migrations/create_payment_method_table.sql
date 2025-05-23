CREATE TABLE payment_method (
    payment_method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(method_name) BETWEEN 2 AND 50),
    description TEXT DEFAULT '',
    icon_url VARCHAR(255) NOT NULL DEFAULT '',
    "order" INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
