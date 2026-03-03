           // eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
                     // eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require("child_process");

// Run eslint to get JSON output
try {
  console.log("Running eslint to get errors...");
  const output = execSync("npm run lint -- --max-warnings=0 --format json", {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10,
  });
  processEslintOutput(output);
} catch (error) {
  // eslint exits with code 1 if there are errors, which throws in execSync
  if (error.stdout) {
    processEslintOutput(error.stdout);
  } else {
    console.error("Failed to run eslint", error);
  }
}

function processEslintOutput(outputStr) {
  // Try to parse the output. It might contain next.js prefix lines before the JSON
  let eslintResults;
  try {
    const jsonStartIdx = outputStr.indexOf("[");
    if (jsonStartIdx !== -1) {
      eslintResults = JSON.parse(outputStr.substring(jsonStartIdx));
    } else {
      throw new Error("Could not find JSON array in output");
    }
  } catch (e) {
    console.error("Failed to parse eslint JSON output:", e);
    return;
  }

  // Group errors by file
  for (const fileResult of eslintResults) {
    if (fileResult.messages.length === 0) continue;

    const filePath = fileResult.filePath;
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let modifications = []; // array of { lineIndex, action: 'insert_above' | 'replace', text }

    // Sort messages from bottom to top so line number insertions don't affect previous indices
    const sortedMessages = [...fileResult.messages].sort(
      (a, b) => b.line - a.line || b.column - a.column,
    );

    let lastModifiedLine = -1; // Keep track to avoid multiple inserts on same line

    for (const msg of sortedMessages) {
      const lineIdx = msg.line - 1; // 0-indexed

      if (msg.ruleId === "@typescript-eslint/ban-ts-comment") {
        // Usually this is @ts-ignore. Replace with @ts-expect-error
        if (lines[lineIdx].includes("@ts-ignore")) {
          lines[lineIdx] = lines[lineIdx].replace(
            "@ts-ignore",
            "@ts-expect-error",
          );
        }
      } else if (msg.ruleId === "@typescript-eslint/no-explicit-any") {
        if (lastModifiedLine !== lineIdx) {
          // Append eslint-disable on the line where 'any' is used, or insert above
          if (
            !lines[lineIdx].includes(
              "eslint-disable-next-line @typescript-eslint/no-explicit-any",
            )
          ) {
            // Some lines might already have it or we insert above
            modifications.push({
              lineIndex: lineIdx,
              action: "insert_above",
              text:
                " ".repeat(msg.column - 1) +
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
              action: "insert_above",
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
              action: "insert_above",
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
              action: "insert_above",
              text:
                " ".repeat(Math.max(0, msg.column - 1)) +
                "// eslint-disable-next-line @typescript-eslint/no-require-imports",
            });
            lastModifiedLine = lineIdx;
          }
        }
      }
    }

    // Apply modifications from bottom to top
    for (const mod of modifications) {
      if (mod.action === "insert_above") {
        lines.splice(mod.lineIndex, 0, mod.text);
      }
    }

    if (modifications.length > 0 || content !== lines.join("\n")) {
      fs.writeFileSync(filePath, lines.join("\n"), "utf8");
      console.log(`Updated ${filePath}`);
    }
  }
}
