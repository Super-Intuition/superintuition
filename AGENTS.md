# Agent instructions

## Development

- Use trunk-based development: commit directly to `main`, with no feature branch, PR, or review queue by default. Commit and push completed work to `origin` (`git push origin main`); this is standing authorization.
- Keep commits small, atomic, bisectable, and revertable. Split independent changes and use focused messages. Run relevant checks after each small change for fast feedback.
- If `main` breaks, fix it immediately or revert immediately if a safe fix is not ready, verify the recovery, and push it.
- When a branch is justified, keep it short-lived (hours, not days), fast-forward it into `main`, and delete it locally and remotely if pushed.
- Check status and fetch before integrating remote work. Preserve unrelated user edits; never force-push shared history or commit secrets.
- Do not update README.md unless explicitly asked.

## Versioning

- Use `MAJOR.MINOR.PATCH`: breaking changes, compatible features, and compatible fixes respectively. Keep `package.json` and `package-lock.json` synchronized with `npm version <version> --no-git-tag-version`. Documentation-only changes may retain the current version; recovery must not silently downgrade it.
- Start every commit subject, including docs and reverts, with `vMAJOR.MINOR.PATCH`, followed by the skill's conventional type, optional scope, and summary. Example: `v0.2.1 fix(viewer): handle empty results`. This overrides the git-commit skill's type-first format; keep the subject within 72 characters.
- Read the version from `package.json` and display it at the top right on every deployed screen, including loading/error states and narrow viewports. Verify the displayed version; do not equate a push with a verified deployment.

## Local tools and skills

Assume the tools and skills below are installed. Read the relevant local instructions and use local commands first; routine use does not require web searches or update checks. If missing, install with the listed commands before proceeding. Upstream links are references for installation, troubleshooting, and intentional updates. Review updates, refresh local instructions, and run relevant checks; do not upgrade on every task.

### Astryx

[Upstream guide](https://astryx.atmeta.com/docs/getting-started) · [Local generated conventions](.agents/astryx.md)

- **Neutral is the established default. Do not ask about look and feel or change the theme unless the user requests a different direction.**
- Read `.agents/astryx.md` before UI work. Use Astryx components, layout primitives, and tokens; discover component props and import paths through the CLI. Migrate existing surfaces incrementally.
- Keep the single root `<Theme theme={themes[defaultThemeSlug]}>` wired through `app/components/AppTheme.tsx` and generated `astryx-themes.ts`. Keep reset/base CSS loaded once and `app/layers.css` imported first. Do not hand-edit the generated theme module.
- Customize with `defineTheme({ extends: importedTheme, ... })`; use `theme eject` only when explicitly asked for an independent source fork.

Use Node >=22.13.0 (`nvm use`). Restore existing dependencies with `npm ci` if needed. For missing Astryx setup:

```sh
npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli
npx @astryxdesign/cli init --agent-docs-path .agents/astryx.md
npx @astryxdesign/cli theme add neutral
```

Routine commands (use the installed CLI; read further commands in the local conventions):

```sh
npx --no-install @astryxdesign/cli docs
npx --no-install @astryxdesign/cli component <Name>
npx --no-install @astryxdesign/cli docs <topic>
npx --no-install @astryxdesign/cli doctor --built .next
```

When intentionally upgrading, update all installed `@astryxdesign/*` packages together to a compatible release, run `npx @astryxdesign/cli upgrade --from <old-core-version> --apply`, and regenerate `.agents/astryx.md` with the init command above.

### Cloudflare deployments

[Upstream skills](https://github.com/cloudflare/skills)

- For any deployment-related work (hosting, CI/CD, build status, domains, configuration, or troubleshooting), read and apply the `cloudflare` skill from this source first, then the relevant product/tool skill. Use the installed Cloudflare plugin skills or project-local `.agents/skills/<name>/SKILL.md`.
- If unavailable, install the needed skill with `npx skills add https://github.com/cloudflare/skills --skill <name> --yes`. Do not upgrade installed skills on routine tasks.
- Follow `cloudflare` for CLI selection: use `wrangler` for existing Wrangler projects and `cf-cli` otherwise. For Next.js deployment changes, load `nextjs-on-cloudflare`; for Worker code/configuration, load `workers-best-practices`. Preserve the existing hosting architecture unless a migration is requested.
- This repository deploys through Cloudflare Workers Builds (`superintuition`). Preserve that Git integration and avoid adding a second deployment trigger in Actions.
- Keep `.github/workflows/cloudflare-deployment.yml` reporting the Cloudflare check for the exact pushed commit on `main`. Actions must show waiting, success, failure, and timeout, with a link to Cloudflare build logs. Update the expected check name if the Worker is renamed. Manual workflow runs observe the selected ref; they do not trigger a Cloudflare rebuild. Rerun Actions after retrying a Cloudflare build.
- Use minimal GitHub token permissions and never commit credentials. The status workflow needs only `checks: read` and no Cloudflare API token. Detailed build/runtime logs remain in Cloudflare; Actions links to build logs.
- After pushing, inspect both the Actions run and its matching Cloudflare check. Verify the deployed application and displayed version separately before claiming the live deployment is verified.

### Git commits

[Upstream skill](https://www.skills.sh/github/awesome-copilot/git-commit) · [Local skill](.agents/skills/git-commit/SKILL.md)

Read `.agents/skills/git-commit/SKILL.md` before committing; follow its diff review, focused staging, and safety checks. Apply this repository's version-first subject and direct-to-main commit/push rules.

If missing: `npx skills add https://github.com/github/awesome-copilot --skill git-commit --yes`.

### Security

[Upstream skill](https://github.com/cloudflare/security-audit-skill) · [Local skill](.agents/skills/security-audit/SKILL.md)

Read `.agents/skills/security-audit/SKILL.md` for security work and follow its execution limits. Use guidance mode for focused work; run the complete audit workflow only for explicit audit/pen-test/comprehensive-review requests or requested report artifacts.

If missing: `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit --yes`.

For full audits, validate the generated artifacts as the skill directs (these commands validate reports; they do not run an audit):

```sh
node .agents/skills/security-audit/validate-coverage-ledger.cjs <audit-dir>/coverage-ledger.json
node .agents/skills/security-audit/validate-findings.cjs <audit-dir>/findings.json
```

## Verification

- Run `npm run typecheck` for TypeScript changes and `npm run build` for application/dependency changes, plus focused tests for changed behavior. For UI changes, inspect affected states at desktop/mobile widths and in light/dark modes, and run Astryx doctor above; resolve failures and inspect warnings.
- Before committing, run `git diff --check`. Documentation-only work needs an instructions/links review, not an application rebuild.
- Report changes, checks, commit/push results, and remaining limitations accurately.

## Response completion

End every final response with this exact sentence on its own line:

Codex has completed responding
