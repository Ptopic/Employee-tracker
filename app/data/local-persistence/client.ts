import SQLite from "react-native-sqlite-storage";
import { LOCAL_DB_NAME, LOCAL_DB_VERSION, LOCAL_MIGRATIONS } from "./schema";

SQLite.enablePromise(true);

let dbInstance: any | null = null;

async function openDatabase() {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await SQLite.openDatabase({
		name: LOCAL_DB_NAME,
		location: "default",
	});

	await dbInstance.executeSql("PRAGMA foreign_keys = ON;");
	return dbInstance;
}

async function ensureMetaTable(db: any) {
	await db.executeSql(`
		CREATE TABLE IF NOT EXISTS _local_schema_meta (
			id INTEGER PRIMARY KEY CHECK (id = 1),
			version INTEGER NOT NULL
		);
	`);
}

async function getCurrentSchemaVersion(db: any): Promise<number> {
	const [result] = await db.executeSql(
		"SELECT version FROM _local_schema_meta WHERE id = 1 LIMIT 1;",
	);

	if (!result?.rows?.length) {
		return 0;
	}

	return Number(result.rows.item(0).version ?? 0);
}

async function setSchemaVersion(db: any, version: number) {
	await db.executeSql(
		`INSERT INTO _local_schema_meta (id, version)
		 VALUES (1, ?)
		 ON CONFLICT(id) DO UPDATE SET version = excluded.version;`,
		[version],
	);
}

export async function initializeLocalPersistenceSchema() {
	const db = await openDatabase();
	await ensureMetaTable(db);

	const currentVersion = await getCurrentSchemaVersion(db);
	const pendingMigrations = LOCAL_MIGRATIONS.filter(
		(migration) => migration.version > currentVersion,
	).sort((a, b) => a.version - b.version);

	for (const migration of pendingMigrations) {
		for (const statement of migration.statements) {
			await db.executeSql(statement);
		}
		await setSchemaVersion(db, migration.version);
	}

	if (currentVersion === 0 && pendingMigrations.length === 0) {
		await setSchemaVersion(db, LOCAL_DB_VERSION);
	}

	return db;
}

export async function getLocalDatabase() {
	const db = await openDatabase();
	await ensureMetaTable(db);
	return db;
}
