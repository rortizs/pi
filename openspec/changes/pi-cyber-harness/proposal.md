# Pi Cyber Harness Proposal

## Decision

Create a strict SDD change named `pi-cyber-harness` to define and later implement cybersecurity capabilities for Pi/Gentle AI. The work will proceed phase-by-phase before any source implementation: proposal, spec, design, tasks, apply, verify, and archive.

This proposal approves the direction only. It does not authorize implementation of offensive, browser evasion, or automation capabilities until the spec and design define explicit authorization, policy, audit, and verification gates.

## Intent

Build a governed cybersecurity harness for Pi that can support SOC, Blue-Team, authorized Red-Team, CTI/OSINT, and browser operations workflows through documented agents, skills, guardrails, audit trails, and verification gates.

The core intent is to make Pi useful for defensive security operations while preserving human control and preventing ambiguous dual-use automation from becoming unrestricted tooling.

## Problem Statement

The project has validated several relevant external references and patterns, including Threat Vector Security's GuardianAgent, ContextCypher, Agentic Boundary Bench, and Apify `fingerprint-suite`. These show useful directions for security-first agent orchestration, threat modeling, boundary testing, browser automation, and OSINT workflows.

Pi already has agent, coding-agent, tool, skill, extension, terminal UI, and web UI foundations, but the cybersecurity direction needs a dedicated, auditable harness plan before implementation. Without a strict spec, SOC/Blue-Team/Red-Team features can blur into unsafe dual-use behavior, unreviewable automation, or undocumented tool permissions.

## Scope

### In Scope

- Define the Pi Cyber Harness capability model.
- Define role boundaries for:
  - SOC operations.
  - Blue-Team investigation and detection engineering.
  - Authorized Red-Team validation.
  - CTI and OSINT collection.
  - Browser operations for authorized research and verification.
- Define security controls for dual-use operations:
  - explicit user authorization,
  - policy gates,
  - approvals,
  - audit logging,
  - sandboxing where applicable,
  - restricted tool scopes,
  - evidence capture.
- Define the SDD phase workflow:
  - one branch per phase,
  - documented phase artifacts,
  - verification before completion claims,
  - Pull Request before merge,
  - issue creation for failing gates,
  - Telegram phase notifications.
- Define required OpenSpec follow-up artifacts:
  - specification,
  - design,
  - task plan,
  - verification report,
  - archive notes.
- Identify an official E2E gate before merge automation depends on it.

### Out of Scope

- Source code changes in this proposal phase.
- Implementing agents, skills, tools, UI, or package behavior.
- Adding unrestricted offensive tooling.
- Adding anti-bot evasion or fingerprint injection as an operational capability without explicit policy approval.
- Running real provider APIs, real external targets, paid tokens, or unauthorized security tests.
- Claiming E2E coverage before an official E2E command is defined and verified.

## Affected Areas Forecast

| Area                                 | Expected impact       | Notes                                                                                   |
| ------------------------------------ | --------------------- | --------------------------------------------------------------------------------------- |
| `openspec/changes/pi-cyber-harness/` | High                  | Primary SDD artifacts for proposal, spec, design, tasks, verify, archive.               |
| `packages/coding-agent`              | Likely high later     | Candidate home for skills, harness behavior, commands, session policy, and tool gating. |
| `packages/agent`                     | Possible medium later | May need generic policy, tool approval, audit, or harness boundary concepts.            |
| `packages/tui`                       | Possible medium later | User-facing approvals, warnings, and phase/status visibility may surface here.          |
| `packages/web-ui`                    | Possible medium later | If SOC dashboards, review panels, or audit views are added.                             |
| `.pi/` project resources             | Possible medium later | Local skills, agents, chains, or Gentle AI SDD assets may be referenced.                |
| Documentation and changelogs         | Medium later          | Required if user-visible behavior or package capabilities change.                       |

## Capability Boundaries

### SOC

SOC workflows should focus on triage, alert context, evidence gathering, runbook execution, and report generation. They must not autonomously modify production systems without explicit approval and audit trail.

### Blue-Team

Blue-Team workflows should support detection engineering, defensive validation, log review, hardening recommendations, and threat modeling. They should prioritize explainability and reproducible evidence.

### Authorized Red-Team

Red-Team workflows must be authorization-bound. The spec must define target scope, allowed actions, proof requirements, and stop conditions before any implementation. Offensive automation must default to disabled unless an approved workflow explicitly enables it.

### CTI/OSINT

CTI/OSINT workflows should collect, summarize, enrich, and cross-reference public or authorized sources. They must track source provenance, confidence, timestamps, and collection constraints.

### Browser Operations

Browser operations are sensitive because they can interact with third-party systems and may include anti-bot or fingerprinting concepts. Browser capabilities must be gated by policy, visible approvals, logging, and authorized-use constraints. Apify `fingerprint-suite` is a reference for risk modeling, not an approved implementation dependency in this proposal.

