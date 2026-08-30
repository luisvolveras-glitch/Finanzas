import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import type { TxType } from './categories';
import { hashPassword } from './password';

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

    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      is_admin INTEGER NOT NULL DEFAULT 0,
      workspace_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  migrateColumns(conn);
  bootstrapAdmin(conn);
  seedBudgetItems(conn);
  seedDebts(conn);
  return conn;
}

function addColumnIfMissing(
  conn: Database.Database,
  table: string,
  column: string,
  definition: string
) {
  const cols = conn.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    conn.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrateColumns(conn: Database.Database) {
  addColumnIfMissing(conn, 'transactions', 'debt_id', 'INTEGER');
  addColumnIfMissing(conn, 'transactions', 'budget_item_id', 'INTEGER');
  addColumnIfMissing(conn, 'transactions', 'workspace_id', 'INTEGER');
  addColumnIfMissing(conn, 'transactions', 'currency', "TEXT NOT NULL DEFAULT 'COP'");
  addColumnIfMissing(conn, 'investments', 'workspace_id', 'INTEGER');
  addColumnIfMissing(conn, 'investments', 'currency', "TEXT NOT NULL DEFAULT 'COP'");
  addColumnIfMissing(conn, 'budget_items', 'workspace_id', 'INTEGER');
  addColumnIfMissing(conn, 'debts', 'workspace_id', 'INTEGER');
  addColumnIfMissing(conn, 'users', 'is_blocked', 'INTEGER NOT NULL DEFAULT 0');
}

function bootstrapAdmin(conn: Database.Database) {
  const { count } = conn.prepare('SELECT COUNT(*) AS count FROM users').get() as {
    count: number;
  };
  if (count > 0) return;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.APP_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  // El build de Next puede levantar varios procesos en paralelo que importan
  // este módulo a la vez; si dos intentan crear el admin al mismo tiempo, el
  // segundo choca con la restricción UNIQUE del correo. Eso significa que el
  // primero ya lo hizo, así que simplemente lo ignoramos.
  try {
    runBootstrapTransaction(conn, adminEmail, adminPassword);
  } catch (err) {
    if (err instanceof Error && /UNIQUE/i.test(err.message)) return;
    throw err;
  }
}

function runBootstrapTransaction(conn: Database.Database, adminEmail: string, adminPassword: string) {
  const bootstrap = conn.transaction(() => {
    const wsInfo = conn.prepare('INSERT INTO workspaces (name) VALUES (?)').run('Mi espacio');
    const workspaceId = wsInfo.lastInsertRowid as number;

    conn
      .prepare(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, reason, status, is_admin, workspace_id)
         VALUES (@email, @passwordHash, 'Admin', '', '', '', 'approved', 1, @workspaceId)`
      )
      .run({
        email: adminEmail.toLowerCase().trim(),
        passwordHash: hashPassword(adminPassword),
        workspaceId,
      });

    for (const table of ['transactions', 'investments', 'budget_items', 'debts']) {
      conn
        .prepare(`UPDATE ${table} SET workspace_id = ? WHERE workspace_id IS NULL`)
        .run(workspaceId);
    }
  });
  bootstrap();
}

// El build de Next puede levantar varios procesos en paralelo que importan
// este módulo a la vez. Sin BEGIN IMMEDIATE, dos procesos pueden hacer el
// SELECT COUNT(*) antes de que cualquiera inserte (ambos ven 0) y sembrar el
// mismo listado dos veces. .immediate() toma el lock de escritura desde el
// BEGIN, así que el segundo proceso espera al primero y su propio COUNT ya
// ve las filas insertadas.
function seedBudgetItems(conn: Database.Database) {
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

  const seed = conn.transaction(() => {
    const { count } = conn.prepare('SELECT COUNT(*) AS count FROM budget_items').get() as {
      count: number;
    };
    if (count > 0) return;

    const admin = conn.prepare('SELECT workspace_id FROM users WHERE is_admin = 1 LIMIT 1').get() as
      | { workspace_id: number }
      | undefined;
    if (!admin) return;

    const insert = conn.prepare(
      `INSERT INTO budget_items (name, detail, frequency, amount_cents, workspace_id) VALUES (?, ?, ?, ?, ?)`
    );
    for (const row of seedRows) insert.run(...row, admin.workspace_id);
  });
  seed.immediate();
}

function seedDebts(conn: Database.Database) {
  const seedRows: [string, string, number, number | null, number | null][] = [
    ['Sra Marina', 'Préstamo gastos variados', 120000000, null, 4],
    ['Alison / Pareja', 'Moto precio total', 115700000, null, null],
  ];

  const seed = conn.transaction(() => {
    const { count } = conn.prepare('SELECT COUNT(*) AS count FROM debts').get() as {
      count: number;
    };
    if (count > 0) return;

    const admin = conn.prepare('SELECT workspace_id FROM users WHERE is_admin = 1 LIMIT 1').get() as
      | { workspace_id: number }
      | undefined;
    if (!admin) return;

    const insert = conn.prepare(
      `INSERT INTO debts (entity, detail, principal_cents, interest_rate, term_months, workspace_id) VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const row of seedRows) insert.run(...row, admin.workspace_id);
  });
  seed.immediate();
}

