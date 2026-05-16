import { describe, expect, test } from "vitest";
import { selectToolReleaseAsset } from "../src/utils/tools-manager.js";

describe("tools-manager", () => {
	test("selects the newest fd release with a macOS x86_64 asset", () => {
		const asset = selectToolReleaseAsset("fd", "darwin", "x64", [
			{
				tag_name: "v10.4.2",
				assets: [
					{
						name: "fd-v10.4.2-aarch64-apple-darwin.tar.gz",
						browser_download_url: "https://example.test/fd-arm64",
					},
				],
			},
			{
				tag_name: "v10.3.0",
				assets: [
					{ name: "fd-v10.3.0-x86_64-apple-darwin.tar.gz", browser_download_url: "https://example.test/fd-x64" },
				],
			},
		]);

		expect(asset).toEqual({
			assetName: "fd-v10.3.0-x86_64-apple-darwin.tar.gz",
			downloadUrl: "https://example.test/fd-x64",
			version: "10.3.0",
		});
	});
});
