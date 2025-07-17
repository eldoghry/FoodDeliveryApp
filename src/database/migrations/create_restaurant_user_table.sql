CREATE TABLE restaurant_user (
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id),
    user_id INT NOT NULL REFERENCES user(user_id)
);