# Super Intuition

Accelerated-Learning Platform.

## Private repo code-review viewer

A web interface for walking through a **private** GitHub repo as a code-review
session. The repo and access token are read from `.env` on the **server** — the
token and the GitHub URL are never shipped to the browser, so the private link
is not exposed publicly.

### Setup

```bash
cp .env.example .env
# edit .env:
#   GITHUB_TOKEN=<PAT with `repo` read scope>
#   GITHUB_REPO=Super-Intuition/ringback-demo-case   # change to any owner/name
npm install
npm run dev        # http://localhost:3000
```

`GITHUB_REPO` is fully swappable — point it at any repo the token can read and
restart.

### Layout

- **Left** — PR conversation (summary / description, rendered markdown).
- **Center** — file diffs with dual line-number gutters, add/del coloring,
  collapse and "Viewed".
- **Right** — assistant chat panel. This is a static UI stub for now; side chat
  and voice calling are not wired up.

### How it stays private

All GitHub calls run in server routes under `app/api/*` using `GITHUB_TOKEN`.
The client only ever sees sanitized JSON (titles, diffs, line counts). `.env` is
gitignored.
