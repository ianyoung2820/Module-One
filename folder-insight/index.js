#!/usr/bin/env node
/**
 * Folder Insight (index.js)
 * Entry point for a Node.js CLI that scans a directory and prints a summary report.
 * Demonstrates output to screen, ES6 array methods, recursion, third-party libs, and exception handling.
 */
import { Command } from "commander";
import chalk from "chalk";
import dayjs from "dayjs";
import fs from "node:fs/promises";
import path from "node:path";
import { scanDir } from "./scanner.js";
import { summarize, printReport, printTree } from "./report.js";

/** Validate that the provided path exists and is a directory. Throw an Error if not. */
async function assertDirectory(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) throw new Error(`Not a directory: ${dirPath}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Unable to access "${dirPath}": ${msg}`);
  }
}

const program = new Command();
program
  .name("folder-insight")
  .description("Scan a directory and print size stats, breakdowns, and largest files.")
  .option("-p, --path <path>", "Directory to scan", ".")
  .option("--top <n>", "Show top N largest files", (v) => parseInt(v, 10), 10)
  .option("--tree", "Print a simple tree view", false)
  .option("--max-depth <n>", "Limit recursion depth", (v) => parseInt(v, 10))
  .option("--ignore <list>", "Comma-separated names to ignore (e.g., node_modules,.git)")
  .option("--follow-symlinks", "Follow symlinks (off by default)", false);

program.parse(process.argv);
const opts = program.opts();

const ignore = new Set((opts.ignore ? opts.ignore.split(",") : ["node_modules", ".git"]).map((s) => s.trim()));

(async () => {
  const started = Date.now();
  try {
    const target = path.resolve(opts.path);
    await assertDirectory(target);

    const files = await scanDir(target, {
      maxDepth: Number.isFinite(opts.maxDepth) ? opts.maxDepth : Infinity,
      ignore,
      followSymlinks: Boolean(opts.followSymlinks),
    });
    const stats = summarize(files);
    const elapsedMs = Date.now() - started;

    console.log(chalk.bold(`Folder Insight — ${chalk.cyan(target)} — ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`));
    printReport(stats, { top: opts.top });

    if (opts.tree) {
      console.log();
      console.log(chalk.bold("Tree View"));
      await printTree(target, {
        maxDepth: Number.isFinite(opts.maxDepth) ? opts.maxDepth : 3,
        ignore,
        followSymlinks: Boolean(opts.followSymlinks),
      });
    }

    console.log();
    console.log(chalk.dim(`Scan finished in ${(elapsedMs / 1000).toFixed(2)}s`));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red("Error:"), msg);
    process.exitCode = 1;
  }
})();
