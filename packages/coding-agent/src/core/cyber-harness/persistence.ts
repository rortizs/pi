import type { CyberCapabilityCategory } from "./types.js";

export type CyberResourceTrust = "trusted" | "unverified" | "dual-use";
export type CyberPersistenceTarget = "engram" | "obsidian";
export type CyberPersistenceStatus = "saved" | "skipped" | "unavailable";

export interface CyberResourceNote {
	id: string;
	what: string;
	why: string;
	where: string;
	classification: CyberCapabilityCategory;
	trust: CyberResourceTrust;
	dualUseCautions: string[];
	suggestedUse: string;
}

export interface CyberResourceNoteInput {
	id: string;
	what: string;
	why: string;
	where: string;
	classification: CyberCapabilityCategory;
	trust: CyberResourceTrust;
	dualUseCautions?: string[];
	suggestedUse: string;
}

export interface CyberPersistenceResult {
	status: CyberPersistenceStatus;
	target: CyberPersistenceTarget;
	noteId?: string;
	summary: string;
}

export interface CyberPersistenceAdapter {
	target: CyberPersistenceTarget;
	available: boolean;
	save(note: CyberResourceNote): Promise<CyberPersistenceResult>;
}

export interface CyberPersistenceAdapters {
	engram?: CyberPersistenceAdapter;
	obsidian?: CyberPersistenceAdapter;
}

export interface CyberResourcePreservationResult {
	note: CyberResourceNote;
	targets: CyberPersistenceResult[];
}

export function createCyberResourceNote(input: CyberResourceNoteInput): CyberResourceNote {
	const dualUseCautions = input.dualUseCautions ?? [];
	return {
		...input,
		dualUseCautions:
			input.trust === "dual-use" && dualUseCautions.length === 0
				? ["Preserve for analysis only; use operationally only with explicit authorization."]
				: dualUseCautions,
	};
}

export async function preserveCyberResource(
	input: CyberResourceNoteInput | CyberResourceNote,
	adapters: CyberPersistenceAdapters,
): Promise<CyberResourcePreservationResult> {
	const note = createCyberResourceNote(input);
	const targets = await Promise.all([
		preserveWithAdapter(note, "engram", adapters.engram),
		preserveWithAdapter(note, "obsidian", adapters.obsidian),
	]);

	return { note, targets };
}

async function preserveWithAdapter(
	note: CyberResourceNote,
	target: CyberPersistenceTarget,
	adapter: CyberPersistenceAdapter | undefined,
): Promise<CyberPersistenceResult> {
	if (!adapter || !adapter.available) {
		return {
			status: "unavailable",
			target,
			summary: `${target} adapter unavailable; structured resource note was not persisted.`,
		};
	}

	if (note.trust === "unverified") {
		return {
			status: "skipped",
			target,
			summary: "Unverified cyber resource was not persisted as a trusted reference.",
		};
	}

	return adapter.save(note);
}
