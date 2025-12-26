export interface Player {
    licence: string;
    firstName: string;
    lastName: string;
    club: string;
    points: number;
    sex: 'M' | 'F';
    category: string;
    toVerify?: boolean;
}
export declare class FFTTApiError extends Error {
    constructor(message: string);
}
export interface FFTTClientInterface {
    searchByLicence(licence: string): Promise<Player | null>;
    initialize(): Promise<boolean>;
}
