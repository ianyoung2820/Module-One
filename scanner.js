import fs from "node:fs/promises";
import path from "node:path";

/** Treat empty, "." or ".." as hidden. */
function isHidden(name) {
  return name === "" || name === "." || name === "..";
}

/** Create a canonical file record from a path and stat. */
function fileRecord(p, stat) {
  const parts = p.split(".");
  const extRaw = parts.length > 1 ? parts.pop() : "";
  const ext = (extRaw || "").toLowerCase();
  return { path: p, size: stat.size, ext: ext ? `.${ext}` : "(no-ext)" };
}

/**
 * Recursively walk a directory and return a list of file records.
 * Uses depth-first traversal, ignore list, and optional symlink following with cycle guard.
 */
export async function scanDir(root, { maxDepth = Infinity, ignore = new Set(), followSymlinks = false } = {}) {
  const results = [];
  const seenRealPaths = new Set(); // for symlink cycles

  async function walk(dir, depth) {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      // permission denied or not a directory
      return;
    }

    for (const ent of entries) {
      const name = ent.name;
      if (isHidden(name) || ignore.has(name)) continue;
      const full = path.join(dir, name);

      let lst;
      try {
        lst = await fs.lstat(full);
      } catch {
        continue;
      }

      if (lst.isSymbolicLink()) {
        if (!followSymlinks) continue;
        try {
          const real = await fs.realpath(full);
          if (seenRealPaths.has(real)) continue;
          seenRealPaths.add(real);
          const rst = await fs.stat(real);
          if (rst.isDirectory()) await walk(real, depth + 1);
          else if (rst.isFile()) results.push(fileRecord(real, rst));
        } catch {
          /* broken symlink or access issue; skip */
        }
        continue;
      }

      if (lst.isDirectory()) {
        await walk(full, depth + 1);
      } else if (lst.isFile()) {
        results.push(fileRecord(full, lst));
      }
    }
  }

  await walk(path.resolve(root), 0);
  return results;
}
