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

export type SocAuditRevisionClassification = "new-revision" | "duplicate" | "conflict";

export interface SocAuditRevisionCandidate extends SocAuditRecordLink {
	contentHash: string;
	createdAt: string;
}

export interface SocAuditRevisionEntry extends SocAuditRevisionCandidate {
	sequence: number;
	revision: number;
}

export interface SocAuditRevisionClassificationResult {
	classification: SocAuditRevisionClassification;
	reason: string;
	existing?: SocAuditRevisionEntry;
}

export interface SocAuditHistoryReconstructionResult {
	entries: SocAuditRevisionEntry[];
	latestByTopicKey: Record<string, SocAuditRevisionEntry>;
	links: SocAuditRecordLink[];
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

export function deriveSocAuditTopicKey(topic: string): string {
	const slug = topic
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return `soc-audit/${slug || "unknown"}`;
}

export function classifySocAuditRevision(
	history: readonly SocAuditRevisionEntry[],
	candidate: SocAuditRevisionCandidate,
): SocAuditRevisionClassificationResult {
	const matchingIdentity = history.find((entry) => hasSameRecordIdentity(entry, candidate));

	if (!matchingIdentity) {
		return { classification: "new-revision", reason: "No accepted record exists for this audit identity" };
	}

	if (matchingIdentity.contentHash === candidate.contentHash) {
		return {
			classification: "duplicate",
			existing: matchingIdentity,
			reason: "An accepted record with the same audit identity and content hash already exists",
		};
	}

	return {
		classification: "conflict",
		existing: matchingIdentity,
		reason: "An accepted record with the same audit identity has different content",
	};
}

export function createSocAuditRevisionEntry(
	history: readonly SocAuditRevisionEntry[],
	candidate: SocAuditRevisionCandidate,
): SocAuditRevisionEntry {
	return {
		...candidate,
		sequence: nextSequence(history),
		revision: nextTopicRevision(history, candidate.topicKey),
	};
}

export function reconstructSocAuditHistory(
	history: readonly SocAuditRevisionEntry[],
): SocAuditHistoryReconstructionResult {
	const entries = [...history].sort((left, right) => left.sequence - right.sequence);
	const latestByTopicKey: Record<string, SocAuditRevisionEntry> = {};
	const links = entries.map((entry) => {
		latestByTopicKey[entry.topicKey] = entry;
		return toSocAuditRecordLink(entry);
	});

	return { entries, latestByTopicKey, links };
}

export function evaluateAuditHistoryCompleteness(
	history: readonly SocAuditRevisionEntry[],
): SocAuditPersistenceCompletenessResult {
	return evaluateAuditPersistenceCompleteness(reconstructSocAuditHistory(history).links);
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

function hasSameRecordIdentity(left: SocAuditRecordLink, right: SocAuditRecordLink): boolean {
	return left.topicKey === right.topicKey && left.sourceId === right.sourceId && left.recordType === right.recordType;
}

function nextSequence(history: readonly SocAuditRevisionEntry[]): number {
	return history.reduce((maxSequence, entry) => Math.max(maxSequence, entry.sequence), 0) + 1;
}

function nextTopicRevision(history: readonly SocAuditRevisionEntry[], topicKey: string): number {
	return (
		history.reduce(
			(maxRevision, entry) => (entry.topicKey === topicKey ? Math.max(maxRevision, entry.revision) : maxRevision),
			0,
		) + 1
	);
}

function toSocAuditRecordLink(entry: SocAuditRevisionEntry): SocAuditRecordLink {
	return { topicKey: entry.topicKey, sourceId: entry.sourceId, recordType: entry.recordType };
}
