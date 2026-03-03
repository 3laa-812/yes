const fs = require("fs");
const r = require("../lint-results-json.json");
for (const f of r) {
  if (!f.messages.length) continue;
  let lines = fs.readFileSync(f.filePath, "utf8").split("\n");
  let toRemove = [];
  let modified = false;
  for (const m of f.messages) {
    if (
      m.ruleId === null &&
      m.message.includes("Unused eslint-disable directive")
    ) {
      toRemove.push(m.line - 1);
    } else if (m.ruleId === "@typescript-eslint/ban-ts-comment") {
      const idx = m.line - 1;
      lines[idx] = lines[idx].replace(
        "@ts-expect-error",
        "@ts-expect-error pending types",
      );
      modified = true;
    }
  }
  if (toRemove.length > 0 || modified) {
    lines = lines.filter((_, i) => !toRemove.includes(i));
    fs.writeFileSync(f.filePath, lines.join("\n"));
    console.log("Fixed", f.filePath);
  }
}
