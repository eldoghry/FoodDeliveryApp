export class PaginationDto {
	page: number = 1;
	limit: number = 10;
	cursor?: string;
}

export type OrderBy = 'ASC' | 'DESC';
