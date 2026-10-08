import * as SQLite from "expo-sqlite";

export type TransferStatus = "completed" | "failed" | "cancelled";

export type TransferHistory = {
  id: number;
  fileName: string;
  fileSize: number;
  status: TransferStatus;
  direction: "sent" | "received";
  date: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// OPEN & INITIALIZE DATABASE (MEMOIZED PROMISE TO PREVENT RACE CONDITIONS)

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync("file-sharing.db");

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS transfer_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fileName TEXT NOT NULL,
            fileSize INTEGER NOT NULL,
            status TEXT NOT NULL,
            direction TEXT NOT NULL,
            date TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_transfer_date ON transfer_history (date DESC);
          CREATE INDEX IF NOT EXISTS idx_transfer_status ON transfer_history (status);
        `);

        console.log("Transfer history database initialized with indexes.");
        return db;
      } catch (error) {
        dbPromise = null;
        console.error("Database initialization error:", error);
        throw error;
      }
    })();
  }

  return dbPromise;
}

// CREATE TABLE & INDEXES

export async function initializeDatabase() {
  await getDatabase();
}

// ADD HISTORY

export async function addTransferHistory(
  fileName: string,
  fileSize: number,
  status: TransferStatus,
  direction: "sent" | "received"
) {
  const db = await getDatabase();

  await db.runAsync(
    `
      INSERT INTO transfer_history
      (
        fileName,
        fileSize,
        status,
        direction,
        date
      )
      VALUES (?, ?, ?, ?, ?);
    `,
    fileName,
    fileSize,
    status,
    direction,
    new Date().toISOString()
  );

  console.log("Transfer history saved:", fileName);
}

// GET HISTORY

export async function getTransferHistory() {
  const db = await getDatabase();

  const result = await db.getAllAsync<TransferHistory>(
    `
        SELECT *
        FROM transfer_history
        ORDER BY date DESC;
      `
  );

  return result;
}

// DELETE ONE HISTORY ITEM

export async function deleteTransferHistory(id: number) {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM transfer_history
      WHERE id = ?;
    `,
    id
  );
}

// CLEAR ALL HISTORY

export async function clearTransferHistory() {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM transfer_history;
    `
  );

  console.log("Transfer history cleared.");
}
