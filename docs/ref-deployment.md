# REF mainnet deployment

> Current checkpoint (5 November 2026): REF #49 / Tape ID 49.2.167 is deployed and activated on chain 196. All eight native truth-table cases are captured in [live evidence](mainnet-live-evidence.json). The owner-signature workflow below documents the deployment process; earlier future-tense text is historical.

`/ref-deploy.html` is the project-owner deployment page. It does not access private keys or send automatically. Only the visitor's explicit **Open OKX Wallet to create circuit** button requests `eth_sendTransaction`; the wallet asks the owner to review and sign.

1. Prepare: select wallet `0x1839231f7fc0d55a3ec58736574aca13f711326d`, switch to chain 196, simulate the exact revision-2 `tapeout(netlist,3,1)` call, read current fee/gas/balance and display an estimate with 25% gas-limit buffer. Reviews expire in two minutes; a 0.002 OKB total estimate ceiling fails closed. The wallet displays its final fee, potentially including additional fee components.
2. Send: re-check wallet, chain, exact calldata/value and live tape-out fee. A pending marker is saved before requesting the wallet. Late/unknown requests never unlock automatic resending; check wallet History first. The hash is saved as soon as it arrives. No approvals, transistor purchase, container opening or HUB deployment is included.
3. Verify/activate: after two confirmations, submit the hash to `/api/ref/activate`. The endpoint accepts only a successful transaction from the fixed owner to the fixed processor with exact calldata and historical fee. It extracts the new NFT ID from the mint log rather than relying on a simulated next ID. It checks the actual circuit owner/netlist/shape and all eight truth-table inputs before pinning a single immutable configuration.

Anyone can relay a transaction hash, but cannot authorize a different sender, design or contract. Activation is authorized by the verified onchain owner transaction, not by trusting caller-supplied ID/score or an arbitrary admin session. The saved configuration is public at `/api/ref/config`, idempotent for the same hash, and rejects replacing it with another transaction.

After activation, explicit Risk Lab and Replay checks read the native REF truth table at the same block as the #48 reference proof. Combination results are taken from native REF `eval` receipts. The existing binding STOP gate remains #48. Money Lab still calculates R/C/D financial comparison bits; no whole-game decentralization or attestation of financial inputs is claimed. A configured REF read failure never silently substitutes a locally verified result.

The server applies schema-only migration `0004_ref_circuit.sql`. Tests cover exact wallet payload/fee limits/expiry, no remote sending in read paths, all eight native outputs, wrong metadata/owner/netlist, successful and failed transaction verification, exact mint extraction, cross-origin rejection and immutable/idempotent activation.

At publication this page is ready for the owner signature; **publication alone does not create a mainnet circuit**. Successful activation and raw proof, not an estimate or virtual circuit ID, determine live deployment status.
