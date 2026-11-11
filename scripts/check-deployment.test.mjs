import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
let id = 0;
for (const scenario of ['healthy', '403', 'warning', 'stale version', 'bad files']) {
  test(scenario, async () => {
    const originalFetch = globalThis.fetch;
    const originalURL = process.env.DEPLOYMENT_URL;
    const originalSummary = process.env.GITHUB_STEP_SUMMARY;
    process.env.DEPLOYMENT_URL = 'https://deployment.example';
    delete process.env.GITHUB_STEP_SUMMARY;
    const paths = [];
    globalThis.fetch = async url => {
      const path = url.pathname;
      paths.push(path);
      if (scenario === '403' && path === '/api/repo') return new Response('{}', { status: 403 });
      const bodies = {
        '/': `<span aria-label="App version ${scenario === 'stale version' ? 'old' : version}"></span>`,
        '/api/repo': scenario === 'warning' ? { warning: 'upstream unavailable' } : { full: 'owner/repo', defaultBranch: 'main' },
        '/api/pulls': [{ number: 1 }],
        '/api/pulls/1': { number: 1 },
        '/api/pulls/1/files': scenario === 'bad files' ? {} : [],
      };
      return new Response(path === '/' ? bodies[path] : JSON.stringify(bodies[path]));
    };
    try {
      process.exitCode = 0;
      await import(`./check-deployment.mjs?test=${id++}`);
      assert.equal(process.exitCode, scenario === 'healthy' ? 0 : 1);
      if (scenario === 'healthy') assert.equal(paths.length, 5);
    } finally {
      globalThis.fetch = originalFetch;
      process.exitCode = 0;
      if (originalURL === undefined) delete process.env.DEPLOYMENT_URL;
      else process.env.DEPLOYMENT_URL = originalURL;
      if (originalSummary !== undefined) process.env.GITHUB_STEP_SUMMARY = originalSummary;
    }
  });
}
