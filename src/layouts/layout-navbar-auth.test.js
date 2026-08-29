import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('navbar auth props', () => {
  it('does not serialize the full Supabase session into the Navbar island', () => {
    const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
    const navbar = readFileSync(join(root, 'src/components/Navbar.tsx'), 'utf8');

    assert.match(
      layout,
      /<Navbar\s+client:load\s+isAuthenticated=\{Boolean\(session\)\}/,
      'Layout must pass only a boolean auth flag to the client Navbar island'
    );
    assert.doesNotMatch(
      layout,
      /initialSession=\{session\}/,
      'Layout must not pass the full session object to a client island'
    );
    assert.doesNotMatch(
      navbar,
      /from '@supabase\/supabase-js'/,
      'Navbar must not import the Session type (which would encourage passing tokens to the client)'
    );
    assert.match(
      navbar,
      /isAuthenticated:\s*boolean/,
      'Navbar should accept a boolean isAuthenticated prop'
    );
  });
});
