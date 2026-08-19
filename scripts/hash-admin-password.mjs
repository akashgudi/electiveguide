#!/usr/bin/env node
// Generates the admin password hash without ever writing the plaintext
// password to disk. Run locally, then copy the printed lines into
// .env.local (for `next dev`) and into your Vercel project's env vars
// (for the deployed site) — both accept the same three keys.
import { randomBytes, scryptSync } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";

const CTRL_C = "";
const BACKSPACE = "";
const DELETE = "";

// Non-interactive (e.g. piped input, used by automated tests): read all of
// stdin up front and hand back one line per call. Avoids readline's EOF
// lifecycle quirks when the whole input arrives before we start reading.
const fallbackLines = !process.stdin.isTTY ? readFileSync(0, "utf8").split("\n") : null;

function promptHidden(question) {
  if (fallbackLines) {
    process.stdout.write(question + "\n");
    return Promise.resolve(fallbackLines.shift() ?? "");
  }

  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let input = "";
    const onData = (char) => {
      if (char === "\n" || char === "\r") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(input);
        return;
      }
      if (char === CTRL_C) process.exit(1);
      if (char === BACKSPACE || char === DELETE) {
        input = input.slice(0, -1);
        return;
      }
      input += char;
    };
    stdin.on("data", onData);
  });
}

const password = await promptHidden("New admin password: ");
const confirm = await promptHidden("Confirm password: ");

if (password !== confirm) {
  console.error("Passwords did not match.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

const envPath = new URL("../.env.local", import.meta.url);
const lines = existsSync(envPath) ? readFileSync(envPath, "utf8").split("\n") : [];

function upsert(lines, key, value) {
  const line = `${key}="${value}"`;
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx >= 0) lines[idx] = line;
  else lines.push(line);
}

upsert(lines, "ADMIN_PASSWORD_SALT", salt);
upsert(lines, "ADMIN_PASSWORD_HASH", hash);

const hasSessionSecret = lines.some((l) => l.startsWith("ADMIN_SESSION_SECRET="));
if (!hasSessionSecret) {
  upsert(lines, "ADMIN_SESSION_SECRET", randomBytes(32).toString("hex"));
}

writeFileSync(envPath, lines.filter((l, i, arr) => l !== "" || i === arr.length - 1).join("\n"));

console.log("\nUpdated .env.local with ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET.");
console.log("Copy the same three keys into your Vercel project's Environment Variables so the deployed site can log in too:");
console.log("  vercel env add ADMIN_PASSWORD_SALT production");
console.log("  vercel env add ADMIN_PASSWORD_HASH production");
console.log("  vercel env add ADMIN_SESSION_SECRET production");
