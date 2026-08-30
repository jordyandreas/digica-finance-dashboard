/**
 * Verify lms_articles migration and seed data.
 *
 * Usage: pnpm tsx --env-file=.env.local scripts/verify-lms-articles.ts
 */

import { createAdminClient } from "../src/lib/supabase-admin";
import {
  LMS_ARTICLE_EXPECTED_COUNT,
  LMS_ARTICLE_EXPECTED_SLUGS,
} from "./lms-articles-expected";

async function main() {
  const supabase = createAdminClient();

  const { error: probeError } = await supabase
    .from("lms_articles")
    .select("id", { count: "exact", head: true });

  if (
    probeError?.code === "PGRST205" ||
    probeError?.message.includes("Could not find the table")
  ) {
    console.error(
      "Table public.lms_articles does not exist yet. Apply migrations first:",
    );
    console.error("  1. supabase/migrations/20260830120000_create_lms_articles.sql");
    console.error("  2. supabase/migrations/20260830120100_seed_lms_articles.sql");
    console.error(
      "Or run: SUPABASE_DB_URL=... pnpm tsx scripts/apply-lms-articles-migrations.ts",
    );
    process.exit(1);
  }

  if (probeError) {
    throw probeError;
  }

  const { count, error: countError } = await supabase
    .from("lms_articles")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  const { data: rows, error: rowsError } = await supabase
    .from("lms_articles")
    .select("slug")
    .order("published_at", { ascending: false });

  if (rowsError) {
    throw rowsError;
  }

  const expectedSlugs = [...LMS_ARTICLE_EXPECTED_SLUGS].sort();
  const actualSlugs = (rows ?? []).map((row) => row.slug).sort();
  const missing = expectedSlugs.filter((slug) => !actualSlugs.includes(slug));

  if (missing.length > 0) {
    console.error("Missing slugs:", missing);
    process.exit(1);
  }

  if (count !== LMS_ARTICLE_EXPECTED_COUNT) {
    console.error(
      `Expected ${LMS_ARTICLE_EXPECTED_COUNT} rows, found ${count ?? 0}`,
    );
    process.exit(1);
  }

  console.log(
    `Verification passed: ${LMS_ARTICLE_EXPECTED_COUNT} articles, all slugs match seed migration.`,
  );
  console.log(actualSlugs.join("\n"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
