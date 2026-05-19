import { describe, expect, it } from "vitest";
import {
	type CyberAuditEventType,
	createCyberAuditEvent,
	createCyberAuditTrail,
} from "../../../src/core/cyber-harness/audit.js";
import {
	type CyberEvidenceKind,
	createBlockedActionEvidenceRef,
	createCyberEvidenceRef,
	createDeniedApprovalEvidenceRef,
} from "../../../src/core/cyber-harness/evidence.js";

const workflowId = "workflow-2026-05-19";
const timestamp = "2026-05-19T00:00:00.000Z";

describe("pi cyber harness audit and evidence schema", () => {
	it("builds structured audit events for the required cyber workflow lifecycle", () => {
		const eventTypes: CyberAuditEventType[] = [
			"workflow.started",
			"policy.decided",
			"action.blocked",
			"approval.decided",
			"tool.executed",
			"evidence.captured",
			"verification.completed",
			"phase.notified",
			"workflow.completed",
		];

		const events = eventTypes.map((eventType, index) =>
			createCyberAuditEvent({
				id: `event-${index + 1}`,
				timestamp,
				workflowId,
				eventType,
				capabilityId: "soc.safe-stub",
				summary: `Lifecycle event ${eventType}`,
				risk: eventType === "action.blocked" ? "high" : "low",
				decision: eventType === "action.blocked" ? "blocked" : "allow",
				status: eventType === "action.blocked" ? "blocked" : "completed",
				policyRuleIds: ["cyber-harness.phase-2"],
				evidenceRefs: [`evidence-${index + 1}`],
			}),
		);

		expect(events.map((event) => event.eventType)).toEqual(eventTypes);
		expect(events.every((event) => event.workflowId === workflowId)).toBe(true);
		expect(events.every((event) => event.summary.length > 0)).toBe(true);
		expect(events.every((event) => event.evidenceRefs.length === 1)).toBe(true);
	});

	it("appends audit events without mutating the previous trail", () => {
		const trail = createCyberAuditTrail();
		const started = createCyberAuditEvent({
			id: "event-started",
			timestamp,
			workflowId,
			eventType: "workflow.started",
			summary: "SOC triage workflow started",
			risk: "low",
			decision: "allow",
			status: "completed",
		});
		const completed = createCyberAuditEvent({
			id: "event-completed",
			timestamp,
			workflowId,
			eventType: "workflow.completed",
			summary: "SOC triage workflow completed",
			risk: "low",
			decision: "allow",
			status: "completed",
		});

		const withStarted = trail.append(started);
		const withCompleted = withStarted.append(completed);

		expect(trail.events).toEqual([]);
		expect(withStarted.events.map((event) => event.id)).toEqual(["event-started"]);
		expect(withCompleted.events.map((event) => event.id)).toEqual(["event-started", "event-completed"]);
	});

	it("builds redaction-friendly evidence references with stable kinds", () => {
		const kind: CyberEvidenceKind = "tool-result";
		const evidence = createCyberEvidenceRef({
			id: "evidence-tool-result",
			kind,
			uriOrPath: "session://cyber/workflows/workflow-2026-05-19/tool-result.json",
			capturedAt: timestamp,
			sourceName: "local faux tool summary",
			summary: "Tool returned a sanitized local result summary.",
			rawAvailable: false,
			verificationStatus: "verified",
			confidence: "high",
			retention: "retain sanitized summary only; do not store secrets",
			redactions: ["api-key", "credential"],
		});

		expect(evidence).toMatchObject({
			kind: "tool-result",
			rawAvailable: false,
			verificationStatus: "verified",
			redactions: ["api-key", "credential"],
		});
		expect(evidence.summary).not.toContain("secret");
	});

	it("represents blocked actions as auditable evidence", () => {
		const evidence = createBlockedActionEvidenceRef({
			id: "evidence-blocked-action",
			capturedAt: timestamp,
			workflowId,
			capabilityId: "browser.public-read",
			actionSummary: "Blocked browser fingerprint evasion request.",
			policyRuleId: "browser-evasion-blocked",
			risk: "critical",
		});

		expect(evidence.kind).toBe("blocked-action");
		expect(evidence.verificationStatus).toBe("verified");
		expect(evidence.rawAvailable).toBe(false);
		expect(evidence.summary).toContain("browser.public-read");
		expect(evidence.summary).toContain("browser-evasion-blocked");
	});

	it("represents denied approvals as auditable evidence", () => {
		const evidence = createDeniedApprovalEvidenceRef({
			id: "evidence-denied-approval",
			capturedAt: timestamp,
			workflowId,
			actor: "operator@example.test",
			actionHash: "sha256:local-action-summary",
			reason: "Scope did not include the requested target.",
		});

		expect(evidence.kind).toBe("approval-denial");
		expect(evidence.verificationStatus).toBe("verified");
		expect(evidence.summary).toContain("operator@example.test");
		expect(evidence.summary).toContain("sha256:local-action-summary");
		expect(evidence.retention).toContain("denied approval");
	});
});
