// Database Diagram for Food Delivery App in dbdiagram.io

Table role {
  role_id int [pk]
  name varchar(100) [not null, unique]
  created_at datetime [not null]
  updated_at datetime
}

Table user_role {
  user_role_id int [pk]
  user_id int [ref: > user.user_id]
  role_id int [ref: > role.role_id]
  created_at datetime [not null]
  updated_at datetime
}

Table user_type {
  user_type_id int [pk]
  name varchar(30) [not null, unique]// customers, driver, partner_employee, internal_employees
  created_at datetime [not null]
  updated_at datetime
}


Table user {
  user_id int [pk]
  user_type_id int [ref:> user_type.user_type_id]
  name varchar(225)
  phone varchar(30) [unique]
  email varchar(255) [unique]
  password varchar(250)
  is_active boolean [not null]
  created_at datetime [not null]
  updated_at datetime
} 


Table address {
  address_id int [pk]
  customer_id int [ref : > customer.customer_id]
  label varchar(50) [null]
  city varchar(255) [not null]
  area varchar(255) [not null]
  street text [not null]
  building varchar(50)
  floor varchar(50)
  geoLocation json
  is_default boolean [not null]
  created_at datetime [not null]
  updated_at datetime
  deleted_at datetime
}

Table customer {
  customer_id int [pk]
  user_id int [ref: - user.user_id]
  birth_date date
  gender enum (male,female)
  created_at datetime [not null]
  updated_at datetime
}

Table cuisine {
  cuisine_id int [pk]
  name varchar(225)
  is_active boolean
  created_at datetime [not null]
  updated_at datetime
}

Table chain {
  chain_id int [pk]
  name varchar(225) [not null]
  commercial_registration_number varchar(20) [not null , unique]
  vat_number varchar(15) [not null , unique]
  storeCount int
  created_at datetime [not null]
  updated_at datetime
}

Table restaurant {
  restaurant_id int [pk]
  chain_id int [ref: > chain.chain_id]
  name varchar(225) [not null]
  logo_url varchar(512) [not null]
  banner_url varchar(512) [not null]
  location json [not null]
  geoLocation geography [not null]
  maxDeliveryDistance int
  approvalStatus enum('pending_approval','approved','rejected')
  status enum('open', 'busy', 'pause', 'closed') [not null]
  email varchar(255)
  phone varchar(30)
  is_active boolean [not null]
  deactivationInfo json
  activationInfo json
  totalRating decimal
  ratingCount int
  averageRating decimal
  created_at datetime [not null]
  approvedAt datetime
  rejectedAt datetime
  updated_at datetime
}

Table restaurant_user {
  restaurant_id int [ref: > restaurant.restaurant_id]
  user_id int [ref: > user.user_id]
  indexes {
    (restaurant_id,user_id) [pk]
  }
}

Table restaurant_cuisine {
  restaurant_id int [ref: > restaurant.restaurant_id]
  cuisine_id int [ref: > cuisine.cuisine_id]
  indexes {
    (restaurant_id,cuisine_id) [pk]
  }
}

Table menu { 
  menu_id int [pk]
  restaurant_id int [ref: - restaurant.restaurant_id]
  is_active boolean [not null]
  created_at datetime [not null]
  updated_at datetime
}

Table category {
  category_id int [pk]
  menu_id int [ref: > menu.menu_id]
  title varchar(100)
  is_active boolean [not null]
  created_at datetime [not null]
  updated_at datetime
}

Table item {
  item_id int [pk]
  restaurant_id int [ref: > restaurant.restaurant_id]
  image_path varchar(512) [not null]
  name varchar(100) [not null]
  description text
  price decimal(10,2) [not null]
  energy_val_cal decimal(10,2)
  notes text 
  is_available boolean [not null]
  created_at datetime [not null]
  updated_at datetime
  deleted_at datetime
}

Table category_items {
  category_id int [ref : > category.category_id]
  item_id int [ref : > item.item_id]
  indexes {
    (category_id,item_id) [pk]
  }
}

