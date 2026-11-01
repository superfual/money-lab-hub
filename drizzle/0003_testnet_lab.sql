CREATE TABLE moneylab_testnet_config (
 id INTEGER PRIMARY KEY CHECK (id=1),
 address TEXT NOT NULL,
 deployment_tx TEXT NOT NULL,
 deployment_block INTEGER NOT NULL,
 attestor TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE moneylab_testnet_runs (
 id TEXT PRIMARY KEY,
 account_id TEXT NOT NULL,
 contract TEXT NOT NULL,
 state TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0,
 last_request TEXT,
 created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX moneylab_testnet_player ON moneylab_testnet_runs(account_id,created_at);
