CREATE TABLE category_items (
    category_id INT NOT NULL REFERENCES category(category_id),
    item_id INT NOT NULL REFERENCES item(item_id)
);