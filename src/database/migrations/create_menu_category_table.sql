CREATE TABLE menu_category (
    menu_category_id SERIAL PRIMARY KEY,
    menu_id INT NOT NULL REFERENCES menu(menu_id),
    category_id INT NOT NULL REFERENCES category(category_id)
);