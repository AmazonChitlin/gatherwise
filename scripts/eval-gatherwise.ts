import { runGatherwiseEvaluation, writeGatherwiseEvaluationArtifacts } from "@/lib/evaluation/gatherwise-harness";

async function main() {
  const mode = process.argv.includes("--live") ? "live" : "offline";
  const report = await runGatherwiseEvaluation({ mode });
  const artifacts = writeGatherwiseEvaluationArtifacts(report);

  process.stdout.write(
    [
      `Gatherwise evaluation complete.`,
      `Mode: ${report.mode}`,
      `Dataset: ${report.datasetVersion}`,
      `Scenarios: ${report.scenarioCount}`,
      `JSON: ${artifacts.jsonPath}`,
      `Markdown: ${artifacts.markdownPath}`,
      `Docs: ${artifacts.docsPath}`
    ].join("\n") + "\n"
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Evaluation failed."}\n`);
  process.exitCode = 1;
});
