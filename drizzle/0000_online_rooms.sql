CREATE TABLE moneylab_profiles (id TEXT PRIMARY KEY NOT NULL, hub TEXT NOT NULL, room_code TEXT);
--> statement-breakpoint
CREATE TABLE moneylab_rooms (code TEXT PRIMARY KEY NOT NULL, revision INTEGER NOT NULL DEFAULT 0, operation_id TEXT NOT NULL, state TEXT NOT NULL, updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE moneylab_settlements (room_code TEXT NOT NULL, round INTEGER NOT NULL, contribution INTEGER NOT NULL, PRIMARY KEY (room_code, round));
