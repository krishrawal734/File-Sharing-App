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

let database: SQLite.SQLiteDatabase | null = null;

// OPEN DATABASE

export async function getDatabase() {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync("file-sharing.db");

  return database;
}

// CREATE TABLE

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transfer_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fileName TEXT NOT NULL,
      fileSize INTEGER NOT NULL,
      status TEXT NOT NULL,
      direction TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);

  console.log("Transfer history database initialized.");
}

// ADD HISTORY

export async function addTransferHistory(
  fileName: string,
  fileSize: number,
  status: TransferStatus,
  direction: "sent" | "received",
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
    new Date().toISOString(),
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
      `,
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
    id,
  );
}

// CLEAR ALL HISTORY

export async function clearTransferHistory() {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM transfer_history;
    `,
  );

  console.log("Transfer history cleared.");
}
