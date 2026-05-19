# Pi Cyber Harness Delta Spec

## ADDED Requirements

### Requirement: Cyber capability catalog

Pi MUST expose a cyber harness capability catalog before enabling any SOC, Blue-Team, authorized Red-Team, CTI/OSINT, or browser operations workflow.

The catalog MUST show each capability's purpose, role category, allowed tools, required approvals, evidence requirements, audit events, data retention notes, and dual-use classification.

The catalog MUST default new cyber capabilities to disabled until their policy, approval, and verification requirements are explicitly defined.

#### Scenario: Operator reviews available cyber capabilities

Given an operator opens the Pi Cyber Harness catalog
When cyber capabilities are listed
Then each capability MUST display its category as SOC, Blue-Team, authorized Red-Team, CTI/OSINT, browser ops, guardrail, audit, or verification
And each capability MUST display whether it is enabled, disabled, or blocked pending policy
And each capability MUST display required approvals before execution.

#### Scenario: New cyber capability has no policy

Given a new cyber agent, skill, or tool is registered without an explicit cyber policy
When the catalog evaluates the capability
Then the capability MUST be marked disabled by default
And the operator MUST see that policy, approval, audit, and verification metadata are missing
And Pi MUST NOT execute the capability as part of a cyber workflow.

### Requirement: SOC workflows

Pi MUST support SOC workflows for triage, alert enrichment, evidence gathering, runbook guidance, and incident report drafting.

SOC workflows MUST be read-only by default and MUST NOT modify production systems, external services, or customer data without explicit operator approval and an audit event.

SOC workflows MUST preserve source provenance, timestamps, confidence level, and evidence references for all findings.

#### Scenario: SOC analyst triages an alert

Given an operator starts a SOC triage workflow for an alert
When Pi gathers context from configured read-only sources
Then Pi MUST show source names, timestamps, and collected evidence
And Pi MUST summarize the alert with confidence and uncertainty
And Pi MUST recommend next actions without performing state-changing actions automatically.

#### Scenario: SOC workflow requests a state-changing action

Given a SOC workflow proposes blocking an IP, disabling a user, quarantining a host, or modifying a ticket
When the action would change state outside the local evidence workspace
Then Pi MUST require explicit approval
And Pi MUST show the exact target, command or API action, expected effect, rollback note, and audit label
And Pi MUST record the approval decision before execution.

### Requirement: Blue-Team workflows

Pi MUST support Blue-Team workflows for detection engineering, log review, hardening recommendations, defensive validation, threat modeling, and control mapping.

Blue-Team workflows MUST produce reproducible evidence, explain detection logic, and distinguish observed facts from recommendations.

Blue-Team workflows SHOULD support MITRE ATT&CK, NIST, STRIDE, and GRC mappings when the required data is available.

#### Scenario: Blue-Team operator drafts a detection

Given an operator asks Pi to draft a detection rule
When Pi produces the draft
Then Pi MUST include the detection objective, data source assumptions, query or rule body, expected true positives, expected false positives, and test data requirements
And Pi MUST label unverified claims as assumptions
And Pi MUST NOT claim the detection is valid until verification evidence is attached.

#### Scenario: Blue-Team operator performs threat modeling

Given an operator provides an architecture description or diagram
When Pi runs a threat-modeling workflow
Then Pi MUST identify assets, trust boundaries, data flows, likely threats, and mitigations
And Pi SHOULD map relevant threats to MITRE ATT&CK, NIST, STRIDE, or GRC references when applicable
And Pi MUST preserve the threat model as evidence for review.

### Requirement: Authorized Red-Team workflows

Pi MUST only allow Red-Team workflows inside an explicit authorization scope.

The authorization scope MUST include owner approval, target boundaries, allowed actions, prohibited actions, time window, evidence requirements, stop conditions, and reporting requirements.

Red-Team workflows MUST default to disabled when authorization is missing, expired, ambiguous, or broader than the operator's approved scope.

Pi MUST NOT provide unrestricted offensive automation, credential abuse, persistence, stealth, exploitation against third-party targets, or anti-abuse evasion outside a documented authorized validation workflow.

#### Scenario: Operator requests Red-Team validation without authorization

Given an operator asks Pi to perform Red-Team validation
And no active authorization scope exists
When the workflow starts
Then Pi MUST refuse to execute Red-Team actions
And Pi MUST ask for an authorization scope artifact or approved workflow
And Pi MAY provide safe planning, scoping, or defensive preparation guidance.

#### Scenario: Authorized Red-Team scope is active

Given an approved Red-Team scope exists
And the requested target and action are inside that scope
When Pi prepares the action
Then Pi MUST show the matching scope clause, expected effect, evidence capture plan, and stop condition
And Pi MUST require approval for any active or intrusive action
And Pi MUST record execution outcome and evidence references.

#### Scenario: Requested Red-Team action exceeds scope

Given an approved Red-Team scope exists
When an operator requests an action outside the approved targets, time window, or allowed actions
Then Pi MUST block the action
And Pi MUST record the blocked request in the audit log
And Pi MUST explain which scope rule was violated.

