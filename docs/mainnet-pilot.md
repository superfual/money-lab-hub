# World 1 Solo — X Layer mainnet founder pilot

> Current checkpoint (5 November 2026): the founder deployed and activated ledger `0x945b8E9Cc8401bB18580897dba4c2055b22D045d` and settled Easy, Medium and Hard. See [live evidence](mainnet-live-evidence.json) and the [README](../README.md). The preflight JSON remains a historical estimate, not proof of deployment.

This is a separate point ledger for chain **196**, with independent contract bytecode, EIP-712 domain (`Money Lab Mainnet Pilot`, version 1), database tables, server attestor secret and browser recovery keys. Existing ordinary HUB and testnet 1952 balances are not migrated or modified. Publishing the website is not blockchain deployment.

The pilot constructor accepts deployment only from project owner `0x1839231f7fc0d55a3ec58736574aca13f711326d`. Only that deployer may register and receive the single free 80-HUB grant. There are no ERC20 transfers, approvals, purchases, deposits or withdrawals. No real-money wager or redemption is implemented. HUB is a nontransferable educational point, not an asset sold to players.

## Owner sequence

1. Open `/mainnet.html` and sign in with the project owner's wallet. The login is a message, not a payment.
2. Click **Prepare deployment**. The page checks/adds X Layer mainnet 196, prepares the exact constructor bytes and estimates real OKB gas. It shows value **0 OKB**, estimated gas and a buffered gas budget. No transaction is sent in this preparation step.
3. Review the summary and explicitly open the wallet; the owner confirms in OKX Wallet. Review expires after two minutes. The client rejects nonzero value, other wallets, other contracts/calldata, invalid level calls and gas budgets above **0.005 OKB**. Wallet confirmation remains the final fee review.
4. Wait for two block confirmations, then activation verifies chain, exact owner creation input, zero value and compiled runtime hash. The mainnet contract address is pinned once. A known deployment hash can be restored after reload; do not redeploy while a previous request is unresolved.
5. Separately prepare and confirm **Register for 80 free HUB** and **Start Easy**. Every chain write has a separate fee review and wallet confirmation. Registration, start and settlement are separate chain transactions.
6. Play the 12-month game with the shared 60-second turn policy. Decisions and detailed journal remain server-managed. Results are server-attested, not trustless game execution.
7. At completion, prepare settlement, review its gas and confirm in the wallet. Only a successful chain settlement records the score/result hash and updates the point balance. A local finish alone is not confirmed onchain.
8. Use **Check onchain settlement** to compare the exact saved journal hash, player, score, survival and point reward with the activated mainnet contract at one confirmed block. Export JSON when desired. Public blockchain data cannot be erased; server journal deletion does not remove onchain outcomes.

The server signing key `MONEYLAB_MAINNET_ATTESTOR_KEY` is an unfunded, dedicated result-attestation key held only in runtime secret storage, not an owner's wallet key. Only its public address is exposed. It is separate from the testnet attestor. The contract cannot rotate it; changing this trust configuration requires a new deployment. Loss of the server/key can prevent settlement; the owner can still abandon an active run directly onchain and lose only locked simulated points.

No user-count or revenue claim follows from a founder test. Label this evidence as a founder-operated mainnet pilot. It does not place World 2/3 onchain or change their gate balances.

Validation covers EVM registration/settlement/unlocks, replay rejection, mainnet/testnet domain separation, owner-only deployment/registration, zero-value and exact-calldata transaction review, server identity/origin/revision guards, independently stored results and evidence hashes. A read-only mainnet preflight, when available, is recorded in `docs/mainnet-preflight.json`; it is not a transaction receipt.
