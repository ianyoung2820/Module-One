import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";

/** Format bytes to a human-friendly string. */
function formatBytes(n) {
  if (n === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

/** Return "x.x%" string safely. */
function percent(part, whole) {
  if (!whole) return "0%";
  return `${((part / whole) * 100).toFixed(1)}%";
}

/** Summarize a list of file records into aggregate stats. */
export function summarize(files) {
  const totalFiles = files.length;
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const byExt = files.reduce((acc, f) => {
    acc[f.ext] = (acc[f.ext] || 0) + f.size;
    return acc;
  }, {});

  const byExtSorted = Object.entries(byExt)
    .map(([ext, bytes]) => ({ ext, bytes }))
    .sort((a, b) => b.bytes - a.bytes);

  const topFiles = [...files].sort((a, b) => b.size - a.size);

  return { totalFiles, totalBytes, byExtSorted, topFiles };
}

/** Print a human-friendly summary. */
export function printReport(stats, { top = 10 } = {}) {
  const { totalFiles, totalBytes, byExtSorted, topFiles } = stats;

  console.log(chalk.bold("\nSummary"));
  console.log(`${chalk.cyan("Files:")} ${totalFiles.toLocaleString()}`);
  console.log(`${chalk.cyan("Total size:")} ${formatBytes(totalBytes)}`);

  console.log(chalk.bold("\nBy Extension (top 10)"));
  byExtSorted.slice(0, 10).forEach(({ ext, bytes }) => {
    console.log(`${ext.padEnd(10)}  ${formatBytes(bytes).padStart(10)}  (${percent(bytes, totalBytes)})`);
  });

  console.log(chalk.bold(`\nLargest Files (top ${top})`));
  topFiles.slice(0, top).forEach((f, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${formatBytes(f.size).padStart(10)}  ${f.path}`);
  });
}

/** Print a simple tree view (directories first). */
export async function printTree(root, { maxDepth = 3, ignore = new Set() } = {}) {
  root = path.resolve(root);
  console.log(root);

  async function walk(dir, depth, prefix) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
    const lastIdx = entries.length - 1;
    for (let i = 0; i < entries.length; i++) {
      const ent = entries[i];
      if (ignore.has(ent.name)) continue;
      const isLast = i == lastIdx;
      const connector = isLast ? "└── " : "├── ";
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      const label = ent.isDirectory() ? chalk.bold(ent.name) : ent.name;
      console.log(prefix + connector + label);
      if (ent.isDirectory()) await walk(path.join(dir, ent.name), depth + 1, nextPrefix);
    }
  }

  await walk(root, 1, "");
}
