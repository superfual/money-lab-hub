# Public mainnet onboarding — prepared, not yet activated

The founder-only ledger cannot enable registration for another wallet: its `register` function requires the deployer and it is not upgradeable. The public pilot therefore has a **separate contract and configuration**. Preparing or publishing this code does not deploy a contract or open onchain registration.

## Owner activation

1. Open `/mainnet-play.html`, sign in with the original owner wallet on X Layer chain 196.
2. Select **Prepare deployment**. Inspect the zero-OKB value, contract source, current gas estimate and buffered budget. Nothing is sent at this step.
3. Confirm the deployment yourself in the wallet. This spends real OKB gas.
4. Wait for two confirmations. Activation checks the owner, exact public constructor bytecode/attestor and runtime hash, and pins the public ledger once. If the page was reloaded, enter the deployment transaction hash and select **Verify & activate**. Do not deploy again while a wallet request is unresolved.

## Friend onboarding after activation

Share `/mainnet-play.html`. Each player signs in with their own wallet, registers for 80 free nontransferable HUB once, then starts Easy. Registration, stage start, settlement and abandonment are zero-value onchain transactions that consume real OKB gas. No HUB sale, token approval, deposits, withdrawals or guaranteed financial return. Mainnet HUB does not unlock ordinary World 2/3 balances.

Gameplay is server-authoritative and server-attested, not trustless game execution. A finished server journal alone is not an onchain settlement. Use **Check onchain settlement** to compare the exact result hash and fields with the public contract.

## Isolation and verification

- Founder `/mainnet.html` and its ledger/history remain available. There is no automatic balance migration.
- Public configuration uses `moneylab_mainnet_public_config`; existing results remain keyed by account and contract.
- Both ledgers retain independent runtime-bytecode pins and EIP-712 contract domains.
- Public requests require the signed-in wallet; journals/evidence are scoped to that account and ledger. Erasing journals is scoped to the selected ledger and does not erase blockchain records.
- Each wallet can register once; multiple wallets are possible. Registered wallet counts must not be presented as unique people or proof of traction.
- Public ledger stays inactive until the owner deploys and verifies it. The old founder contract is never presented as publicly registrable.

Tests: `node --test tests/mainnet-*.test.mjs` covers independent player registration/settlement, replay and cross-player rejection, private journal isolation, exact activation/runtime pins, zero-value wallet transaction review and preservation of the founder pilot.
