import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import HttpStatusCodes from 'http-status-codes';
import { UserService } from '../services/user.service';
import { Controller, Route, Tags, Get, Post, Body, Query, Path, SuccessResponse, Queries, Middlewares } from 'tsoa';
import { CreateUserBody, GetUsersQuery } from '../dtos/user.dto';
import { query } from 'winston';
import { validateRequest } from '../middlewares/validate-request.middleware';

@Route('user')
@Tags('User')
export class UserController extends Controller {
	private userService = new UserService();

	@Post('/')
	@Middlewares([validateRequest(CreateUserBody, 'body')])
	async create(@Body() createUserDto: CreateUserBody) {
		console.log('user controller create', createUserDto);
		const user = await this.userService.createUser(createUserDto);
		return user;
	}

	@Get('/')
	@Middlewares([validateRequest(GetUsersQuery, 'query')])
	async getAll(@Queries() queries: GetUsersQuery) {
		console.log('user controller get all', queries);
		return await this.userService.getAll(queries);
	}

	@Get('/test')
	async test() {
		return { message: 'Sending without validation' };
	}

	@Get('/:id')
	@Middlewares([
		validateRequest(
			class x {
				id!: number;
			},
			'params'
		)
	])
	async getOne(@Path() id: number) {
		return await this.userService.getOne(id);
	}
}
