import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

if (!existsSync("out")) {
  throw new Error("Next.js did not produce the expected out directory.");
}

rmSync("dist", { recursive: true, force: true });
cpSync("out", "dist", { recursive: true });

mkdirSync("dist/server", { recursive: true });
writeFileSync("dist/server/index.js", `export default {
  async fetch(request, env) {
    if (env.ASSETS?.fetch) return env.ASSETS.fetch(request);
    return new Response("Static asset binding unavailable.", { status: 503 });
  }
};
`);

mkdirSync("dist/.openai", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");
