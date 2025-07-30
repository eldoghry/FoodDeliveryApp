CREATE TABLE order_status_log (
    order_status_log_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES "order"(order_id),
    "status" VARCHAR(30) NOT NULL CHECK ("status" IN ('initiated', 'pending', 'confirmed', 'onTheWay', 'delivered', 'canceled', 'failed')),
    change_by VARCHAR(30) NOT NULL CHECK (change_by IN ('system', 'restaurant', 'payment')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);