Table cart {
  cart_id int [pk]
  customer_id int [ref : - customer.customer_id]
  total_items int [not null]
  created_at datetime [not null]
  updated_at datetime
}

Table cart_item {
  cart_item_id int [pk]
  cart_id int [ref : > cart.cart_id]
  restaurant_id int [ref:> restaurant.restaurant_id]
  item_id int [ref : > item.item_id]
  quantity int [not null]
  price decimal(10,2) [not null]
  total_price decimal(10,2) [not null]
  created_at datetime [not null]
  updated_at datetime
}

Table order_status_log {
  order_status_log_id int [pk]
  order_id int [ref : > order.order_id]
  status enum(initiated, pending, confirmed, onTheWay, delivered, canceled, failed)
  changed_by enum (restaurant, system, payment)
  created_at datetime [not null]
}

Table order {
  order_id int [pk]
  restaurant_id int [ref: > restaurant.restaurant_id]
  customer_id int [ref : > customer.customer_id]
  delivery_address_id int [ref : > address.address_id]
  delivery_address jsonb
  customer_instructions text
  status enum(initiated, pending, confirmed, onTheWay, delivered, canceled, failed)
  delivery_fees decimal(5,2)
  service_fees decimal(5,2)
  total_amount decimal(10,2)
  placed_at datetime 
  delivered_at datetime 
  cancellation_info JSONB //{cancelled_by: 'customer', cancellation_reason: 'reason', cancelled_at: 'timestamp'}
  created_at datetime [not null]
  updated_at datetime
}

Table order_item {
  order_item_id int [pk]
  order_id int [ref : > order.order_id]
  item_id int [ref : > item.item_id]
  quantity int
  price decimal(10,2)
  total_price decimal(10,2) // price * quantity (+ customizations)
  created_at datetime [not null]
}

Table rating { 
  rating_id int [pk]
  customer_id int [ref : > customer.customer_id]
  restaurant_id int [ref : > restaurant.restaurant_id]
  order_id int [ref : > order.order_id]
  rating int [not null]
  comment text
  created_at datetime [not null]
}

Table payment_method {
  payment_method_id int [pk]
  method_name varchar(20) //('cash', 'credit_card', 'stc_pay', 'apple_pay')
  description text
  icon_url varchar(255) // URL to the icon image
  order int // Order in which the payment method appears in the app
  is_active boolean
  created_at datetime [not null]
  updated_at datetime
}

Table payment_method_config {
  payment_config_id int [pk]
  payment_method_id int [ref : > payment_method.payment_method_id]
  gateway_config JSONB [not null]
  created_at datetime [not null]
  updated_at datetime
}

Table transaction {
  transaction_id int [pk]
  customer_id int [ref : > customer.customer_id]
  payment_method_id int [ref : > payment_method.payment_method_id]
  order_id int [ref : > order.order_id]
  amount decimal(10,2)
  transaction_reference varchar(100) // from payment gateway or internal logic
  payment_reference varchar(100) // from payment gateway or internal logic
  status enum(initiated, pending, paid, failed, cancelled, refunded, partially_refunded, expired)
  created_at datetime [not null]
  updated_at datetime
}

Table transaction_detail {
  transaction_detail_id int [pk]
  transaction_id int [ref : > transaction.transaction_id]
  provider varchar(20) //('cash', 'credit_card', 'stc_pay', 'apple_pay')
  action varchar(20) //('charge', 'verify', 'refund')
  request_payload JSONB
  response_payload JSONB
  success boolean
  error_stack JSONB
  created_at datetime
}

Table transaction_status_log {
  transaction_status_log_id int [pk]
  transaction_id int [ref : > transaction.transaction_id]
  status enum(initiated, pending, paid, failed, cancelled, refunded, partially_refunded, expired)
  created_at datetime
}

Table auditing {
  auditing_id int [pk]
  user_id int [ref : > user.user_id]
  audit_event json
  audit_data json
  audit_date datetime
  created_at datetime
}

Table setting {
  id int [pk]
  key varchar(255) [not null]
  value json
  description text
  created_at datetime
  updated_at datetime
}
