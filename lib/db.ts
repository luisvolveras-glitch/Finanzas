import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import type { TxType } from './categories';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'finanzas.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __finanzasDb: Database.Database | undefined;
}

function createConnection() {
  const conn = new Database(dbPath);
  conn.pragma('journal_mode = WAL');
  conn.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      amount_cents INTEGER NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'otro_gasto',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  `);
  return conn;
}

const db = global.__finanzasDb ?? createConnection();
if (process.env.NODE_ENV !== 'production') {
  global.__finanzasDb = db;
}

export interface Transaction {
  id: number;
  type: TxType;
  amount_cents: number;
  detail: string;
  category: string;
  date: string;
  created_at: string;
}

export interface NewTransaction {
  type: TxType;
  amountCents: number;
  detail: string;
  category: string;
  date: string;
}

export function addTransaction(tx: NewTransaction): Transaction {
  const stmt = db.prepare(
    `INSERT INTO transactions (type, amount_cents, detail, category, date)
     VALUES (@type, @amountCents, @detail, @category, @date)`
  );
  const info = stmt.run(tx);
  return db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(info.lastInsertRowid) as Transaction;
}

export function updateTransaction(id: number, tx: NewTransaction): Transaction | undefined {
  db.prepare(
    `UPDATE transactions
     SET type = @type, amount_cents = @amountCents, detail = @detail, category = @category, date = @date
     WHERE id = @id`
  ).run({ ...tx, id });
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction | undefined;
}

export function deleteTransaction(id: number): void {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
}

export function getTransaction(id: number): Transaction | undefined {
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction | undefined;
}

export interface ListFilters {
  month?: string; // 'YYYY-MM'
  type?: TxType;
  limit?: number;
}

export function listTransactions(filters: ListFilters = {}): Transaction[] {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.month) {
    clauses.push("strftime('%Y-%m', date) = @month");
    params.month = filters.month;
  }
  if (filters.type) {
    clauses.push('type = @type');
    params.type = filters.type;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';

  return db
    .prepare(`SELECT * FROM transactions ${where} ORDER BY date DESC, id DESC ${limit}`)
    .all(params) as Transaction[];
}

export interface PeriodTotals {
  income_cents: number;
  expense_cents: number;
}

export function getTotals(month?: string): PeriodTotals {
  const where = month ? "WHERE strftime('%Y-%m', date) = @month" : '';
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents
       FROM transactions ${where}`
    )
    .get(month ? { month } : {}) as PeriodTotals;
  return row;
}

export interface MonthlySummaryRow {
  month: string;
  income_cents: number;
  expense_cents: number;
}

export function getMonthlySummary(limit = 12): MonthlySummaryRow[] {
  return db
    .prepare(
      `SELECT
         strftime('%Y-%m', date) AS month,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents
       FROM transactions
       GROUP BY month
       ORDER BY month DESC
       LIMIT ?`
    )
    .all(limit) as MonthlySummaryRow[];
}

export interface CategoryTotalRow {
  category: string;
  type: TxType;
  total_cents: number;
}

export function getCategoryTotals(month?: string): CategoryTotalRow[] {
  const where = month ? "WHERE strftime('%Y-%m', date) = @month" : '';
  return db
    .prepare(
      `SELECT category, type, SUM(amount_cents) AS total_cents
       FROM transactions ${where}
       GROUP BY category, type
       ORDER BY total_cents DESC`
    )
    .all(month ? { month } : {}) as CategoryTotalRow[];
}

export function getAvailableMonths(): string[] {
  return (
    db
      .prepare(
        `SELECT DISTINCT strftime('%Y-%m', date) AS month FROM transactions ORDER BY month DESC`
      )
      .all() as { month: string }[]
  ).map((r) => r.month);
}

export default db;
