import { describe, expect, it } from "vitest";
import {
	DOMAIN,
	EVIDENCE_VALIDATION_STATUS,
	type EvidenceRecord,
	type HandoffArtifact,
	type HumanApprovalCheckpoint,
	MCP_INVOCATION_STATUS,
	type McpToolInvocationRequest,
	type McpToolInvocationResult,
	type SocTaskRequest,
	validateEvidenceRecord,
	validateHandoffArtifact,
	validateHumanApprovalCheckpoint,
	validateMcpToolInvocationRequest,
	validateMcpToolInvocationResult,
	validateSocTaskRequest,
} from "../../../src/core/security/contracts.js";
import {
	evaluateAuditPersistenceCompleteness,
	SOC_AUDIT_RECORD_TYPE,
	type SocAuditRecordLink,
	type SocEvidencePersistenceAdapter,
} from "../../../src/core/security/engram-adapter.js";
import { normalizeEvidenceRecord, transitionEvidenceValidationStatus } from "../../../src/core/security/evidence.js";
import { evaluateGeminiDependencyPolicy, evaluateMcpInvocationPolicy } from "../../../src/core/security/policy.js";

describe("SOC MCP evidence contract", () => {
	it("accepts complete contract records across SOC, MCP, evidence, approval, and handoff boundaries", () => {
		const socTask = {
			id: "soc-task-1",
			domain: DOMAIN.SOC,
			input: { kind: "alert", value: "suspicious-login", source: "siem" },
			scope: { tenant: "acme", environment: "prod", allowedTargets: ["10.0.0.5"] },
			urgency: "high",
		} satisfies SocTaskRequest;

		const invocation = {
			id: "invoke-1",
			server: "kali-mcp",
			tool: "nmap_scan",
			params: { target: "10.0.0.5" },
			intent: "Verify exposed services for a scoped alert",
			scope: socTask.scope,
			operator: { id: "operator-1", role: "soc-analyst" },
			approvalId: "approval-1",
		} satisfies McpToolInvocationRequest;

		const result = {
			invocationId: invocation.id,
			status: MCP_INVOCATION_STATUS.SUCCESS,
			startedAt: "2026-05-12T18:30:00.000Z",
			finishedAt: "2026-05-12T18:31:00.000Z",
			outputRef: "engram://evidence/raw/invoke-1",
			summary: "Host exposes SSH only",
		} satisfies McpToolInvocationResult;

		const evidence = {
			id: "evidence-1",
			observation: "Only TCP/22 observed on scoped host",
			source: "kali-mcp:nmap_scan",
			timestamp: result.finishedAt,
			scope: socTask.scope,
			interpretation: "Exposure is expected for the hardened bastion",
			confidence: "high",
			validationStatus: EVIDENCE_VALIDATION_STATUS.VALIDATED,
			toolInvocationId: invocation.id,
			rawRef: result.outputRef,
		} satisfies EvidenceRecord;

		const approval = {
			id: "approval-1",
			action: "allow",
			reason: "Operator approved scoped service enumeration",
			requestedBy: "soc-orchestrator",
			approvedBy: "operator-1",
			decidedAt: "2026-05-12T18:29:00.000Z",
		} satisfies HumanApprovalCheckpoint;

		const handoff = {
			id: "handoff-1",
			fromDomain: DOMAIN.SOC,
			toDomain: DOMAIN.BLUE_TEAM,
			summary: "Scoped host exposure verified",
			evidenceIds: [evidence.id],
			recommendations: ["Keep SSH restricted to approved admin network"],
			createdAt: "2026-05-12T18:32:00.000Z",
		} satisfies HandoffArtifact;

		expect(validateSocTaskRequest(socTask)).toEqual({ valid: true, errors: [] });
		expect(validateMcpToolInvocationRequest(invocation)).toEqual({ valid: true, errors: [] });
		expect(validateMcpToolInvocationResult(result)).toEqual({ valid: true, errors: [] });
		expect(validateEvidenceRecord(evidence)).toEqual({ valid: true, errors: [] });
		expect(validateHumanApprovalCheckpoint(approval)).toEqual({ valid: true, errors: [] });
		expect(validateHandoffArtifact(handoff)).toEqual({ valid: true, errors: [] });
	});

	it("rejects omitted required fields and invalid lifecycle statuses with auditable field errors", () => {
		expect(validateSocTaskRequest({ id: "soc-task-2", domain: DOMAIN.SOC })).toEqual({
			valid: false,
			errors: [
				"input.kind is required",
				"input.value is required",
				"input.source is required",
				"scope.allowedTargets must contain at least one target",
				"urgency must be one of low, medium, high, critical",
			],
		});

		expect(validateMcpToolInvocationRequest({ id: "invoke-2", server: "kali-mcp", tool: "nmap_scan" })).toEqual({
			valid: false,
			errors: [
				"params is required",
				"intent is required",
				"scope.allowedTargets must contain at least one target",
				"operator.id is required",
				"operator.role is required",
			],
		});

		expect(validateMcpToolInvocationResult({ invocationId: "invoke-2", status: "done" })).toEqual({
			valid: false,
			errors: [
				"status must be one of success, error, blocked",
				"startedAt is required",
				"finishedAt is required",
				"summary is required",
			],
		});

		expect(validateEvidenceRecord({ id: "evidence-2", validationStatus: "hypothesis" })).toEqual({
			valid: false,
			errors: [
				"observation is required",
				"source is required",
				"timestamp is required",
				"scope.allowedTargets must contain at least one target",
				"interpretation is required",
				"confidence must be one of low, medium, high",
				"validationStatus must be one of pending, validated, rejected",
			],
		});

		expect(validateHumanApprovalCheckpoint({ id: "approval-2", action: "allow" })).toEqual({
			valid: false,
			errors: ["reason is required", "requestedBy is required"],
		});

		expect(validateHandoffArtifact({ id: "handoff-2", evidenceIds: [] })).toEqual({
			valid: false,
			errors: [
				"fromDomain is required",
				"toDomain is required",
				"summary is required",
				"evidenceIds must contain at least one evidence id",
				"recommendations must contain at least one recommendation",
				"createdAt is required",
			],
		});
	});

	it("enforces MCP approval gates for destructive, high-impact, out-of-scope, and approved scoped actions", () => {
		const scopedInvocation = {
			id: "invoke-policy-1",
			server: "kali-mcp",
			tool: "nmap_scan",
			params: { target: "10.0.0.5" },
			intent: "Enumerate approved host exposure",
			scope: { tenant: "acme", environment: "prod", allowedTargets: ["10.0.0.5"] },
			operator: { id: "operator-1", role: "soc-analyst" },
		} satisfies McpToolInvocationRequest;

		expect(evaluateMcpInvocationPolicy({ ...scopedInvocation, tool: "hydra_attack" })).toEqual({
			action: "deny",
			blocked: true,
			reason: "Tool hydra_attack is destructive or policy-restricted",
		});
		expect(evaluateMcpInvocationPolicy({ ...scopedInvocation, params: { target: "10.0.0.99" } })).toEqual({
			action: "deny",
			blocked: true,
			reason: "Target 10.0.0.99 is outside the approved SOC scope",
		});
		expect(evaluateMcpInvocationPolicy(scopedInvocation)).toEqual({
			action: "require-human",
			blocked: true,
			reason: "Tool nmap_scan is high-impact and requires human approval",
		});
		expect(
			evaluateMcpInvocationPolicy(scopedInvocation, {
				id: "approval-1",
				action: "allow",
				reason: "Approved scoped enumeration",
				requestedBy: "soc-orchestrator",
				approvedBy: "operator-1",
				decidedAt: "2026-05-12T18:29:00.000Z",
			}),
		).toEqual({
			action: "allow",
			blocked: false,
			reason: "Approved scoped enumeration",
		});
	});

	it("rejects Gemini CLI as a hidden mandatory SOC dependency while allowing MCP-only workflows", () => {
		expect(evaluateGeminiDependencyPolicy(["kali-mcp", "engram"])).toEqual({ valid: true, errors: [] });
		expect(evaluateGeminiDependencyPolicy(["kali-mcp", "gemini-cli"])).toEqual({
			valid: false,
			errors: ["Gemini CLI must not be required for baseline SOC compliance"],
		});
	});

	it("normalizes MCP results into pending evidence and records auditable validation transitions", () => {
		const scope = { tenant: "acme", environment: "prod", allowedTargets: ["10.0.0.5"] };
		const invocation = {
			id: "invoke-evidence-1",
			server: "kali-mcp",
			tool: "nmap_scan",
			params: { target: "10.0.0.5" },
			intent: "Verify service exposure",
			scope,
			operator: { id: "operator-1", role: "soc-analyst" },
		} satisfies McpToolInvocationRequest;
		const result = {
			invocationId: invocation.id,
			status: MCP_INVOCATION_STATUS.SUCCESS,
			startedAt: "2026-05-12T18:30:00.000Z",
			finishedAt: "2026-05-12T18:31:00.000Z",
			outputRef: "engram://evidence/raw/invoke-evidence-1",
			summary: "Host exposes SSH only",
		} satisfies McpToolInvocationResult;

		const pendingEvidence = normalizeEvidenceRecord({
			id: "evidence-normalized-1",
			invocation,
			result,
			observation: result.summary,
			interpretation: "SSH exposure is expected for this bastion host",
			confidence: "medium",
		});

		expect(pendingEvidence).toEqual({
			id: "evidence-normalized-1",
			observation: "Host exposes SSH only",
			source: "kali-mcp:nmap_scan",
			timestamp: "2026-05-12T18:31:00.000Z",
			scope,
			interpretation: "SSH exposure is expected for this bastion host",
			confidence: "medium",
			validationStatus: EVIDENCE_VALIDATION_STATUS.PENDING,
			toolInvocationId: invocation.id,
			rawRef: result.outputRef,
		});

		expect(transitionEvidenceValidationStatus(pendingEvidence, EVIDENCE_VALIDATION_STATUS.VALIDATED)).toEqual({
			...pendingEvidence,
			validationStatus: EVIDENCE_VALIDATION_STATUS.VALIDATED,
		});
		expect(
			transitionEvidenceValidationStatus(
				pendingEvidence,
				EVIDENCE_VALIDATION_STATUS.REJECTED,
				"Raw output missing host evidence",
			),
		).toEqual({
			...pendingEvidence,
			validationStatus: EVIDENCE_VALIDATION_STATUS.REJECTED,
			rejectionReason: "Raw output missing host evidence",
		});
		expect(() => transitionEvidenceValidationStatus(pendingEvidence, EVIDENCE_VALIDATION_STATUS.REJECTED)).toThrow(
			"Rejected evidence requires an auditable rejection reason",
		);
	});

	it("links SOC decision, invocation, evidence, validation, and handoff records through an in-memory Engram adapter", async () => {
		const writes: SocAuditRecordLink[] = [];
		const adapter: SocEvidencePersistenceAdapter = {
			persistDecision: async (checkpoint) => {
				const write = {
					topicKey: `soc/decision/${checkpoint.id}`,
					sourceId: checkpoint.id,
					recordType: SOC_AUDIT_RECORD_TYPE.DECISION,
				};
				writes.push(write);
				return write;
			},
			persistInvocation: async (result) => {
				const write = {
					topicKey: `soc/invocation/${result.invocationId}`,
					sourceId: result.invocationId,
					recordType: SOC_AUDIT_RECORD_TYPE.INVOCATION,
				};
				writes.push(write);
				return write;
			},
			persistEvidence: async (record) => {
				const write = {
					topicKey: `soc/evidence/${record.id}`,
					sourceId: record.id,
					recordType: SOC_AUDIT_RECORD_TYPE.EVIDENCE,
				};
				writes.push(write);
				return write;
			},
			persistValidation: async (record) => {
				const write = {
					topicKey: `soc/validation/${record.id}`,
					sourceId: record.id,
					recordType: SOC_AUDIT_RECORD_TYPE.VALIDATION,
				};
				writes.push(write);
				return write;
			},
			persistHandoff: async (handoff) => {
				const write = {
					topicKey: `soc/handoff/${handoff.id}`,
					sourceId: handoff.id,
					recordType: SOC_AUDIT_RECORD_TYPE.HANDOFF,
				};
				writes.push(write);
				return write;
			},
		};
		const approval = {
			id: "approval-integration-1",
			action: "allow",
			reason: "Approved scoped workflow",
			requestedBy: "soc-orchestrator",
			approvedBy: "operator-1",
			decidedAt: "2026-05-12T18:29:00.000Z",
		} satisfies HumanApprovalCheckpoint;
		const invocationResult = {
			invocationId: "invoke-integration-1",
			status: MCP_INVOCATION_STATUS.SUCCESS,
			startedAt: "2026-05-12T18:30:00.000Z",
			finishedAt: "2026-05-12T18:31:00.000Z",
			outputRef: "engram://evidence/raw/invoke-integration-1",
			summary: "No unexpected open ports",
		} satisfies McpToolInvocationResult;
		const evidence = {
			id: "evidence-integration-1",
			observation: invocationResult.summary,
			source: "kali-mcp:nmap_scan",
			timestamp: invocationResult.finishedAt,
			scope: { tenant: "acme", environment: "prod", allowedTargets: ["10.0.0.5"] },
			interpretation: "No escalation needed",
			confidence: "high",
			validationStatus: EVIDENCE_VALIDATION_STATUS.VALIDATED,
			toolInvocationId: invocationResult.invocationId,
			rawRef: invocationResult.outputRef,
		} satisfies EvidenceRecord;
		const handoff = {
			id: "handoff-integration-1",
			fromDomain: DOMAIN.SOC,
			toDomain: DOMAIN.BLUE_TEAM,
			summary: "SOC triage completed",
			evidenceIds: [evidence.id],
			recommendations: ["Close alert as expected exposure"],
			createdAt: "2026-05-12T18:32:00.000Z",
		} satisfies HandoffArtifact;

		await adapter.persistDecision(approval);
		await adapter.persistInvocation(invocationResult);
		await adapter.persistEvidence(evidence);
		await adapter.persistValidation(evidence);
		await adapter.persistHandoff(handoff);

		expect(writes).toEqual([
			{ topicKey: "soc/decision/approval-integration-1", sourceId: approval.id, recordType: "decision" },
			{
				topicKey: "soc/invocation/invoke-integration-1",
				sourceId: invocationResult.invocationId,
				recordType: "invocation",
			},
			{ topicKey: "soc/evidence/evidence-integration-1", sourceId: evidence.id, recordType: "evidence" },
			{ topicKey: "soc/validation/evidence-integration-1", sourceId: evidence.id, recordType: "validation" },
			{ topicKey: "soc/handoff/handoff-integration-1", sourceId: handoff.id, recordType: "handoff" },
		]);
		expect(handoff.evidenceIds).toEqual([evidence.id]);
	});

	it("flags missing required audit record types as audit-gap non-compliance", () => {
		const persistedLinks: SocAuditRecordLink[] = [
			{ topicKey: "soc/decision/approval-1", sourceId: "approval-1", recordType: SOC_AUDIT_RECORD_TYPE.DECISION },
			{ topicKey: "soc/invocation/invoke-1", sourceId: "invoke-1", recordType: SOC_AUDIT_RECORD_TYPE.INVOCATION },
			{ topicKey: "soc/evidence/evidence-1", sourceId: "evidence-1", recordType: SOC_AUDIT_RECORD_TYPE.EVIDENCE },
		];

		expect(evaluateAuditPersistenceCompleteness(persistedLinks)).toEqual({
			compliant: false,
			missingRecordTypes: [SOC_AUDIT_RECORD_TYPE.VALIDATION, SOC_AUDIT_RECORD_TYPE.HANDOFF],
			reason: "Missing required SOC audit records: validation, handoff",
		});
		expect(
			evaluateAuditPersistenceCompleteness([
				...persistedLinks,
				{
					topicKey: "soc/validation/evidence-1",
					sourceId: "evidence-1",
					recordType: SOC_AUDIT_RECORD_TYPE.VALIDATION,
				},
				{ topicKey: "soc/handoff/handoff-1", sourceId: "handoff-1", recordType: SOC_AUDIT_RECORD_TYPE.HANDOFF },
			]),
		).toEqual({ compliant: true, missingRecordTypes: [], reason: "All required SOC audit records were persisted" });
	});
});
