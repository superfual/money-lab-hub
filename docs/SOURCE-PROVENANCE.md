# Source provenance

This repository starts from the working Money Lab prototype 23 deployed on 1 November 2026. The deployed Sites source commit is `102bbe97de1378de773897feba7836d88f952752`. This export contains the application, engine, migrations, tests and selected technical notes. Runtime databases, session material, hosting-account identity, generated bundles and browser screenshots are excluded. The hosting manifest keeps only logical database bindings; publishing a separate Site requires its own project identity.

The README is rewritten for current behavior, replacing accumulated historical release notes. The export adds the independently verified circuit creation transaction to the release manifest; that evidence-only change does not alter the deployed game.

Tests recorded for the source baseline: 99 passing checks. These are automated checks, not an independent security audit or user-adoption figures. Friend playtesting is beginning. Offline balance simulations in the documents are synthetic and must not be presented as real player analytics.

AI-assisted implementation supported the project. Existing TapeOut protocol components and npm dependencies remain third-party work. This snapshot does not transfer or expose player records. No open-source license for original project material has been selected yet.

Prototype 24 analytics update: deployed Sites source `2806e189ccca0d6faea2743082410fb3398546f0`, 1 November 2026. Adds aggregate analytics and owner-authorized chat reporting. 109 automated checks passed. No runtime player data is included.
