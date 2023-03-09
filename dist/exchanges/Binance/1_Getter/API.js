// node_modules
import crypto from 'crypto';
import https from 'https';
import { config } from 'dotenv';
config();
const BASE_ENDPOINT = process.env.BASE_ENDPOINT;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
import { newRequest } from '../Counter.js';
export const API = new class {
    getFees() {
        const options = {
            path: `/sapi/v1/asset/tradeFee`,
            isSecure: true
        };
        return this._createRequest(options);
    }
    getAccountInfo() {
        const options = {
            path: `/api/v3/account`,
            isSecure: true
        };
        return this._createRequest(options);
    }
    getExchangeInfo() {
        const options = {
            path: `/api/v3/exchangeInfo?permissions=SPOT`
        };
        return this._createRequest(options);
    }
    getSymbolsPrices(symbolsNames) {
        const options = {
            path: `/api/v3/ticker/price?symbols=${JSON.stringify(symbolsNames)}`
        };
        return this._createRequest(options);
    }
    _createRequest(options) {
        newRequest();
        const { method = 'GET', path, isSecure } = options;
        return new Promise(resolve => {
            const options = {
                hostname: BASE_ENDPOINT, path, method
            };
            if (isSecure) {
                options.headers = { 'X-MBX-APIKEY': API_KEY };
                options.path = this._updateToSecure(options.path);
            }
            const request = https.request(options, response => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('error', console.error);
                response.on('end', () => resolve(JSON.parse(data)));
            });
            request.on('error', err => {
                console.log('Request error!', err);
            });
            request.end();
        });
    }
    _updateToSecure(path) {
        const timestamp = Date.now();
        const hash = crypto.createHmac('sha256', API_SECRET)
            .update(`timestamp=${timestamp}`)
            .digest('hex');
        const char = path.includes('?') ? '&' : '?';
        return `${path}${char}timestamp=${timestamp}&signature=${hash}`;
    }
};
