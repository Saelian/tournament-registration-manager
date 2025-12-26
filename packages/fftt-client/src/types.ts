export interface Player {
  licence: string;
  firstName: string;
  lastName: string;
  club: string;
  points: number;
  sex: 'M' | 'F';
  category: string; // "Senior", "Junior", "Cadet", etc.
}

export interface FFTTClientInterface {
  searchByLicence(licence: string): Promise<Player | null>;
  initialize(): Promise<boolean>;
}
