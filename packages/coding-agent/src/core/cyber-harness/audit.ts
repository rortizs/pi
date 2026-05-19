import type { CyberRiskLevel } from "./types.js";

export type CyberAuditPhase = "proposal" | "spec" | "design" | "tasks" | "apply" | "verify" | "archive";

export type CyberAuditEventType =
	| "workflow.started"
	| "capability.selected"
	| "policy.decided"
	| "approval.requested"
	| "approval.decided"
	| "tool.executed"
	| "action.blocked"
	| "evidence.captured"
	| "verification.completed"
	| "phase.notified"
	| "workflow.completed";

export type CyberAuditDecision = "allow" | "require_approval" | "deny" | "blocked" | "approved" | "skipped";
export type CyberAuditStatus = "pending" | "completed" | "failed" | "blocked" | "skipped";

export interface CyberAuditEvent {
	id: string;
	timestamp: string;
	workflowId: string;
	phase?: CyberAuditPhase;
	capabilityId?: string;
	eventType: CyberAuditEventType;
	actor?: string;
	summary: string;
	risk: CyberRiskLevel;
	decision: CyberAuditDecision;
	policyRuleIds: string[];
	target?: string;
	actionHash?: string;
	evidenceRefs: string[];
	status: CyberAuditStatus;
}

export interface CreateCyberAuditEventInput {
	id: string;
	timestamp: string;
	workflowId: string;
	phase?: CyberAuditPhase;
	capabilityId?: string;
	eventType: CyberAuditEventType;
	actor?: string;
	summary: string;
	risk: CyberRiskLevel;
	decision: CyberAuditDecision;
	policyRuleIds?: string[];
	target?: string;
	actionHash?: string;
	evidenceRefs?: string[];
	status: CyberAuditStatus;
}

export interface CyberAuditTrail {
	events: readonly CyberAuditEvent[];
	append(event: CyberAuditEvent): CyberAuditTrail;
}

export function createCyberAuditEvent(input: CreateCyberAuditEventInput): CyberAuditEvent {
	return {
		...input,
		policyRuleIds: input.policyRuleIds ?? [],
		evidenceRefs: input.evidenceRefs ?? [],
	};
}

export function createCyberAuditTrail(events: readonly CyberAuditEvent[] = []): CyberAuditTrail {
	return {
		events,
		append(event) {
			return createCyberAuditTrail([...events, event]);
		},
	};
}
