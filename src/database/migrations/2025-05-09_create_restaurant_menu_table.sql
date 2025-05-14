CREATE TABLE restaurant_menu (
    restaurant_menu_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id),
    menu_id INT NOT NULL REFERENCES menu(menu_id),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, menu_id)
);
