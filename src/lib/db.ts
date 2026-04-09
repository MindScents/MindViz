import { neon } from "@neondatabase/serverless";
import type { Ingredient } from "@/types";

export interface PerfumeRecord {
  id: string;
  perfume_name: string;
  ingredients: Ingredient[];
  user_name: string;
  user_email: string;
}

function getSQL() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing POSTGRES_URL or DATABASE_URL environment variable. " +
        "Add a Neon Postgres database in Vercel dashboard → Storage."
    );
  }
  return neon(url);
}

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS perfume_results (
      id VARCHAR(36) PRIMARY KEY,
      perfume_name VARCHAR(100) NOT NULL,
      ingredients JSONB NOT NULL,
      user_name VARCHAR(100) NOT NULL,
      user_email VARCHAR(200) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  tableReady = true;
}

export async function saveResult(record: PerfumeRecord): Promise<void> {
  await ensureTable();
  const sql = getSQL();
  await sql`
    INSERT INTO perfume_results (id, perfume_name, ingredients, user_name, user_email)
    VALUES (
      ${record.id},
      ${record.perfume_name},
      ${JSON.stringify(record.ingredients)},
      ${record.user_name},
      ${record.user_email}
    )
  `;
}

export async function getResult(id: string): Promise<PerfumeRecord | null> {
  await ensureTable();
  const sql = getSQL();
  const rows = await sql`
    SELECT * FROM perfume_results WHERE id = ${id}
  `;

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    perfume_name: row.perfume_name,
    ingredients:
      typeof row.ingredients === "string"
        ? JSON.parse(row.ingredients)
        : row.ingredients,
    user_name: row.user_name,
    user_email: row.user_email,
  };
}
