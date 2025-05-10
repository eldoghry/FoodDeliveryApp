CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES "user"(user_id),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
