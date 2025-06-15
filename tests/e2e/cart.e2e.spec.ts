import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';

describe('E2E: App Health', () => {
	let app: Application;

	beforeAll(() => {
		app = createApp();
	});

	// it('GET /health should return 200', async () => {
	// 	const res = await request(app).get('/api/v1/cart/add');
	// 	expect(res.status).toBe(200);
	// 	expect(res.body.message).toBe('OK');
	// });

	it('GET /api/v1/cart/invalid should return 404 Not Found', async () => {
		const res = await request(app).get('/api/v1/car/invalid');
		expect(res.status).toBe(404);
	});
});
