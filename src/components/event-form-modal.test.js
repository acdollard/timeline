import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('EventFormModal birth mode binding', () => {
  it('defines isBirthMode before any JSX that references it', () => {
    const source = readFileSync(join(root, 'src/components/EventFormModal.tsx'), 'utf8');
    const defIndex = source.search(/const isBirthMode\s*=/);
    assert.ok(defIndex >= 0, 'EventFormModal must bind isBirthMode; opening the modal currently throws ReferenceError');

    const firstUse = source.indexOf('isBirthMode', defIndex + 1);
    assert.ok(firstUse > defIndex, 'isBirthMode must be defined before it is used');

    const uses = [...source.matchAll(/\bisBirthMode\b/g)];
    assert.ok(uses.length > 1, 'isBirthMode should be used in the modal UI');
  });
});