const db = global.__finanzasDb ?? createConnection();
if (process.env.NODE_ENV !== 'production') {
  global.__finanzasDb = db;
}

export interface Workspace {
  id: number;
  name: string;
  created_at: string;
}

export function createWorkspace(name: string): number {
  const info = db.prepare('INSERT INTO workspaces (name) VALUES (?)').run(name);
  return info.lastInsertRowid as number;
}

export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  reason: string;
  status: UserStatus;
  is_admin: number;
  is_blocked: number;
  workspace_id: number;
  created_at: string;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  reason: string;
  workspaceId: number;
}

export function createUser(user: NewUser): User {
  const stmt = db.prepare(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, reason, workspace_id)
     VALUES (@email, @passwordHash, @firstName, @lastName, @phone, @reason, @workspaceId)`
  );
  const info = stmt.run({ ...user, email: user.email.toLowerCase().trim() });
  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as User;
}

export function getUserByEmail(email: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as
    | User
    | undefined;
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function listPendingUsers(): User[] {
  return db
    .prepare("SELECT * FROM users WHERE status = 'pending' ORDER BY created_at ASC")
    .all() as User[];
}

export function listAllUsers(): User[] {
  return db.prepare('SELECT * FROM users ORDER BY created_at ASC').all() as User[];
}

export function approveUser(id: number): void {
  db.prepare("UPDATE users SET status = 'approved' WHERE id = ?").run(id);
}

export function rejectUser(id: number): void {
  db.prepare("UPDATE users SET status = 'rejected' WHERE id = ?").run(id);
}

export function blockUser(id: number): void {
  db.prepare('UPDATE users SET is_blocked = 1 WHERE id = ?').run(id);
}

export function unblockUser(id: number): void {
  db.prepare('UPDATE users SET is_blocked = 0 WHERE id = ?').run(id);
}

export function setUserPasswordHash(id: number, passwordHash: string): void {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}

export function getAdminWorkspaceId(): number | undefined {
  const row = db
    .prepare('SELECT workspace_id FROM users WHERE is_admin = 1 LIMIT 1')
    .get() as { workspace_id: number } | undefined;
  return row?.workspace_id;
}

export type Currency = 'COP' | 'USD';

export interface Transaction {
  id: number;
  type: TxType;
  amount_cents: number;
  detail: string;
  category: string;
  date: string;
  created_at: string;
  debt_id: number | null;
  budget_item_id: number | null;
  workspace_id: number;
  currency: Currency;
}

export interface NewTransaction {
  type: TxType;
  amountCents: number;
  detail: string;
  category: string;
  date: string;
  debtId: number | null;
  budgetItemId: number | null;
  workspaceId: number;
  currency: Currency;
}

export function addTransaction(tx: NewTransaction): Transaction {
  const stmt = db.prepare(
    `INSERT INTO transactions (type, amount_cents, detail, category, date, debt_id, budget_item_id, workspace_id, currency)
     VALUES (@type, @amountCents, @detail, @category, @date, @debtId, @budgetItemId, @workspaceId, @currency)`
  );
  const info = stmt.run(tx);
  return db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(info.lastInsertRowid) as Transaction;
}

export function updateTransaction(
  id: number,
  workspaceId: number,
  tx: NewTransaction
): Transaction | undefined {
  db.prepare(
    `UPDATE transactions
     SET type = @type, amount_cents = @amountCents, detail = @detail, category = @category,
         date = @date, debt_id = @debtId, budget_item_id = @budgetItemId, currency = @currency
     WHERE id = @id AND workspace_id = @workspaceId`
  ).run({ ...tx, id, workspaceId });
  return db
    .prepare('SELECT * FROM transactions WHERE id = ? AND workspace_id = ?')
    .get(id, workspaceId) as Transaction | undefined;
}

export function deleteTransaction(id: number, workspaceId: number): void {
  db.prepare('DELETE FROM transactions WHERE id = ? AND workspace_id = ?').run(id, workspaceId);
}

export function getTransaction(id: number, workspaceId: number): Transaction | undefined {
  return db
    .prepare('SELECT * FROM transactions WHERE id = ? AND workspace_id = ?')
    .get(id, workspaceId) as Transaction | undefined;
}

export interface ListFilters {
  month?: string; // 'YYYY-MM'
  type?: TxType;
  limit?: number;
}

export function listTransactions(workspaceId: number, filters: ListFilters = {}): Transaction[] {
  const clauses: string[] = ['workspace_id = @workspaceId'];
  const params: Record<string, unknown> = { workspaceId };

  if (filters.month) {
    clauses.push("strftime('%Y-%m', date) = @month");
    params.month = filters.month;
  }
  if (filters.type) {
    clauses.push('type = @type');
    params.type = filters.type;
  }

  const where = `WHERE ${clauses.join(' AND ')}`;
  const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';

  return db
    .prepare(`SELECT * FROM transactions ${where} ORDER BY date DESC, id DESC ${limit}`)
    .all(params) as Transaction[];
}

export interface PeriodTotals {
  income_cents: number;
  expense_cents: number;
}

export function getTotals(workspaceId: number, month?: string): PeriodTotals {
  const where = month
    ? "WHERE workspace_id = @workspaceId AND currency = 'COP' AND strftime('%Y-%m', date) = @month"
    : "WHERE workspace_id = @workspaceId AND currency = 'COP'";
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents
       FROM transactions ${where}`
    )
    .get(month ? { workspaceId, month } : { workspaceId }) as PeriodTotals;
  return row;
}

