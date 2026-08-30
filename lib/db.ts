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

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL DEFAULT 'otro_inversion',
      name TEXT NOT NULL DEFAULT '',
      amount_cents INTEGER NOT NULL,
      interest_rate REAL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(date);

    CREATE TABLE IF NOT EXISTS budget_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      detail TEXT NOT NULL DEFAULT '',
      frequency TEXT NOT NULL DEFAULT '',
      amount_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL DEFAULT '',
      detail TEXT NOT NULL DEFAULT '',
      principal_cents INTEGER NOT NULL,
      interest_rate REAL,
      term_months INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  migrateTransactionsDebtId(conn);
  seedBudgetItems(conn);
  seedDebts(conn);
  return conn;
}

function migrateTransactionsDebtId(conn: Database.Database) {
  const cols = conn.prepare('PRAGMA table_info(transactions)').all() as { name: string }[];
  if (!cols.some((c) => c.name === 'debt_id')) {
    conn.exec('ALTER TABLE transactions ADD COLUMN debt_id INTEGER');
  }
}

function seedDebts(conn: Database.Database) {
  const { count } = conn.prepare('SELECT COUNT(*) AS count FROM debts').get() as {
    count: number;
  };
  if (count > 0) return;

  const seedRows: [string, string, number, number | null, number | null][] = [
    ['Sra Marina', 'Préstamo gastos variados', 120000000, null, 4],
    ['Alison / Pareja', 'Moto precio total', 115700000, null, null],
  ];

  const insert = conn.prepare(
    `INSERT INTO debts (entity, detail, principal_cents, interest_rate, term_months) VALUES (?, ?, ?, ?, ?)`
  );
  const insertMany = conn.transaction((rows: typeof seedRows) => {
    for (const row of rows) insert.run(...row);
  });
  insertMany(seedRows);
}

function seedBudgetItems(conn: Database.Database) {
  const { count } = conn.prepare('SELECT COUNT(*) AS count FROM budget_items').get() as {
    count: number;
  };
  if (count > 0) return;

  const seedRows: [string, string, string, number][] = [
    ['Inmobiliaria', 'Arriendo casa', '1 de cada mes', 50000000],
    ['Movistar', 'Internet, parabólica y teléfono fijo casa', '9 de cada mes', 17649000],
    ['Imexhs - Wendy', 'Cumples y pachangas', '1 de cada mes', 1100000],
    ['Claro', 'Datos celular personal', '5 siguiente mes', 3500000],
    ['Barbería', 'Cabello', '10 de cada mes', 16000000],
    ['Cadena', 'Deuda Yayis', '1 de cada mes', 20000000],
    ['Madre Yayis', 'Préstamo', '1 de cada mes', 30000000],
    ['Banco de Bogotá', 'Tarjeta de crédito', '15 de cada mes', 23278800],
    ['Banco de Bogotá', 'Tarjeta de crédito GOLD', '15 de cada mes', 152384900],
    ['Parqueadero', 'Moto', '6 de cada mes en efectivo', 7000000],
    ['Colsubsidio', 'Crédito de consumo', '15 de cada mes', 20000000],
  ];

  const insert = conn.prepare(
    `INSERT INTO budget_items (name, detail, frequency, amount_cents) VALUES (?, ?, ?, ?)`
  );
  const insertMany = conn.transaction((rows: typeof seedRows) => {
    for (const row of rows) insert.run(...row);
  });
  insertMany(seedRows);
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
  debt_id: number | null;
}

export interface NewTransaction {
  type: TxType;
  amountCents: number;
  detail: string;
  category: string;
  date: string;
  debtId: number | null;
}

export function addTransaction(tx: NewTransaction): Transaction {
  const stmt = db.prepare(
    `INSERT INTO transactions (type, amount_cents, detail, category, date, debt_id)
     VALUES (@type, @amountCents, @detail, @category, @date, @debtId)`
  );
  const info = stmt.run(tx);
  return db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(info.lastInsertRowid) as Transaction;
}

export function updateTransaction(id: number, tx: NewTransaction): Transaction | undefined {
  db.prepare(
    `UPDATE transactions
     SET type = @type, amount_cents = @amountCents, detail = @detail, category = @category,
         date = @date, debt_id = @debtId
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

export interface Investment {
  id: number;
  category: string;
  name: string;
  amount_cents: number;
  interest_rate: number | null;
  date: string;
  created_at: string;
}

export interface NewInvestment {
  category: string;
  name: string;
  amountCents: number;
  interestRate: number | null;
  date: string;
}

export function addInvestment(inv: NewInvestment): Investment {
  const stmt = db.prepare(
    `INSERT INTO investments (category, name, amount_cents, interest_rate, date)
     VALUES (@category, @name, @amountCents, @interestRate, @date)`
  );
  const info = stmt.run(inv);
  return db
    .prepare('SELECT * FROM investments WHERE id = ?')
    .get(info.lastInsertRowid) as Investment;
}

export function updateInvestment(id: number, inv: NewInvestment): Investment | undefined {
  db.prepare(
    `UPDATE investments
     SET category = @category, name = @name, amount_cents = @amountCents,
         interest_rate = @interestRate, date = @date
     WHERE id = @id`
  ).run({ ...inv, id });
  return db.prepare('SELECT * FROM investments WHERE id = ?').get(id) as Investment | undefined;
}

export function deleteInvestment(id: number): void {
  db.prepare('DELETE FROM investments WHERE id = ?').run(id);
}

export function listInvestments(limit = 200): Investment[] {
  return db
    .prepare('SELECT * FROM investments ORDER BY date DESC, id DESC LIMIT ?')
    .all(limit) as Investment[];
}

export interface InvestmentTotals {
  total_cents: number;
  weighted_rate: number | null;
}

export function getInvestmentTotals(): InvestmentTotals {
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(amount_cents), 0) AS total_cents,
         CASE WHEN SUM(amount_cents) > 0
           THEN SUM(amount_cents * COALESCE(interest_rate, 0)) * 1.0 / SUM(amount_cents)
           ELSE NULL
         END AS weighted_rate
       FROM investments`
    )
    .get() as InvestmentTotals;
  return row;
}

