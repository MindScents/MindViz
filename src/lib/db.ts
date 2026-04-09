/**
 * Database abstraction layer.
 * Uses @vercel/postgres when POSTGRES_URL is set (Vercel deployment),
 * falls back to in-memory store for local development.
 */

import type { Ingredient } from "@/types";

export interface PerfumeRecord {
  id: string;
  perfume_name: string;
  ingredients: Ingredient[];
  user_name: string;
  user_email: string;
  created_at: string;
}

/* ---------- In-memory fallback for local dev ---------- */
const memoryStore = new Map<string, PerfumeRecord>();

/* ---------- Postgres helpers ---------- */
async function getSQL() {
  const { sql } = await import("@vercel/postgres");
  return sql;
}

async function ensureTable() {
  const sql = await getSQL();
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
}

const hasDb = !!process.env.POSTGRES_URL;

export async function saveResult(record: PerfumeRecord): Promise<void> {
  if (!hasDb) {
    memoryStore.set(record.id, record);
    return;
  }

  await ensureTable();
  const sql = await getSQL();
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
  if (!hasDb) {
    return memoryStore.get(id) || null;
  }

  await ensureTable();
  const sql = await getSQL();
  const { rows } = await sql`
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
    created_at: row.created_at,
  };
}
