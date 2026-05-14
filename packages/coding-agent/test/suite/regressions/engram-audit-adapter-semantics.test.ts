import { describe, expect, it } from "vitest";
import {
	classifySocAuditRevision,
	createSocAuditRevisionEntry,
	deriveSocAuditTopicKey,
	evaluateAuditHistoryCompleteness,
	reconstructSocAuditHistory,
	SOC_AUDIT_RECORD_TYPE,
	type SocAuditRevisionCandidate,
	type SocAuditRevisionClassification,
	type SocAuditRevisionEntry,
} from "../../../src/core/security/engram-adapter.js";

interface FakeEngramAuditAppendResult {
	classification: SocAuditRevisionClassification;
	reason: string;
	existing?: SocAuditRevisionEntry;
	entry?: SocAuditRevisionEntry;
	history: SocAuditRevisionEntry[];
}

class FakeEngramAuditHistory {
	private readonly history: SocAuditRevisionEntry[] = [];

	append(candidate: SocAuditRevisionCandidate): FakeEngramAuditAppendResult {
		const result = classifySocAuditRevision(this.history, candidate);

		if (result.classification !== "new-revision") {
			return { ...result, history: [...this.history] };
		}

		const entry = createSocAuditRevisionEntry(this.history, candidate);
		this.history.push(entry);
		return { ...result, entry, history: [...this.history] };
	}

	entries() {
		return [...this.history];
	}
}

const candidate = (overrides: Partial<SocAuditRevisionCandidate> = {}): SocAuditRevisionCandidate => ({
	topicKey: deriveSocAuditTopicKey("soc alert suspicious login"),
	sourceId: "source-1",
	recordType: SOC_AUDIT_RECORD_TYPE.EVIDENCE,
	contentHash: "hash-1",
	createdAt: "2026-05-12T18:31:00.000Z",
	...overrides,
});

