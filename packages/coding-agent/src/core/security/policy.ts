/**
 * Policy helpers keep SOC orchestration decisions auditable while Pi only evaluates boundary contracts.
 * Kali tooling never decides scope or approval for itself, and Gemini CLI is never a baseline dependency.
 */

import {
	HUMAN_APPROVAL_ACTION,
	type HumanApprovalAction,
	type HumanApprovalCheckpoint,
	type McpToolInvocationRequest,
} from "./contracts.js";

export interface PolicyEvaluationResult {
	action: HumanApprovalAction;
	blocked: boolean;
	reason: string;
}

export interface DependencyPolicyResult {
	valid: boolean;
	errors: string[];
}

const DESTRUCTIVE_OR_RESTRICTED_TOOLS = new Set(["hydra_attack", "metasploit_run", "sqlmap_scan"]);
const HIGH_IMPACT_TOOLS = new Set(["nmap_scan", "nikto_scan", "wpscan_analyze", "gobuster_scan", "dirb_scan"]);
const GEMINI_CLI_DEPENDENCY = "gemini-cli";

export function evaluateMcpInvocationPolicy(
	request: McpToolInvocationRequest,
	approval?: HumanApprovalCheckpoint,
): PolicyEvaluationResult {
	const target = extractTarget(request.params);

	if (DESTRUCTIVE_OR_RESTRICTED_TOOLS.has(request.tool)) {
		return deny(`Tool ${request.tool} is destructive or policy-restricted`);
	}

	if (target !== undefined && !request.scope.allowedTargets.includes(target)) {
		return deny(`Target ${target} is outside the approved SOC scope`);
	}

	if (HIGH_IMPACT_TOOLS.has(request.tool) && approval?.action !== HUMAN_APPROVAL_ACTION.ALLOW) {
		return {
			action: HUMAN_APPROVAL_ACTION.REQUIRE_HUMAN,
			blocked: true,
			reason: `Tool ${request.tool} is high-impact and requires human approval`,
		};
	}

	return {
		action: HUMAN_APPROVAL_ACTION.ALLOW,
		blocked: false,
		reason: approval?.reason ?? "SOC invocation is within approved scope",
	};
}

export function evaluateGeminiDependencyPolicy(requiredDependencies: string[]): DependencyPolicyResult {
	if (requiredDependencies.includes(GEMINI_CLI_DEPENDENCY)) {
		return { valid: false, errors: ["Gemini CLI must not be required for baseline SOC compliance"] };
	}

	return { valid: true, errors: [] };
}

function deny(reason: string): PolicyEvaluationResult {
	return { action: HUMAN_APPROVAL_ACTION.DENY, blocked: true, reason };
}

function extractTarget(params: Record<string, unknown>): string | undefined {
	const target = params.target;
	return typeof target === "string" && target.trim().length > 0 ? target : undefined;
}
