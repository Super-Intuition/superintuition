# Agent instructions

## Development workflow

- Use trunk-based development. Work directly on `main`; do not create feature branches, pull requests, or review queues by default.
- Keep commits small and atomic. Each commit must stand alone, be bisectable and revertable, and have a focused message. Split independent changes, such as a refactor and its follow-up documentation, into separate commits.
- Keep feedback fast: make a small change, run the relevant checks, inspect the result, then commit. Keep `main` working after every commit.
- Commit and push completed work to remote `origin` by default (`git push origin main`). Check the working tree and fetch before integrating remote changes; preserve unrelated user work and never force-push shared history.
- Use a branch only when there is a concrete justification. Keep it alive for hours, not days; integrate promptly with a fast-forward merge into `main`, then delete it locally and remotely if it was pushed.
- If a change breaks `main`, stop unrelated work and fix it immediately. If a safe fix is not immediate, revert the offending commit immediately, restore the checks, and push the recovery. Do not leave `main` broken while investigating.

### Git commits

- Use the [git-commit skill from github/awesome-copilot](https://www.skills.sh/github/awesome-copilot/git-commit) for creating commits and splitting changes into atomic commits. Read the project-local [.agents/skills/git-commit/SKILL.md](.agents/skills/git-commit/SKILL.md) before committing.
- Follow its diff analysis, focused staging, commit type/scope selection, and Git safety checks. Stage only files belonging to the current change; preserve unrelated user edits.
- Prefix the skill's Conventional Commits-style subject with the application version: `vMAJOR.MINOR.PATCH <type>(<optional-scope>): <summary>`. Example: `v0.2.1 fix(viewer): handle empty results`. Keep the full subject, including the version, within 72 characters where possible.
- The version-first format is an intentional repository override of the skill's default type-first format. Preserve its breaking-change markers and footer conventions after the version prefix.
- This repository's direct-to-`main`, commit-and-push defaults remain in force. The standing user instruction authorizes pushing completed work to `origin/main`; the skill's commit-only scope does not remove that authorization.

## Versioning

- Use semantic versioning: `MAJOR.MINOR.PATCH`. Increment major for incompatible changes, minor for backward-compatible features, and patch for backward-compatible fixes.
- `package.json` is the single source of truth for the application version. Keep the root version and root package entry in `package-lock.json` synchronized; use `npm version <version> --no-git-tag-version`.
- Start **every commit subject** with the resulting version for readability, including documentation, maintenance, and reverts. Example: `v0.2.1 fix: handle empty results`. Do not put the version at the end or only in the body.
- Bump the version with application changes. Documentation-only changes may retain the current application version, but must still include it in the commit message. Do not silently downgrade the version during a recovery.
- Display `vMAJOR.MINOR.PATCH` in the top-right of the application on every deployed screen, including loading, empty, and error states. Read it from the version source, never a second hardcoded string.
- Verify that the displayed version matches the built commit and stays visible at narrow viewport widths. A successful push alone is not proof of deployment; report deployment status only when verified.

## Design system: Astryx

Use [Astryx](https://astryx.atmeta.com/docs/getting-started) for UI components, layout, tokens, and themes.

### Setup and discovery

- Use Node.js >=22.13.0. `.nvmrc` selects Node 22 (`nvm use`).
- Install `@astryxdesign/core`, `@stylexjs/stylex`, `@astryxdesign/theme-neutral`, and `@astryxdesign/cli`, then run `npx @astryxdesign/cli init`.
- Keep Astryx core, theme, and CLI releases compatible. Read the generated agent docs after initialization or upgrades and preserve the managed Astryx block below when editing this file.
- Discover components and read their documented props before using them. Import each component from its own entry point.
- Import the reset and base CSS once. Keep the explicit CSS layer order in `app/layers.css`, imported before other styles, so Tailwind preflight cannot override Astryx defaults.
- Migrate existing surfaces incrementally. Use Astryx for new UI; keep existing behavior working and replace legacy primitives as each surface is intentionally migrated.

### Look and feel

- Ask the user what look and feel the app should have at initial setup or when a new direction is requested. Do not repeatedly ask for an already-established preference.
- Current user preference: **neutral and minimal**, using `@astryxdesign/theme-neutral`. Default to neutral when the user has no preference.
- Run `npx @astryxdesign/cli theme list`, install the closest theme package, and run `npx @astryxdesign/cli theme add <slug>`. Use `--package <package>` when multiple owners share a slug.
- Import `themes` and `defaultThemeSlug` from the generated `astryx-themes.ts` module once, in the root theme provider, and pass `themes[defaultThemeSlug]` to `<Theme>`. The generated module supplies the theme CSS and fonts; do not hand-edit it.
- Customize through `defineTheme({ extends: importedTheme, ... })` and theme tokens. Use `theme eject` **only** when the user explicitly asks for an independent source fork.
- Show the rendered theme result before moving on to additional design work. Check light/dark behavior, typography, spacing, and responsive visibility.

## Security

Use [Cloudflare's security-audit skill](https://github.com/cloudflare/security-audit-skill). Its project-local entry point is [.agents/skills/security-audit/SKILL.md](.agents/skills/security-audit/SKILL.md).

- Read that skill before security questions, security-sensitive reviews, vulnerability investigation, or audits; load its companion documents as needed.
- Follow guidance mode for focused work. Run the complete six-phase workflow only for an explicit codebase audit, pen test, comprehensive review, or requested report artifacts. Installing or referencing the skill does not mean an audit has run.
- In full audit mode, follow its independent validation, coverage tracking, structured findings, and reporting requirements. Run both provided validators and distinguish confirmed findings, unresolved validation, and rejected candidates.
- Follow the skill's sandbox and source/local-only restrictions for security reproductions. Do not probe deployed systems or live data as part of an audit. If required controls are unavailable, record the exact validation blocker rather than claiming a confirmed result.
- Keep secrets and credentials out of source control, browser bundles, logs, screenshots, and audit artifacts. Keep audit outputs outside the repository unless the user explicitly chooses a fully ignored directory.
- Treat dependency advisories as evidence to assess, not proof of an exploitable application vulnerability. Report remaining issues and verification limits accurately.

## Fast feedback and completion

- Install from the lockfile with `npm ci` when setting up an existing checkout.
- Run `npm run typecheck` for TypeScript changes and `npm run build` for application or dependency changes. Use focused tests when they exercise changed behavior; do not add tests that merely mirror the implementation.
- For UI changes, inspect the running app and affected states at relevant viewport sizes. After an Astryx build, run `npx @astryxdesign/cli doctor --built .next`; inspect warnings and resolve failures before delivery.
- Run `git diff --check` before committing. For documentation-only changes, review the instructions, paths, and links; a fresh application build is unnecessary if application files did not change.
- Report what changed, what was verified, the commit/push result, and any remaining limitations. Do not claim checks or deployment succeeded without evidence.

## Response completion

At the end of every final response, include this exact sentence on its own line:

Codex has completed responding

## Generated Astryx conventions

<!-- ASTRYX:START -->
Astryx v0.7.13 · 174 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx template <Block>` for parts it lacks; `astryx component <Name>` to read props before using one.
Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.
Before you deliver a build, run `astryx doctor --built <dir>`; don't deliver it if it fails.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then Tailwind utilities backed by tokens. No raw hex/px.
- Palettes and custom colors go through the theme, never :root overrides. Run `astryx theme add <slug>` to import; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any style={{…}}, raw <div>/<span>, imported .css/@apply, or hardcoded/arbitrary value (bg-[#fff], p-[13px]) with the component or a token-backed utility.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump
<!-- ASTRYX:END -->
