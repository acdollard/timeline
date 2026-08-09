import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isBirthEventRecord } from './birthEvent.ts';

describe('isBirthEventRecord', () => {
  it('detects birth via type field', () => {
    assert.equal(isBirthEventRecord({ type: 'birth' }), true);
  });

  it('detects birth via related event_types object', () => {
    assert.equal(isBirthEventRecord({ type: 'travel', event_types: { name: 'birth' } }), true);
  });

  it('detects birth via related event_types array', () => {
    assert.equal(isBirthEventRecord({ event_types: [{ name: 'birth' }] }), true);
  });

  it('returns false for non-birth events', () => {
    assert.equal(isBirthEventRecord({ type: 'travel', event_types: { name: 'travel' } }), false);
  });

  it('returns false for nullish input', () => {
    assert.equal(isBirthEventRecord(null), false);
    assert.equal(isBirthEventRecord(undefined), false);
  });
});
