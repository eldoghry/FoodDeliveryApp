
CREATE TABLE item (
    item_id SERIAL PRIMARY KEY,
    image_path VARCHAR(512) NOT NULL DEFAULT '',
    name VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(item_name) BETWEEN 2 AND 100),
    description TEXT DEFAULT '',
    price DECIMAL(10,2) NOT NULL CHECK (item_price >= 0.00),
    energy_val_cal DECIMAL(10,2) NOT NULL DEFAULT 0.0 CHECK (energy_val_cal >= 0.00),
    notes TEXT DEFAULT '',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
