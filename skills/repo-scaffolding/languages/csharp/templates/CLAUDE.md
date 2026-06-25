<!-- Agent-primary — Claude is a primary reader of this file. Keep it load-bearing, not decorative. -->

# <project>

<One-line description of what this solution is.>

## Architecture

<1–3 bullets describing the top-level shape — the main projects and how they relate.>

- <project A — what it is>
- <project B — what it is>

## Project structure & dependency chain

This table is the boundary contract. Each row is a project; the import columns are what the
NetArchTest guard (`ArchitectureTests`) enforces. Apps are leaves — no library may depend on an app.

| Project        | May reference        | Must NOT reference  |
| -------------- | -------------------- | ------------------- |
| `Scope.Core`   | (none — foundation)  | everything else (it is the deepest layer) |
| `Scope.App`    | `Scope.Core`         | —                   |

## Rules

**Do:** <the short list — e.g. put shared contracts in `Scope.Core`; run the verify gate before
pushing; reference projects via `ProjectReference`, versions via central `Directory.Packages.props`.>

**Do NOT:** <the short list — e.g. reference a leaf app from a library; add a `<PackageReference>`
`Version` in a `.csproj` (central management owns versions); add a NuGet source outside `nuget.config`.>

## Development

- The **pre-push gate** is the sole source of truth for "is the tree green":
  `dotnet format --verify-no-changes` → `dotnet restore --locked-mode` → `dotnet build` →
  `dotnet test` → `ast-grep scan`. Enable it once per clone: `git config core.hooksPath .githooks`.

## Key entry points

| Concern                  | File                          |
| ------------------------ | ----------------------------- |
| <solution root>          | <path>.sln                    |
| <app entry / Program.cs> | <path>                        |
