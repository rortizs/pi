import type { CyberCapability, CyberCapabilityCategory } from "./types.js";

const CATEGORIES: CyberCapabilityCategory[] = [
	"soc",
	"blue-team",
	"authorized-red-team",
	"cti-osint",
	"browser-ops",
	"guardrail",
	"audit",
	"verification",
];

export const CYBER_CAPABILITY_CATALOG: CyberCapability[] = CATEGORIES.map((category) => ({
	id:
		category === "authorized-red-team"
			? "red-team.scoped-validation"
			: category === "browser-ops"
				? "browser.public-read"
				: category === "guardrail"
					? "guardrail.local-research"
					: category === "cti-osint"
						? "cti.public-resource"
						: `${category}.safe-stub`,
	title: `${category} cyber harness stub`,
	category,
	status: "enabled",
	purpose: "Declare a safe cyber harness capability boundary without executing tools.",
	allowedTools: ["read"],
	forbiddenBehaviors: ["external side effects", "credential abuse", "stealth", "anti-bot evasion"],
	approvalRequired: category === "authorized-red-team" || category === "browser-ops",
	evidenceRequired: true,
	auditEvents: ["policy.decided"],
	retention: "retain policy decision summaries without secrets",
	dualUse: category === "authorized-red-team" || category === "browser-ops" ? "high" : "low",
	defaultRisk: category === "authorized-red-team" || category === "browser-ops" ? "critical" : "low",
}));
