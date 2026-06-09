export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ListParams extends PaginationParams {
  search?: string;
  status?: string;
}

export interface PaginationMeta {
  page: number;
  total_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    page,
    total_page: Math.ceil(total / limit) || 1,
    total,
  };
}
