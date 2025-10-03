# Overview

As a software engineer, I’m building a small Node.js command‑line tool to deepen my JavaScript skills beyond the browser and practice clean program structure. The tool—**Folder Insight**—scans a directory and prints a readable report to the terminal: total files and size, a breakdown by file extension, the largest files, and an optional tree view. The goal is to demonstrate practical use of core JavaScript features (functions, ES6 array methods) plus recursion and third‑party libraries.

What it does: 
Performs a depth‑first recursive walk of a target folder; aggregates results with ES6 array methods (`map`, `filter`, `reduce`, `sort`); prints a colorized summary and “top N” largest files; optionally prints a simple directory tree; handles common errors (bad path, permissions) with friendly messages.

Why I built it: 
This project gives me hands‑on practice with Node’s filesystem APIs, CLI ergonomics, and robust error handling, while keeping the scope small enough to finish in a sprint. It also sets a pattern (clear module boundaries, helpful README, video walkthrough) that I can reuse in future modules.

Demo Video (4–5 minutes):  
[Software Demo Video](https://youtu.be/-jnoe3sQIMY?si=qbCXCAIIszkSEoKZ)

# Development Environment

- Runtime: Node.js (LTS 18+)
- Language: JavaScript (ES Modules)
- Packages: `commander`, `chalk`, `dayjs`
- OS/Terminal: Windows/macOS/Linux; PowerShell/Bash/zsh
- Editor: VS Code

# Useful Websites

- [Node.js fs (File System) Docs](https://nodejs.org/api/fs.html)  
- [Node.js path Docs](https://nodejs.org/api/path.html)  
- [commander.js](https://github.com/tj/commander.js/)  
- [chalk](https://github.com/chalk/chalk)  
- [dayjs](https://day.js.org/)  
- [Markdown Guide — Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)  
- [GitHub Docs — Create a Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)

# To Run

```bash
# 1) Install dependencies
npm install

# 2) Run against the current folder (top 10 files)
node index.js --path . --top 10

# 3) Add a tree view (limited depth) and ignore heavy folders
node index.js --path . --tree --max-depth 2 --ignore node_modules,.git

# 4) Optional: link globally for convenience
npm link
folder-insight --path ~/Documents --top 8 --tree
```
