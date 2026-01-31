import { FFTTClientInterface, Player } from './types.js';
export declare class MockFFTTClient implements FFTTClientInterface {
    private delay;
    constructor(delay?: number);
    searchByLicence(licence: string): Promise<Player | null>;
    searchByLicenceB(licence: string): Promise<Player | null>;
    initialize(): Promise<boolean>;
}
