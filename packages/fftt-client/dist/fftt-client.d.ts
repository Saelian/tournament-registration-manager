import { FFTTClientInterface, Player } from './types.js';
export interface FFTTClientConfig {
    appId: string;
    serie: string;
    password?: string;
}
export declare class FFTTClient implements FFTTClientInterface {
    private client;
    private config;
    private parser;
    constructor(config: FFTTClientConfig);
    private generateTimestamp;
    private generateTmc;
    initialize(): Promise<boolean>;
    searchByLicence(licence: string): Promise<Player | null>;
    searchByLicenceB(licence: string): Promise<Player | null>;
}
