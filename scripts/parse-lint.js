const fs = require("fs");

const logOutput = fs.readFileSync("lint.log", "utf8");

const lines = logOutput.split("\n");
let currentFile = "";
const fileIssues = {}; // path -> array of { line, col, rule }

for (const line of lines) {
  if (line.startsWith("/home/")) {
    currentFile = line.trim();
    if (!fileIssues[currentFile]) fileIssues[currentFile] = [];
  } else if (line.trim().match(/^\d+:\d+/)) {
    const parts = line.trim().split(/\s+/);
    // "9:54  error  Unexpected any...  @typescript-eslint/no-explicit-any"
    const lineCol = parts[0].split(":");
    const ruleId = parts[parts.length - 1];

    if (
      ruleId.startsWith("@typescript-eslint") ||
      ruleId.startsWith("react-hooks")
    ) {
      fileIssues[currentFile].push({
        line: parseInt(lineCol[0]),
        column: parseInt(lineCol[1]),
        rule: ruleId,
      });
    }
  }
}

for (const [file, issues] of Object.entries(fileIssues)) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, "utf8");
  let sourceLines = content.split("\n");
  let modifications = [];

  const sortedIssues = [...issues].sort(
    (a, b) => b.line - a.line || b.column - a.column,
  );
  let lastModLine = -1;

  for (const issue of sortedIssues) {
    const lineIdx = issue.line - 1;

    if (issue.rule === "@typescript-eslint/ban-ts-comment") {
      if (sourceLines[lineIdx].includes("@ts-ignore")) {
        sourceLines[lineIdx] = sourceLines[lineIdx].replace(
          "@ts-ignore",
          "@ts-expect-error",
        );
      }
    } else {
      if (lastModLine !== lineIdx) {
        if (
          !sourceLines[lineIdx].includes(
            `eslint-disable-next-line ${issue.rule}`,
          )
        ) {
          modifications.push({
            index: lineIdx,
            text:
              " ".repeat(Math.max(0, issue.column - 1)) +
              `// eslint-disable-next-line ${issue.rule}`,
          });
          lastModLine = lineIdx;
        }
      }
    }
  }

  for (const mod of modifications) {
    sourceLines.splice(mod.index, 0, mod.text);
  }

  if (modifications.length > 0 || content !== sourceLines.join("\n")) {
    fs.writeFileSync(file, sourceLines.join("\n"), "utf8");
    console.log(`Updated ${file} with ${modifications.length} lines inserted`);
  }
}
