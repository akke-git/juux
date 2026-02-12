import mysql, { type Pool, type PoolOptions } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __juuxMysqlPool: Pool | undefined;
}

function createPool(): Pool {
  const config: PoolOptions = {
    host: process.env.GOLF_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.GOLF_DB_PORT ?? 3306),
    user: process.env.GOLF_DB_USER ?? "root",
    password: process.env.GOLF_DB_PASSWORD ?? "",
    database: process.env.GOLF_DB_NAME ?? "golf",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4"
  };

  return mysql.createPool(config);
}

export const db = global.__juuxMysqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.__juuxMysqlPool = db;
}