export function getTotalsUSD(workspaceId: number, month?: string): PeriodTotals {
  const where = month
    ? "WHERE workspace_id = @workspaceId AND currency = 'USD' AND strftime('%Y-%m', date) = @month"
    : "WHERE workspace_id = @workspaceId AND currency = 'USD'";
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents
       FROM transactions ${where}`
    )
    .get(month ? { workspaceId, month } : { workspaceId }) as PeriodTotals;
  return row;
}

export interface MonthlySummaryRow {
  month: string;
  income_cents: number;
  expense_cents: number;
}

export function getMonthlySummary(workspaceId: number, limit = 12): MonthlySummaryRow[] {
  return db
    .prepare(
      `SELECT
         strftime('%Y-%m', date) AS month,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END), 0) AS income_cents,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expense_cents
       FROM transactions
       WHERE workspace_id = ? AND currency = 'COP'
       GROUP BY month
       ORDER BY month DESC
       LIMIT ?`
    )
    .all(workspaceId, limit) as MonthlySummaryRow[];
}

export interface CategoryTotalRow {
  category: string;
  type: TxType;
  total_cents: number;
}

export function getCategoryTotals(workspaceId: number, month?: string): CategoryTotalRow[] {
  const where = month
    ? "WHERE workspace_id = @workspaceId AND currency = 'COP' AND strftime('%Y-%m', date) = @month"
    : "WHERE workspace_id = @workspaceId AND currency = 'COP'";
  return db
    .prepare(
      `SELECT category, type, SUM(amount_cents) AS total_cents
       FROM transactions ${where}
       GROUP BY category, type
       ORDER BY total_cents DESC`
    )
    .all(month ? { workspaceId, month } : { workspaceId }) as CategoryTotalRow[];
}

export function getAvailableMonths(workspaceId: number): string[] {
  return (
    db
      .prepare(
        `SELECT DISTINCT strftime('%Y-%m', date) AS month FROM transactions WHERE workspace_id = ? ORDER BY month DESC`
      )
      .all(workspaceId) as { month: string }[]
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
  workspace_id: number;
  currency: Currency;
}

export interface NewInvestment {
  category: string;
  name: string;
  amountCents: number;
  interestRate: number | null;
  date: string;
  workspaceId: number;
  currency: Currency;
}

export function addInvestment(inv: NewInvestment): Investment {
  const stmt = db.prepare(
    `INSERT INTO investments (category, name, amount_cents, interest_rate, date, workspace_id, currency)
     VALUES (@category, @name, @amountCents, @interestRate, @date, @workspaceId, @currency)`
  );
  const info = stmt.run(inv);
  return db
    .prepare('SELECT * FROM investments WHERE id = ?')
    .get(info.lastInsertRowid) as Investment;
}

export function updateInvestment(
  id: number,
  workspaceId: number,
  inv: NewInvestment
): Investment | undefined {
  db.prepare(
    `UPDATE investments
     SET category = @category, name = @name, amount_cents = @amountCents,
         interest_rate = @interestRate, date = @date, currency = @currency
     WHERE id = @id AND workspace_id = @workspaceId`
  ).run({ ...inv, id, workspaceId });
  return db
    .prepare('SELECT * FROM investments WHERE id = ? AND workspace_id = ?')
    .get(id, workspaceId) as Investment | undefined;
}

export function deleteInvestment(id: number, workspaceId: number): void {
  db.prepare('DELETE FROM investments WHERE id = ? AND workspace_id = ?').run(id, workspaceId);
}

export function listInvestments(workspaceId: number, limit = 200): Investment[] {
  return db
    .prepare('SELECT * FROM investments WHERE workspace_id = ? ORDER BY date DESC, id DESC LIMIT ?')
    .all(workspaceId, limit) as Investment[];
}

export interface InvestmentTotals {
  total_cents: number;
  weighted_rate: number | null;
}

export function getInvestmentTotals(workspaceId: number): InvestmentTotals {
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(amount_cents), 0) AS total_cents,
         CASE WHEN SUM(amount_cents) > 0
           THEN SUM(amount_cents * COALESCE(interest_rate, 0)) * 1.0 / SUM(amount_cents)
           ELSE NULL
         END AS weighted_rate
       FROM investments
       WHERE workspace_id = ? AND currency = 'COP'`
    )
    .get(workspaceId) as InvestmentTotals;
  return row;
}

