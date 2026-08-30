/**
 * Apply lms_articles SQL migrations via direct Postgres connection.
 *
 * Usage:
 *   SUPABASE_DB_URL="postgresql://..." pnpm tsx scripts/apply-lms-articles-migrations.ts
 *
 * Get the connection string from Supabase Dashboard → Project Settings → Database.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

const MIGRATIONS = [
  "20260830120000_create_lms_articles.sql",
  "20260830120100_seed_lms_articles.sql",
];

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(
      "Set SUPABASE_DB_URL or DATABASE_URL to your Supabase Postgres connection string.",
    );
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    for (const fileName of MIGRATIONS) {
      const filePath = join(process.cwd(), "supabase", "migrations", fileName);
      const migrationSql = readFileSync(filePath, "utf8");
      console.log(`Applying ${fileName}...`);
      await sql.unsafe(migrationSql);
      console.log(`Applied ${fileName}`);
    }

    const [{ count }] = await sql<{ count: string }[]>`
      SELECT count(*)::text AS count FROM public.lms_articles
    `;
    console.log(`lms_articles row count: ${count}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
