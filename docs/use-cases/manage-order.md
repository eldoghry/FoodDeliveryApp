# Manage Order – Use Case Documentation

This repository contains comprehensive documentation for the **Place Order** use case of a food delivery application. It includes the complete flow description, visual representations, data modeling, and supporting pseudocode and diagrams.

---

## Content List

1. [Overview](#overview)
2. [Manage order Use Case Flows](#manage-order-use-case-flows) 
3. [Flowchart Diagram](#flowchart-diagram)
4. [Sequence Diagram](#sequence-diagram)
5. [Pseudocode](#pseudocode)
6. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
7. [Data Model Description](#data-model-description)
8. [SQL Scripts](#sql-scripts)

---

## Overview

The **Place Order** use case enables customers of the food delivery application to seamlessly complete the ordering process—from selecting a delivery location and items to completing payment and receiving their order. This use case is essential for ensuring a smooth, secure, and user-friendly experience. It includes the ability to:

- Detect or manually assign a delivery location  
- Browse and select restaurants and menu items  
- Apply customizations and review cart contents  
- Choose a preferred payment method (wallet, credit card, etc.)  
- Complete secure payment with OTP verification  
- Track order status and delivery progress in real-time 

This documentation presents the full flow and core logic of the Place Order use case, including business rules, interaction diagrams, data entities, and implementation-ready pseudocode.

---

## Manage Order Use Case Flows

### `Actors`  
- Customer
- Restaurant/Kitchen Staff
- Delivery Person (Driver)
- Payment Gateway

### `Main Flow : Place New Order` 
#### Goal : 
The customer selects their preferred items and receives timely delivery at the specified location.

#### **Precondition** : 
- The customer is authenticated in the application using their user account. 
- The restaurant is subscribed to the app, and its employees have the privilege to manage order requests. 

#### **Flow Steps** : 
1. The customer opens the application on their phone, and the system automatically assigns an address if location detection is enabled on the mobile device. Alternatively, the customer can manually assign an address using the map. 
2. When the location is successfully assigned, the system redirects the customer to the register/login screen. The customer then registers or logs in using their user account and receives an OTP via SMS to complete the authentication process.  
3. When the customer is successfully authorized or remains unauthorized, the system directs them to a list of recommended restaurants based on the assigned location..  
4. To place a new order, the customer browses or searches for a restaurant and selects one to view its menu.  
5. The customer selects specific items from the menu and customizes them.  
6. The customer adds the selected items to the shopping cart.  
7. The customer opens the cart to review the items, update quantities, remove items or add a note for the restaurant.  
8. The system checks the customer's authorization. If authorized, they can proceed to checkout; otherwise, they are redirected to the register/login screen.
9. The system displays the delivery details, including the current delivery location. The customer can update the location or add a new one, and the system updates it accordingly.  
10. The customer selects a payment method. If they choose a credit card or Visa, they enter the necessary card details.  
11. If the customer does not select a payment method and wants to use the application’s wallet, the amount is deducted directly from the wallet. If the wallet balance is insufficient, the customer can recharge it or pay the remaining amount using a credit card or Visa.  
12. The customer can apply a coupon or voucher if available. The system validates it and updates the receipt accordingly.  
13. After selecting the delivery location, payment method, and reviewing the final order summary, the "Execute Order" button is enabled. The customer clicks on it to proceed to the **Payment Verification** screen for secure payment processing.  
14. On the **Payment Verification** screen:  
    - An OTP is sent via SMS to the phone number linked to the customer's credit card or Visa.  
    - The customer enters the OTP.  
    - If the entered OTP matches the sent code and the account has sufficient funds, the payment is completed, and the order amount is deducted. The customer is then redirected to the **Order Tracking** screen.  
    - If the OTP is incorrect, the payment is declined, and the customer can re-enter the correct code or request a new OTP.  
    - If the OTP is correct but the account balance is insufficient, the payment is rejected, and a message is sent to the customer explaining the reason. The customer is then redirected back to the **Order Summary** screen.  
15. After successful payment, the customer is redirected to the **Order Tracking** page.  
    - The system searches for a delivery person to accept the request.  
    - Once a delivery person is assigned, the order is sent to the restaurant for preparation.  
    - When the restaurant completes the preparation, the delivery person picks up the order and delivers it to the customer.  
    - The customer can track the order status at each stage:  
      **"Delivery person assigned," "Order is ready," "Delivery person is on the way,"** and **"Order delivered."**  
    - The customer can also track the delivery person's real-time location on the map.  
16. Upon receiving the order, the system saves the order details, allowing the customer to access them later for reordering or issue resolution. The customer is then redirected to the **Order Summary** screen, displaying the final status: **"Order Delivered."**  
17. After receiving the order, the customer can rate the delivery person and restaurant or submit a complaint if there is an issue with the order.

**Postcondition**:  
- **order Status Updated**: 
	- The restaurant order is either in a "Delivery person found,", "Order is ready"  , "Delivery person is on the way," or "Order delivered" state, depending on the actions taken by the restaurant and the delivery person.
. 
- **Notification Sent**: 
	- notification is sent to the customer each time the order status changes to keep them updated on its progress.

---

## Flowchart Diagram

![Place Order Flowchart](../diagrams/manage-order/flowchart.png)

---

## Sequence Diagram

![FDS Sequence Diagram](../diagrams/manage-order/sequence-diagram.png) 

---

## Entity Relationship Diagram (ERD)

![ERD Diagram](../diagrams/manage-order/erd-diagram.png)

---

## Data Model Description

The data model for the **Manage Cart** use case includes core entities such as users, customers, restaurants, menus, items, and the cart itself. The following tables are used to support the cart operations:


### `user_type`
Defines the roles of users in the system.

- `user_type_id` (PK)
- `name` – Unique role name (e.g., "customer")
- `created_at`, `updated_at`


### `user`
Stores account details for users, including login credentials and contact information.

- `user_id` (PK)
- `user_type_id` – Foreign key to `user_type`
- `name`, `phone`, `email`, `password`
- `is_active`, `created_at`, `updated_at`


### `customer`
Links the user to a customer profile, including optional personal data.

- `customer_id` (PK)
- `user_id` – Foreign key to `user`
- `birth_date`, `gender`
- `created_at`, `updated_at`


### `address`
Manages customer addresses. A customer may have multiple addresses with one marked as default.

- `address_id` (PK)
- `address_line1`, `address_line2`, `city`
- `is_default` – Indicates default delivery address
- `created_at`, `updated_at`
  

### `restaurant`
Stores restaurant registration and profile details.

- `restaurant_id` (PK)
- `user_id` – Foreign key to `user`
- `name`, `commercial_registration_number`, `vat_number`
- `logo_url`, `banner_url`, `location` (contains location details)
- `status` (enum: open, busy, pause, closed)
- `is_active`, `created_at`, `updated_at`
  

### `menu`
Defines menus for restaurants. Each restaurant can have multiple menus.

- `menu_id` (PK)
- `restaurant_id` – Foreign key to `restaurant`
- `menu_title`
- `is_active`
- `created_at`, `updated_at`

### `category` and `menu_category`
Defines categories for menus. Each menu can have multiple categories.

- `category_id` (PK), `title`, `is_active`
- `created_at`, `updated_at`

- `menu_category`: Composite table linking `menu_id` with `category_id`


### `item`
Defines items with pricing and availability.

- `item_id` (PK)
- `category_id` – Foreign key to `category`
- `image_path`, `name`, `description`, `price`, `energy_val_cal`, `notes`
- `is_available`, `created_at`, `updated_at`

### `cart`
Represents a customer’s cart.

- `cart_id` (PK)
- `customer_id` – Foreign key to `customer`
- `total_items`
- `created_at`, `updated_at`


### `cart_item`
Stores individual items within a cart along with pricing and quantity.

- `cart_item_id` (PK)
- `cart_id` – Foreign key to `cart`
- `restaurant_id` – Foreign key to `restaurant`
- `item_id` – Foreign key to `item`
- `quantity`, `price`, `total_price`
- `created_at`, `updated_at`


### `order`
Stores order details.

- `order_id` (PK)
- `order_status_id` – Foreign key to `order_status`
- `customer_id` – Foreign key to `customer`
- `restaurant_id` – Foreign key to `restaurant`
- `delivery_address_id` – Foreign key to `address`
- `status` (enum: initiated, pending, confirmed, onTheWay, delivered, canceled, failed)
- `delivery_fees`,`service_fees`
- `customer_instructions`
- `total_amount`
- `placed_at`, `delivered_at`
- `cancellation_info`
- `created_at`, `updated_at`


### `order_item`
Stores individual items within an order along with pricing and quantity.

- `order_item_id` (PK)
- `order_id` – Foreign key to `order`
- `item_id` – Foreign key to `item`
- `quantity`, `item_price`, `total_price`
- `created_at`, `updated_at`


### `order_status_log`
Stores order status changes details.

- `order_status_log_id` (PK)
- `order_id` – Foreign key to `order`
- `status` (enum: initiated, pending, confirmed, onTheWay, delivered, canceled, failed)
- `change_by` (enum: system, restaurant, payment)
- `created_at`


### `payment_method`
Stores payment method details.

- `payment_method_id` (PK)
- `method_name` (enum: cash, visa, wallet)
- `description`
- `icon_url`
- `order` (sort order of payment method)
- `is_active`
- `created_at`, `updated_at`


### `payment_method_config`
Stores payment method configuration details.

- `payment_method_config_id` (PK)
- `payment_method_id` – Foreign key to `payment_method`
- `gateway_config` (contains )
- `is_active`
- `created_at`, `updated_at`


### `payment_status`
Stores payment status details.

- `payment_status_id` (PK)
- `status_name`
- `is_active`
- `created_at`, `updated_at`


### `transaction`
Stores transaction details.

- `transaction_id` (PK)
- `customer_id` – Foreign key to `customer`
- `order_id` – Foreign key to `order`
- `payment_method_id` – Foreign key to `payment_method`
- `amount`
- `payment_status_id` – Foreign key to `payment_status`
- `transaction_code`
- `created_at`, `updated_at`


### `transaction_detail`
Stores transaction details.

- `transaction_detail_id` (PK)
- `transaction_id` – Foreign key to `transaction`
- `detail_key`
- `detail_value`
- `created_at`


### `auditing`
Stores auditing details.

- `auditing_id` (PK)
- `user_id` – Foreign key to `user`
- `audit_event`
- `audit_data`
- `audit_date`
- `created_at`


These entities together provide the full backend data structure for managing a customer's order, supporting features such as placing orders, tracking order status, payment processing, and auditing.
---

```sql
CREATE TABLE user_type (
    user_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(250) NOT NULL CHECK (CHAR_LENGTH(password) BETWEEN 8 AND 250),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    user_type_id INT REFERENCES user_type(user_type_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "user"(user_id),
    birth_date DATE NULL,
    gender VARCHAR(6) CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurant (
    restaurant_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "user"(user_id),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512) DEFAULT '',
    banner_url VARCHAR(512) NOT NULL DEFAULT '',
    location JSONB,
    status VARCHAR(6) NOT NULL CHECK (status IN ('open', 'busy', 'pause', 'closed')),
    commercial_registration_number VARCHAR(20) UNIQUE NOT NULL,
    vat_number VARCHAR(15) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu (
    menu_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL UNIQUE REFERENCES restaurant(restaurant_id),
    menu_title VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(menu_title) BETWEEN 2 AND 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(title) BETWEEN 2 AND 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_category (
    menu_category_id SERIAL PRIMARY KEY,
    menu_id INT NOT NULL REFERENCES menu(menu_id),
    category_id INT NOT NULL REFERENCES category(category_id)
);

CREATE TABLE item (
    item_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES category(category_id),
    image_path VARCHAR(512) NOT NULL DEFAULT '',
    name VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(name) BETWEEN 2 AND 100),
    description TEXT DEFAULT '',
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0.00),
    energy_val_cal DECIMAL(10,2) NOT NULL DEFAULT 0.0 CHECK (energy_val_cal >= 0.00),
    notes TEXT DEFAULT '',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart (
    cart_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_item (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES cart(cart_id),
    restaurant_id INT NOT NULL REFERENCES restaurant(restaurant_id),
    item_id INT NOT NULL REFERENCES item(item_id),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0.00),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0.00),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "order" (
    order_id SERIAL PRIMARY KEY,
    order_status_id INT NOT NULL REFERENCES order_status(order_status_id),
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    delivery_address_id INT NOT NULL REFERENCES address(address_id),
    customer_instructions TEXT DEFAULT '',
    delivery_fees DECIMAL(5,2) NOT NULL CHECK (delivery_fees >= 0.00),
    service_fees DECIMAL(5,2) NOT NULL CHECK (service_fees >= 0.00),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0.00),
    placed_at TIMESTAMP NOT NULL,
    delivered_at TIMESTAMP NOT NULL,
    cancellation_info JSONB, -- {cancelled_by: 'customer', cancellation_reason: 'reason', cancelled_at: 'timestamp'}
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES "order"(order_id),
    item_id INT NOT NULL REFERENCES item(item_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0.00),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0.00),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE order_status_log (
    order_status_log_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES "order"(order_id),
    status VARCHAR(6) NOT NULL CHECK (status IN ('initiated', 'pending', 'confirmed', 'onTheWay', 'delivered', 'canceled', 'failed')),
    change_by VARCHAR(6) NOT NULL CHECK (change_by IN ('system', 'restaurant', 'payment')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE payment_method (
    payment_method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(100) NOT NULL CHECK (CHAR_LENGTH(method_name) BETWEEN 2 AND 100),
    description TEXT DEFAULT '',
    icon_url VARCHAR(512) DEFAULT '',
    "order" INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_method_config (
    payment_method_config_id SERIAL PRIMARY KEY,
    payment_method_id INT NOT NULL REFERENCES payment_method(payment_method_id),
    gateway_config JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_status (
    payment_status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(20) NOT NULL CHECK ( CHAR_LENGTH(status_name) BETWEEN 2 AND 20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transaction (
    transaction_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customer(customer_id),
    order_id INT NOT NULL REFERENCES "order"(order_id),
    payment_method_id INT NOT NULL REFERENCES payment_method(payment_method_id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0.00),
    payment_status_id INT NOT NULL REFERENCES payment_status(payment_status_id),
    transaction_code VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transaction_detail (
    transaction_detail_id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES transaction(transaction_id),
    detail_key JSONB NOT NULL,
    detail_value JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auditing (
    auditing_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES "user"(user_id),
    audit_event JSONB NOT NULL,
    audit_data JSONB NOT NULL,
    audit_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);
