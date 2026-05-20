import { describe, expect, it } from "vitest";
import {
	type CyberPersistenceAdapter,
	type CyberResourceNoteInput,
	createCyberResourceNote,
	preserveCyberResource,
} from "../../../src/core/cyber-harness/persistence.js";

const baseResource: CyberResourceNoteInput = {
	id: "resource-guardian-agent",
	what: "GuardianAgent describes security-first agent orchestration patterns.",
	why: "It informs cyber harness approval, audit, and boundary design.",
	where: "https://example.test/guardian-agent",
	classification: "cti-osint",
	trust: "trusted",
	dualUseCautions: ["Do not copy active offensive automation without authorization."],
	suggestedUse: "Use as reference material for policy and audit design.",
};

function availableAdapter(target: "engram" | "obsidian", savedId: string): CyberPersistenceAdapter {
	return {
		target,
		available: true,
		save: async (note) => ({
			status: "saved",
			target,
			noteId: savedId,
			summary: note.what,
		}),
	};
}

function unavailableAdapter(target: "engram" | "obsidian"): CyberPersistenceAdapter {
	return {
		target,
		available: false,
		save: async () => {
			throw new Error("unavailable adapter must not be called");
		},
	};
}

describe("pi cyber harness CTI/OSINT persistence adapters", () => {
	it("saves trusted resources through available Engram and Obsidian adapters", async () => {
		const result = await preserveCyberResource(baseResource, {
			engram: availableAdapter("engram", "memory-1"),
			obsidian: availableAdapter("obsidian", "project/pi/Cybersecurity Agent Resources.md"),
		});

		expect(result.note).toMatchObject({
			what: baseResource.what,
			why: baseResource.why,
			where: baseResource.where,
			classification: "cti-osint",
			trust: "trusted",
		});
		expect(result.targets).toEqual([
			expect.objectContaining({ status: "saved", target: "engram", noteId: "memory-1" }),
			expect.objectContaining({
				status: "saved",
				target: "obsidian",
				noteId: "project/pi/Cybersecurity Agent Resources.md",
			}),
		]);
	});

	it("returns unavailable without claiming persistence when adapters are unavailable", async () => {
		const result = await preserveCyberResource(baseResource, {
			engram: unavailableAdapter("engram"),
			obsidian: unavailableAdapter("obsidian"),
		});

		expect(result.targets).toEqual([
			expect.objectContaining({ status: "unavailable", target: "engram" }),
			expect.objectContaining({ status: "unavailable", target: "obsidian" }),
		]);
		expect(result.targets.every((target) => target.status !== "saved")).toBe(true);
	});

	it("skips unverified resources while preserving normalized fallback content", async () => {
		const note = createCyberResourceNote({
			...baseResource,
			trust: "unverified",
			why: "The source provenance could not be verified yet.",
			suggestedUse: "Track as a lead until an analyst validates the source.",
		});

		const result = await preserveCyberResource(note, {
			engram: availableAdapter("engram", "memory-unverified"),
			obsidian: availableAdapter("obsidian", "obsidian-unverified"),
		});

		expect(result.note.trust).toBe("unverified");
		expect(result.targets).toEqual([
			expect.objectContaining({ status: "skipped", target: "engram" }),
			expect.objectContaining({ status: "skipped", target: "obsidian" }),
		]);
		expect(result.note.suggestedUse).toContain("validates");
	});

	it("adds a default caution when a resource is classified as dual-use", () => {
		const note = createCyberResourceNote({
			...baseResource,
			trust: "dual-use",
			dualUseCautions: [],
		});

		expect(note.dualUseCautions.join(" ")).toContain("authorization");
	});

	it("retains dual-use cautions for red-team relevant resources", () => {
		const note = createCyberResourceNote({
			...baseResource,
			classification: "authorized-red-team",
			trust: "trusted",
			dualUseCautions: [
				"Use only inside documented authorization scope.",
				"Do not enable stealth, credential abuse, or third-party exploitation.",
			],
			suggestedUse: "Use for defensive validation planning only.",
		});

		expect(note.classification).toBe("authorized-red-team");
		expect(note.dualUseCautions).toContain("Use only inside documented authorization scope.");
		expect(note.dualUseCautions.join(" ")).toContain("third-party exploitation");
	});
});
