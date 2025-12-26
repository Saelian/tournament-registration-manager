import { FFTTClientInterface, Player } from './types.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// Using require to load JSON in NodeNext module type without assert assertions which might be experimental or change
const mockPlayers = require('../data/mock-players.json') as Player[];

export class MockFFTTClient implements FFTTClientInterface {
  private delay: number;

  constructor(delay: number = 200) {
    this.delay = delay;
  }

  async searchByLicence(licence: string): Promise<Player | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    const player = mockPlayers.find((p) => p.licence === licence);
    return player || null;
  }
}
