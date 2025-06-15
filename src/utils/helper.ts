import { CartItem } from '../models/cart/cart-item.entity';
import { OrderItem } from '../models/order/order-item.entity';
import { Request } from 'express';

export interface CursorPaginatedResult<T> {
	data: T[];
	nextCursor: string | null;
	hasNextPage: boolean;
}

/**
 * Paginates an array of items using cursor-based pagination.
 *
 * @param items The array of items to paginate.
 * @param limit The maximum number of items per page.
 * @param cursorField The field to use as the cursor for pagination.
 * @returns A CursorPaginatedResult object containing the paginated data.
 */
export function cursorPaginate<T>(items: T[], limit: number, cursorField: keyof T): CursorPaginatedResult<T> {
	const hasNextPage = items.length > limit;
	const data = hasNextPage ? items.slice(0, -1) : items;
	const lastItem = data[data.length - 1];
	const nextCursor = hasNextPage && lastItem ? lastItem[cursorField] : null;

	return {
		data,
		nextCursor: nextCursor ? new Date(nextCursor as any).toISOString() : null,
		hasNextPage
	};
}

/**
 * Checks if a given date is within a specified time limit.
 *
 * @param date The date to check.
 * @param limitMinutes The time limit in minutes.
 * @returns True if the date is within the time limit, false otherwise.
 */
export function isWithinTimeLimit(date: Date, limitMinutes: number): boolean {
	const now = new Date();
	const targetDate = new Date(date);
	const minutesSince = (now.getTime() - targetDate.getTime()) / (1000 * 60);
	console.log('isWithinTimeLimit', minutesSince <= limitMinutes);
	return minutesSince <= limitMinutes;
}

/**
 * Converts a given number of seconds to milliseconds.
 *
 * @param seconds A non-negative number representing seconds.
 * @returns The equivalent value in milliseconds.
 * @throws {Error} If the input is negative.
 */
export function secondsToMilliseconds(seconds: number) {
	if (seconds < 0) throw new Error('Input cannot be negative.');
	return seconds * 1000;
}

/**
 * Extracts the IP address from an Express request object.
 *
 * It checks various headers and properties to determine the client's IP address,
 * prioritizing those that are more likely to be accurate in the presence of proxies.
 *
 * @param req The Express Request object.
 * @returns The client's IP address as a string, or null if it cannot be determined.
 */
export function getIpFromRequest(req: Request): string | null {
	const xForwardedFor = req.headers['x-forwarded-for'] as string | string[] | undefined;
	if (xForwardedFor) {
		// The 'x-forwarded-for' header can contain a comma-separated list of IPs.
		// The first one is usually the client's original IP.
		if (typeof xForwardedFor === 'string') {
			return xForwardedFor.split(',')[0].trim();
		} else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
			return xForwardedFor[0].trim();
		}
	}

	// Check the 'X-Real-IP' header, often used by Nginx reverse proxies.
	const xRealIp = req.headers['x-real-ip'] as string | undefined;
	if (xRealIp) {
		return xRealIp.trim();
	}

	// Fallback to the 'req.ip' property, which usually reflects the immediate connection's IP.
	// This might be the proxy's IP if one is in use.
	if (req.ip) {
		return req.ip;
	}

	// If all else fails, try 'req.socket.remoteAddress'.
	if (req.socket && req.socket.remoteAddress) {
		return req.socket.remoteAddress;
	}

	return null;
}

export function generatePaymentReference(prefix = 'PAY') {
	const timestamp = Date.now().toString(36).toUpperCase();
	const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `${prefix}-${timestamp}-${randomPart}`;
}
