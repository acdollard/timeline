import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function frontmatter(relativePath) {
  const source = readFileSync(join(root, relativePath), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `${relativePath} should have Astro frontmatter`);
  return match[1];
}

describe('auth email pages SSR frontmatter', () => {
  it('confirm-email does not reference undeclared SSR token symbols', () => {
    const fm = frontmatter('src/pages/confirm-email.astro');
    // Merge regression 52198aa reintroduced these without declarations,
    // crashing every SSR render of the confirmation page.
    for (const symbol of ['access_token', 'refresh_token', 'redirect', 'cookies', 'hasHashTokens']) {
      assert.equal(
        fm.includes(symbol),
        false,
        `confirm-email frontmatter must not reference undeclared '${symbol}'`
      );
    }
    assert.match(fm, /searchParams\.get\("error"\)/);
  });

  it('reset-password does not reference undeclared SSR token symbols', () => {
    const fm = frontmatter('src/pages/reset-password.astro');
    for (const symbol of ['access_token', 'refresh_token', 'redirect', 'hasHashTokens']) {
      assert.equal(
        fm.includes(symbol),
        false,
        `reset-password frontmatter must not reference undeclared '${symbol}'`
      );
    }
    assert.match(fm, /searchParams\.get\("error"\)/);
    assert.match(fm, /searchParams\.get\("success"\)/);
  });
});
