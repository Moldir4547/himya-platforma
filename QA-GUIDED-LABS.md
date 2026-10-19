# Guided virtual laboratories — grade 7

Route: `/mektep/7-synyp/zerthana` (within the existing authenticated school shell).
Entry points: School hub, grade 7 hub, every grade 7 lesson's Laboratory tab.

15 textbook-based scenarios contain 86 ordered steps. Each includes a goal, equipment/reagents, safety instructions, a qualitative animated diagram and a manually written observation per completed step. The clock counts active work; pause and reload do not add offline time. A green check marks completion of a simulated action, not correctness of the student's scientific account. No automatic answer fills the journal or awards correctness points.

Existing theory, school assessments, slides and teacher-uploaded materials remain available. The new journal is separate from existing automatically graded assessments.

## Persistence and access

Both supported stores implement `saveGuidedLab`. The local API and Supabase RPC validate bounded record fields, the published grade 7 parent, signed-in owner, completed reports and a compare-and-swap revision. Journal records are under `user_progress.school_learning._guided_labs`, so existing account progress loading and administrator analytics transport them. The School Results page renders observations and time; account ownership comes from the session, never request input. User text is HTML-escaped.

Drafts save after editing, after actions, every five seconds while working, and through the explicit Save button. The UI confirms persistence only after a successful response. A failed save retains the draft in the current tab. Conflicting edits in another tab are rejected rather than silently overwritten. Copy the draft before refreshing after a conflict. Browser close delivery is best effort; use the explicit Save button and verify the confirmation before closing.

Restart saves the preceding draft first and begins a new attempt; the preceding report is displayed and all saved attempts are retained in `guided_lab_attempts`. Admins preview the simulator without generating learner records and see saved learner journals through `/mektep/progress`. There is no new broad teacher access policy; administrator access follows the platform's existing `is_admin()` rule.

## Deployment requirement

Apply `supabase/migrations/202610190002_guided_lab_journals.sql` to the production project **before merging/deploying this branch**. It adds two RLS-protected tables and one authenticated RPC, preserving existing data. The migration is committed here but has not been applied to production in this change. Without it, the frontend displays a save error and must not claim success.

The scenes are qualitative SVG teaching models with accelerated action animations, not a physics engine or validated real laboratory measurements.

## Validation

- `node --test tests/guided-lab.mjs tests/school.mjs tests/platform.mjs tests/store.mjs`
- `python3 tests/guided_lab_validation.py`
- `python3 tests/guided_lab_integration.py` (real HTTP/local database; owner separation, admin results, stale revisions, draft/final records and attempt history)
- `node --test tests/guided-lab.browser.mjs tests/school.browser.mjs` with Playwright Chromium (1440, 390 and 320 px; order/tool guards, manual observations, failed save/retry, reload, timer pause, isolation and HTML escaping)
- `node tests/guided-lab.sql.mjs` with PGlite (isolated PostgreSQL: migration, all 15 journals, completion validation, stale writes, restart history, owner/admin RLS and anonymous denial).
- Existing integration/security tests, generated school-spec consistency and `node build.mjs`.

Automated checks do not establish production Supabase deployment. Browser tests use a stubbed store; local HTTP integration exercises the real local server. The migration and policy tests passed in isolated PostgreSQL; production credentials and deployment were not exercised.
