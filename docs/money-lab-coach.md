# Money Lab Coach v1

Product-only, bilingual document-based assistant. This release uses curated answers and local lexical retrieval, not a generative model. No API key, external inference, token usage, paid service, chat persistence or session-data access is introduced. It does not inherit the founder's ChatGPT conversations.

Knowledge lives in `dist/coach-knowledge.mjs`; every answer has a same-origin related-page link. Changes to product rules must update this file and its tests. Unknown/ambiguous questions fall back rather than invent facts. The related link is a product navigation aid, not an independent proof of a transaction. Mainnet claims must always be verified in the receipt workflow.

The floating panel is included on authored HTML pages, supports Vietnamese/English, keyboard close, clear-chat and topic chips. Conversation is limited to 24 DOM messages and discarded on reload. It makes no chat network requests. Secret-pattern detection hides likely credentials as a best-effort precaution; it is not a security guarantee. Never paste credentials.

## Future model integration (not enabled)

Add a server-side inference endpoint only after selecting a provider and a monthly budget. Retrieve only approved passages; cap input/output, calls per user and total spend; keep credentials server-side. Do not reuse or cache private player context across users. The model may explain authoritative calculations but may not modify game state, send transactions, claim live verification without a tool result, or replace circuit/contract rules.

Personalized coaching needs explicit opt-in and an allowlist of read-only session fields. No server session or wallet data is currently sent to Coach.
