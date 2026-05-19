# Pi Cyber Harness Tasks

## Review Workload Forecast

| Field                   | Value                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estimated changed lines | 900-1,500 across the full implementation; 120-250 for the first implementation slice                                                                                             |
| 400-line budget risk    | High                                                                                                                                                                             |
| Chained PRs recommended | Yes                                                                                                                                                                              |
| Suggested split         | PR 1 docs/tasks gate → PR 2 catalog + policy evaluator → PR 3 audit/evidence → PR 4 CTI/OSINT persistence adapters → PR 5 Telegram notification payloads → PR 6 capability stubs |
| Delivery strategy       | auto-chain                                                                                                                                                                       |
| Chain strategy          | stacked-to-main                                                                                                                                                                  |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Operating constraints

- Change id: `pi-cyber-harness`.
- Current docs/spec branch: `docs/pi-cyber-harness-spec`.
- Future implementation branches must use repository branch policy, for example `feat/pi-cyber-harness-policy`, `feat/pi-cyber-harness-audit`, `feat/pi-cyber-harness-cti-persistence`.
- Keep source code unchanged until proposal, spec, design, and this task plan are reviewed.
- Preserve unrelated worktree changes. Stage only files changed by the active phase.
- Pull Requests must link an approved issue and include exactly one `type:*` label when repository automation requires it.
- Strict TDD applies to every code-changing slice: RED → GREEN → TRIANGULATE → REFACTOR, with command output recorded.
- Do not use real provider APIs, paid tokens, real API keys, or external targets. For `packages/coding-agent/test/suite/`, use the local harness and faux provider only.
- Browser anti-bot/fingerprint evasion remains blocked by default and may appear only as policy/test data, not as an operational feature.

## Docs-only phase verification

Use these checks for proposal/spec/design/tasks phases:

```bash
test -f openspec/config.yaml
test -f openspec/changes/pi-cyber-harness/proposal.md
test -f openspec/changes/pi-cyber-harness/specs/cyber-harness/spec.md
test -f openspec/changes/pi-cyber-harness/design.md
test -f openspec/changes/pi-cyber-harness/tasks.md
git diff --name-only -- packages packages/ai packages/agent packages/coding-agent packages/tui packages/web-ui
```

Expected result:

- All `test -f` commands exit `0` after their phase artifacts exist.
- The source package diff command prints nothing for docs-only phases.
- Code tests are skipped for docs-only phases with this rationale: no source, test, package, or generated files were intentionally modified.

Current E2E status: no official E2E script is detected. The first code slice must create a deterministic local gate before implementation merge workflow can claim E2E readiness.

## Phase 0: finish SDD planning artifacts

### Task 0.1: Ensure design artifact exists

**Files:**

- Verify/Create: `openspec/changes/pi-cyber-harness/design.md`

**Steps:**

1. Confirm the design phase content has been written to `openspec/changes/pi-cyber-harness/design.md`.
2. If missing, write only the approved design content from the design phase.
3. Run docs-only verification for `design.md` existence and source package diff.
4. Record the command output in the phase handoff or future `verify.md`.

**Rollback:** remove only `openspec/changes/pi-cyber-harness/design.md` if it was created incorrectly.

### Task 0.2: Review and commit task plan docs-only phase

**Files:**

- Modify: `openspec/changes/pi-cyber-harness/tasks.md`

**Steps:**

1. Review `tasks.md` against `proposal.md`, `spec.md`, and `design.md`.
2. Run the docs-only verification command set above.
3. Do not run `npm run check`, `npm test`, or `npm run build` for this docs-only phase unless formatting/tooling files were changed.
4. If verification fails, document the failure and fix the artifact path/content before committing.
5. Commit only OpenSpec files changed in this phase, for example:
   - `openspec/config.yaml` if created by SDD init,
   - `openspec/changes/pi-cyber-harness/proposal.md`,
   - `openspec/changes/pi-cyber-harness/specs/cyber-harness/spec.md`,
   - `openspec/changes/pi-cyber-harness/design.md`,
   - `openspec/changes/pi-cyber-harness/tasks.md`.
6. Prepare a docs Pull Request from `docs/pi-cyber-harness-spec` with one `type:docs` label and linked approved issue if repository policy requires it.

**Rollback:** revert only the OpenSpec artifact files from this phase.

## Phase 1: first implementation slice, catalog and deny-by-default policy

**Branch:** `feat/pi-cyber-harness-policy`

**Goal:** introduce the minimum safe runtime core for a cyber capability catalog and policy evaluator. This slice must not execute cyber tools. It only models capabilities and policy decisions.

**Review target:** 120-250 changed lines.

### Task 1.1: RED, add policy regression tests

**Files:**

- Create: `packages/coding-agent/test/suite/regressions/pi-cyber-harness-policy.test.ts`
- Discovery target: `packages/coding-agent/test/suite/harness.ts`

**Test cases:**