### Requirement: CTI and OSINT workflows

Pi MUST support CTI and OSINT workflows for collecting, summarizing, enriching, cross-referencing, and preserving public or authorized information sources.

CTI/OSINT workflows MUST track source URL or identifier, collection timestamp, access method, license or terms constraints when known, confidence, and analyst notes.

CTI/OSINT workflows MUST distinguish public information, user-provided information, paid/private intelligence, and sensitive personal data.

#### Scenario: Operator saves a trusted CTI resource

Given an operator shares a CTI/OSINT resource through Telegram or another Pi input channel
When Pi determines the resource is relevant and trustworthy enough to preserve
Then Pi MUST save a concise discovery to Engram when available
And Pi MUST save or append an organized note under the user's Obsidian `project/pi/` area when Obsidian tools are available
And Pi MUST classify the resource by SOC, Blue-Team, Red-Team, CTI/OSINT, browser ops, guardrail, audit, or verification relevance.

#### Scenario: CTI source has uncertain trust

Given Pi cannot verify the source, author, provenance, or safety of a shared CTI/OSINT resource
When the operator asks to preserve it
Then Pi MUST label the resource as unverified
And Pi MUST record the uncertainty and follow-up validation steps
And Pi MUST NOT promote the resource to trusted reference status without additional evidence.

### Requirement: Browser operations

Pi MUST treat browser operations as sensitive capabilities when they interact with external sites, authenticated sessions, scraping, form submission, downloads, anti-bot controls, or fingerprinting concepts.

Browser operations MUST require policy classification, allowed target scope, user-visible approval for sensitive actions, audit logging, and evidence capture.

Anti-bot evasion, fingerprint injection, or stealth browsing MUST NOT be enabled as general-purpose functionality. Such techniques MAY only be referenced for risk modeling or explicitly authorized testing workflows with documented legal and policy approval.

#### Scenario: Browser workflow reads a public page

Given an operator requests collection from a public web page
When the browser workflow only reads the page and captures evidence
Then Pi MUST record the URL, timestamp, tool used, and extracted evidence
And Pi SHOULD warn when terms, robots policy, login walls, or rate limits are encountered
And Pi MUST NOT bypass access controls.

#### Scenario: Browser workflow attempts fingerprint or anti-bot evasion

Given a browser workflow requests fingerprint injection, header camouflage, CAPTCHA bypass, stealth automation, or anti-bot evasion
When no explicit authorized testing policy allows that behavior
Then Pi MUST block the action
And Pi MUST explain that the capability is dual-use and requires explicit authorization
And Pi MUST record the blocked request in the audit log.

### Requirement: Guardrails and approval gates

Pi MUST enforce deny-by-default guardrails for cyber capabilities that are destructive, intrusive, state-changing, dual-use, externally targeted, or likely to affect third-party systems.

Approval prompts MUST show the requested action, actor, target, scope match, risk level, expected effect, evidence plan, rollback or stop condition, and audit destination.

Approvals MUST be recorded with decision, timestamp, operator identity when available, action hash or stable identifier, and resulting execution status.

#### Scenario: Sensitive action requires approval

Given a cyber workflow prepares a sensitive action
When the action is destructive, intrusive, state-changing, externally targeted, dual-use, or browser-sensitive
Then Pi MUST pause before execution
And Pi MUST display a structured approval prompt
And Pi MUST only continue after explicit approval.

#### Scenario: Operator denies approval

Given Pi displays an approval prompt for a sensitive cyber action
When the operator denies the action
Then Pi MUST NOT execute the action
And Pi MUST record the denial and reason when provided
And Pi MAY offer a safer alternative if one exists.

### Requirement: Audit logging and evidence capture

Pi MUST produce audit events for cyber workflow start, capability selection, policy decision, approval decision, tool execution, blocked action, evidence capture, verification result, phase notification, and workflow completion.

Audit events MUST include timestamp, workflow id, capability id, operator-visible summary, risk classification, decision, and evidence references when applicable.

Evidence capture MUST be tamper-evident enough for review by preserving source metadata, raw or summarized evidence references, command or tool invocation summaries, and verification status.

#### Scenario: Cyber workflow completes

Given a cyber workflow has executed one or more steps
When the workflow completes
Then Pi MUST produce an operator-visible summary
And Pi MUST link the summary to audit events and evidence references
And Pi MUST identify unresolved risks, assumptions, and follow-up actions.

#### Scenario: Action is blocked by policy

Given a cyber workflow requests an action blocked by policy
When Pi blocks the action
Then Pi MUST create an audit event with the blocked action summary, matched policy rule, risk level, and operator-visible explanation
And Pi MUST NOT execute the blocked action.

### Requirement: Agent and skill boundaries

Pi MUST define cyber agents and skills with explicit role boundaries, tool permissions, input constraints, output requirements, approval requirements, and forbidden behaviors.

Cyber agents and skills MUST NOT spawn additional agents or expand their own permissions unless the parent orchestrator or operator explicitly approves that behavior through documented policy.

Cyber agents and skills MUST emit structured outputs suitable for evidence review, including findings, confidence, sources, assumptions, actions taken, actions blocked, and next steps.

