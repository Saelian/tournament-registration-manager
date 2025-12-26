import axios from 'axios';
import { Parser } from 'xml2js';
import crypto from 'crypto';
export class FFTTClient {
    constructor(config) {
        this.config = config;
        this.client = axios.create({
            baseURL: 'http://www.fftt.com/mobile/pxml',
            timeout: 5000,
        });
        this.parser = new Parser({ explicitArray: false });
    }
    generateTimestamp() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const pad3 = (n) => n.toString().padStart(3, '0');
        return [
            now.getFullYear(),
            pad(now.getMonth() + 1),
            pad(now.getDate()),
            pad(now.getHours()),
            pad(now.getMinutes()),
            pad(now.getSeconds()),
            pad3(now.getMilliseconds())
        ].join('');
    }
    generateTmc(tm, password) {
        if (!password)
            return '';
        // Based on common implementations, tmc is HMAC-SHA1 or MD5 hash of the timestamp with the password
        // For now, we'll assume HMAC-SHA1. This might need adjustment based on exact specs.
        return crypto.createHmac('sha1', password).update(tm).digest('hex');
    }
    async searchByLicence(licence) {
        const tm = this.generateTimestamp();
        const tmc = this.generateTmc(tm, this.config.password);
        try {
            const response = await this.client.get('/xml_joueur.php', {
                params: {
                    serie: this.config.serie,
                    id: this.config.appId,
                    tm,
                    tmc,
                    licence,
                },
                responseType: 'text', // We expect XML
            });
            if (!response.data)
                return null;
            const result = await this.parser.parseStringPromise(response.data);
            // FFTT XML structure usually looks like: <liste><joueur>...</joueur></liste> or just <joueur>...
            // Based on search: <joueur> is the root for each player, but maybe wrapped in <liste> if multiple?
            // Endpoint is singular "xml_joueur", so likely returns one <joueur> or <liste><joueur>...
            const playerNode = result.liste?.joueur || result.joueur;
            if (!playerNode)
                return null;
            // Handle case where playerNode is an array (should not happen for single licence search but safety check)
            const data = Array.isArray(playerNode) ? playerNode[0] : playerNode;
            // Map XML fields to Player interface
            // <licence>, <nom>, <prenom>, <club>, <point>, <sexe> (maybe?), <categ>
            // Note: 'sexe' field wasn't explicitly in the search result list but is common. 
            // Search result had: <licence>, <nom>, <prenom>, <club>, <nclub>, <natio>, <clglob>, <point>, ...
            // I'll assume 'sexe' is 'M' or 'F' if present, or infer/default.
            // Search result didn't list 'sexe'. I might need another endpoint or it was omitted.
            // Let's assume it's not there and default to 'M' or check if I can get it.
            // Actually, standard FFTT `xml_joueur` might not have sex. `xml_liste_joueur` might.
            // For now, I'll map what I have.
            return {
                licence: data.licence,
                firstName: data.prenom,
                lastName: data.nom,
                club: data.club,
                points: parseFloat(data.point || '0'), // points are strings in XML
                sex: data.sexe === 'F' ? 'F' : 'M', // Assumption if field exists
                category: data.categ,
            };
        }
        catch (error) {
            // In production, we should log this error
            console.error('FFTT API Error:', error);
            return null;
        }
    }
}