export function getInvestmentTotalsUSD(workspaceId: number): InvestmentTotals {
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(amount_cents), 0) AS total_cents,
         CASE WHEN SUM(amount_cents) > 0
           THEN SUM(amount_cents * COALESCE(interest_rate, 0)) * 1.0 / SUM(amount_cents)
           ELSE NULL
         END AS weighted_rate
       FROM investments
       WHERE workspace_id = ? AND currency = 'USD'`
    )
    .get(workspaceId) as InvestmentTotals;
  return row;
}

export interface InvestmentCategoryTotalRow {
  category: string;
  total_cents: number;
  count: number;
}

export function getInvestmentCategoryTotals(workspaceId: number): InvestmentCategoryTotalRow[] {
  return db
    .prepare(
      `SELECT category, SUM(amount_cents) AS total_cents, COUNT(*) AS count
       FROM investments
       WHERE workspace_id = ? AND currency = 'COP'
       GROUP BY category
       ORDER BY total_cents DESC`
    )
    .all(workspaceId) as InvestmentCategoryTotalRow[];
}

export interface BudgetItem {
  id: number;
  name: string;
  detail: string;
  frequency: string;
  amount_cents: number;
  created_at: string;
  workspace_id: number;
}

export interface NewBudgetItem {
  name: string;
  detail: string;
  frequency: string;
  amountCents: number;
  workspaceId: number;
}

export function addBudgetItem(item: NewBudgetItem): BudgetItem {
  const stmt = db.prepare(
    `INSERT INTO budget_items (name, detail, frequency, amount_cents, workspace_id)
     VALUES (@name, @detail, @frequency, @amountCents, @workspaceId)`
  );
  const info = stmt.run(item);
  return db
    .prepare('SELECT * FROM budget_items WHERE id = ?')
    .get(info.lastInsertRowid) as BudgetItem;
}

export function updateBudgetItem(
  id: number,
  workspaceId: number,
  item: NewBudgetItem
): BudgetItem | undefined {
  db.prepare(
    `UPDATE budget_items
     SET name = @name, detail = @detail, frequency = @frequency, amount_cents = @amountCents
     WHERE id = @id AND workspace_id = @workspaceId`
  ).run({ ...item, id, workspaceId });
  return db
    .prepare('SELECT * FROM budget_items WHERE id = ? AND workspace_id = ?')
    .get(id, workspaceId) as BudgetItem | undefined;
}

export function deleteBudgetItem(id: number, workspaceId: number): void {
  const unlink = db.transaction((itemId: number, ws: number) => {
    db.prepare(
      'UPDATE transactions SET budget_item_id = NULL WHERE budget_item_id = ? AND workspace_id = ?'
    ).run(itemId, ws);
    db.prepare('DELETE FROM budget_items WHERE id = ? AND workspace_id = ?').run(itemId, ws);
  });
  unlink(id, workspaceId);
}

export function getBudgetItemPaidTotal(itemId: number, workspaceId: number, month: string): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM transactions
       WHERE budget_item_id = ? AND workspace_id = ? AND type = 'expense'
         AND strftime('%Y-%m', date) = ?`
    )
    .get(itemId, workspaceId, month) as { total: number };
  return row.total;
}

