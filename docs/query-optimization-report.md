# 📈 SQL Query Optimization Report – Food Delivery App

This document outlines SQL query performance improvements implemented across various modules in the food delivery app. The results are based on performance tests run on a dataset simulating production-scale data.

## 🔢 Seeded Data Overview

| Table Name         | Number of Records Seeded |
| ------------------ | ------------------------ |
| USER               | 110,000                  |
| CUSTOMER           | 100,000                  |
| ADDRESS            | 100,000                  |
| CHAIN              | 200                      |
| RESTAURANT         | 10,000                   |
| MENU               | 10,000                   |
| CATEGORY           | 30,000                   |
| ITEM               | 300,000                  |
| CART               | 100,000                  |
| CART\_ITEM         | 300,000                  |
| ORDER              | 2,000,000                |
| ORDER\_ITEM        | 6,000,000                |
| ORDER\_STATUS\_LOG | 6,286,221                |
| CATEGORY\_ITEMS    | 134,731                  |
| RATING             | 143,225                  |

---

## 🛒 **CART Module**

### 🔹 Function Name: `getCartByCustomerId`

* **Query Description**: Fetch the latest cart for a customer
* **SQL Query**:

  ```sql
  SELECT *
  FROM cart
  WHERE customer_id = :customerId
  ORDER BY created_at DESC
  LIMIT 1;
  ```
* **Time Before Optimization**: 2.427 ms
* **Optimization Technique**:

  * Selected only required columns (cart_id , customer_id)
  * Created index : `CREATE INDEX idx_customer_id ON cart(customer_id)`
* **Time After Optimization**: 0.027 ms

### 🔹 Function Name: `getCartWithItems`

* **Query Description**: Fetch cart with its items by customer and restaurant
* **SQL Query**:

  ```sql
    SELECT
        cart.*, cartItem.*
    FROM
        cart cart
    INNER JOIN
        cart_item cartItem ON cartItem.cart_id = cart.cart_id
    WHERE
        cart.customer_id = :customerId AND cartItem.restaurant_id = :restaurantId
    LIMIT 1;
  ```
* **Time Before Optimization**: 21.514 ms
* **Optimization Technique**:

  * Replaced `LEFT JOIN` with `INNER JOIN`
  * Selected only needed columns (cart_id , customer_id, restaurant_id)
  * Created composite index : `CREATE INDEX idx_cart_id_restaurant_id ON cart_item(cart_id,restaurant_id)`
* **Time After Optimization**: 0.077 ms

---

## 📦 **ORDER Module**

### 🔹 Function Name: `getOrdersByActorId`

* **Query Description**: Fetch all orders for a customer or restaurant
* **SQL Query**:

  ```sql
  SELECT 
        order.*,
        restaurant.*,
        customer.*,
        user.*,
        orderItems.*,
        item.*,
        transaction.*,
        paymentMethod.*
    FROM 
        order order
    LEFT JOIN 
        restaurant restaurant ON restaurant.id = order.restaurant_id
    LEFT JOIN 
        customer customer ON customer.id = order.customer_id
    LEFT JOIN 
        user user ON user.id = customer.user_id
    LEFT JOIN 
        order_item orderItems ON orderItems.order_id = order.id
    LEFT JOIN 
        item item ON item.id = orderItems.item_id AND ("item"."deleted_at" IS NULL)
    LEFT JOIN 
        transaction transaction ON transaction.order_id = order.id
    LEFT JOIN 
        payment_method paymentMethod ON paymentMethod.id = transaction.payment_method_id
    WHERE 
        (order.customer_id = :actorId OR order.restaurant_id = :actorId)
        AND order.created_at < :cursorDate
    ORDER BY 
        order.created_at DESC
    LIMIT 
        :limitPlusOne;
  ```
