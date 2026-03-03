const fs = require("fs");
const glob = require("glob"); // Note: we can use a recursive readdir if glob isn't present, but let's just do a naive read
const path = require("path");

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function (file) {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          if (!file.includes("node_modules") && !file.includes(".next")) {
            walk(file, function (err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            if (!--pending) done(null, results);
          }
        } else {
          if (file.endsWith(".tsx")) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk("/home/alaar/Desktop/proDev/TheKitchen/yes/app", function (err, files) {
  if (err) throw err;
  let count = 0;
  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let lines = content.split("\n");
    let modified = false;
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].match(/^\s*\/\/ eslint-disable-next-line/)) {
        if (lines[i + 1].match(/^\s*[{<]/)) {
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
      fs.writeFileSync(file, lines.join("\n"));
      count++;
      console.log(`Fixed ${file}`);
    }
  });
  console.log(`Total fixed: ${count}`);
});
