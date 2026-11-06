CREATE TABLE moneylab_mainnet_public_config (
 id INTEGER PRIMARY KEY CHECK (id=1),
 address TEXT NOT NULL,
 deployment_tx TEXT NOT NULL,
 deployment_block INTEGER NOT NULL,
 attestor TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
