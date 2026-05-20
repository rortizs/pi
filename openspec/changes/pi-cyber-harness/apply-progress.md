# Pi Cyber Harness Apply Progress

## Phase 1: catalog and deny-by-default policy

Status: implementation complete after fresh review fixes; verification gates pass after the separate web-ui example baseline fix was merged.

### PR boundary

- Branch: `feat/pi-cyber-harness-policy`
- Slice: Phase 1 only, catalog + policy evaluator
- Approved issue: https://github.com/rortizs/pi/issues/7
- Future PR body must include: `Closes #7`
- Future PR label: exactly one `type:*` label, expected `type:feature`

### Completed tasks

- Task 1.1 RED: added policy regression tests first.
- Task 1.2 GREEN: added minimal cyber harness types, static catalog, and deny-by-default policy evaluator.
- Task 1.3 TRIANGULATE: added CTI/OSINT source metadata cases and state-changing SOC approval case.
- Task 1.4 REFACTOR: kept decision reasons, categories, statuses, risks, and action classifications as stable literal unions.
- Fresh review fixes: changed unknown capability reason to exact `unregistered capability`, blocked disabled capabilities before action evaluation, and made incomplete policy metadata checks safe for partially populated capabilities.

### Files changed

- `packages/coding-agent/test/suite/regressions/pi-cyber-harness-policy.test.ts`
- `packages/coding-agent/src/core/cyber-harness/types.ts`
- `packages/coding-agent/src/core/cyber-harness/catalog.ts`
- `packages/coding-agent/src/core/cyber-harness/policy.ts`
- `openspec/changes/pi-cyber-harness/apply-progress.md`

### TDD Cycle Evidence

| Cycle | Phase             | Command                                                                                                                                  | Exit | Evidence                                                                                                                                                                                                                                                        |
| ----- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | RED               | `cd packages/coding-agent && npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-policy.test.ts` | 1    | Failed before implementation: missing `../../../src/core/cyber-harness/catalog.js`; 1 failed suite, no tests collected.                                                                                                                                         |
| 1     | GREEN             | same targeted command                                                                                                                    | 0    | 6 tests passed after adding types, catalog, and policy evaluator.                                                                                                                                                                                               |
| 2     | TRIANGULATE RED   | same targeted command                                                                                                                    | 1    | 2 CTI/OSINT tests failed: expected `blocked`/`allow`, received `approval-required`.                                                                                                                                                                             |
| 2     | TRIANGULATE GREEN | same targeted command                                                                                                                    | 0    | 9 tests passed after requiring CTI source metadata and allowing sourced public CTI read-only classification.                                                                                                                                                    |
| 3     | REFACTOR VERIFY   | same targeted command                                                                                                                    | 0    | 9 tests passed after final verification.                                                                                                                                                                                                                        |
| 3     | ROOT CHECK        | `npm run check`                                                                                                                          | 2    | Biome and package TypeScript reached `packages/web-ui/example`; failed because `@earendil-works/pi-web-ui` could not be resolved and related callback parameters were implicit `any`. No cyber harness errors were reported before that unrelated gate failure. |
| 4     | REVIEW RED        | `cd packages/coding-agent && npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-policy.test.ts` | 1    | 3 focused failures after reviewer-requested tests: exact `unregistered capability` reason mismatch, incomplete metadata threw on missing arrays, and disabled capability was incorrectly allowed.                                                               |
| 4     | REVIEW GREEN      | same targeted command                                                                                                                    | 0    | 10 tests passed after fixing exact reason string, safe partial metadata checks, and disabled capability blocking.                                                                                                                                               |
| 4     | ROOT CHECK        | `npm run check`                                                                                                                          | 2    | Same unrelated `packages/web-ui/example` module-resolution failure; no cyber harness diagnostics before that gate.                                                                                                                                              |
| 5     | REBASE VERIFY     | `cd packages/coding-agent && npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-policy.test.ts` | 0    | 10 tests passed after rebasing onto `fork/main` with web-ui example baseline fix PR #9 merged.                                                                                                                                                                  |
| 5     | ROOT CHECK        | `npm run check`                                                                                                                          | 0    | Root check passed: Biome reported no fixes, `tsgo --noEmit` passed, browser smoke passed, and `packages/web-ui` plus example checks passed.                                                                                                                     |

