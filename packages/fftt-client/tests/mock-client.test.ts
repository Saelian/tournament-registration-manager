import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MockFFTTClient } from '../dist/mock-client.js';

describe('MockFFTTClient', () => {
  it('should find existing player by licence', async () => {
    const client = new MockFFTTClient(0); // No delay for tests
    const player = await client.searchByLicence('1234567');

    assert.ok(player);
    assert.equal(player.licence, '1234567');
    assert.equal(player.firstName, 'Jean');
    assert.equal(player.lastName, 'DUPONT');
  });

  it('should return null for non-existent player', async () => {
    const client = new MockFFTTClient(0);
    const player = await client.searchByLicence('0000000');

    assert.strictEqual(player, null);
  });

  it('should initialize successfully', async () => {
    const client = new MockFFTTClient(0);
    const result = await client.initialize();

    assert.strictEqual(result, true);
  });

  it('should have all required player fields', async () => {
    const client = new MockFFTTClient(0);
    const player = await client.searchByLicence('9999999');

    assert.ok(player);
    assert.equal(typeof player.licence, 'string');
    assert.equal(typeof player.firstName, 'string');
    assert.equal(typeof player.lastName, 'string');
    assert.equal(typeof player.club, 'string');
    assert.equal(typeof player.points, 'number');
    assert.ok(player.sex === 'M' || player.sex === 'F');
    assert.equal(typeof player.category, 'string');
  });

  it('should find players with different categories', async () => {
    const client = new MockFFTTClient(0);

    const senior = await client.searchByLicence('1234567');
    assert.equal(senior?.category, 'Senior');

    const junior = await client.searchByLicence('7654321');
    assert.equal(junior?.category, 'Junior');

    const veteran = await client.searchByLicence('2121212');
    assert.equal(veteran?.category, 'Veteran');

    const cadet = await client.searchByLicence('1111111');
    assert.equal(cadet?.category, 'Cadet');

    const benjamin = await client.searchByLicence('5555555');
    assert.equal(benjamin?.category, 'Benjamin');
  });

  it('should find players with different point ranges', async () => {
    const client = new MockFFTTClient(0);

    // Low points (500-600)
    const lowPoints = await client.searchByLicence('5555555');
    assert.ok(lowPoints && lowPoints.points >= 500 && lowPoints.points < 700);

    // High points (2800-3000)
    const highPoints = await client.searchByLicence('1717171');
    assert.ok(highPoints && highPoints.points >= 2800);
  });

  it('should find both male and female players', async () => {
    const client = new MockFFTTClient(0);

    const male = await client.searchByLicence('1234567');
    assert.equal(male?.sex, 'M');

    const female = await client.searchByLicence('7654321');
    assert.equal(female?.sex, 'F');
  });
});
