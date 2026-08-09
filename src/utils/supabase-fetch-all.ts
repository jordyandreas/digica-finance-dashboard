import type { PostgrestError } from "@supabase/supabase-js";

/** PostgREST default max rows per request. */
export const SUPABASE_PAGE_SIZE = 1000;

type FetchPageResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
};

/**
 * Fetches all rows by paging through `.range()` until a short page is returned.
 * Avoids silent truncation when a table exceeds Supabase's ~1000-row default limit.
 */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<FetchPageResult<T>>,
): Promise<{ data: T[]; error: PostgrestError | null }> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);

    if (error) {
      return { data: [], error };
    }

    const page = data ?? [];
    all.push(...page);

    if (page.length < SUPABASE_PAGE_SIZE) {
      break;
    }

    from += SUPABASE_PAGE_SIZE;
  }

  return { data: all, error: null };
}
