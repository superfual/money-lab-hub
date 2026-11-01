# Money Lab Testnet Lab

Status: implemented and locally tested; **not deployed to a blockchain until the owner's wallet transaction succeeds and activation verifies it**. Publishing the web page is not contract deployment. Existing Money Lab accounts, HUB, rooms and mainnet TapeOut circuit are separate and unchanged.

## Owner deployment

1. Open `/testnet.html` on the existing Money Lab Site. Sign in with the project owner's wallet `0x1839231f7fc0d55a3ec58736574aca13f711326d` using the existing message-only account flow.
2. Obtain free testnet OKB from the [official X Layer faucet](https://web3.okx.com/vi/xlayer/faucet). Faucet eligibility can change. Never send real OKB to testnet or buy funds merely to pass a faucet requirement.
3. Click **Prepare deployment**. The wallet must be on X Layer Testnet, chain ID **1952** (`0x7a0`), RPC `https://testrpc.xlayer.tech/terigon`. The UI switches/adds only this chain and estimates gas before presenting a second confirmation control.
4. Review value **0 OKB**, gas payable in **testnet OKB**, and testnet network. Click **Open wallet to confirm**, then confirm in your own wallet. Never provide recovery words or private keys to this app or chat.
5. Wait for two confirmations. The page verifies the creation transaction's owner, exact compiled constructor input, chain, zero value and deployed runtime hash. Only then is the contract address pinned in `moneylab_testnet_config`. If the page reloads or times out, the deployment hash is retained locally; paste it in the recovery field and click **Verify & activate**. Do not deploy again just because the first transaction is pending.
6. A second, separately reviewed transaction registers the player's wallet for 80 tHUB. Start Easy in another transaction, play the twelve-month server-authoritative game, then explicitly submit settlement. Refresh/resume after pending confirmations. A failed or cancelled transaction is never shown as confirmed.

There is no automatic mainnet deployment, live token, purchase, approval, transfer, withdrawal, economic conversion or migration of existing HUB. No existing balance is confiscated. Wallet switching affects the user's wallet network; the original TapeOut integration reads its mainnet RPC independently.

## Design and trust

- `contracts/MoneyLabTestnet.sol`: non-upgradeable testnet-only point ledger, not ERC20. Constructor rejects all chain IDs except 1952. No mutable admin or signer rotation. Redeployment/new experiment is required if the signer changes or a flaw is found.
- One welcome grant of 80 **tHUB per wallet**, not per person. New wallets can claim again; no Sybil resistance is claimed.
- Easy/Medium/Hard targets: 60/70/75. Bonds: 0/40/80. Rewards: base 12/28/60 plus 2/3/4 per complete five score points over target. A win requires survival and the target. On success refund the bond plus reward; loss/abandonment forfeits bond. Easy stays available at zero balance. These match the current Solo formula, with a separate test balance.
- The contract owns registration, level unlocks, available balances, active run identity/bond and settled outcomes. The server still owns random moves, decisions and the detailed game state. Losing this server can prevent settlement; the player can abandon onchain without server permission, losing any bond. No stronger availability promise is made.
- Finished results are signed using EIP-712, domain `Money Lab Testnet`, version `1`, chain 1952 and the exact contract. The signature binds player, run ID, level, score, survival flag, final-state hash and one-hour deadline. The contract independently calculates reward and rejects replays, altered values, wrong signers, wrong players and stale/abandoned runs.
- `/api/testnet/receipt` never accepts a client score as authority. It signs only the authenticated player's finished server save for their confirmed active run. Game writes are revision-checked and idempotent. Circuit failures do not commit decisions. Detail replay does not let the browser choose balances or receive two rewards. Knowledge answers can still be looked up; this is not a competitive anti-cheat system or proof of learning.
- The attestor is a **dedicated unfunded server signing key**, stored only in the Sites runtime secret `MONEYLAB_TESTNET_ATTESTOR_KEY`. It is not the owner's wallet key. Public config exposes only its address. Do not print or export runtime secrets, copy them into GitHub or send them to browsers. Secret rotation requires a new contract and an explicitly planned new experiment; never silently overwrite an existing attestor.
- Activation is restricted to the authenticated project owner and exact compiled bytecode. A contract address supplied by a visitor is not trusted. The first activated address is pinned; replacing it requires a deliberate future source/config migration.
- Deployment and gameplay transactions are sent from the player's own wallet, after the page shows a review and the wallet confirms. Every request sends zero native token value; gas remains necessary. No key is requested from players.

## Privacy

Onchain addresses, transactions, point balances, run identities, difficulty, score, win status, reward and result hash are public and cannot be erased. Do not promise deletion or anonymity. Detailed decisions remain in the server DB, not onchain. The page offers **Erase server testnet journals** only with no active onchain run; this has no effect on onchain history, grants, levels or balance. Normal account deletion also removes associated testnet journals, but cannot erase chain data; any active chain run may still need to be abandoned directly. Existing normal-game history clearing is separate from testnet journal erasure.

No Duel/Group contract settlements, relayer, gas sponsorship, full onchain randomness, public-value HUB token or mainnet economics are implemented. The primary campaign integration remains TapeOut circuit #48 on X Layer **mainnet 196**, independently of this **testnet 1952** experiment. Testnet activity is not counted as validated mainnet users or revenue.

## Build / verification

`npm ci`, `npm run contracts:build`, `npm run build`, `npm test`.

Compiler pinned to Solidity 0.8.30, optimizer 200 runs, viaIR, EVM Paris. Public source, ABI, creation bytecode and deployed runtime hash are under `dist/content/`. Rebuilding unchanged source must reproduce the artifact. Contract checks run in a local Ganache EVM configured with chain ID 1952; that is **not** evidence of a public testnet deployment or an independent audit. API checks use isolated SQLite and signed wallet sessions. Production verification before activation checks configuration/unactivated status only; user wallet deployment remains required.

Official network reference: https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information
