# Chemical bonding interactive practice

Target lesson: /sabaktastyk-kopiri/himiyalyk-bailanys

## Behavior
- Adds eight tasks: three school, three transitional, two university.
- Selecting an answer immediately explains both the scientific concept and the chosen misconception.
- Each question accepts one choice per attempt. Correct answers score one point (maximum eight).
- Retry clears the active answers; it preserves the saved best result.
- Save is enabled only for a completed attempt by a verified learner.
- Scores are calculated again by the backend. Retrying an uncertain save uses the same attempt UUID.
- Latest score, best score and attempt count are stored in the existing lesson's user_progress.bond_practice.
- Existing teacher quiz scores/answers, lesson progress/completion, uploaded resources and theory are preserved.
- Existing built-in theory, SVG diagrams, review questions and navigation are unchanged.
- The practice block is appended even when a teacher supplies a custom lesson body.

## Deployment
1. Apply supabase/migrations/202610160001_bond_practice.sql before deploying the frontend on Supabase.
   This adds a JSONB field and the authenticated submit_bond_practice RPC; it does not rewrite content.
2. Local Python deployments add the SQLite field automatically on startup.
3. Run node build.mjs and deploy the generated public assets through the existing Pages workflow.
4. Verify a learner can save and reload a result on the bonding lesson.

The live Supabase migration has not been applied or executed in this task.
GitHub writes were denied by the session's tool approval policy; no remote branch or PR was created.

## Validation
- node --test tests/platform.mjs tests/redox.mjs tests/bond-practice.mjs (40 passed)
- python3 tests/integration.py (2 passed, including the new real SQLite/API workflow)
- python3 tests/security.py (2 passed)
- npm install --no-save --package-lock=false playwright@1.56.1
- npx playwright install --with-deps chromium
- node --test tests/bond-practice.browser.mjs (passed at 1440, 390 and 320 px)
- node build.mjs (21 public assets)
- node --check app.js and node --check bond-practice.js

Browser tests render the original lesson theory and the real practice module with a simulated save adapter.
API integration tests cover the real local backend, separate teacher scores, server grading, best score,
duplicate saves, malformed answers, admin rejection and hidden lesson rejection.
The Supabase adapter and SQL/client answer-key parity have automated unit coverage;
the SQL migration still requires validation in a Supabase staging database.
Browser captures were visually inspected at desktop and mobile widths.

## Manual review
- Visit the bonding lesson as a learner, select a wrong answer and read its explanation.
- Follow its theory link and confirm the route does not change.
- Complete all eight tasks, save, reload and confirm the saved score and best score.
- Retry with a lower score; confirm the best score remains.
- Confirm teacher material, uploaded files, teacher quiz and its saved score are still present.
- Confirm a second learner does not see another learner's saved results.