describe("Engram audit adapter semantics", () => {
	it("derives stable topic keys and links equivalent writes to the same topic history", () => {
		const adapter = new FakeEngramAuditHistory();
		const topicKey = deriveSocAuditTopicKey(" SOC Alert: Suspicious Login ");
		const equivalentTopicKey = deriveSocAuditTopicKey("soc-alert suspicious   login");
		const distinctTopicKey = deriveSocAuditTopicKey("soc alert privilege escalation");

		const first = adapter.append(candidate({ topicKey, sourceId: "evidence-1", contentHash: "hash-a" }));
		const second = adapter.append(
			candidate({ topicKey: equivalentTopicKey, sourceId: "validation-1", contentHash: "hash-b" }),
		);
		const distinct = adapter.append(
			candidate({ topicKey: distinctTopicKey, sourceId: "handoff-1", contentHash: "hash-c" }),
		);

		expect(topicKey).toBe(equivalentTopicKey);
		expect(distinctTopicKey).not.toBe(topicKey);
		expect(first.entry?.revision).toBe(1);
		expect(second.entry?.revision).toBe(2);
		expect(distinct.entry?.revision).toBe(1);
		expect(
			adapter
				.entries()
				.filter((entry) => entry.topicKey === topicKey)
				.map((entry) => entry.sourceId),
		).toEqual(["evidence-1", "validation-1"]);
		expect(
			adapter
				.entries()
				.filter((entry) => entry.topicKey === distinctTopicKey)
				.map((entry) => entry.sourceId),
		).toEqual(["handoff-1"]);
	});

	it("assigns monotonic per-topic revisions while preserving deterministic append sequence", () => {
		const adapter = new FakeEngramAuditHistory();
		const topicKey = deriveSocAuditTopicKey("soc host exposure");

		adapter.append(
			candidate({ topicKey, sourceId: "first", contentHash: "hash-first", createdAt: "2026-05-12T18:33:00.000Z" }),
		);
		adapter.append(
			candidate({ topicKey, sourceId: "second", contentHash: "hash-second", createdAt: "2026-05-12T18:31:00.000Z" }),
		);
		adapter.append(
			candidate({
				topicKey: deriveSocAuditTopicKey("soc host baseline"),
				sourceId: "other",
				contentHash: "hash-other",
			}),
		);

		expect(
			adapter
				.entries()
				.map((entry) => ({ sourceId: entry.sourceId, revision: entry.revision, sequence: entry.sequence })),
		).toEqual([
			{ sourceId: "first", revision: 1, sequence: 1 },
			{ sourceId: "second", revision: 2, sequence: 2 },
			{ sourceId: "other", revision: 1, sequence: 3 },
		]);
	});

	it("reconstructs canonical history deterministically without mutating accepted entries", () => {
		const first = createSocAuditRevisionEntry(
			[],
			candidate({ sourceId: "first", contentHash: "hash-first", createdAt: "2026-05-12T18:33:00.000Z" }),
		);
		const second = createSocAuditRevisionEntry(
			[first],
			candidate({ sourceId: "second", contentHash: "hash-second", createdAt: "2026-05-12T18:31:00.000Z" }),
		);
		const shuffled = [second, first];

		const reconstructed = reconstructSocAuditHistory(shuffled);
		const repeated = reconstructSocAuditHistory(shuffled);

		expect(reconstructed).toEqual(repeated);
		expect(reconstructed.entries.map((entry) => entry.sourceId)).toEqual(["first", "second"]);
		expect(reconstructed.latestByTopicKey[first.topicKey]).toEqual(second);
		expect(reconstructed.links).toEqual([
			{ topicKey: first.topicKey, sourceId: "first", recordType: SOC_AUDIT_RECORD_TYPE.EVIDENCE },
			{ topicKey: first.topicKey, sourceId: "second", recordType: SOC_AUDIT_RECORD_TYPE.EVIDENCE },
		]);
		expect(first).toEqual({ ...first, sequence: 1, revision: 1 });
	});

	it("classifies duplicates and conflicts without appending or overwriting accepted history", () => {
		const adapter = new FakeEngramAuditHistory();
		const accepted = adapter.append(candidate());
		const duplicate = adapter.append(candidate());
		const conflict = adapter.append(candidate({ contentHash: "hash-conflict" }));

		expect(accepted.classification).toBe("new-revision");
		expect(duplicate.classification).toBe("duplicate");
		expect(duplicate.entry).toBeUndefined();
		expect(duplicate.history).toEqual(adapter.entries());
		expect(conflict.classification).toBe("conflict");
		expect(conflict.entry).toBeUndefined();
		expect(adapter.entries()).toHaveLength(1);
		expect(adapter.entries()[0]?.contentHash).toBe("hash-1");
	});

	it("evaluates required audit record completeness from reconstructed history only", () => {
		const history = [
			createSocAuditRevisionEntry(
				[],
				candidate({ sourceId: "decision-1", recordType: SOC_AUDIT_RECORD_TYPE.DECISION, contentHash: "decision" }),
			),
			createSocAuditRevisionEntry(
				[],
				candidate({
					sourceId: "invocation-1",
					recordType: SOC_AUDIT_RECORD_TYPE.INVOCATION,
					contentHash: "invocation",
				}),
			),
			createSocAuditRevisionEntry(
				[],
				candidate({ sourceId: "evidence-1", recordType: SOC_AUDIT_RECORD_TYPE.EVIDENCE, contentHash: "evidence" }),
			),
		];
		const validation = createSocAuditRevisionEntry(
			history,
			candidate({
				sourceId: "validation-1",
				recordType: SOC_AUDIT_RECORD_TYPE.VALIDATION,
				contentHash: "validation",
			}),
		);
		const completeHistory = [
			...history,
			validation,
			createSocAuditRevisionEntry(
				[...history, validation],
				candidate({ sourceId: "handoff-1", recordType: SOC_AUDIT_RECORD_TYPE.HANDOFF, contentHash: "handoff" }),
			),
		];

		expect(evaluateAuditHistoryCompleteness(history)).toEqual({
			compliant: false,
			missingRecordTypes: [SOC_AUDIT_RECORD_TYPE.VALIDATION, SOC_AUDIT_RECORD_TYPE.HANDOFF],
			reason: "Missing required SOC audit records: validation, handoff",
		});
		expect(evaluateAuditHistoryCompleteness(completeHistory)).toEqual({
			compliant: true,
			missingRecordTypes: [],
			reason: "All required SOC audit records were persisted",
		});
	});
});
