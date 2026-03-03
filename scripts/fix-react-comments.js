const fs = require("fs");

const lintOutput = fs.readFileSync("lint-results-json.json", "utf8");
const results = JSON.parse(lintOutput);
let fixedCount = 0;

for (const fileResult of results) {
  const filePath = fileResult.filePath;
  const messages = fileResult.messages.filter(
    (m) => m.ruleId === "react/jsx-no-comment-textnodes",
  );

  if (messages.length === 0) continue;

  let content = fs.readFileSync(filePath, "utf8");
  let lines = content.split("\n");
  let modified = false;

  for (const msg of messages) {
    const lineIdx = msg.line - 1;
    // Sometimes the error is on the line below the comment.
    // Let's check this line and the line above it.
    for (let i = Math.max(0, lineIdx - 1); i <= lineIdx + 1; i++) {
      if (lines[i].includes("// eslint-disable-next-line")) {
        lines[i] = lines[i]
          .replace(
            "// eslint-disable-next-line",
            "{/* eslint-disable-next-line",
          )
          .replace(/$/, " */}");
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join("\n"));
    fixedCount++;
    console.log(`Fixed JSX comment in ${filePath}`);
  }
}

console.log(`Total files fixed: ${fixedCount}`);
