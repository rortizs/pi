import { describe, expect, it } from "vitest";
import { CYBER_CAPABILITY_CATALOG } from "../../../src/core/cyber-harness/catalog.js";
import { evaluateCyberAction } from "../../../src/core/cyber-harness/policy.js";
import type { CyberCapability } from "../../../src/core/cyber-harness/types.js";

describe("pi cyber harness deny-by-default policy", () => {
	it("denies unknown cyber capabilities as unregistered", () => {
		const decision = evaluateCyberAction({
			capabilityId: "unknown.capability",
			action: "summarize local notes",
			classification: "local-docs-research",
		});

		expect(decision.decision).toBe("deny");
		expect(decision.reason).toBe("unregistered capability");
		expect(decision.auditable).toBe(true);
	});

	it("blocks capabilities with missing policy metadata", () => {
		const incompleteCapability: CyberCapability = {
			id: "soc.incomplete",
			title: "Incomplete SOC action",
			category: "soc",
			status: "enabled",
			purpose: "Triage local alert notes without executing tools.",
		};

		const decision = evaluateCyberAction(
			{
				capabilityId: incompleteCapability.id,
				action: "triage alert",
				classification: "local-docs-research",
			},
			[incompleteCapability],
		);

		expect(decision.decision).toBe("blocked");
		expect(decision.reason).toBe("blocked-pending-policy");
	});

	it("blocks disabled capabilities before evaluating otherwise safe actions", () => {
		const disabledCapability: CyberCapability = {
			id: "guardrail.disabled-local-research",
			title: "Disabled local research",
			category: "guardrail",
			status: "disabled",
			purpose: "Declare a disabled local research boundary.",
			allowedTools: ["read"],
			forbiddenBehaviors: ["external side effects"],
			approvalRequired: false,
			evidenceRequired: true,
			auditEvents: ["policy.decided"],
			retention: "retain decision summaries",
			dualUse: "low",
			defaultRisk: "low",
		};

		const decision = evaluateCyberAction(
			{
				capabilityId: disabledCapability.id,
				action: "summarize local policy notes",
				classification: "local-docs-research",
			},
			[disabledCapability],
		);

		expect(decision.decision).toBe("blocked");
		expect(decision.reason).toBe("blocked-pending-policy");
		expect(decision.capabilityStatus).toBe("disabled");
	});

	it("blocks browser fingerprint and anti-bot evasion without explicit authorized testing policy", () => {
		const decision = evaluateCyberAction({
			capabilityId: "browser.public-read",
			action: "inject fingerprint headers and bypass captcha",
			classification: "browser-evasion",
			target: "https://example.test",
		});

		expect(decision.decision).toBe("deny");
		expect(decision.reason).toBe("browser-evasion-blocked");
		expect(decision.risk).toBe("critical");
	});

	it("blocks authorized Red-Team active action without scope", () => {
		const decision = evaluateCyberAction({
			capabilityId: "red-team.scoped-validation",
			action: "run active validation",
			classification: "active-red-team",
			target: "internal-app",
		});

		expect(decision.decision).toBe("deny");
		expect(decision.reason).toBe("missing-authorization-scope");
	});

	it("allows complete read-only local docs research and marks it auditable", () => {
		const decision = evaluateCyberAction({
			capabilityId: "guardrail.local-research",
			action: "summarize local policy notes",
			classification: "local-docs-research",
		});

		expect(decision).toMatchObject({
			decision: "allow",
			reason: "read-only-local-research-allowed",
			risk: "low",
			auditable: true,
		});
	});

	it("requires source metadata before allowing read-only public CTI/OSINT classification", () => {
		const decision = evaluateCyberAction({
			capabilityId: "cti.public-resource",
			action: "classify public advisory",
			classification: "public-cti-osint",
			target: "public advisory",
		});

		expect(decision.decision).toBe("blocked");
		expect(decision.reason).toBe("public-cti-source-metadata-required");
	});

	it("allows read-only public CTI/OSINT only when source metadata is present", () => {
		const decision = evaluateCyberAction({
			capabilityId: "cti.public-resource",
			action: "classify public advisory",
			classification: "public-cti-osint",
			target: "public advisory",
			source: {
				urlOrId: "https://example.test/advisory",
				collectedAt: "2026-05-19T00:00:00.000Z",
			},
		});

		expect(decision.decision).toBe("allow");
		expect(decision.reason).toBe("public-cti-read-only-allowed");
		expect(decision.risk).toBe("medium");
	});

	it("requires approval for state-changing SOC actions and does not auto-execute", () => {
		const decision = evaluateCyberAction({
			capabilityId: "soc.safe-stub",
			action: "block suspicious IP",
			classification: "state-changing-soc",
			target: "198.51.100.10",
		});

		expect(decision.decision).toBe("approval-required");
		expect(decision.reason).toBe("state-changing-action-requires-approval");
		expect(decision.auditable).toBe(true);
	});

	it("contains initial safe stubs for all cyber harness categories", () => {
		expect(CYBER_CAPABILITY_CATALOG.map((capability) => capability.category).sort()).toEqual([
			"audit",
			"authorized-red-team",
			"blue-team",
			"browser-ops",
			"cti-osint",
			"guardrail",
			"soc",
			"verification",
		]);
	});
});
