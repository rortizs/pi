/**
 * SOC/MCP/evidence boundary contracts for Pi runtime scaffolding.
 * Pi owns these contract shapes; SOC orchestration, Kali tooling, and Engram persistence stay external boundaries.
 */

export const DOMAIN = {
	SOC: "soc",
	BLUE_TEAM: "blue-team",
	RED_TEAM: "red-team",
} as const;

export type SocDomain = (typeof DOMAIN)[keyof typeof DOMAIN];

export const SOC_INPUT_KIND = {
	ALERT: "alert",
	INDICATOR: "indicator",
} as const;

export type SocInputKind = (typeof SOC_INPUT_KIND)[keyof typeof SOC_INPUT_KIND];

export const URGENCY = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
	CRITICAL: "critical",
} as const;

export type Urgency = (typeof URGENCY)[keyof typeof URGENCY];

export const MCP_INVOCATION_STATUS = {
	SUCCESS: "success",
	ERROR: "error",
	BLOCKED: "blocked",
} as const;

export type McpInvocationStatus = (typeof MCP_INVOCATION_STATUS)[keyof typeof MCP_INVOCATION_STATUS];

export const CONFIDENCE = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
} as const;

export type Confidence = (typeof CONFIDENCE)[keyof typeof CONFIDENCE];

export const EVIDENCE_VALIDATION_STATUS = {
	PENDING: "pending",
	VALIDATED: "validated",
	REJECTED: "rejected",
} as const;

export type EvidenceValidationStatus = (typeof EVIDENCE_VALIDATION_STATUS)[keyof typeof EVIDENCE_VALIDATION_STATUS];

export const HUMAN_APPROVAL_ACTION = {
	ALLOW: "allow",
	DENY: "deny",
	REQUIRE_HUMAN: "require-human",
} as const;

export type HumanApprovalAction = (typeof HUMAN_APPROVAL_ACTION)[keyof typeof HUMAN_APPROVAL_ACTION];

export interface SocTaskInput {
	kind: SocInputKind;
	value: string;
	source: string;
}

export interface SocTaskScope {
	tenant?: string;
	environment?: string;
	allowedTargets: string[];
}

export interface SocTaskRequest {
	id: string;
	domain: SocDomain;
	input: SocTaskInput;
	scope: SocTaskScope;
	urgency: Urgency;
}

export interface McpToolOperatorContext {
	id: string;
	role: string;
}

export interface McpToolInvocationRequest {
	id: string;
	server: string;
	tool: string;
	params: Record<string, unknown>;
	intent: string;
	scope: SocTaskScope;
	operator: McpToolOperatorContext;
	approvalId?: string;
}

export interface McpToolInvocationResult {
	invocationId: string;
	status: McpInvocationStatus;
	startedAt: string;
	finishedAt: string;
	outputRef?: string;
	summary: string;
	error?: string;
}

export interface EvidenceRecord {
	id: string;
	observation: string;
	source: string;
	timestamp: string;
	scope: SocTaskScope;
	interpretation: string;
	confidence: Confidence;
	validationStatus: EvidenceValidationStatus;
	toolInvocationId?: string;
	rawRef?: string;
	rejectionReason?: string;
}

export interface HumanApprovalCheckpoint {
	id: string;
	action: HumanApprovalAction;
	reason: string;
	requestedBy: string;
	approvedBy?: string;
	decidedAt?: string;
}

export interface HandoffArtifact {
	id: string;
	fromDomain: SocDomain;
	toDomain: SocDomain;
	summary: string;
	evidenceIds: string[];
	recommendations: string[];
	createdAt: string;
}

export interface ContractValidationResult {
	valid: boolean;
	errors: string[];
}