### Verification output summary

Targeted regression final run:

```text
Test Files  1 passed (1)
Tests  10 passed (10)
```

Root check failure summary:

```text
src/custom-messages.ts(2,52): error TS2307: Cannot find module '@earendil-works/pi-web-ui' or its corresponding type declarations.
src/custom-messages.ts(3,62): error TS2307: Cannot find module '@earendil-works/pi-web-ui' or its corresponding type declarations.
src/main.ts(21,8): error TS2307: Cannot find module '@earendil-works/pi-web-ui' or its corresponding type declarations.
npm error path /Users/richardortiz/workspace/pi/packages/web-ui
```

### Deviations from design

- None for Phase 1 scope. The slice only models capabilities and policy decisions; it does not execute cyber tools.
- The official E2E gate remains future Phase 6 work; this targeted regression is the local E2E-equivalent gate for Slice 1.

### Remaining tasks

- Commit, push, and open a PR after final status review; do not include unrelated local runtime artifacts.
- Continue with Phase 2 only after Phase 1 PR boundary is accepted/merged.

### Workload

- Forecast target: 120-250 changed lines.
- Actual Phase 1 implementation plus progress artifact is above target but still limited to one focused PR boundary.

### Prerequisite baseline fix

- Separate PR https://github.com/rortizs/pi/pull/9 fixed `packages/web-ui/example/tsconfig.json` to resolve `@earendil-works/pi-web-ui` from source.
- PR #9 merged with commit `c34d468793dade00f89f41a9c2f9de6af80a0e1f`, closing issue #8.

## Phase 2: audit and evidence schema

Status: implementation complete; verification gates pass.

### PR boundary

- Branch: `feat/pi-cyber-harness-audit`
- Slice: Phase 2 only, audit event and evidence reference helpers
- Approved issue: https://github.com/rortizs/pi/issues/11
- Future PR body must include: `Closes #11`
- Future PR label: exactly one `type:*` label, expected `type:feature`

### Completed tasks

- RED: added audit/evidence regression tests before implementation.
- GREEN: added append-only audit event/trail builders and redaction-friendly evidence reference helpers.
- TRIANGULATE: added blocked-action and denied-approval evidence tests.
- REFACTOR: kept audit event types, evidence kinds, decision/status, and verification fields as stable literal unions.

### Files changed

- `packages/coding-agent/test/suite/regressions/pi-cyber-harness-audit.test.ts`
- `packages/coding-agent/src/core/cyber-harness/audit.ts`
- `packages/coding-agent/src/core/cyber-harness/evidence.ts`
- `openspec/changes/pi-cyber-harness/apply-progress.md`

### TDD Cycle Evidence

| Cycle | Phase             | Command                                                                                                                                 | Exit | Evidence                                                                                                                                                             |
| ----- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | RED               | `cd packages/coding-agent && npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-audit.test.ts` | 1    | Failed before implementation: missing `../../../src/core/cyber-harness/audit.js`; 1 failed suite, no tests collected.                                                |
| 1     | GREEN             | same targeted command                                                                                                                   | 0    | 3 tests passed after adding `audit.ts` and `evidence.ts`.                                                                                                            |
| 2     | TRIANGULATE RED   | same targeted command                                                                                                                   | 1    | 2 focused tests failed because `createBlockedActionEvidenceRef` and `createDeniedApprovalEvidenceRef` were not implemented.                                          |
| 2     | TRIANGULATE GREEN | same targeted command                                                                                                                   | 0    | 5 tests passed after adding blocked-action and approval-denial evidence helpers.                                                                                     |
| 3     | REFACTOR VERIFY   | `cd packages/coding-agent && npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-audit.test.ts` | 0    | 5 tests passed after formatting/refactor verification.                                                                                                               |
| 3     | ROOT CHECK        | `npm run check`                                                                                                                         | 0    | Root check passed after final file updates; Biome reported no fixes, `tsgo --noEmit` passed, browser smoke passed, and `packages/web-ui` plus example checks passed. |

### Verification output summary

Targeted regression final run:

```text
Test Files  1 passed (1)
Tests  5 passed (5)
```

Root check final run:

```text
biome check --write --error-on-warnings .: Checked 663 files; No fixes applied.
tsgo --noEmit: passed.
npm run check:browser-smoke: passed.
packages/web-ui check: passed.
```

