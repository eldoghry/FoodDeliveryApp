import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { OrderStatusEnum } from '../models';
import {} from '../repositories';
import { OrderService } from './order.service';
import { CreateRatingDto } from '../dtos/rating.dto';
import { RatingRepository } from '../repositories/rating.repository';
import { Transactional } from 'typeorm-transactional';
import { Rating } from '../models/rating/rating.entity';

export class RatingService {
	private ratingRepo = new RatingRepository();
	// private orderService = new OrderService();

	@Transactional()
	async createRating(dto: CreateRatingDto & { restaurantId: number }): Promise<Rating> {
		const rating = this.ratingRepo.createRating({ ...dto, restaurantId: dto.restaurantId });

		logger.info(`Rating created for order ${dto.orderId} with rating ${dto.rating}`);

		return rating;
	}
}