function result(errors: string[]): ContractValidationResult {
	return { valid: errors.length === 0, errors };
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nestedRecord(value: Record<string, unknown>, key: string): Record<string, unknown> {
	const child = value[key];
	return isRecord(child) ? child : {};
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function hasAllowedValue<T extends Record<string, string>>(values: T, value: unknown): value is T[keyof T] {
	return typeof value === "string" && Object.values(values).includes(value);
}

function hasNonEmptyStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function validateRequiredString(record: Record<string, unknown>, key: string, errors: string[], label = key): void {
	if (!isNonEmptyString(record[key])) errors.push(`${label} is required`);
}

function validateEnum<T extends Record<string, string>>(
	record: Record<string, unknown>,
	key: string,
	values: T,
	errors: string[],
	label = key,
): void {
	if (!hasAllowedValue(values, record[key])) {
		errors.push(`${label} must be one of ${Object.values(values).join(", ")}`);
	}
}

function validateRequiredEnum<T extends Record<string, string>>(
	record: Record<string, unknown>,
	key: string,
	values: T,
	errors: string[],
	label = key,
): void {
	if (!isNonEmptyString(record[key])) {
		errors.push(`${label} is required`);
		return;
	}
	validateEnum(record, key, values, errors, label);
}

function validateScope(scope: unknown, errors: string[]): void {
	if (!isRecord(scope) || !hasNonEmptyStringArray(scope.allowedTargets)) {
		errors.push("scope.allowedTargets must contain at least one target");
	}
}

export function validateSocTaskRequest(value: unknown): ContractValidationResult {
	const record = isRecord(value) ? value : {};
	const input = nestedRecord(record, "input");
	const errors: string[] = [];

	validateRequiredString(record, "id", errors);
	validateRequiredEnum(record, "domain", DOMAIN, errors);
	validateRequiredEnum(input, "kind", SOC_INPUT_KIND, errors, "input.kind");
	validateRequiredString(input, "value", errors, "input.value");
	validateRequiredString(input, "source", errors, "input.source");
	validateScope(record.scope, errors);
	validateEnum(record, "urgency", URGENCY, errors);

	return result(errors);
}

export function validateMcpToolInvocationRequest(value: unknown): ContractValidationResult {
	const record = isRecord(value) ? value : {};
	const operator = nestedRecord(record, "operator");
	const errors: string[] = [];

	validateRequiredString(record, "id", errors);
	validateRequiredString(record, "server", errors);
	validateRequiredString(record, "tool", errors);
	if (!isRecord(record.params)) errors.push("params is required");
	validateRequiredString(record, "intent", errors);
	validateScope(record.scope, errors);
	validateRequiredString(operator, "id", errors, "operator.id");
	validateRequiredString(operator, "role", errors, "operator.role");

	return result(errors);
}

export function validateMcpToolInvocationResult(value: unknown): ContractValidationResult {
	const record = isRecord(value) ? value : {};
	const errors: string[] = [];

	validateRequiredString(record, "invocationId", errors);
	validateEnum(record, "status", MCP_INVOCATION_STATUS, errors);
	validateRequiredString(record, "startedAt", errors);
	validateRequiredString(record, "finishedAt", errors);
	validateRequiredString(record, "summary", errors);

	return result(errors);
}

export function validateEvidenceRecord(value: unknown): ContractValidationResult {
	const record = isRecord(value) ? value : {};
	const errors: string[] = [];

	validateRequiredString(record, "id", errors);
	validateRequiredString(record, "observation", errors);
	validateRequiredString(record, "source", errors);
	validateRequiredString(record, "timestamp", errors);
	validateScope(record.scope, errors);
	validateRequiredString(record, "interpretation", errors);
	validateEnum(record, "confidence", CONFIDENCE, errors);
	validateEnum(record, "validationStatus", EVIDENCE_VALIDATION_STATUS, errors);

	return result(errors);
}

export function validateHumanApprovalCheckpoint(value: unknown): ContractValidationResult {
	const record = isRecord(value) ? value : {};
	const errors: string[] = [];

	validateRequiredString(record, "id", errors);
	validateRequiredEnum(record, "action", HUMAN_APPROVAL_ACTION, errors);
	validateRequiredString(record, "reason", errors);
	validateRequiredString(record, "requestedBy", errors);

	return result(errors);
}

export function validateHandoffArtifact(value: unknown): ContractValidationResult {
	const record = isRecord(value) ? value : {};
	const errors: string[] = [];

	validateRequiredString(record, "id", errors);
	validateRequiredEnum(record, "fromDomain", DOMAIN, errors);
	validateRequiredEnum(record, "toDomain", DOMAIN, errors);
	validateRequiredString(record, "summary", errors);
	if (!hasNonEmptyStringArray(record.evidenceIds)) {
		errors.push("evidenceIds must contain at least one evidence id");
	}
	if (!hasNonEmptyStringArray(record.recommendations)) {
		errors.push("recommendations must contain at least one recommendation");
	}
	validateRequiredString(record, "createdAt", errors);

	return result(errors);
}
