/**
 * Engram adapter contracts define Pi's persistence boundary without performing real Engram writes.
 * Production adapters must persist SOC decisions, invocations, evidence, validation, and handoffs with stable topic links.
 */

import type { EvidenceRecord, HandoffArtifact, HumanApprovalCheckpoint, McpToolInvocationResult } from "./contracts.js";

export const SOC_AUDIT_RECORD_TYPE = {
	DECISION: "decision",
	INVOCATION: "invocation",
	EVIDENCE: "evidence",
	VALIDATION: "validation",
	HANDOFF: "handoff",
} as const;

export type SocAuditRecordType = (typeof SOC_AUDIT_RECORD_TYPE)[keyof typeof SOC_AUDIT_RECORD_TYPE];

export const REQUIRED_SOC_AUDIT_RECORD_TYPES = [
	SOC_AUDIT_RECORD_TYPE.DECISION,
	SOC_AUDIT_RECORD_TYPE.INVOCATION,
	SOC_AUDIT_RECORD_TYPE.EVIDENCE,
	SOC_AUDIT_RECORD_TYPE.VALIDATION,
	SOC_AUDIT_RECORD_TYPE.HANDOFF,
] as const;

export interface SocAuditRecordLink {
	topicKey: string;
	sourceId: string;
	recordType: SocAuditRecordType;
}

export interface SocAuditPersistenceCompletenessResult {
	compliant: boolean;
	missingRecordTypes: SocAuditRecordType[];
	reason: string;
}

export interface SocEvidencePersistenceAdapter {
	persistDecision(checkpoint: HumanApprovalCheckpoint): Promise<SocAuditRecordLink>;
	persistInvocation(result: McpToolInvocationResult): Promise<SocAuditRecordLink>;
	persistEvidence(record: EvidenceRecord): Promise<SocAuditRecordLink>;
	persistValidation(record: EvidenceRecord): Promise<SocAuditRecordLink>;
	persistHandoff(handoff: HandoffArtifact): Promise<SocAuditRecordLink>;
}

export function evaluateAuditPersistenceCompleteness(
	persistedLinks: SocAuditRecordLink[],
): SocAuditPersistenceCompletenessResult {
	const persistedTypes = new Set(persistedLinks.map((link) => link.recordType));
	const missingRecordTypes = REQUIRED_SOC_AUDIT_RECORD_TYPES.filter((recordType) => !persistedTypes.has(recordType));

	if (missingRecordTypes.length === 0) {
		return { compliant: true, missingRecordTypes: [], reason: "All required SOC audit records were persisted" };
	}

	return {
		compliant: false,
		missingRecordTypes,
		reason: `Missing required SOC audit records: ${missingRecordTypes.join(", ")}`,
	};
}
