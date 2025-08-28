CREATE TABLE user_role (
    user_role_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES "user"(user_id),
    role_id INT NOT NULL REFERENCES role(role_id),
    UNIQUE(user_id, role_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
