/**
 * Evidence helpers normalize Kali MCP outputs before any Engram persistence boundary is called.
 * They keep validation-state changes explicit so SOC reviewers can audit why evidence was accepted or rejected.
 */

import {
	type Confidence,
	EVIDENCE_VALIDATION_STATUS,
	type EvidenceRecord,
	type EvidenceValidationStatus,
	type McpToolInvocationRequest,
	type McpToolInvocationResult,
} from "./contracts.js";

export interface NormalizeEvidenceInput {
	id: string;
	invocation: McpToolInvocationRequest;
	result: McpToolInvocationResult;
	observation: string;
	interpretation: string;
	confidence: Confidence;
}

export function normalizeEvidenceRecord(input: NormalizeEvidenceInput): EvidenceRecord {
	return {
		id: input.id,
		observation: input.observation,
		source: `${input.invocation.server}:${input.invocation.tool}`,
		timestamp: input.result.finishedAt,
		scope: input.invocation.scope,
		interpretation: input.interpretation,
		confidence: input.confidence,
		validationStatus: EVIDENCE_VALIDATION_STATUS.PENDING,
		toolInvocationId: input.invocation.id,
		rawRef: input.result.outputRef,
	};
}

export function transitionEvidenceValidationStatus(
	record: EvidenceRecord,
	validationStatus: EvidenceValidationStatus,
	rejectionReason?: string,
): EvidenceRecord {
	if (validationStatus === EVIDENCE_VALIDATION_STATUS.REJECTED && rejectionReason === undefined) {
		throw new Error("Rejected evidence requires an auditable rejection reason");
	}

	if (validationStatus === EVIDENCE_VALIDATION_STATUS.REJECTED) {
		return { ...record, validationStatus, rejectionReason };
	}

	return { ...record, validationStatus, rejectionReason: undefined };
}
