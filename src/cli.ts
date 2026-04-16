import { cac } from "cac";
import { scan } from "./index.ts";
import { REPORTERS } from "./reporters/index.ts";
import type { Format } from "./types.ts";

const VERSION = "0.1.0";

const toArray = (v: unknown): string[] => {
	if (Array.isArray(v)) return v.map(String);
	if (typeof v === "string" && v.length > 0) return [v];
	return [];
};

const isFormat = (v: unknown): v is Format =>
	v === "pretty" || v === "json" || v === "md";

type CliFlags = {
	format?: string;
	project?: string;
	include?: string | string[];
	exclude?: string | string[];
	deps?: boolean;
	failOnFound?: boolean;
};

const cli = cac("depretec");

cli
	.command("[...paths]", "Scan for @deprecated JSDoc usages")
	.option("-f, --format <fmt>", "Output format: pretty | json | md", {
		default: "pretty",
	})
	.option("-p, --project <path>", "Path to tsconfig.json")
	.option("--include <glob>", "Extra glob (repeatable)")
	.option("--exclude <glob>", "Exclude glob (repeatable)")
	.option("--no-deps", "Skip scanning node_modules for deprecation definitions")
	.option("--fail-on-found", "Exit with code 1 if any occurrence is found")
	.action(async (paths: string[], flags: CliFlags) => {
		const format = flags.format ?? "pretty";
		if (!isFormat(format)) {
			console.error(`Unknown format: ${format}. Use pretty | json | md.`);
			process.exit(2);
		}

		const cwd = paths[0] ?? process.cwd();
		const report = await scan({
			cwd,
			project: flags.project,
			include: toArray(flags.include),
			exclude: toArray(flags.exclude),
			noDeps: flags.deps === false,
		});

		console.log(REPORTERS[format](report, cwd));

		if (flags.failOnFound && report.occurrences.length > 0) {
			process.exit(1);
		}
	});

cli.help();
cli.version(VERSION);

try {
	cli.parse(process.argv, { run: false });
	await cli.runMatchedCommand();
} catch (err) {
	console.error(err instanceof Error ? err.message : err);
	process.exit(2);
}