### Deviations from design

- None for Phase 2 scope. The slice only models audit/evidence data and does not execute cyber tools, call providers, access external targets, or persist data.
- Initial audit trail storage is immutable in-memory data as planned; durable persistence remains future Phase 3+ work.

### Remaining tasks

- Commit, push, and open a PR after final status review; do not include unrelated local runtime artifacts.
- Continue with Phase 3 only after Phase 2 PR boundary is accepted/merged.

### Workload

- Phase 2 remains within a focused PR boundary for audit/evidence helpers plus regression coverage.

## Phase 3: CTI/OSINT preservation adapters

Status: implementation complete; verification gates pass.

### PR boundary

- Branch: `feat/pi-cyber-harness-cti-persistence`
- Slice: Phase 3 only, CTI/OSINT preservation adapter boundaries
- Approved issue: https://github.com/rortizs/pi/issues/13
- Future PR body must include: `Closes #13`
- Future PR label: exactly one `type:*` label, expected `type:feature`

### Completed tasks

- RED: added CTI/OSINT persistence regression tests before implementation.
- GREEN: added injected Engram/Obsidian adapter boundaries and explicit `saved`, `skipped`, and `unavailable` result objects.
- TRIANGULATE: added trusted, unverified, and dual-use resource classification coverage.
- REFACTOR: normalized note fields as `what`, `why`, `where`, `classification`, `trust`, `dualUseCautions`, and `suggestedUse` with stable literal unions.

### Files changed

- `packages/coding-agent/test/suite/regressions/pi-cyber-harness-persistence.test.ts`
- `packages/coding-agent/src/core/cyber-harness/persistence.ts`
- `openspec/changes/pi-cyber-harness/apply-progress.md`

### TDD Cycle Evidence

| Cycle | Phase             | Command                                                                                                                                       | Exit | Evidence                                                                                                                                                          |
| ----- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | RED               | `cd packages/coding-agent && npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-persistence.test.ts` | 1    | Failed before implementation: missing `../../../src/core/cyber-harness/persistence.js`; 1 failed suite, no tests collected.                                       |
| 1     | GREEN             | same targeted command                                                                                                                         | 0    | 4 tests passed after adding `persistence.ts` with injected Engram/Obsidian adapters and explicit saved/skipped/unavailable statuses.                              |
| 2     | TRIANGULATE RED   | same targeted command                                                                                                                         | 1    | 1 focused dual-use caution test failed because a dual-use resource with empty cautions did not receive a default authorization caution.                            |
| 2     | TRIANGULATE GREEN | same targeted command                                                                                                                         | 0    | 5 tests passed after adding the default dual-use authorization caution during note normalization.                                                                  |
| 3     | REFACTOR VERIFY   | `cd packages/coding-agent && npx tsx ../../node_modules/vitest/dist/cli.js --run test/suite/regressions/pi-cyber-harness-persistence.test.ts` | 0    | 5 tests passed after final formatting/refactor verification.                                                                                                      |
| 3     | ROOT CHECK        | `npm run check`                                                                                                                               | 0    | First root check passed after Biome fixed 1 file; repeated root check passed with no fixes applied, `tsgo --noEmit` passed, browser smoke passed, web-ui passed. |
| 3     | DIFF CHECK        | `git diff --check`                                                                                                                            | 0    | No whitespace errors reported.                                                                                                                                    |

### Verification output summary

Targeted regression final run:

```text
Test Files  1 passed (1)
Tests  5 passed (5)
```

Root check final run:

```text
biome check --write --error-on-warnings .: Checked 665 files; No fixes applied.
tsgo --noEmit: passed.
npm run check:browser-smoke: passed.
packages/web-ui check: passed.
```

### Deviations from design

- None for Phase 3 scope. The slice only models adapter interfaces and injected fake adapters in tests; it does not call real Engram, Obsidian, provider APIs, browser automation, external targets, or persistence tools.
- Unverified resources return `skipped` for available adapters and preserve structured fallback note content for later manual review.

### Remaining tasks

- Commit, push, and open a PR after final status review; do not include unrelated local runtime artifacts.
- Continue with Phase 4 only after Phase 3 PR boundary is accepted/merged.

### Workload

- Phase 3 remains within a focused PR boundary for persistence adapter helpers plus regression coverage.
