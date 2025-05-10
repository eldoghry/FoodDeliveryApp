CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "user"(user_id),
    birth_date DATE NULL,
    gender VARCHAR(6) CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
