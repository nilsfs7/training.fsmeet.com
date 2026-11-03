import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;
let schemaReady: Promise<void> | null = null;

export function getPool(): mysql.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!pool) {
    pool = mysql.createPool({
      uri: url,
      dateStrings: true,
      connectionLimit: 10,
      waitForConnections: true,
    });
  }
  return pool;
}

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = migrate().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

async function migrate(): Promise<void> {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) NOT NULL,
      fsmeet_sub VARCHAR(255) NOT NULL,
      email VARCHAR(255) NULL,
      display_name VARCHAR(255) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY users_fsmeet_sub (fsmeet_sub)
    ) ENGINE=InnoDB
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      trained_on DATE NOT NULL,
      duration_minutes INT UNSIGNED NOT NULL,
      note VARCHAR(2000) NULL,
      created_at DATETIME(3) NOT NULL,
      updated_at DATETIME(3) NOT NULL,
      PRIMARY KEY (id),
      KEY sessions_user_trained (user_id, trained_on),
      CONSTRAINT sessions_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
    ) ENGINE=InnoDB
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS session_categories (
      session_id CHAR(36) NOT NULL,
      category VARCHAR(32) NOT NULL,
      PRIMARY KEY (session_id, category),
      CONSTRAINT session_categories_session_fk FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);
  await db.query("ALTER TABLE sessions ADD COLUMN IF NOT EXISTS feeling VARCHAR(16) NULL");
  await db.query(`
    UPDATE sessions
    SET feeling = CASE feeling
      WHEN 'rough' THEN '1'
      WHEN 'hard' THEN '3'
      WHEN 'okay' THEN '5'
      WHEN 'good' THEN '8'
      WHEN 'great' THEN '10'
      ELSE feeling
    END
    WHERE feeling IN ('rough', 'hard', 'okay', 'good', 'great')
  `);
  await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS feeling_input VARCHAR(16) NOT NULL DEFAULT 'emoji'");
  await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS duration_unit VARCHAR(16) NOT NULL DEFAULT 'hours'");
}
