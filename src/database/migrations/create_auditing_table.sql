CREATE TABLE auditing (
    audit_id SERIAL PRIMARY KEY,
    -- user_id INT NOT NULL REFERENCES "user"(user_id),
    table_name VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(table_name) BETWEEN 2 AND 100),
    row_id INT NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (CHAR_LENGTH(action) BETWEEN 2 AND 50),
    changed_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);