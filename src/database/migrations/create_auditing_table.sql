CREATE TABLE auditing (
    auditing_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES "user"(user_id),
    audit_event JSONB NOT NULL DEFAULT '{}',
    audit_data JSONB NOT NULL DEFAULT '{}',
    audit_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
