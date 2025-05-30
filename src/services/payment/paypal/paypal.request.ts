export const PaypalCreateOrderUrl = '/v2/checkout/orders';
export const PaypalOrderDetailsUrl = (orderId: string) => `/v2/checkout/orders/${orderId}`;
export const PaypalConfirmOrderUrl = (orderId: string) => `/v2/checkout/orders/${orderId}/confirm-payment-source`;
export const PaypalCaptureOrder = (orderId: string) => `/v2/checkout/orders/${orderId}/capture`;
export const PaypalAuthUrl = '/v1/oauth2/token'