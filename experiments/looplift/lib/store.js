import { get, list, put } from '@vercel/blob';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildLeaderboard, normalizeWebsite, safeDisplayName, shouldCreditReferral, weekKey } from './logic.mjs';

const ACCESS = 'private';
const FILE_BACKEND = process.env.STORAGE_BACKEND === 'file';
const FILE_STORE_DIR = path.resolve(process.env.FILE_STORE_DIR || '.looplift-data');

function filePath(pathname) {
  return path.join(FILE_STORE_DIR, ...pathname.split('/'));
}

function isMissing(error) {
  return error?.code === 'ENOENT' || error?.status === 404 || error?.statusCode === 404 || String(error?.message || '').includes('404');
}

function isAlreadyExists(error) {
  return error?.code === 'EEXIST' || String(error?.message || '').toLowerCase().includes('already exists');
}

async function readJson(pathname) {
  if (FILE_BACKEND) {
    try {
      return JSON.parse(await readFile(filePath(pathname), 'utf8'));
    } catch (error) {
      if (isMissing(error)) return null;
      throw error;
    }
  }

  try {
    const result = await get(pathname, { access: ACCESS, useCache: false });
    if (!result) return null;
    return await new Response(result.stream).json();
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

async function putJson(pathname, value, allowOverwrite = false) {
  if (FILE_BACKEND) {
    const target = filePath(pathname);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, JSON.stringify(value), { encoding: 'utf8', flag: allowOverwrite ? 'w' : 'wx' });
    return;
  }

  return put(pathname, JSON.stringify(value), {
    access: ACCESS,
    contentType: 'application/json',
    allowOverwrite,
    addRandomSuffix: false
  });
}

async function listJson(prefix) {
  if (FILE_BACKEND) {
    const directory = filePath(prefix.replace(/\/$/, ''));
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      const values = [];
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
        const value = await readJson(`${prefix}${entry.name}`);
        if (value) values.push(value);
      }
      return values;
    } catch (error) {
      if (isMissing(error)) return [];
      throw error;
    }
  }

  const values = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const value = await readJson(blob.pathname);
      if (value) values.push(value);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return values;
}

export function fingerprintForRequest(request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
  const ua = request.headers.get('user-agent') || 'unknown-ua';
  const secret = process.env.ANTI_ABUSE_SECRET;
  if (!secret) throw new Error('ANTI_ABUSE_SECRET is required');
  return createHmac('sha256', secret).update(`${forwarded}|${ua}`).digest('hex');
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

export async function getParticipant(id) {
  if (!id) return null;
  return readJson(`participants/${id}.json`);
}

export async function getParticipantByCode(code) {
  if (!code) return null;
  const alias = await readJson(`codes/${String(code).toUpperCase()}.json`);
  if (!alias?.participantId) return null;
  return getParticipant(alias.participantId);
}

export async function createParticipant({ refCode, displayName, website, fingerprintHash }) {
  if (!fingerprintHash) throw new Error('FINGERPRINT_REQUIRED');

  const fingerprintPath = `fingerprints/${fingerprintHash}.json`;
  const existingFingerprint = await readJson(fingerprintPath);
  if (existingFingerprint?.participantId) throw new Error('DEVICE_ALREADY_JOINED');

  const id = randomUUID();
  const code = `LOOP-${id.replaceAll('-', '').slice(0, 10).toUpperCase()}`;
  const editToken = randomBytes(24).toString('base64url');
  const createdAt = new Date().toISOString();
  const participant = {
    id,
    code,
    displayName: safeDisplayName(displayName),
    website: normalizeWebsite(website),
    createdAt,
    fingerprintHash,
    editTokenHash: tokenHash(editToken)
  };

  try {
    await putJson(fingerprintPath, { participantId: id, createdAt }, false);
  } catch (error) {
    if (isAlreadyExists(error)) throw new Error('DEVICE_ALREADY_JOINED');
    throw error;
  }

  await putJson(`participants/${id}.json`, participant, false);
  await putJson(`codes/${code}.json`, { participantId: id, code }, false);

  let referral = { status: 'none', reason: null };
  if (refCode) {
    const referrer = await getParticipantByCode(refCode);
    const decision = shouldCreditReferral({ referrer, referredFingerprint: fingerprintHash });
    if (decision.credit) {
      const event = {
        id,
        referrerId: referrer.id,
        referredId: id,
        refCode: referrer.code,
        weekKey: weekKey(new Date()),
        status: 'credited',
        createdAt
      };
      try {
        await putJson(`referrals/${id}.json`, event, false);
        referral = { status: 'credited', reason: null };
      } catch (error) {
        if (!isAlreadyExists(error)) throw error;
        referral = { status: 'ignored', reason: 'duplicate-event' };
      }
    } else {
      referral = { status: 'rejected', reason: decision.reason };
      await putJson(`rejections/${id}.json`, {
        referredId: id,
        refCode: String(refCode).toUpperCase(),
        reason: decision.reason,
        createdAt
      }, false);
    }
  }

  return { participant, editToken, referral };
}

export async function updateParticipant({ id, editToken, displayName, website }) {
  const participant = await getParticipant(id);
  if (!participant) return null;
  if (!editToken || tokenHash(editToken) !== participant.editTokenHash) throw new Error('UNAUTHORIZED');
  const updated = {
    ...participant,
    displayName: safeDisplayName(displayName ?? participant.displayName),
    website: website === undefined ? participant.website : normalizeWebsite(website),
    updatedAt: new Date().toISOString()
  };
  await putJson(`participants/${id}.json`, updated, true);
  return updated;
}

export async function getLeaderboard() {
  const [participants, referrals] = await Promise.all([listJson('participants/'), listJson('referrals/')]);
  return buildLeaderboard(participants, referrals, new Date()).slice(0, 50);
}

export async function getPublicParticipant(id) {
  const participant = await getParticipant(id);
  if (!participant) return null;
  const board = await getLeaderboard();
  const row = board.find((item) => item.id === id);
  return {
    id: participant.id,
    code: participant.code,
    displayName: participant.displayName,
    website: participant.website,
    createdAt: participant.createdAt,
    score: row?.score || 0,
    rank: row?.rank || null,
    reward: row?.reward || 'Racing'
  };
}
