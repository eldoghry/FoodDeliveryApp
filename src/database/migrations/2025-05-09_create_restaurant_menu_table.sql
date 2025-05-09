CREATE TABLE restaurant_menu (
    restaurant_menu_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    menu_id INT NOT NULL REFERENCES menu(menu_id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, menu_id)
);
