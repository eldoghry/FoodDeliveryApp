
CREATE TABLE menu_item (
    menu_id INT NOT NULL REFERENCES menu(menu_id),
    item_id INT NOT NULL REFERENCES item(item_id),
    PRIMARY KEY (menu_id, item_id)
);
