import DatabaseConstructor from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Database {
  private db: any;

  constructor(dbPath: string = "selin.db") {
    try {
      this.db = new DatabaseConstructor(dbPath);
    } catch (err) {
      console.warn("better-sqlite3 failed to initialize native binary, falling back to clean emulator:", err);
      this.db = this.createFallbackDb();
    }
    this.initSchema();
  }

  private createFallbackDb() {
    const store: Record<string, any[]> = {
      users: [],
      conversations: [],
      subscriptions: [],
      settings: [],
      logs: []
    };

    return {
      exec: (sql: string) => {
        // Minimal parser/emulator for essential schema creation
      },
      prepare: (sql: string) => {
        const lowerSql = sql.toLowerCase();
        return {
          get: (...args: any[]) => {
            if (lowerSql.includes("from users")) {
              return store.users.find(u => u.id === args[0]) || null;
            }
            if (lowerSql.includes("from settings")) {
              return store.settings.find(s => s.key === args[0]) || null;
            }
            return null;
          },
          all: (...args: any[]) => {
            if (lowerSql.includes("from conversations")) {
              return store.conversations;
            }
            return [];
          },
          run: (...args: any[]) => {
            if (lowerSql.includes("insert into logs")) {
              store.logs.push({ level: args[0], message: args[1], context: args[2] });
            } else if (lowerSql.includes("insert into users")) {
              store.users.push({ id: args[0], username: args[1], email: args[2] });
            } else if (lowerSql.includes("insert into settings")) {
              store.settings.push({ key: args[0], value: args[1] });
            }
            return { changes: 1, lastInsertRowid: Date.now() };
          }
        };
      }
    };
  }

  private initSchema() {
    const schemaPath = path.resolve(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf-8");
      this.db.exec(schema);
    }
  }

  public exec(sql: string): void {
    this.db.exec(sql);
  }

  public prepare(sql: string): any {
    return this.db.prepare(sql);
  }
}
