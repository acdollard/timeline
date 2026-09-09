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

/** Strip line + block comments so comment text cannot false-positive. */
function codeOnly(frontmatterSource) {
  return frontmatterSource
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('auth email pages SSR frontmatter', () => {
  it('confirm-email does not crash on undeclared SSR token symbols', () => {
    const code = codeOnly(frontmatter('src/pages/confirm-email.astro'));
    // Merge regression 52198aa reintroduced these without declarations,
    // crashing every SSR render of the confirmation page.
    assert.equal(/\baccess_token\b/.test(code), false);
    assert.equal(/\brefresh_token\b/.test(code), false);
    assert.equal(/\bhasHashTokens\b/.test(code), false);
    assert.equal(/\bredirect\s*\(/.test(code), false);
    assert.equal(/\bcookies\b/.test(code), false);
    assert.equal(/\bcreateRequestSupabaseClient\b/.test(code), false);
    assert.match(code, /searchParams\.get\("error"\)/);
  });

  it('reset-password does not crash on undeclared SSR token symbols', () => {
    const code = codeOnly(frontmatter('src/pages/reset-password.astro'));
    assert.equal(/\baccess_token\b/.test(code), false);
    assert.equal(/\brefresh_token\b/.test(code), false);
    assert.equal(/\bhasHashTokens\b/.test(code), false);
    assert.equal(/\bredirect\s*\(/.test(code), false);
    assert.equal(/\bcreateRequestSupabaseClient\b/.test(code), false);
    assert.match(code, /searchParams\.get\("error"\)/);
    assert.match(code, /searchParams\.get\("success"\)/);
  });
});
