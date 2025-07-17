CREATE TABLE restaurant_cuisine (
    restaurant_id INT NOT NULL UNIQUE REFERENCES "restaurant"(restaurant_id),
    cuisine_id INT NOT NULL UNIQUE REFERENCES "cuisine"(cuisine_id)
);
