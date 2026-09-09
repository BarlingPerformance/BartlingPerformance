import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'bartling.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color_tag TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
    start_datetime TEXT NOT NULL,
    end_datetime TEXT NOT NULL,
    renter_name TEXT NOT NULL,
    drivers_license_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_card_number TEXT NOT NULL,
    price REAL NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const seedVehicles = [
  { id: 'bmw-m4-competition-xdrive', name: 'BMW M4 Competition xDrive', color_tag: 'blue' },
  { id: 'audi-rs3-limousine', name: 'Audi RS3 Limousine', color_tag: 'red' },
];

const insertVehicle = db.prepare(
  'INSERT OR IGNORE INTO vehicles (id, name, color_tag) VALUES (@id, @name, @color_tag)'
);
const seedTx = db.transaction((vehicles) => {
  for (const v of vehicles) insertVehicle.run(v);
});
seedTx(seedVehicles);
