import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('filesystem ledger creates participants, credits one referral, and blocks duplicate devices', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'looplift-store-'));
  process.env.STORAGE_BACKEND = 'file';
  process.env.FILE_STORE_DIR = directory;

  const store = await import(`../lib/store.js?file-test=${Date.now()}`);

  try {
    const inviter = await store.createParticipant({
      displayName: 'Alpha',
      website: 'alpha.example',
      fingerprintHash: 'fingerprint-alpha'
    });

    const friend = await store.createParticipant({
      refCode: inviter.participant.code,
      displayName: 'Beta',
      website: 'beta.example',
      fingerprintHash: 'fingerprint-beta'
    });

    assert.equal(friend.referral.status, 'credited');

    const board = await store.getLeaderboard();
    const alpha = board.find((row) => row.id === inviter.participant.id);
    const beta = board.find((row) => row.id === friend.participant.id);
    assert.equal(alpha.score, 1);
    assert.equal(beta.score, 0);

    await assert.rejects(
      () => store.createParticipant({
        refCode: inviter.participant.code,
        displayName: 'Duplicate',
        fingerprintHash: 'fingerprint-beta'
      }),
      /DEVICE_ALREADY_JOINED/
    );

    await assert.rejects(
      () => store.updateParticipant({
        id: friend.participant.id,
        editToken: 'wrong-token',
        displayName: 'Tampered'
      }),
      /UNAUTHORIZED/
    );

    const updated = await store.updateParticipant({
      id: friend.participant.id,
      editToken: friend.editToken,
      displayName: 'Beta Updated',
      website: 'https://beta.example/new'
    });
    assert.equal(updated.displayName, 'Beta Updated');
    assert.equal(updated.website, 'https://beta.example/new');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