* **Time Before Optimization**: 1018.376 ms
* **Optimization Technique**:
  * add payment_method_id column to order table for faster join
  * Selected only necessary columns (
    "order".*,
    restaurant.name,
    customer.customer_id,
    customer.user_id,
    "user".name,
    "user".phone,
    orderItems.*,
    item.image_path,
    item.name,
    paymentMethod.code)
  * Created composite index: `CREATE INDEX idx_order_customer_createdat ON "order" (customer_id, created_at DESC)`
  * Created index : `CREATE INDEX idx_order_id on order_item(order_id)`
* **Time After Optimization**: 6.551 ms

### 🔹 Function Name: `getOrderById`

* **Query Description**: Fetch single order with status logs
* **SQL Query**:

  ```sql
  SELECT 
    "order".*,
    "orderStatusLogs".*
    FROM 
        "order" "order"
    LEFT JOIN 
        "order_status_log" "orderStatusLogs" 
        ON "orderStatusLogs"."order_id" = "order"."order_id"
    WHERE 
        "order"."order_id" = :orderId
    LIMIT 1;
  ```
* **Time Before Optimization**: 351.022 ms
* **Optimization Technique**:

  * Created index : `CREATE INDEX idx_order_status_log_order_id ON order_status_log(order_id)`
* **Time After Optimization**: 0.267 ms

### 🔹 Function Name: `getActiveOrderByRestaurantId`

* **Query Description**: Retrieve active orders for a restaurant
* **SQL Query**:

  ```sql
    SELECT 
        "order".*
    FROM 
        "order" "order"
    WHERE 
        ("order"."status" NOT IN ('delivered', 'canceled', 'failed'))
        AND "order"."restaurant_id" = :restaurantId
    LIMIT 1;
  ```
* **Time Before Optimization**: 493.672 ms
* **Optimization Technique**:

  * Selected only required columns (order_id)
  * Created indexes:
    * `CREATE INDEX idx_order_restaurant_id ON "order" (restaurant_id);`
    * `CREATE INDEX idx_order_status ON "order" (status);`
* **Time After Optimization**: 2.448 ms

---

## 👤 **CUSTOMER Module**

### 🔹 Function Name: `getAddressesByCustomerId`

* **Query Description**: Get addresses by customer ID
* **SQL Query**:

  ```sql
  SELECT 
        "address".*
    FROM 
        "address" "address"
    WHERE 
        "address"."customer_id" = :customerId
    ORDER BY 
        "address"."created_at" DESC
  ```
* **Time Before Optimization**: 88.804 ms
* **Optimization Technique**:

  * Created composite index: `CREATE INDEX idx_address_customer_created_at ON address(customer_id, created_at DESC)`
* **Time After Optimization**: 0.250 ms

---

## 🍽️ **RESTAURANT Module**

### 🔹 Function Name: `getRestaurantBy`

* **Query Description**: Get restaurant by name
* **SQL Query**:

  ```sql
  SELECT
    "restaurant".*
    FROM "restaurant" "restaurant" 
    WHERE "restaurant"."name" = :name
    LIMIT 1;
  ```
* **Time Before Optimization**: 81.657 ms
* **Optimization Technique**:

  * Created index: `CREATE INDEX idx_restaurant_name ON restaurant(name)`
* **Time After Optimization**: 0.930 ms

### 🔹 Function Name: `getDetailedActiveRestaurantView`

* **Query Description**: Get full details of an specific active restaurant
* **SQL Query**:

  ```sql
  SELECT 
      r.*, c.*, cu.*, m.*, cat.*, i.*
  FROM restaurant r
  LEFT JOIN chain c ON c.chain_id = r.chain_id
  LEFT JOIN restaurant_cuisine rc ON rc.restaurant_id = r.restaurant_id
  LEFT JOIN cuisine cu ON cu.cuisine_id = rc.cuisine_id
  LEFT JOIN menu m ON m.restaurant_id = r.restaurant_id AND m.is_active = true
  LEFT JOIN category cat ON cat.menu_id = m.menu_id AND cat.is_active = true
  LEFT JOIN category_items ci ON ci.category_id = cat.category_id
  LEFT JOIN item i ON i.item_id = ci.item_id AND i.is_available = true AND i.deleted_at IS NULL
  WHERE r.restaurant_id = :restaurantId
  GROUP BY r.restaurant_id, c.chain_id, cu.cuisine_id, m.menu_id, cat.category_id, i.item_id;
  ```