#### Scenario: Cyber skill is selected

Given an operator selects a cyber skill
When Pi prepares the skill for execution
Then Pi MUST show the skill's role, allowed tools, approval requirements, and forbidden behaviors
And Pi MUST enforce those boundaries during execution
And Pi MUST record the selected skill and policy decision in the audit log.

#### Scenario: Skill requests a forbidden behavior

Given a cyber skill attempts to perform a forbidden behavior
When Pi evaluates the request
Then Pi MUST block the behavior
And Pi MUST record the policy violation
And Pi MUST continue only with safe alternatives or stop the workflow.

### Requirement: Research preservation in Engram and Obsidian

Pi MUST preserve trusted or relevant cyber research discoveries in Engram when memory tools are available.

Pi MUST preserve operator-approved cyber research notes in the user's Obsidian vault under `project/pi/` when Obsidian tools are available.

Research preservation MUST include what was found, why it matters, where it was found, how it maps to SOC/Blue-Team/Red-Team/CTI/OSINT/browser ops/guardrails/audit/verification, trust assessment, and dual-use cautions.

#### Scenario: Telegram resource is trusted and relevant

Given the operator sends a cyber resource through Telegram
And Pi assesses it as relevant and trustworthy enough for the project
When preserving the finding
Then Pi MUST save the key discovery in Engram when available
And Pi MUST append or create an Obsidian note under `project/pi/`
And Pi MUST include classification, trust rationale, and next use in the Pi Cyber Harness project.

#### Scenario: Memory or Obsidian tools are unavailable

Given a cyber resource should be preserved
When Engram or Obsidian tools are unavailable
Then Pi MUST state which preservation target was unavailable
And Pi MUST include enough structured content in the phase artifact or response for later manual preservation
And Pi MUST NOT claim persistence occurred for unavailable systems.

### Requirement: Telegram phase notifications

Pi MUST notify the operator through Telegram at SDD phase boundaries when Telegram output is available.

Phase notifications MUST include completed phase, changed artifacts, verification evidence or explicit statement that verification was not applicable, risks or blockers, and next phase.

Pi MUST NOT claim a phase is complete in Telegram until the phase artifacts are written and fresh verification appropriate to the phase has been performed or explicitly documented as not applicable.

#### Scenario: Spec phase completes

Given the spec phase artifacts have been written
When Pi sends the phase notification
Then the notification MUST identify the completed phase as `spec`
And it MUST list exact artifact paths
And it MUST state the next phase as `design`
And it MUST mention any unresolved blockers such as missing E2E definition.

### Requirement: Verification and E2E gates

Pi MUST define an official verification gate before any implementation-phase merge depends on E2E status.

Documentation-only SDD phases MUST at minimum verify that expected OpenSpec artifacts exist and that no source code changes were intentionally made by the phase.

Code-changing phases MUST run `npm run check` after code changes unless superseded by a more specific approved project rule, and MUST run targeted tests for affected packages when tests are created or modified.

The official E2E gate MUST be one of a dedicated root E2E script, a package-specific E2E command, or a documented composite gate with exact commands, expected outputs, and failure handling.

#### Scenario: Documentation-only phase verification

Given a phase only changes OpenSpec documentation artifacts
When verifying the phase
Then Pi MUST confirm the expected artifact paths exist
And Pi MUST confirm source packages were not intentionally modified by the phase
And Pi MAY skip code tests with an explicit documentation-only rationale.

#### Scenario: Code-changing phase verification

Given a phase changes source code
When verifying the phase
Then Pi MUST run the configured check command after code changes
And Pi MUST run targeted package tests for changed test files or affected packages when appropriate
And Pi MUST record command, exit status, and relevant output before claiming the phase is complete.

#### Scenario: E2E gate is missing

Given no official E2E gate is defined
When a phase workflow requires E2E before merge
Then Pi MUST treat the missing E2E gate as a blocker for implementation merge automation
And Pi MUST create or update the design/tasks artifact to define the E2E gate
And Pi MUST NOT claim E2E readiness.

### Requirement: Issue, Pull Request, and merge workflow

Pi MUST follow the operator's strict phase workflow for implementation phases: branch per phase, documented artifacts, verification, issue creation for failed gates, Pull Request after passing gates, push, and merge to `main` only after checks pass.

Pull Requests MUST link an approved issue when repository policy requires it and MUST include exactly one `type:*` label when repository automation requires it.

Pi MUST stage and commit only files modified by the current phase and MUST preserve unrelated worktree changes.

#### Scenario: Verification gate fails

Given a phase verification gate fails
When the failure is confirmed from fresh output
Then Pi MUST document the failing command and output
And Pi MUST create or request creation of an issue according to available permissions
And Pi MUST continue fixing until the gate passes before proceeding to Pull Request and merge.

#### Scenario: Verification gate passes

Given all required gates for the phase pass
When preparing the Pull Request
Then Pi MUST commit only the phase's files
And Pi MUST create or prepare a Pull Request linked to the approved issue
And Pi MUST push and merge only after required checks pass and merge is authorized by policy.
