import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Using require to load JSON in NodeNext module type without assert assertions which might be experimental or change
const mockPlayers = require('../data/mock-players.json');
export class MockFFTTClient {
    constructor(delay = 200) {
        this.delay = delay;
    }
    async searchByLicence(licence) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, this.delay));
        const player = mockPlayers.find((p) => p.licence === licence);
        return player || null;
    }
    async searchByLicenceB(licence) {
        await new Promise((resolve) => setTimeout(resolve, this.delay));
        const player = mockPlayers.find((p) => p.licence === licence);
        return player || null;
    }
    async initialize() {
        await new Promise((resolve) => setTimeout(resolve, this.delay));
        return true;
    }
}