* **Time Before Optimization**: 47.350 ms
* **Optimization Technique**:

  * Created index: 
   `CREATE INDEX idx_category_active_menu ON category(menu_id, is_active)`
  * Created partial index: 
   `CREATE INDEX idx_item_available ON item(item_id) WHERE is_available = true AND deleted_at IS NULL;`
* **Time After Optimization**: 2.966 ms

### 🔹 Function Name: `getFilteredRestaurants`

* **Query Description**: Filter restaurants by geo, rating, cuisines, cursor.
* **SQL Query**:

  ```sql
  SELECT 
        "restaurant".*,
        "cuisine".*
    FROM 
        "restaurant" "restaurant"
    LEFT JOIN 
        "restaurant_cuisine" "restaurant_cuisines" ON "restaurant_cuisines"."restaurant_id" = "restaurant"."restaurant_id"
    LEFT JOIN 
        "cuisine" "cuisine" ON "cuisine"."cuisine_id" = "restaurant_cuisines"."cuisine_id"
    WHERE 
        "restaurant"."is_active" = TRUE
        AND "restaurant"."status" NOT IN ('pause')
        AND ST_DWithin(
            "restaurant"."geo_location",
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            "restaurant"."max_delivery_distance"
        )
        AND (:cuisinesIds IS NULL OR "cuisine"."cuisine_id" IN (:...cuisinesIds))
        AND (:cursor IS NULL OR "restaurant"."restaurant_id" < :cursor)
        AND (:rating IS NULL OR "restaurant"."average_rating" >= :rating)
    ORDER BY 
        "restaurant"."restaurant_id" DESC
    LIMIT :limitPlusOne;
  ```
* **Time Before Optimization**: 187.566 ms
* **Optimization Technique**:

  * Created additional indexes:
    * `CREATE INDEX idx_restaurant_geo ON restaurant USING GIST(geo_location)`
    * `CREATE INDEX idx_restaurant_active_status ON restaurant(is_active, status)`
    * `CREATE INDEX idx_restaurant_avg_rating ON restaurant(average_rating)`
* **Time After Optimization**: 3.643 ms

### 🔹 Function Name: `searchRestaurantsByKeyword`

* **Query Description**: Search restaurants by keyword (search by name, cuisine name)
* **SQL Query**:

  ```sql
    -- sql before optimization
    SELECT 
      r.*,
      c.*,
      CASE
        WHEN r.name ILIKE :keyword THEN 0
        WHEN c.name ILIKE :keyword THEN 2
        WHEN c.cuisine_id IN (:...cuisinesIds) THEN 10
        ELSE 20
      END AS rank
    FROM restaurant r
    LEFT JOIN restaurant_cuisine rc ON rc.restaurant_id = r.restaurant_id
    LEFT JOIN cuisine c ON c.cuisine_id = rc.cuisine_id
    WHERE 
    r.is_active = true
        AND r.status <> 'pause'::restaurant_status_enum
        AND ST_DWithin(
              r.geo_location,
              ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
              r.max_delivery_distance
            )
      AND (r.name ILIKE :keyword
          OR c.name ILIKE :keyword
          OR c.cuisine_id IN (:...cuisinesIds)
        )
    ORDER BY rank ASC, r.name ASC;

    -- sql after optimization
    WITH 
    filtered_restaurants AS (
      SELECT r.*
      FROM restaurant r
      WHERE r.is_active = true
        AND r.status <> 'pause'::restaurant_status_enum
        AND ST_DWithin(
              r.geo_location,
              ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
              r.max_delivery_distance
            )
    ),
    filtered_restaurants_cuisine AS (
      SELECT *
      FROM restaurant_cuisine
      WHERE restaurant_id IN (SELECT restaurant_id FROM filtered_restaurants)
    )

    SELECT 
      fr.restaurant_id, fr.name as restaurant_name, fr.email, fr.phone, 
      fr.chain_id, fr.logo_url, fr.location, fr.geo_location, 
      fr.max_delivery_distance, fr.status, fr.total_rating,
      fr.rating_count, fr.average_rating,
      c.cuisine_id, c.name as cuisine_name,
      CASE
        WHEN fr.name ILIKE :keyword THEN 0
        WHEN c.name ILIKE :keyword THEN 2
        WHEN c.cuisine_id IN (:...cuisinesIds) THEN 10
        ELSE 20
      END AS rank
    FROM filtered_restaurants fr
    INNER JOIN filtered_restaurants_cuisine rc ON rc.restaurant_id = fr.restaurant_id
    INNER JOIN cuisine c ON c.cuisine_id = rc.cuisine_id
    WHERE fr.name ILIKE :keyword
      OR c.name ILIKE :keyword
      OR c.cuisine_id IN (:...cuisinesIds)
    ORDER BY rank ASC, fr.name ASC;
  ```
