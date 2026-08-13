export interface RespuestaPaginada<T> {
  data: T[];
  meta: {
    total: number;
    skip: number;
    limit: number;
    hasMore: boolean;
  };
}