export const LOCAL_DB_NAME = "saveit.local.db";
export const LOCAL_DB_VERSION = 1;

export interface LocalMigration {
	version: number;
	statements: string[];
}

export const LOCAL_MIGRATIONS: LocalMigration[] = [
	{
		version: 1,
		statements: [
			`CREATE TABLE IF NOT EXISTS managers (
				id TEXT PRIMARY KEY NOT NULL,
				google_auth_id TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL UNIQUE,
				full_name TEXT NOT NULL,
				company_name TEXT,
				preferences_json TEXT,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL
			);`,
			`CREATE TABLE IF NOT EXISTS employees (
				id TEXT PRIMARY KEY NOT NULL,
				manager_id TEXT NOT NULL,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				age INTEGER NOT NULL CHECK (age >= 14),
				hourly_rate REAL NOT NULL CHECK (hourly_rate >= 0),
				status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				FOREIGN KEY (manager_id) REFERENCES managers(id) ON DELETE CASCADE
			);`,
			`CREATE TABLE IF NOT EXISTS shifts (
				id TEXT PRIMARY KEY NOT NULL,
				manager_id TEXT NOT NULL,
				date TEXT NOT NULL,
				start_time TEXT NOT NULL,
				end_time TEXT NOT NULL,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				FOREIGN KEY (manager_id) REFERENCES managers(id) ON DELETE CASCADE
			);`,
			`CREATE TABLE IF NOT EXISTS shift_assignments (
				id TEXT PRIMARY KEY NOT NULL,
				shift_id TEXT NOT NULL,
				employee_id TEXT NOT NULL,
				calculated_hours REAL NOT NULL CHECK (calculated_hours >= 0),
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL,
				FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
				FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
				UNIQUE (shift_id, employee_id)
			);`,
			`CREATE TABLE IF NOT EXISTS local_sync_checkpoints (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				entity_type TEXT NOT NULL UNIQUE CHECK (entity_type IN ('manager', 'employee', 'shift', 'shift_assignment')),
				last_synced_at TEXT,
				updated_at TEXT NOT NULL
			);`,
			`CREATE TABLE IF NOT EXISTS local_outbox_events (
				id TEXT PRIMARY KEY NOT NULL,
				entity_type TEXT NOT NULL CHECK (entity_type IN ('manager', 'employee', 'shift', 'shift_assignment')),
				entity_id TEXT NOT NULL,
				action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
				payload_json TEXT NOT NULL,
				retry_count INTEGER NOT NULL DEFAULT 0,
				created_at TEXT NOT NULL,
				updated_at TEXT NOT NULL
			);`,
			"CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);",
			"CREATE INDEX IF NOT EXISTS idx_shifts_manager_id_date ON shifts(manager_id, date);",
			"CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift_id ON shift_assignments(shift_id);",
			"CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee_id ON shift_assignments(employee_id);",
			"CREATE INDEX IF NOT EXISTS idx_local_outbox_events_entity ON local_outbox_events(entity_type, entity_id);"
		],
	},
];
