const fs = require("fs");
const eslintResults = require("./eslint-results.json");

for (const fileResult of eslintResults) {
  if (fileResult.messages.length === 0) continue;

  const filePath = fileResult.filePath;
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf8");
  let lines = content.split("\n");
  let modifications = [];

  const sortedMessages = [...fileResult.messages].sort(
    (a, b) => b.line - a.line || b.column - a.column,
  );

  let lastModifiedLine = -1;

  for (const msg of sortedMessages) {
    const lineIdx = msg.line - 1;

    if (msg.ruleId === "@typescript-eslint/ban-ts-comment") {
      if (lines[lineIdx].includes("@ts-ignore")) {
        lines[lineIdx] = lines[lineIdx].replace(
          "@ts-ignore",
          "@ts-expect-error",
        );
      }
    } else if (msg.ruleId === "@typescript-eslint/no-explicit-any") {
      if (lastModifiedLine !== lineIdx) {
        if (
          !lines[lineIdx].includes(
            "eslint-disable-next-line @typescript-eslint/no-explicit-any",
          )
        ) {
          modifications.push({
            lineIndex: lineIdx,
            text:
              " ".repeat(Math.max(0, msg.column - 1)) +
              "// eslint-disable-next-line @typescript-eslint/no-explicit-any",
          });
          lastModifiedLine = lineIdx;
        }
      }
    } else if (msg.ruleId === "@typescript-eslint/no-unused-vars") {
      if (lastModifiedLine !== lineIdx) {
        if (
          !lines[lineIdx].includes(
            "eslint-disable-next-line @typescript-eslint/no-unused-vars",
          )
        ) {
          modifications.push({
            lineIndex: lineIdx,
            text:
              " ".repeat(Math.max(0, msg.column - 1)) +
              "// eslint-disable-next-line @typescript-eslint/no-unused-vars",
          });
          lastModifiedLine = lineIdx;
        }
      }
    } else if (msg.ruleId === "react-hooks/set-state-in-effect") {
      if (lastModifiedLine !== lineIdx) {
        if (
          !lines[lineIdx].includes(
            "eslint-disable-next-line react-hooks/set-state-in-effect",
          )
        ) {
          modifications.push({
            lineIndex: lineIdx,
            text:
              " ".repeat(Math.max(0, msg.column - 1)) +
              "// eslint-disable-next-line react-hooks/set-state-in-effect",
          });
          lastModifiedLine = lineIdx;
        }
      }
    } else if (msg.ruleId === "@typescript-eslint/no-require-imports") {
      if (lastModifiedLine !== lineIdx) {
        if (
          !lines[lineIdx].includes(
            "eslint-disable-next-line @typescript-eslint/no-require-imports",
          )
        ) {
          modifications.push({
            lineIndex: lineIdx,
            text:
              " ".repeat(Math.max(0, msg.column - 1)) +
              "// eslint-disable-next-line @typescript-eslint/no-require-imports",
          });
          lastModifiedLine = lineIdx;
        }
      }
    }
  }

  for (const mod of modifications) {
    lines.splice(mod.lineIndex, 0, mod.text);
  }

  if (modifications.length > 0 || content !== lines.join("\n")) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    console.log(
      `Updated ${filePath} with ${modifications.length} modifications`,
    );
  }
}
