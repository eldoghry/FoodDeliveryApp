import { PaginationDto, OrderBy } from './shared.dto';

export class ListRestaurantsDto extends PaginationDto {
	search?: string;
	cuisine?: string;
	rating?: number;
	status?: 'active' | 'inactive';
	radius?: number;
	sort?: 'name' | 'rating' | 'distance' | 'created_at';
	order?: OrderBy;
}
