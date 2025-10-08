import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOME_SHARE_SCOPE_DEFAULTS,
  projectShareScope,
  buildHomeShareIndex,
  getHomeShareGrant,
  shareAllowsField,
  applyHomeShareUpdate,
} from './sharing.js';

test('projectShareScope falls back to defaults and coerces booleans', () => {
  const projected = projectShareScope({ alias: 1, address: 'yes' });
  Object.entries(HOME_SHARE_SCOPE_DEFAULTS).forEach(([key, defaultValue]) => {
    if (key === 'alias' || key === 'address') {
      assert.equal(projected[key], true);
    } else {
      assert.equal(projected[key], defaultValue);
    }
  });
});

test('buildHomeShareIndex only includes active grants and normalises scope', () => {
  const index = buildHomeShareIndex([
    {
      id: 'share-active',
      wishlistId: 'w-1',
      homeId: 'h-1',
      grantedAt: '2024-03-01T10:00:00Z',
      scope: { alias: true, priceExpectation: true },
    },
    {
      id: 'share-revoked',
      wishlistId: 'w-1',
      homeId: 'h-2',
      grantedAt: '2024-03-02T10:00:00Z',
      revokedAt: '2024-03-03T10:00:00Z',
      scope: { alias: true },
    },
  ]);

  const activeGrant = getHomeShareGrant(index, 'w-1', 'h-1');
  assert.ok(activeGrant, 'active share should be present');
  assert.equal(shareAllowsField(activeGrant, 'alias'), true);
  assert.equal(shareAllowsField(activeGrant, 'priceExpectation'), true);
  assert.equal(shareAllowsField(activeGrant, 'photos'), false);

  const revokedGrant = getHomeShareGrant(index, 'w-1', 'h-2');
  assert.equal(revokedGrant, null);
});

test('applyHomeShareUpdate removes revoked grants from the index', () => {
  const index = buildHomeShareIndex([
    {
      id: 'share-active',
      wishlistId: 'w-1',
      homeId: 'h-1',
      grantedAt: '2024-03-01T10:00:00Z',
      scope: { alias: true },
    },
  ]);

  const revoked = {
    id: 'share-active',
    wishlistId: 'w-1',
    homeId: 'h-1',
    grantedAt: '2024-03-01T10:00:00Z',
    revokedAt: '2024-03-05T10:00:00Z',
    scope: { alias: true },
  };

  const grantBefore = getHomeShareGrant(index, 'w-1', 'h-1');
  assert.ok(grantBefore, 'grant should exist prior to revocation');

  applyHomeShareUpdate(index, revoked, new Date('2024-03-06T10:00:00Z'));

  const grantAfter = getHomeShareGrant(index, 'w-1', 'h-1');
  assert.equal(grantAfter, null, 'grant should be removed after revocation');
});
