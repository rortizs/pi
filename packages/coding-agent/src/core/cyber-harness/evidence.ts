export type CyberEvidenceKind =
	| "source-url"
	| "screenshot"
	| "command-output"
	| "tool-result"
	| "file-artifact"
	| "memory-observation"
	| "obsidian-note"
	| "verification-output"
	| "blocked-action"
	| "approval-denial";

export type CyberEvidenceVerificationStatus = "unverified" | "verified" | "disputed" | "not-applicable";
export type CyberEvidenceConfidence = "low" | "medium" | "high";
export type CyberEvidenceRisk = "low" | "medium" | "high" | "critical";

export interface CyberEvidenceRef {
	id: string;
	kind: CyberEvidenceKind;
	uriOrPath: string;
	capturedAt: string;
	sourceName?: string;
	summary: string;
	rawAvailable: boolean;
	verificationStatus: CyberEvidenceVerificationStatus;
	confidence?: CyberEvidenceConfidence;
	retention: string;
	redactions: string[];
}

export interface CreateCyberEvidenceRefInput {
	id: string;
	kind: CyberEvidenceKind;
	uriOrPath: string;
	capturedAt: string;
	sourceName?: string;
	summary: string;
	rawAvailable: boolean;
	verificationStatus: CyberEvidenceVerificationStatus;
	confidence?: CyberEvidenceConfidence;
	retention: string;
	redactions?: string[];
}

export function createCyberEvidenceRef(input: CreateCyberEvidenceRefInput): CyberEvidenceRef {
	return {
		...input,
		redactions: input.redactions ?? [],
	};
}

export interface CreateBlockedActionEvidenceRefInput {
	id: string;
	capturedAt: string;
	workflowId: string;
	capabilityId: string;
	actionSummary: string;
	policyRuleId: string;
	risk: CyberEvidenceRisk;
}

export function createBlockedActionEvidenceRef(input: CreateBlockedActionEvidenceRefInput): CyberEvidenceRef {
	return createCyberEvidenceRef({
		id: input.id,
		kind: "blocked-action",
		uriOrPath: `audit://${input.workflowId}/blocked-actions/${input.id}`,
		capturedAt: input.capturedAt,
		sourceName: input.capabilityId,
		summary: `${input.actionSummary} Capability: ${input.capabilityId}. Policy rule: ${input.policyRuleId}. Risk: ${input.risk}.`,
		rawAvailable: false,
		verificationStatus: "verified",
		confidence: "high",
		retention: "retain blocked action summary, policy rule, and risk without secrets",
		redactions: [],
	});
}

export interface CreateDeniedApprovalEvidenceRefInput {
	id: string;
	capturedAt: string;
	workflowId: string;
	actor: string;
	actionHash: string;
	reason: string;
}

export function createDeniedApprovalEvidenceRef(input: CreateDeniedApprovalEvidenceRefInput): CyberEvidenceRef {
	return createCyberEvidenceRef({
		id: input.id,
		kind: "approval-denial",
		uriOrPath: `audit://${input.workflowId}/approval-denials/${input.id}`,
		capturedAt: input.capturedAt,
		sourceName: input.actor,
		summary: `Approval denied by ${input.actor} for action ${input.actionHash}. Reason: ${input.reason}`,
		rawAvailable: false,
		verificationStatus: "verified",
		confidence: "high",
		retention: "retain denied approval decision, action hash, and reason without secrets",
		redactions: [],
	});
}
