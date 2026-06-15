/** One page of a cursor-paginated source. `nextCursor: null` means "no more". */
export interface Page<T> {
  items: T[];
  nextCursor: number | null;
}