export function listBudgetItems(workspaceId: number): BudgetItem[] {
  return db
    .prepare('SELECT * FROM budget_items WHERE workspace_id = ? ORDER BY id ASC')
    .all(workspaceId) as BudgetItem[];
}

export function getBudgetTotal(workspaceId: number): number {
  const row = db
    .prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total FROM budget_items WHERE workspace_id = ?')
    .get(workspaceId) as { total: number };
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
  workspace_id: number;
}

export interface NewDebt {
  entity: string;
  detail: string;
  principalCents: number;
  interestRate: number | null;
  termMonths: number | null;
  workspaceId: number;
}

export function addDebt(debt: NewDebt): Debt {
  const stmt = db.prepare(
    `INSERT INTO debts (entity, detail, principal_cents, interest_rate, term_months, workspace_id)
     VALUES (@entity, @detail, @principalCents, @interestRate, @termMonths, @workspaceId)`
  );
  const info = stmt.run(debt);
  return db.prepare('SELECT * FROM debts WHERE id = ?').get(info.lastInsertRowid) as Debt;
}

export function updateDebt(id: number, workspaceId: number, debt: NewDebt): Debt | undefined {
  db.prepare(
    `UPDATE debts
     SET entity = @entity, detail = @detail, principal_cents = @principalCents,
         interest_rate = @interestRate, term_months = @termMonths
     WHERE id = @id AND workspace_id = @workspaceId`
  ).run({ ...debt, id, workspaceId });
  return db
    .prepare('SELECT * FROM debts WHERE id = ? AND workspace_id = ?')
    .get(id, workspaceId) as Debt | undefined;
}

export function deleteDebt(id: number, workspaceId: number): void {
  const unlink = db.transaction((debtId: number, ws: number) => {
    db.prepare('UPDATE transactions SET debt_id = NULL WHERE debt_id = ? AND workspace_id = ?').run(
      debtId,
      ws
    );
    db.prepare('DELETE FROM debts WHERE id = ? AND workspace_id = ?').run(debtId, ws);
  });
  unlink(id, workspaceId);
}

