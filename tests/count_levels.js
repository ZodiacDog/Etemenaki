const fs = require("fs");
const path = require("path");
const htmlPath = path.join(__dirname, "..", "ETEMENAKI_50_LEVELS.html");
const t = fs.readFileSync(htmlPath, "utf8");
if (!t.includes("<!DOCTYPE html>")) {
  throw new Error("ETEMENAKI_50_LEVELS.html is not an HTML document");
}
const i = t.indexOf("const ALL_LEVELS =");
if (i < 0) throw new Error("ALL_LEVELS not found");
const start = t.indexOf("[", i);

function extractArray(s, start) {
  let depth = 0, inStr = false, quote = "", escape = false;
  for (let k = start; k < s.length; k++) {
    const ch = s[k];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === quote) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = true; quote = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return s.slice(start, k + 1);
    }
  }
  return null;
}

const arrSrc = extractArray(t, start);
const data = eval("(" + arrSrc + ")");
if (data.length !== 50) throw new Error("expected 50 levels, got " + data.length);
const ids = data.map((l) => l.id).sort((a, b) => a - b);
if (ids[0] !== 1 || ids[49] !== 50) throw new Error("level ids are not 1..50");
const sums = { examples: 0, practices: 0, games: 0, assessment: 0 };
for (const L of data) {
  sums.examples += (L.examples || []).length;
  sums.practices += (L.practices || []).length;
  sums.games += (L.games || []).length;
  sums.assessment += (L.assessment || []).length;
}
if (sums.examples !== 200 || sums.practices !== 200 || sums.games !== 200 || sums.assessment !== 250) {
  throw new Error("content counts changed: " + JSON.stringify(sums));
}
const cssBlocks = t.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
const braces = cssBlocks.reduce((n, b) => n + (b.split("{").length - 1), 0);
console.log("OK: 50 levels, 200 examples, 200 practices, 200 games, 250 assessment questions, css braces=", braces);
