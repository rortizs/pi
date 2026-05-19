import { CYBER_CAPABILITY_CATALOG } from "./catalog.js";
import type { CyberActionRequest, CyberCapability, CyberPolicyDecision } from "./types.js";

export function hasCompleteCyberPolicyMetadata(capability: CyberCapability): boolean {
	return Boolean(
		capability.purpose &&
			Array.isArray(capability.allowedTools) &&
			capability.allowedTools.length > 0 &&
			Array.isArray(capability.forbiddenBehaviors) &&
			capability.forbiddenBehaviors.length > 0 &&
			Array.isArray(capability.auditEvents) &&
			capability.auditEvents.length > 0 &&
			capability.retention &&
			typeof capability.approvalRequired === "boolean" &&
			typeof capability.evidenceRequired === "boolean" &&
			capability.dualUse &&
			capability.defaultRisk,
	);
}

export function evaluateCyberAction(
	request: CyberActionRequest,
	catalog: CyberCapability[] = CYBER_CAPABILITY_CATALOG,
): CyberPolicyDecision {
	const capability = catalog.find((candidate) => candidate.id === request.capabilityId);
	if (!capability) {
		return { decision: "deny", reason: "unregistered capability", risk: "high", auditable: true };
	}

	if (capability.status !== "enabled" || !hasCompleteCyberPolicyMetadata(capability)) {
		return {
			decision: "blocked",
			reason: "blocked-pending-policy",
			risk: capability.defaultRisk ?? "high",
			auditable: true,
			capabilityStatus: capability.status,
		};
	}

	if (request.classification === "browser-evasion") {
		return { decision: "deny", reason: "browser-evasion-blocked", risk: "critical", auditable: true };
	}

	if (request.classification === "active-red-team" && !request.authorizationScopeId) {
		return { decision: "deny", reason: "missing-authorization-scope", risk: "critical", auditable: true };
	}

	if (request.classification === "local-docs-research") {
		return { decision: "allow", reason: "read-only-local-research-allowed", risk: "low", auditable: true };
	}

	if (request.classification === "public-cti-osint") {
		if (!request.source) {
			return {
				decision: "blocked",
				reason: "public-cti-source-metadata-required",
				risk: "medium",
				auditable: true,
			};
		}

		return { decision: "allow", reason: "public-cti-read-only-allowed", risk: "medium", auditable: true };
	}

	return {
		decision: "approval-required",
		reason: "state-changing-action-requires-approval",
		risk: capability.defaultRisk ?? "high",
		auditable: true,
	};
}
