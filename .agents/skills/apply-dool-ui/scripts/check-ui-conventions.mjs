#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const explicitPaths = process.argv.slice(2);
const approvedLayoutAmbient =
  "bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.13),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.1),transparent_35%)]";

function gitLines(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0 && !result.stdout) return [];

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const changedPaths = explicitPaths.length
  ? explicitPaths
  : [
      ...gitLines(["diff", "--name-only", "--diff-filter=ACMR", "HEAD", "--", "app", "components"]),
      ...gitLines(["ls-files", "--others", "--exclude-standard", "--", "app", "components"]),
    ];

const files = [...new Set(changedPaths)].filter((path) => /\.(tsx|jsx)$/.test(path));
const checks = [
  {
    label: "literal color",
    pattern: /(?:#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\()/gi,
    help: "Use a semantic palette role from references/design-tokens.md.",
  },
  {
    label: "arbitrary Tailwind color",
    pattern: /\b(?:bg|text|border|ring|outline|fill|stroke)-\[#[^\]]+\]/g,
    help: "Use a documented semantic Tailwind color.",
  },
  {
    label: "arbitrary Tailwind spacing",
    pattern: /\b(?:[mp][trblxy]?|gap-[xy]?|space-[xy]|inset-[xy]?|top|right|bottom|left)-\[[^\]]+\]/g,
    help: "Use the standard spacing scale from references/design-tokens.md.",
  },
];

const failures = [];

for (const file of files) {
  const rawSource = readFileSync(file, "utf8");
  const source = /(?:^|\/)layout\.(tsx|jsx)$/.test(file)
    ? rawSource.replaceAll(approvedLayoutAmbient, "approved-layout-ambient")
    : rawSource;
  const lines = source.split("\n");

  for (const check of checks) {
    check.pattern.lastIndex = 0;
    for (const match of source.matchAll(check.pattern)) {
      const line = source.slice(0, match.index).split("\n").length;
      failures.push(`${file}:${line} ${check.label}: ${JSON.stringify(match[0])}\n  ${check.help}\n  ${lines[line - 1].trim()}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Dool UI convention check failed:\n\n${failures.join("\n\n")}`);
  process.exit(1);
}

console.log(
  files.length === 0
    ? "Dool UI convention check: no changed UI files."
    : `Dool UI convention check passed for ${files.length} file(s).`,
);
