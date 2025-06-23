import { PaginationDto, OrderBy } from './shared.dto';

export class ListRestaurantsDto extends PaginationDto {
	search?: string;
	cuisines?: number[];
	rating?: number;
	// status?: 'active' | 'inactive';
	radius?: number;
	// sort?: 'name' | 'rating' | 'distance' | 'created_at';
	// order?: OrderBy;
}

export class ListTopRatedRestaurantsDto extends PaginationDto {
	cuisines?: number[];
}
