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

![order_notification.flowchart](https://www.mermaidchart.com/raw/7df71a32-8e5e-4042-862d-f4571860f53e?theme=light&version=v0.1&format=svg)

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
