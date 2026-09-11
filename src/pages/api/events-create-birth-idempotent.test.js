import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('POST /api/events birth idempotency', () => {
  it('reuses an existing owned birth event instead of inserting a second one', () => {
    const source = readFileSync(join(root, 'src/pages/api/events.ts'), 'utf8');
    const postStart = source.indexOf('export const POST');
    assert.ok(postStart >= 0, 'events.ts must export POST');
    const postHandler = source.slice(postStart, source.indexOf('export const PUT'));

    assert.match(postHandler, /requestCreatesBirthEvent/);
    assert.match(postHandler, /findOwnedBirthEvent/);
    assert.ok(
      postHandler.indexOf('findOwnedBirthEvent') < postHandler.indexOf('.insert(['),
      'Existing birth lookup must run before insert'
    );
    assert.match(
      postHandler,
      /existingBirth/,
      'POST must return the existing birth row when one is already owned'
    );
    assert.doesNotMatch(
      postHandler.slice(postHandler.indexOf('existingBirth'), postHandler.indexOf('.insert([')),
      /\.insert\(/,
      'Must not insert when an owned birth event already exists'
    );
  });
});