## Trusted References

These references are inspiration only. No implementation is copied or adopted by this proposal.

| Reference                            | Relevance                                                                                              | Use in future phases                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Threat-Vector-Security GuardianAgent | Security-first AI agent orchestration, approvals, sandboxing, prompt-injection defenses, audit trails. | Compare harness boundaries, policy gates, and runtime controls.                   |
| Threat-Vector-Security ContextCypher | Offline threat modeling with MITRE ATT&CK, NIST, STRIDE/GRC, architecture diagrams.                    | Inform threat-modeling, architecture review, and Blue-Team modules.               |
| Agentic Boundary Bench               | Evaluation of agent security boundaries.                                                               | Inform verification and adversarial boundary tests.                               |
| Apify `fingerprint-suite`            | Browser fingerprint/header generation and injection for Playwright/Puppeteer.                          | Treat as dual-use reference for browser ops risk, not unrestricted functionality. |

## Workflow Requirements

Each phase must follow this operating model:

1. Create or use a dedicated branch for the phase.
2. Write/update OpenSpec artifacts before implementation.
3. Keep source code unchanged until spec, design, and tasks are approved.
4. For code phases, follow strict TDD where applicable:
   - RED,
   - GREEN,
   - TRIANGULATE,
   - REFACTOR,
   - record evidence.
5. Run fresh verification before completion claims.
6. Run the official E2E gate before PR/merge once defined.
7. If a verification gate fails:
   - create an issue,
   - document the failing command and output,
   - fix until the gate passes,
   - close the issue through the fixing PR.
8. If verification passes:
   - commit only files changed in the phase,
   - open a Pull Request linked to an approved issue,
   - apply exactly one `type:*` label,
   - push,
   - merge to `main` only after checks pass.
9. Notify the user via Telegram at phase boundaries with:
   - completed phase,
   - artifacts changed,
   - verification evidence,
   - next phase.

## Verification and E2E Gap

`openspec/config.yaml` identifies available root commands:

- `npm run check`
- `npm test`
- `npm run build`
- `npm run check:browser-smoke`

However, no dedicated root E2E script has been detected. This is a blocker for any workflow that requires "E2E before merge" as an automated gate.

Before implementation phases depend on E2E, the spec/design must define the official E2E gate. The gate may be one of:

- a new dedicated root script, for example `npm run test:e2e`,
- a package-specific E2E command,
- a documented browser smoke + package integration test combination,
- or a deliberately scoped initial gate for the first documentation-only phase.

Until that is defined, this change must not claim E2E readiness.

## Risks

| Risk                                      | Impact | Mitigation                                                                           |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| Dual-use capability misuse                | High   | Authorization-bound workflows, approvals, audit logs, safe defaults, explicit scope. |
| Browser automation abuse                  | High   | Gate browser ops, require user approval, log actions, define allowed targets.        |
| Undefined E2E gate                        | High   | Make E2E definition a required spec/design task before merge automation.             |
| Oversized review burden                   | Medium | Use phase branches and keep PRs small; split if changed lines exceed review budget.  |
| Tool permission creep                     | High   | Define capability boundaries and deny-by-default policies.                           |
| False security findings                   | Medium | Require evidence, confidence scoring, and reproducible validation.                   |
| Accidental source changes during planning | Medium | Proposal phase modifies OpenSpec artifacts only.                                     |

## Rollback

Proposal-phase rollback is simple:

1. Revert `openspec/changes/pi-cyber-harness/proposal.md`.
2. Leave `openspec/config.yaml` intact unless the entire SDD initialization is intentionally rolled back.
3. Do not modify package source, generated files, or runtime configuration for rollback in this phase.

Future implementation rollback must be defined per task and include data, audit, UI, and policy migration considerations if those areas are changed.

## Success Criteria

This proposal phase is successful when:

- `openspec/changes/pi-cyber-harness/proposal.md` exists.
- The proposal states intent, scope, affected areas, risks, rollback, and success criteria.
- Dual-use boundaries are explicit.
- The missing E2E gate is documented as a required follow-up.
- No source code is modified by this phase.
- The next recommended phase is clear: write the formal spec.

The overall `pi-cyber-harness` change is successful only when later phases deliver:

- approved spec and design artifacts,
- task plan with review workload estimate,
- implementation with strict TDD evidence where code changes exist,
- official E2E gate definition and passing evidence,
- Pull Request linked to an approved issue,
- passing checks before merge,
- archive notes with decisions and follow-ups.

## Next Phase

Proceed to `spec` for `pi-cyber-harness`.

The spec must define user-visible behavior, role boundaries, policy and authorization requirements, audit events, official E2E gate proposal, and measurable acceptance criteria for the first implementable slice.

## Skill Resolution

`injected`
