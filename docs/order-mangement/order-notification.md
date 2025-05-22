# Sub-Feature: Order Notification

## Description

Sends order confirmation and updates to customers via email/SMS.

## Use Cases

- Customer receives confirmation after placing an order.

- Customer gets updates when order status changes (e.g., "Out for Delivery").

## Actors

- Customer

- System

## Flow Chart

![order_notification.flowchart](https://drive.google.com/file/d/17zKw_PehyvCJnvO1LQsiKwoo2ptrHiqq)

## Errors

- Email/SMS service failure.
- Invalid customer contact details.

## API Design

- Description: send notification.
- Request Body:

  ```json
  {
  	"order_id": "ORD-1001",
  	"customer_id": "123",
  	"message": "Your order is confirmed!",
  	"channel": "SMS/EMAIL"
  }
  ```

- Request Body:
  ```json
  {
  	"status": true
  }
  ```