- Unknown cyber capability is denied as `unregistered capability`.
- Capability with missing policy metadata resolves to `blocked-pending-policy`.
- Browser fingerprint/anti-bot evasion action is blocked without explicit authorized testing policy.
- Authorized Red-Team active action without scope is blocked.
- Read-only local docs/research action for a complete capability is allowed and marked auditable.

**Steps:**

1. Read `packages/coding-agent/test/suite/harness.ts` and nearby regression tests to match existing patterns.
2. Write the failing regression tests first.
3. Run from `packages/coding-agent`:

```bash
npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-policy.test.ts
```

4. Expected RED: tests fail because cyber harness modules do not exist.

### Task 1.2: GREEN, add catalog and policy evaluator

**Files:**

- Create: `packages/coding-agent/src/core/cyber-harness/types.ts`
- Create: `packages/coding-agent/src/core/cyber-harness/catalog.ts`
- Create: `packages/coding-agent/src/core/cyber-harness/policy.ts`

**Steps:**

1. Implement `CyberCapability`, `CyberActionRequest`, and `CyberPolicyDecision` types without `any`.
2. Implement a static initial catalog with safe stubs for categories: SOC, Blue-Team, authorized Red-Team, CTI/OSINT, browser ops, guardrail, audit, verification.
3. Implement `evaluateCyberAction()` as deny-by-default:
   - unregistered capability → deny,
   - incomplete policy metadata → blocked,
   - browser evasion/fingerprint/CAPTCHA/stealth → deny,
   - active Red-Team without valid scope → deny,
   - complete read-only local docs/research → allow and audit.
4. Keep all externally targeted, state-changing, browser-sensitive, and Red-Team active actions blocked or approval-required.
5. Re-run the targeted regression command until GREEN.

### Task 1.3: TRIANGULATE, add one extra safe and one extra unsafe case

**Files:**

- Modify: `packages/coding-agent/test/suite/regressions/pi-cyber-harness-policy.test.ts`
- Modify as needed: `packages/coding-agent/src/core/cyber-harness/policy.ts`

**Steps:**

1. Add a test for CTI/OSINT read-only public resource classification requiring source metadata.
2. Add a test that state-changing SOC action requires explicit approval and is not auto-executed.
3. Run the targeted regression command and fix only policy logic required by the tests.

### Task 1.4: REFACTOR and verification gate

**Files:**

- Modify as needed: `packages/coding-agent/src/core/cyber-harness/*.ts`
- Modify as needed: `packages/coding-agent/test/suite/regressions/pi-cyber-harness-policy.test.ts`

**Steps:**

1. Refactor for clarity, named decision reasons, and stable enum/string literal unions.
2. Run targeted regression command from `packages/coding-agent`.
3. Run root check after code changes from repo root:

```bash
npm run check
```

4. Record command, exit status, and relevant output.
5. Treat this targeted regression as the initial local E2E-equivalent gate for Slice 1 until a broader `test:e2e:cyber-harness` script exists.
6. If either command fails, create/update an issue with the failing command/output and fix before PR.

**Rollback:** remove `packages/coding-agent/src/core/cyber-harness/` and `packages/coding-agent/test/suite/regressions/pi-cyber-harness-policy.test.ts`.

## Phase 2: audit and evidence schema

**Branch:** `feat/pi-cyber-harness-audit`

**Goal:** add structured audit event and evidence reference helpers for cyber workflows. No external execution.

**Files:**

- Create: `packages/coding-agent/src/core/cyber-harness/audit.ts`
- Create: `packages/coding-agent/src/core/cyber-harness/evidence.ts`
- Create: `packages/coding-agent/test/suite/regressions/pi-cyber-harness-audit.test.ts`

**TDD steps:**

1. RED: test audit events for workflow start, policy decision, blocked action, approval decision, tool execution summary, evidence capture, verification result, phase notification, and workflow completion.
2. GREEN: implement append-only in-memory/event-builder helpers with redaction-friendly fields.
3. TRIANGULATE: add tests that blocked actions and denied approvals are auditable evidence.
4. REFACTOR: extract stable event type unions and evidence kind unions.
5. Verify targeted regression and `npm run check`.

**Rollback:** remove audit/evidence files and tests from this slice only.

## Phase 3: CTI/OSINT preservation adapters

**Branch:** `feat/pi-cyber-harness-cti-persistence`

**Goal:** add optional adapter boundaries for preserving trusted cyber resources in Engram and Obsidian without claiming persistence when tools are unavailable.

**Files:**

- Create: `packages/coding-agent/src/core/cyber-harness/persistence.ts`
- Create: `packages/coding-agent/test/suite/regressions/pi-cyber-harness-persistence.test.ts`
- Update only if needed: `packages/coding-agent/src/core/cyber-harness/types.ts`

**TDD steps:**

1. RED: mock available/unavailable Engram and Obsidian adapters.
2. GREEN: implement persistence result objects with explicit `saved`, `skipped`, or `unavailable` statuses.
3. TRIANGULATE: test trusted, unverified, and dual-use resource classification payloads.
4. REFACTOR: normalize note fields: what, why, where, classification, trust, dual-use cautions, suggested use.
5. Verify targeted regression and `npm run check`.

