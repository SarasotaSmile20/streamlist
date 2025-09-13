#!/usr/bin/env node
const { existsSync } = require("fs");
const { join } = require("path");

function fail(msg) {
  console.error("\n[streamlist] Preflight check failed:\n" + msg + "\n");
  process.exit(1);
}

// Check Node version range compatible with CRA 5
const major = parseInt(process.versions.node.split(".")[0], 10);
if (Number.isFinite(major) && (major < 14 || major >= 23)) {
  console.warn(
    `\n[streamlist] Warning: Node ${process.versions.node} may be incompatible with CRA 5.\n` +
      `Use Node >=14 and <23 for best results.\n`
  );
}

// Ensure react-scripts is actually installed
const RS = join(process.cwd(), "node_modules", "react-scripts", "scripts", "start.js");
if (!existsSync(RS)) {
  fail(
    "react-scripts is not installed correctly.\n" +
      "Try a clean install:\n\n" +
      "  rm -rf node_modules package-lock.json\n" +
      "  npm cache clean --force\n" +
      "  npm install\n\n" +
      "If using yarn/pnpm, remove their lockfile and node_modules, then install."
  );
}

// Everything looks OK
process.exit(0);

