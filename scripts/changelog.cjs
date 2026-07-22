const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const { getInfo } = require('@changesets/get-github-info');
const { config } = require('dotenv');

config({ quiet: true });

const SEE_LINE = /^See:\s*(.*)/i;
const TRAILING_CHARACTER = /[.;:]$/;
const listFormatter = new Intl.ListFormat('en-US');

function repositoryName() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;

  const metadata = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
  const repository =
    typeof metadata.repository === 'string' ? metadata.repository : metadata.repository?.url;
  if (!repository) return undefined;

  const match = /(?:github\.com[/:])([^/]+\/[^/.]+)(?:\.git)?$/.exec(repository);
  return match?.[1];
}

function summaryLines(summary) {
  let lines = summary.trim().split(/\r?\n/);
  if (!lines.some(line => line.includes('```'))) {
    lines = lines.map(line => line.trim()).filter(Boolean);
    const last = lines.length - 1;
    if (last >= 0) lines[last] = lines[last].replace(TRAILING_CHARACTER, '');
  }
  return lines;
}

function seeReference(links) {
  const references = links
    .filter(Boolean)
    .map(link => (typeof link === 'string' ? link : link.pull || link.commit))
    .filter(Boolean);
  return references.length === 0 ? '' : `(See ${listFormatter.format(references)})`;
}

async function githubInfo(commit) {
  const repo = repositoryName();
  if (!repo || !commit) return undefined;
  return getInfo({ repo, commit });
}

async function getDependencyReleaseLine(changesets, dependenciesUpdated) {
  if (dependenciesUpdated.length === 0) return '';

  const links = await Promise.all(
    changesets.map(async changeset => {
      if (!changeset.commit) return undefined;

      const explicitReference = summaryLines(changeset.summary).find(line => SEE_LINE.test(line));
      if (explicitReference) return SEE_LINE.exec(explicitReference)?.[1].trim();

      return (await githubInfo(changeset.commit))?.links;
    }),
  );

  const reference = seeReference(links);
  const heading = reference ? `- Updated dependencies ${reference}` : '- Updated dependencies';
  const details = dependenciesUpdated.map(dependency => {
    return `  - ${dependency.name}@${dependency.newVersion}`;
  });
  return [heading, ...details].join('\n');
}

async function getReleaseLine(changeset, type) {
  const lines = summaryLines(changeset.summary);
  const referenceIndex = lines.findIndex(line => SEE_LINE.test(line));
  let pull;
  if (referenceIndex >= 0) {
    pull = SEE_LINE.exec(lines[referenceIndex])?.[1].trim();
    lines.splice(referenceIndex, 1);
  }

  const info = pull ? undefined : await githubInfo(changeset.commit);
  const [firstLine = '', ...remainingLines] = lines;
  const warning = type === 'patch' && /^\s*fix/i.test(firstLine) ? '⚠️ ' : '';
  let output = `- ${warning}${firstLine}`;
  if (remainingLines.length > 0) {
    output += `\n${remainingLines.map(line => `  ${line}`).join('\n')}`;
  }

  const user = info?.links.user;
  if (user) {
    output += /(?:[!?.]|```)\s*$/.test(output) ? `\nSubmitted by ${user}` : `, by ${user}`;
  }

  const reference = seeReference([pull || info?.links.pull || info?.links.commit]);
  if (reference) output += ` ${reference}`;
  return output;
}

module.exports = {
  getDependencyReleaseLine,
  getReleaseLine,
};
