import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('DELETE /api/events/:id birth guard', () => {
  it('rejects birth event deletion before deleteEventForUser', () => {
    const source = readFileSync(join(root, 'src/pages/api/events/[id].ts'), 'utf8');
    const deleteStart = source.indexOf('export const DELETE');
    assert.ok(deleteStart >= 0, 'events/[id].ts must export DELETE');
    const deleteHandler = source.slice(deleteStart);

    assert.match(deleteHandler, /isBirthEventRecord/);
    assert.match(deleteHandler, /Birth event cannot be deleted/);
    assert.ok(
      deleteHandler.indexOf('isBirthEventRecord') < deleteHandler.indexOf('deleteEventForUser'),
      'Birth check must run before the delete RPC'
    );
  });
});
