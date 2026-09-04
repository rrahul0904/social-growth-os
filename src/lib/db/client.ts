import postgres from "postgres";

let sql: ReturnType<typeof postgres> | undefined;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required when DEMO_MODE=false");
  sql ??= postgres(url, {
    max: 8,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return sql;
}
