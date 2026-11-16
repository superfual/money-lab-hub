# Chinese presentation locale

Money Lab supports VI, EN and Simplified Chinese (中文). Select the shared language control, or use `?lang=zh` for a direct Chinese entry link. The preference is retained across pages. Changing language reloads the current page; it does not reset the guest save, HUB, RNG state or running turn deadline. A countdown continues while switching languages.

The adapter renders the existing English UI through a reviewed, local Chinese catalog. The engine's language key remains `en` for backwards compatibility with bilingual card arrays and saved records; the presentation preference is stored separately as `moneyLabLocale=zh`. The document content language is `zh-CN`. Legacy two-language controls are hidden in favor of one consistent VI / EN / 中文 selector.

Scope: board, World 1 teaching cards, opportunities, events, finance, timers, rules, Replay, TapeOut, decision verifier, mainnet/testnet interfaces, multiplayer and initial World 2/3 screens. Contract identifiers, asset tickers, numbers, calldata and machine-readable evidence retain their original formats. Code, JSON textareas and user-written Coach messages are not translated. Uncatalogued technical errors may remain in English; no external translation or paid AI API is used.

The deterministic Coach supports Chinese topic matching and displays translated documentation. It cannot inspect live balances or transactions, and never signs or executes trades.

## Maintenance and validation

Edit `dist/locales/zh-CN.tsv`, then run `node scripts/build-zh-locale.mjs`. The standard build also regenerates `dist/locales/zh-CN.mjs`. Maintain full sentence translations before adding shorter fragments. Numeric templates preserve values supplied by the game.

`tests/chinese-locale.test.mjs` covers every World 1 question, option and explanation, opportunity, surprise and market story; financial-value preservation; RPC identifiers; Coach topic matching; and bootstrap inclusion. Full browser acceptance is still necessary for layout and dynamic interactions.

## Review checkpoint — 17 November 2026 (Vietnam)

206 automated tests passed. Preview browser checks observed Chinese landing, route choices, countdown and timeout, preserved month/balances after switching EN → 中文, Chinese Coach question/answer, a two-branch Replay example, mainnet notices and independent verification examples. No production wallet interaction or transaction was required. Mobile viewport/device acceptance remains separate from this desktop review.
