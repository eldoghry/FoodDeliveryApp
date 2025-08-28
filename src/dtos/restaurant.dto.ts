import { Cuisine, Restaurant } from '../models';
import { PaginationDto } from './shared.dto';

export class ListRestaurantsFilterDto extends PaginationDto {
	cuisines?: number[];
	rating?: number;
	radius?: number;
	lat!: number;
	lng!: number;
}

export class ListTopRatedRestaurantsFilterDto extends PaginationDto {
	cuisines?: number[];
	lat!: number;
	lng!: number;
}

export class SearchRestaurantsQueryDto extends PaginationDto {
	keyword!: string;
	lat!: number;
	lng!: number;
}

export class ListRecommendedRestaurantsFilterDto {
	lat!: number;
	lng!: number;
	cuisines?: number[];
	sort?: 'rating' | 'createdAt';
	limit?: number;
}

export class RestaurantResponseDto extends Restaurant {
	averageRating!: number;
	ratingCount!: number;
	cuisineList!: string[];
	rank?: number;
}

export class RegisterRestaurantPayloadDto {
		firstName!: string;
		lastName!: string;
		businessPhone!: string;
		businessEmail!: string;
		name!: string;
		chainName!: string;
		logoUrl!: string;
		bannerUrl!: string;
		location!: {
			city: string;
			area: string;
			street: string;
			coordinates: {
				lat: number;
				lng: number;
			};
		};
		commercialRegistrationNumber!: string;
		vatNumber!: string;
		cuisines!: number[];
}
	