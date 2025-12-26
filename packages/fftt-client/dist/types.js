export class FFTTApiError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FFTTApiError';
    }
}