**Rollback:** remove persistence files and tests from this slice only.

## Phase 4: Telegram phase notification payloads

**Branch:** `feat/pi-cyber-harness-phase-notifications`

**Goal:** create transport-agnostic Telegram phase notification payloads. Do not send real Telegram messages in tests.

**Files:**

- Create: `packages/coding-agent/src/core/cyber-harness/notifications.ts`
- Create: `packages/coding-agent/test/suite/regressions/pi-cyber-harness-notifications.test.ts`

**TDD steps:**

1. RED: test payload requires completed phase, artifact paths, verification evidence or explicit not-applicable reason, risks/blockers, and next phase.
2. GREEN: implement payload builder.
3. TRIANGULATE: test it refuses completion wording when artifact or verification evidence is missing.
4. REFACTOR: keep output concise for Telegram/mobile width.
5. Verify targeted regression and `npm run check`.

**Rollback:** remove notification files and tests from this slice only.

## Phase 5: capability stubs and integration boundary

**Branch:** `feat/pi-cyber-harness-capability-stubs`

**Goal:** register safe, disabled-by-default cyber capability stubs and expose a local API for future orchestrator integration.

**Files:**

- Modify: `packages/coding-agent/src/core/cyber-harness/catalog.ts`
- Create or modify: `packages/coding-agent/src/core/cyber-harness/index.ts`
- Create: `packages/coding-agent/test/suite/regressions/pi-cyber-harness-catalog.test.ts`

**TDD steps:**

1. RED: test catalog contains SOC, Blue-Team, authorized Red-Team, CTI/OSINT, browser ops, guardrail, audit, and verification stubs.
2. GREEN: add stubs with complete policy-critical metadata and disabled/blocked defaults where appropriate.
3. TRIANGULATE: test that missing required fields fail validation and block execution.
4. REFACTOR: centralize category/status validation.
5. Verify targeted regression and `npm run check`.

**Rollback:** revert catalog/index changes and remove catalog test from this slice only.

## Phase 6: define official E2E command

**Branch:** `test/pi-cyber-harness-e2e-gate`

**Goal:** promote the deterministic cyber harness regression suite into an official, documented local E2E gate.

**Files:**

- Modify: `packages/coding-agent/package.json` if adding a package script.
- Modify: root `package.json` only if a root alias is approved.
- Modify: `openspec/config.yaml` to record the official gate after it exists.
- Create or modify: `openspec/changes/pi-cyber-harness/verify.md`.

**TDD/verification steps:**

1. Decide whether the official command is package-local or root-level. Prefer package-local first.
2. Add script only after tests exist and pass directly.
3. Run the direct command and the script alias to confirm equivalence.
4. Run `npm run check` after `package.json` changes.
5. Record command output in `verify.md`.

**Rollback:** remove only the added script/verification artifact updates.

## Phase 7: archive and final merge readiness

**Branch:** `docs/pi-cyber-harness-archive`

**Files:**

- Create: `openspec/changes/pi-cyber-harness/archive.md`
- Update: `openspec/changes/pi-cyber-harness/verify.md`

**Steps:**

1. Summarize implemented slices, decisions, verification evidence, unresolved risks, and follow-up work.
2. Confirm all required PRs are merged or explicitly deferred.
3. Confirm no source changes remain unverified.
4. Send Telegram phase notice with completed archive, artifacts, verification, risks, and next project phase.

## PR and issue gates for every code slice

1. Start from updated `main`; create the slice branch named above.
2. Confirm an approved issue exists or create/request one before PR.
3. Use strict TDD and record RED/GREEN/TRIANGULATE/REFACTOR evidence.
4. Run targeted regression(s) from the affected package root.
5. Run `npm run check` from repo root after code changes.
6. If a gate fails:
   - create/update an issue with command, exit status, and relevant output,
   - fix in the same slice branch,
   - rerun gates before PR.
7. Before commit, run `git status --short` and stage only current-slice files.
8. Commit with a conventional message, for example `feat(coding-agent): add cyber harness policy gate`.
9. Open Pull Request with linked approved issue and exactly one `type:*` label.
10. Push and merge to `main` only after required checks pass and merge is authorized.

## Telegram phase notice template

```text
Fase terminada: <phase>
Artefactos: <paths>
Verificación: <commands/results or docs-only rationale>
Riesgos: <none/blockers>
Sigue: <next phase>
```

Do not send completion wording until artifacts are written and fresh verification is recorded.

## Dependencies and ordering

- Phase 0 must finish before any source implementation.
- Phase 1 must finish before audit/evidence, persistence, notifications, or capability integration.
- Phase 2 should finish before any tool mediation is implemented.
- Phase 3 depends on Phase 2 for evidence references.
- Phase 4 can run after Phase 2 and should remain transport-agnostic.
- Phase 5 depends on Phase 1 and should use Phase 2 audit primitives if available.
- Phase 6 depends on at least Phase 1 tests existing.
- Phase 7 runs after merged or explicitly deferred implementation slices.
