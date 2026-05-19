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
