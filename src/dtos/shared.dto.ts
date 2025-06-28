export class PaginationDto {
	limit: number = 10;
	cursor?: string;
}

export class PaginatedResultsDto<T> {
	data!: T[];
	nextCursor!: string | null;
	hasNextPage!: boolean;
}

export type OrderBy = 'ASC' | 'DESC';