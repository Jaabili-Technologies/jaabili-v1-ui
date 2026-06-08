import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const result = spawnSync(command, ["--dir", "apps/main-ui", "run", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    PORT: process.env.PORT ?? "3002",
    BASE_PATH: process.env.BASE_PATH ?? "/",
  },
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
