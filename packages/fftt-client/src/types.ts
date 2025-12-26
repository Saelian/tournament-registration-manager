export interface Player {
  licence: string;
  firstName: string;
  lastName: string;
  club: string;
  points: number;
  sex: 'M' | 'F';
  category: string; // "Senior", "Junior", "Cadet", etc.
  toVerify?: boolean; // True when data is manually entered and not verified via FFTT API
}

export class FFTTApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FFTTApiError';
  }
}

export interface FFTTClientInterface {
  searchByLicence(licence: string): Promise<Player | null>;
  initialize(): Promise<boolean>;
}