* **Time Before Optimization**: 275.702 ms
* **Optimization Technique**:
  * Created CTEs (Common Table Expressions) for filtered restaurants and cuisines to reduce the number of scans and improve performance
  * Selected only required columns
  * Added `CREATE EXTENSION IF NOT EXISTS pg_trgm;` to enable trigram index for ILIKE operations to improve search performance

  * Created indexes:
    * `CREATE index CONCURRENTLY idx_restaurant_name_trgm ON restaurant USING GIN (name gin_trgm_ops);`
    * `CREATE index CONCURRENTLY idx_cuisine_name_trgm ON cuisine USING GIN (name gin_trgm_ops);`
* **Time After Optimization**: 14.422 ms

## 🍽️ **MENU Module**

### 🔹 Function Name: `getMenuByRestaurantId`

* **Query Description**: Get menu with all categories and items by restaurant ID
* **SQL Query**:

  ```sql
    -- sql before optimization
    SELECT
      m.*,
      c.*,
      i.*
    FROM menu m
    LEFT JOIN category c ON c.menu_id = m.menu_id
    LEFT JOIN category_items ci ON ci.category_id = c.category_id
    LEFT JOIN item i ON i.item_id = ci.item_id AND i.deleted_at IS NULL
    WHERE m.restaurant_id = :restaurantId;

    -- sql after optimization
    CREATE MATERIALIZED VIEW menu_restaurant_view AS
    SELECT
        m.menu_id,
        m.restaurant_id as restaurant_id,

        c.category_id,
        c.title AS category_title,

        i.item_id,
        i.name AS item_name,
        i.price AS item_price,
        i.is_available AS item_is_available

    FROM menu m
    LEFT JOIN category c 
        ON c.menu_id = m.menu_id
    LEFT JOIN category_items ci 
        ON ci.category_id = c.category_id
    LEFT JOIN item i 
        ON i.item_id = ci.item_id
      AND i.deleted_at IS NULL;

      select * from menu_restaurant_view WHERE restaurant_id = 800;

  ```
* **Time Before Optimization**: 35.558 ms
* **Optimization Technique**:
  * Selected only required columns
  * Created materialized view for selected columns with joins
  * Created indexes on materialized view:
    * `CREATE INDEX idx_menu_restaurant_id ON menu_restaurant_view(restaurant_id);`
* **Time After Optimization**: 0.246 ms

### 🔹 Function Name: `getItemBy({ restaurantId, name: ILike(normalizeString(name))})`

* **Query Description**: Get item by name and restaurant ID
* **SQL Query**:

  ```sql
    SELECT 
        "item".*
    FROM 
        "item" "item"
    WHERE 
        "item"."restaurant_id" = :restaurantId
        AND "item"."name" ILIKE :name 
        AND "item"."deleted_at" IS NULL
    LIMIT 1;
  ```
