CREATE TABLE rating (
    rating_id SERIAL PRIMARY KEY   ,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id),
    order_id INT NOT NULL REFERENCES order(order_id),
    rating smallint NOT NULL,
    comment text,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)