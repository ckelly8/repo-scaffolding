/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-app-imports",
      comment: "Apps are leaves — packages must never import an app.",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
    {
      name: "no-circular",
      comment: "No circular dependencies between packages.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    // Add one rule per disallowed edge from the CLAUDE.md dependency-chain table, e.g.:
    // { name: "core-imports-nothing", severity: "error",
    //   from: { path: "^packages/core/" }, to: { path: "^packages/app/" } },
  ],
  options: {
    tsConfig: { fileName: "tsconfig.json" },
    doNotFollow: { path: "node_modules" },
  },
};
