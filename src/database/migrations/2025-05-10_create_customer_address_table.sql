CREATE TABLE customer_address (
    address_id INT NOT NULL REFERENCES address(address_id),
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (address_id, customer_id)
);
