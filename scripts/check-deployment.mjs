import { readFile, appendFile } from 'node:fs/promises';

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const results = [];
try {
  if (!process.env.DEPLOYMENT_URL) throw new Error('Set the DEPLOYMENT_URL GitHub Actions repository variable.');
  const base = new URL(process.env.DEPLOYMENT_URL);
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('DEPLOYMENT_URL must be an HTTPS URL without credentials.');
  async function request(path, json = true) {
    const response = await fetch(new URL(path, base), {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(30000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}; inspect the deployed application and Cloudflare logs.`);
    const body = json ? await response.json() : await response.text();
    if (json && (!body || body.error || body.warning || body.warnings?.length)) throw new Error(`${path}: application returned an error or warning.`);
    results.push(`${path}: HTTP ${response.status}`);
    return body;
  }
  const html = await request('/', false);
  if (!html.includes(`App version ${version}`)) throw new Error(`Homepage does not display expected version ${version}.`);
  const repo = await request('/api/repo');
  if (!repo.full || !repo.defaultBranch) throw new Error('/api/repo: invalid repository response.');
  const pulls = await request('/api/pulls');
  if (!Array.isArray(pulls)) throw new Error('/api/pulls: expected a pull request list.');
  if (pulls.length) {
    const number = pulls[0].number;
    if (!Number.isSafeInteger(number) || number < 1) throw new Error('/api/pulls: invalid pull number.');
    const detail = await request(`/api/pulls/${number}`);
    if (detail.number !== number) throw new Error('Pull detail does not match the requested pull.');
    const files = await request(`/api/pulls/${number}/files`);
    if (!Array.isArray(files)) throw new Error('Pull files: expected a file list.');
  } else {
    results.push('No pull requests; detail/file checks not applicable.');
  }
  results.push(`Deployed application checks passed (v${version}).`);
} catch (error) {
  results.push(`FAILED: ${error.message}`);
  console.error(`::error::${error.message.replaceAll('\n', ' ')}`);
  process.exitCode = 1;
} finally {
  console.log(results.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `\n## Deployed application health\n\n${results.map(line => `- ${line}`).join('\n')}\n`);
  }
}
