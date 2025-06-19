import { AppDataSource } from '../config/data-source';
import { Repository } from 'typeorm';
import { Rating, RatingRelations } from '../models/rating/rating.entity';
import { CreateRatingDto } from '../dtos/rating.dto';

export class RatingRepository {
	private ratingRepo: Repository<Rating>;

	constructor() {
		this.ratingRepo = AppDataSource.getRepository(Rating);
	}

	// Rating operations
	async createRating(data: CreateRatingDto & { restaurantId: number }): Promise<Rating> {
		const rating = this.ratingRepo.create(data);
		return await this.ratingRepo.save(rating);
	}

	async getManyRatingBy(filter: {
		customerId?: number;
		orderId?: number;
		restaurantId?: number;
		relations?: RatingRelations[];
	}): Promise<Rating[]> {
		const query = this.ratingRepo.createQueryBuilder('rating');

		if (filter?.relations) {
			filter.relations.forEach((relation) => query.leftJoinAndSelect(`rating.${relation}`, relation));
		}

		if (filter.customerId) {
			query.where('rating.customerId = :customerId', { customerId: filter.customerId });
		}

		if (filter.orderId) {
			query.andWhere('rating.orderId = :orderId', { orderId: filter.orderId });
		}

		if (filter.restaurantId) {
			query.andWhere('rating.restaurantId = :restaurantId', { restaurantId: filter.restaurantId });
		}

		return query.getMany();
	}

	async getOneRatingBy(filter: {
		orderId?: number;
		ratingId?: number;
		relations?: RatingRelations[];
	}): Promise<Rating | null> {
		const query = this.ratingRepo.createQueryBuilder('rating');

		if (filter?.relations) {
			filter.relations.forEach((relation) => query.leftJoinAndSelect(`rating.${relation}`, relation));
		}

		if (filter.ratingId) {
			query.where('rating.ratingId = :ratingId', { ratingId: filter.ratingId });
		}

		if (filter.orderId) {
			query.andWhere('rating.orderId = :orderId', { orderId: filter.orderId });
		}

		return query.getOne();
	}
}
