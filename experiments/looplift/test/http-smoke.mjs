import assert from 'node:assert/strict';

const base = process.env.LOOPLIFT_BASE_URL || 'http://127.0.0.1:3000';

async function json(path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  const body = await response.json();
  return { response, body };
}

const home = await fetch(base);
assert.equal(home.status, 200);
assert.match(await home.text(), /Visits don.t score/i);

const alpha = await json('/api/join', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-forwarded-for': '10.10.0.1',
    'user-agent': 'looplift-e2e-alpha'
  },
  body: JSON.stringify({ displayName: 'HTTP Alpha', website: 'alpha.example' })
});
assert.equal(alpha.response.status, 201);
assert.ok(alpha.body.participant?.code);
assert.equal(alpha.body.participant.score, 0);

const beta = await json('/api/join', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-forwarded-for': '10.10.0.2',
    'user-agent': 'looplift-e2e-beta'
  },
  body: JSON.stringify({
    displayName: 'HTTP Beta',
    website: 'beta.example',
    refCode: alpha.body.participant.code
  })
});
assert.equal(beta.response.status, 201);
assert.equal(beta.body.referral?.status, 'credited');

const leaderboard = await json('/api/leaderboard');
assert.equal(leaderboard.response.status, 200);
const alphaRow = leaderboard.body.leaderboard.find((row) => row.id === alpha.body.participant.id);
const betaRow = leaderboard.body.leaderboard.find((row) => row.id === beta.body.participant.id);
assert.equal(alphaRow?.score, 1);
assert.equal(betaRow?.score, 0);

const duplicate = await json('/api/join', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-forwarded-for': '10.10.0.2',
    'user-agent': 'looplift-e2e-beta'
  },
  body: JSON.stringify({ displayName: 'Duplicate Beta' })
});
assert.equal(duplicate.response.status, 409);
assert.match(duplicate.body.error, /already joined/i);

const unknownReferral = await json('/api/join', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-forwarded-for': '10.10.0.3',
    'user-agent': 'looplift-e2e-gamma'
  },
  body: JSON.stringify({ displayName: 'HTTP Gamma', refCode: 'LOOP-UNKNOWN' })
});
assert.equal(unknownReferral.response.status, 201);
assert.equal(unknownReferral.body.referral?.status, 'rejected');
assert.equal(unknownReferral.body.referral?.reason, 'unknown-referrer');

for (const route of ['/rules', '/privacy']) {
  const response = await fetch(`${base}${route}`);
  assert.equal(response.status, 200);
}

console.log(JSON.stringify({
  ok: true,
  alphaScore: alphaRow.score,
  betaScore: betaRow.score,
  duplicateStatus: duplicate.response.status,
  unknownReferral: unknownReferral.body.referral.reason
}));