export function listDebts(workspaceId: number): Debt[] {
  return db.prepare('SELECT * FROM debts WHERE workspace_id = ? ORDER BY id ASC').all(
    workspaceId
  ) as Debt[];
}

export function getDebtPaidTotal(debtId: number, workspaceId: number): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM transactions
       WHERE debt_id = ? AND type = 'expense' AND workspace_id = ?`
    )
    .get(debtId, workspaceId) as { total: number };
  return row.total;
}

export function getDebtPaidTotalForMonth(debtId: number, workspaceId: number, month: string): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM transactions
       WHERE debt_id = ? AND type = 'expense' AND workspace_id = ?
         AND strftime('%Y-%m', date) = ?`
    )
    .get(debtId, workspaceId, month) as { total: number };
  return row.total;
}

export function getDebtPaidTotalUpToMonth(
  debtId: number,
  workspaceId: number,
  month: string
): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total
       FROM transactions
       WHERE debt_id = ? AND type = 'expense' AND workspace_id = ?
         AND strftime('%Y-%m', date) <= ?`
    )
    .get(debtId, workspaceId, month) as { total: number };
  return row.total;
}

export function getDebtPayments(debtId: number, workspaceId: number): Transaction[] {
  return db
    .prepare(
      `SELECT * FROM transactions WHERE debt_id = ? AND type = 'expense' AND workspace_id = ? ORDER BY date DESC, id DESC`
    )
    .all(debtId, workspaceId) as Transaction[];
}

export interface BudgetRow {
  key: string;
  name: string;
  detail: string;
  frequency: string;
  amountCents: number;
  paidCents: number;
  itemId?: number;
}

export function getBudgetRows(workspaceId: number, month: string): BudgetRow[] {
  const items = listBudgetItems(workspaceId);
  const debts = listDebts(workspaceId);

  const itemRows: BudgetRow[] = items.map((item) => ({
    key: `item-${item.id}`,
    name: item.name,
    detail: item.detail,
    frequency: item.frequency,
    amountCents: item.amount_cents,
    paidCents: getBudgetItemPaidTotal(item.id, workspaceId, month),
    itemId: item.id,
  }));

  const debtRows: BudgetRow[] = debts
    .map((debt): BudgetRow | null => {
      const paidThisMonth = getDebtPaidTotalForMonth(debt.id, workspaceId, month);
      const paidUpToMonth = getDebtPaidTotalUpToMonth(debt.id, workspaceId, month);
      const paidBeforeThisMonth = paidUpToMonth - paidThisMonth;
      const remainingBeforeThisMonth = debt.principal_cents - paidBeforeThisMonth;
      if (remainingBeforeThisMonth <= 0) return null;

      const installments = debt.term_months && debt.term_months > 0 ? debt.term_months : 1;
      const installmentCents = Math.round(debt.principal_cents / installments);
      const amountCents = Math.min(installmentCents, remainingBeforeThisMonth);

      return {
        key: `debt-${debt.id}`,
        name: debt.entity,
        detail: debt.detail,
        frequency: 'Deuda (cuota)',
        amountCents,
        paidCents: paidThisMonth,
      };
    })
    .filter((r): r is BudgetRow => r !== null);

  return [...itemRows, ...debtRows];
}

export interface BudgetPayment {
  id: number;
  date: string;
  detail: string;
  amount_cents: number;
  target: string;
}

export function getBudgetPayments(workspaceId: number, month: string): BudgetPayment[] {
  return db
    .prepare(
      `SELECT t.id, t.date, t.detail, t.amount_cents,
              COALESCE(bi.name, d.entity) AS target
       FROM transactions t
       LEFT JOIN budget_items bi ON bi.id = t.budget_item_id
       LEFT JOIN debts d ON d.id = t.debt_id
       WHERE t.workspace_id = ? AND t.type = 'expense'
         AND (t.budget_item_id IS NOT NULL OR t.debt_id IS NOT NULL)
         AND strftime('%Y-%m', t.date) = ?
       ORDER BY t.date ASC, t.id ASC`
    )
    .all(workspaceId, month) as BudgetPayment[];
}

export default db;
