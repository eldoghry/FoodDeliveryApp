import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { createUserBodySchema, getUserParamsSchema, getUsersQuerySchema } from '../validators/user.validator';

const UserRouter = Router();
const controller = new UserController();

/**
 * @swagger
 * tags:
 *      name: User
 *      description: User management APIs
 */

/**
 * @swagger
 * /user:
 *      post:
 *          summary: Create new user
 *          tags: [User]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/CreateUser'
 *          response:
 *              200:
 *                  description: User created successfully
 *                  content:
 *                      application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 */
UserRouter.post('/', validateRequest({ body: createUserBodySchema }), controller.create.bind(controller));

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
UserRouter.get('/', validateRequest({ query: getUsersQuerySchema }), controller.getAll.bind(controller));
UserRouter.get('/test', controller.test.bind(controller)); // sending without validation

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
UserRouter.get('/:id', validateRequest({ params: getUserParamsSchema }), controller.getOne.bind(controller));

export default UserRouter;
