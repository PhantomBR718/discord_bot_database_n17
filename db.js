import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH || 'database.sqlite');
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    discord_username TEXT NOT NULL,
    discord_nick TEXT,
    account_created_at TEXT NOT NULL,
    server_joined_at TEXT,
    roblox_nick TEXT NOT NULL,
    roblox_username TEXT NOT NULL,
    roblox_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    note TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const now = () => new Date().toISOString();

export function saveUser(user) {
  const timestamp = now();
  db.prepare(`INSERT INTO users
    (discord_id, discord_username, discord_nick, account_created_at, server_joined_at, roblox_nick, roblox_username, roblox_id, created_at, updated_at)
    VALUES (@discord_id, @discord_username, @discord_nick, @account_created_at, @server_joined_at, @roblox_nick, @roblox_username, @roblox_id, @created_at, @updated_at)
    ON CONFLICT(discord_id) DO UPDATE SET
      discord_username=excluded.discord_username, discord_nick=excluded.discord_nick,
      account_created_at=excluded.account_created_at, server_joined_at=excluded.server_joined_at,
      roblox_nick=excluded.roblox_nick, roblox_username=excluded.roblox_username,
      roblox_id=excluded.roblox_id, updated_at=excluded.updated_at`).run({ ...user, created_at: timestamp, updated_at: timestamp });
}

export function findUser(idOrUsername) {
  return db.prepare(`SELECT * FROM users WHERE discord_id = ? OR lower(discord_username) = lower(?) LIMIT 1`).get(idOrUsername, idOrUsername);
}

export function manualRegister(user) { saveUser(user); return findUser(user.discord_id); }

export function addReport(discordId, note, authorId) {
  return db.prepare('INSERT INTO reports (discord_id, note, author_id, created_at) VALUES (?, ?, ?, ?)').run(discordId, note, authorId, now());
}

export function getReports(discordId) {
  return db.prepare('SELECT * FROM reports WHERE discord_id = ? ORDER BY created_at DESC').all(discordId);
}
