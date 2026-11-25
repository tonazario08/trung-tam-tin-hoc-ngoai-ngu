export function pageParams(q: any) {
  const page = Math.max(1, parseInt(q.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(q.limit || '10', 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}
export function pageResult<T>(items: T[], total: number, page: number, limit: number) {
  return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