* **Time Before Optimization**: 547.616 ms
* **Optimization Technique**:

  * Created index:
    * `CREATE INDEX idx_item_restaurant_id ON item(restaurant_id);`
* **Time After Optimization**: 1.440 ms

### 🔹 Function Name: `searchItemsInMenu`

* **Query Description**: Search items in menu by restaurant ID and keyword
* **SQL Query**:

  ```sql
  SELECT "item".*
    FROM "item" "item"
    INNER JOIN "category_items" "category_item" ON "category_item"."item_id"="item"."item_id"
    INNER JOIN "category" "category" ON "category"."category_id"="category_item"."category_id"
    WHERE 
    ( 
      "item"."restaurant_id" = 1
    AND "category"."is_active" = true 
    AND "item"."is_available" = true 
    AND ("item"."name" ILIKE '%sp%' OR "item"."description" ILIKE '%sp%')
    ) 
    AND ( "item"."deleted_at" IS NULL ) 
    ORDER BY "item"."name" ASC

  ```
* **Time Before Optimization**: 35.368 ms
* **Optimization Technique**:

  * Created composite index:
    * `CREATE INDEX idx_item_restaurant_available_deleted_at ON item(restaurant_id, is_available, deleted_at)`
* **Time After Optimization**: 2.322 ms

---

## ✅ Final Optimization Summary

| Function Name                   | Query Description                          | Time Before Optimization | Optimization Technique                                 | Time After Optimization |
| ------------------------------- | ------------------------------------------ | ------------------------ | ------------------------------------------------------ | ----------------------- |
| getCartByCustomerId             | Get cart by customer ID                    | 2.427 ms                 | Select only required columns, index on customer\_id    | 0.027 ms                |
| getCartWithItems                | Get cart items by customer & restaurant    | 21.514 ms                | INNER JOIN, select only needed cols, composite index   | 0.077 ms                |
| getOrdersByActorId              | Get orders for customer or restaurant      | 1018.376 ms              | Column selection, new FKs, composite indexes           | 6.551 ms                |
| getOrderById                    | Get order with status log                  | 351.022 ms               | Index on order\_status\_log(order\_id)                 | 0.267 ms                |
| getActiveOrderByRestaurantId    | Get active orders by restaurant ID         | 493.672 ms               | Select only order\_id, index on restaurant\_id, status | 2.448 ms                |
| getAddressesByCustomerId        | Get addresses by customer                  | 88.804 ms                | Composite index on customer\_id and created\_at        | 0.250 ms                |
| getRestaurantBy                 | Get restaurant by name                     | 81.657 ms                | Index on name                                          | 0.930 ms                |
| getDetailedActiveRestaurantView | Full details of active restaurant          | 47.350 ms                | Index on category(menu\_id, is\_active), partial index on item(is_available, deleted_at) | 13.599 ms               |
| getFilteredRestaurants          | Filter restaurants by geo & other criteria | 187.566 ms               | indexes on geo_location, is_active, status, average_rating | 3.643 ms                |
| searchRestaurantsByKeyword      | Search restaurants by keyword              | 275.702 ms               | CTEs, trigram index, selected only required columns    | 14.422 ms               |
| getMenuByRestaurantId           | Get menu by restaurant ID                  | 35.558 ms                | Materialized view with joins , selected only required columns, index on materialized view for restaurant\_id                           | 0.246 ms                |
| getItemBy({ restaurantId, name: ILike(normalizeString(name))}) | Get item by name and restaurant ID         | 547.616 ms               | Index on item\_restaurant\_id                           | 1.440 ms                |
| searchItemsInMenu               | Search items in menu by restaurant ID and keyword | 35.368 ms               | Composite index on item\_restaurant\_available\_deleted\_at | 2.322 ms                |

