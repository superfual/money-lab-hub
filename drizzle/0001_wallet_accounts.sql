CREATE TABLE moneylab_wallet_accounts (id TEXT PRIMARY KEY NOT NULL, address TEXT, deleted INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE moneylab_wallet_challenges (nonce TEXT PRIMARY KEY NOT NULL, address TEXT NOT NULL, message TEXT NOT NULL, expires INTEGER NOT NULL, used TEXT);
--> statement-breakpoint
CREATE TABLE moneylab_wallet_sessions (token_hash TEXT PRIMARY KEY NOT NULL, account_id TEXT NOT NULL, expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE moneylab_solo (id TEXT PRIMARY KEY NOT NULL, state TEXT, revision INTEGER NOT NULL DEFAULT 0, operation_id TEXT, last_request TEXT);
