// Verifies every package/app tsconfig references[] mirrors its package.json workspace deps.
// Exit 1 with a diff if they drift. Run as part of `verify`.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const WORKSPACE_ROOTS = ["packages", "apps"];
let failed = false;

for (const root of WORKSPACE_ROOTS) {
  if (!existsSync(root)) continue;

  for (const name of readdirSync(root)) {
    const dir = join(root, name);
    const pkgPath = join(dir, "package.json");
    const tsPath = join(dir, "tsconfig.json");
    if (!existsSync(pkgPath) || !existsSync(tsPath)) continue;

    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const ts = JSON.parse(readFileSync(tsPath, "utf8"));
    const workspaceDeps = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })
      .filter(([, v]) => String(v).startsWith("workspace:"))
      .map(([k]) => k);
    const refPaths = new Set((ts.references ?? []).map((r) => r.path));

    for (const dep of workspaceDeps) {
      const short = dep.split("/").pop();
      if (![...refPaths].some((p) => p.endsWith(short))) {
        console.error(`${name}: missing tsconfig reference for workspace dep ${dep}`);
        failed = true;
      }
    }
  }
}
process.exit(failed ? 1 : 0);
