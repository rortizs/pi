export type CyberCapabilityCategory =
	| "soc"
	| "blue-team"
	| "authorized-red-team"
	| "cti-osint"
	| "browser-ops"
	| "guardrail"
	| "audit"
	| "verification";

export type CyberCapabilityStatus = "enabled" | "disabled" | "blocked-pending-policy";
export type CyberRiskLevel = "low" | "medium" | "high" | "critical";
export type CyberActionClassification =
	| "local-docs-research"
	| "public-cti-osint"
	| "state-changing-soc"
	| "active-red-team"
	| "browser-evasion"
	| "external-read-only";

export type CyberPolicyDecisionStatus = "allow" | "approval-required" | "deny" | "blocked";
export type CyberPolicyDecisionReason =
	| "read-only-local-research-allowed"
	| "public-cti-source-metadata-required"
	| "public-cti-read-only-allowed"
	| "state-changing-action-requires-approval"
	| "unregistered capability"
	| "blocked-pending-policy"
	| "browser-evasion-blocked"
	| "missing-authorization-scope";

export interface CyberCapability {
	id: string;
	title: string;
	category: CyberCapabilityCategory;
	status: CyberCapabilityStatus;
	purpose?: string;
	allowedTools?: string[];
	forbiddenBehaviors?: string[];
	approvalRequired?: boolean;
	evidenceRequired?: boolean;
	auditEvents?: string[];
	retention?: string;
	dualUse?: "low" | "medium" | "high";
	defaultRisk?: CyberRiskLevel;
}

export interface CyberActionRequest {
	capabilityId: string;
	action: string;
	classification: CyberActionClassification;
	target?: string;
	authorizationScopeId?: string;
	source?: {
		urlOrId: string;
		collectedAt: string;
	};
}

export interface CyberPolicyDecision {
	decision: CyberPolicyDecisionStatus;
	reason: CyberPolicyDecisionReason;
	risk: CyberRiskLevel;
	auditable: boolean;
	capabilityStatus?: CyberCapabilityStatus;
}
