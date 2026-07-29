import { cpSync, existsSync, rmSync } from "node:fs";

if (!existsSync("out")) {
  throw new Error("Next.js did not produce the expected out directory.");
}

rmSync("dist", { recursive: true, force: true });
cpSync("out", "dist", { recursive: true });