export interface InvestmentCategoryTotalRow {
  category: string;
  total_cents: number;
  count: number;
}

export function getInvestmentCategoryTotals(): InvestmentCategoryTotalRow[] {
  return db
    .prepare(
      `SELECT category, SUM(amount_cents) AS total_cents, COUNT(*) AS count
       FROM investments
       GROUP BY category
       ORDER BY total_cents DESC`
    )
    .all() as InvestmentCategoryTotalRow[];
}

export interface BudgetItem {
  id: number;
  name: string;
  detail: string;
  frequency: string;
  amount_cents: number;
  created_at: string;
}

export interface NewBudgetItem {
  name: string;
  detail: string;
  frequency: string;
  amountCents: number;
}

export function addBudgetItem(item: NewBudgetItem): BudgetItem {
  const stmt = db.prepare(
    `INSERT INTO budget_items (name, detail, frequency, amount_cents)
     VALUES (@name, @detail, @frequency, @amountCents)`
  );
  const info = stmt.run(item);
  return db
    .prepare('SELECT * FROM budget_items WHERE id = ?')
    .get(info.lastInsertRowid) as BudgetItem;
}

export function updateBudgetItem(id: number, item: NewBudgetItem): BudgetItem | undefined {
  db.prepare(
    `UPDATE budget_items
     SET name = @name, detail = @detail, frequency = @frequency, amount_cents = @amountCents
     WHERE id = @id`
  ).run({ ...item, id });
  return db.prepare('SELECT * FROM budget_items WHERE id = ?').get(id) as BudgetItem | undefined;
}

export function deleteBudgetItem(id: number): void {
  db.prepare('DELETE FROM budget_items WHERE id = ?').run(id);
}

export function listBudgetItems(): BudgetItem[] {
  return db.prepare('SELECT * FROM budget_items ORDER BY id ASC').all() as BudgetItem[];
}

export function getBudgetTotal(): number {
  const row = db
    .prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total FROM budget_items')
    .get() as { total: number };
  return row.total;
}

export interface Debt {
  id: number;
  entity: string;
  detail: string;
  principal_cents: number;
  interest_rate: number | null;
  term_months: number | null;
  created_at: string;
}

export interface NewDebt {
  entity: string;
  detail: string;
  principalCents: number;
  interestRate: number | null;
  termMonths: number | null;
}

export function addDebt(debt: NewDebt): Debt {
  const stmt = db.prepare(
    `INSERT INTO debts (entity, detail, principal_cents, interest_rate, term_months)
     VALUES (@entity, @detail, @principalCents, @interestRate, @termMonths)`
  );
  const info = stmt.run(debt);
  return db.prepare('SELECT * FROM debts WHERE id = ?').get(info.lastInsertRowid) as Debt;
}

export function updateDebt(id: number, debt: NewDebt): Debt | undefined {
  db.prepare(
    `UPDATE debts
     SET entity = @entity, detail = @detail, principal_cents = @principalCents,
         interest_rate = @interestRate, term_months = @termMonths
     WHERE id = @id`
  ).run({ ...debt, id });
  return db.prepare('SELECT * FROM debts WHERE id = ?').get(id) as Debt | undefined;
}

export function deleteDebt(id: number): void {
  const unlink = db.transaction((debtId: number) => {
    db.prepare('UPDATE transactions SET debt_id = NULL WHERE debt_id = ?').run(debtId);
    db.prepare('DELETE FROM debts WHERE id = ?').run(debtId);
  });
  unlink(id);
}

export function listDebts(): Debt[] {
  return db.prepare('SELECT * FROM debts ORDER BY id ASC').all() as Debt[];
}

export function getDebtPaidTotal(debtId: number): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM transactions
       WHERE debt_id = ? AND type = 'expense'`
    )
    .get(debtId) as { total: number };
  return row.total;
}

export function getDebtPayments(debtId: number): Transaction[] {
  return db
    .prepare(
      `SELECT * FROM transactions WHERE debt_id = ? AND type = 'expense' ORDER BY date DESC, id DESC`
    )
    .all(debtId) as Transaction[];
}

export default db;
