'use strict';

const Axios = require('axios');
const Speakeasy = require('speakeasy');
const Bunyan = require('bunyan');
const Limiter = require('limiter');
const QueryString = require('querystring');

// Import constants from index.js to have access to CATEGORY, UPC, PLATFORM, etc.
let MainConst = {};
try {
    const indexModule = require('../../index');
    MainConst = indexModule.CATEGORY ? indexModule : (indexModule.CONST || {});
} catch (e) {
    // If can't load, use defaults
}

// ---------------- CONST ----------------
const CONST = {
    BASE_URL: {
        production: 'https://production-gameflip.fingershock.com/api/v1',
        test: 'https://test-gameflip.fingershock.com/api/v1',
        development: 'http://localhost:3000/api/v1'
    },
    LOG_NAME_FROM_LEVEL: {
        10: 'TRACE',
        20: 'DEBUG',
        30: 'INFO',
        40: 'WARN',
        50: 'ERROR',
        60: 'FATAL'
    },
    // Import constants from main module if available
    CATEGORY: MainConst.CATEGORY || {},
    KIND: MainConst.KIND || {},
    UPC: MainConst.UPC || {},
    PLATFORM: MainConst.PLATFORM || {},
    LISTING_STATUS: MainConst.LISTING_STATUS || {},
    EXCHANGE_STATUS: MainConst.EXCHANGE_STATUS || {},
    ACCEPT_CURRENCY: MainConst.ACCEPT_CURRENCY || {},
    STEAM: MainConst.STEAM || {},
    ESCROW_STATUS: MainConst.ESCROW_STATUS || {},
    LISTING_OPS: MainConst.LISTING_OPS || {}
};

// ---------------- Util ----------------
const Util = {
    emptyArray: x => ((typeof x === 'undefined') || (Array.isArray(x) && x.length == 0)),
    isNull: x => ((typeof x === 'undefined') || (x === null)),
    options: function () {
        for (let i = 0; i < arguments.length; i++) {
            let x = arguments[i];
            if ((typeof x !== 'undefined') && (x !== null)) return x;
        }
        return null;
    },
    queryString: obj => {
        const qs = QueryString.stringify(obj);
        return qs ? ('?' + qs) : '';
    },
    sleep: seconds => new Promise(r => setTimeout(r, seconds * 1000))
};

// ---------------- Clase GfApi ----------------
class GfApi {
    constructor(apiKey, secret, options = {}) {
        if (!apiKey || !secret) throw new Error('API_KEY o API_SECRET no definidos');
        
        this.apiKey = apiKey;
        this.secret = Object.assign(
            { 
                encoding: 'base32', 
                algorithm: 'sha1',
                digits: 6, 
                period: 30 
            },
            typeof secret === 'string' ? { secret: secret } : secret
        );
        
        // Ensure secret.secret is set
        if (!this.secret.secret && typeof secret === 'string') {
            this.secret.secret = secret;
        }
        
        this.baseUrl = CONST.BASE_URL.production;
        this.environment = options.environment || 'production';
        
        if (this.environment in CONST.BASE_URL) {
            this.baseUrl = CONST.BASE_URL[this.environment];
        }

        this.log = Bunyan.createLogger({
            name: 'gfapi',
            level: options.logLevel || 'info',
            stream: {
                type: 'raw',
                write: function (json) {
                    const entry = JSON.parse(json);
                    console.log(`${CONST.LOG_NAME_FROM_LEVEL[entry.level]} ${entry.msg}`);
                }
            }
        });

        this.rateLimiter = new Limiter.RateLimiter({ tokensPerInterval: 3, interval: "minute" });
        
        // Setup axios instance
        this.axios = Axios.create({
            baseURL: this.baseUrl,
            timeout: 30000
        });
    }

    async _get(uri, params = {}) {
        await this.rateLimiter.removeTokens(1);
        
        const fullUrl = `${this.baseUrl}/${uri}${Util.queryString(params)}`;
        const token = Speakeasy.totp({
            secret: this.secret.secret,
            encoding: this.secret.encoding,
            algorithm: this.secret.algorithm,
            digits: this.secret.digits,
            period: this.secret.period
        });

        this.log.debug(`GET ${fullUrl} - Token: ${token.substring(0, 10)}...`);

        try {
            const response = await this.axios.get(fullUrl, {
                headers: {
                    "Authorization": `GFAPI ${this.apiKey}:${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            this.log.debug(`GET ${fullUrl} - Status: ${response.status}`);
            
            // GameFlip API returns {status: "SUCCESS", data: ...} or {status: "FAILURE", error: ...}
            const apiData = response.data || {};
            
            if (apiData.status === 'SUCCESS') {
                this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);
                return apiData.data;
            } else {
                const error = apiData.error || {};
                const errorMessage = error.message || JSON.stringify(error) || 'Unknown error';
                const errorCode = error.code || response.status || 500;
                this.log.error(`FAIL: ${fullUrl} - Status: ${errorCode}, Message: ${errorMessage}`);
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            }
        } catch (err) {
            this.log.error(`ERROR ${fullUrl} - ${err.message}`);
            
            if (err.response) {
                const apiData = err.response.data || {};
                const error = apiData.error || {};
                const errorMessage = error.message || err.message || JSON.stringify(apiData) || 'Unknown error';
                const errorCode = error.code || err.response.status || 500;
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            } else if (err.request) {
                throw new Error(`No response from server: ${fullUrl}`);
            } else {
                throw err;
            }
        }
    }

    // Account methods - como en el ejemplo
    async profile_get(id = 'me') {
        return this._get(`account/${id}/profile`);
    }

    /**
     * Get wallet balance and transaction history/ledger
     * @param {string} owner - User ID or 'me' (default: 'me')
     * @param {object} options - Options for data return
     *   - balance_only: Return only the wallet balance without any recent history (without ledger)
     *   - flp: Return with the "balance" property to be a map showing the balance for each currency supported
     *   - pending: Also include pending transactions
     *   - held: Also include held transactions
     *   - year_month (yyyy-mm): The year and month in which the transactions took place
     * @returns {Promise} wallet information
     */
    async wallet_get(owner = 'me', options = {}) {
        let endpoint = `account/${owner}/wallet_history`;
        let opts = options || {};

        // Default behavior: balance_only if year_month not provided
        if (!opts.year_month && typeof opts.balance_only === 'undefined') {
            opts.balance_only = true;
        }
        if (typeof opts.flp === 'undefined') {
            opts.flp = true;
        }

        // Build query string - flags should be without =, values should have =
        let qs = "";
        for (let prop in opts) {
            if (opts[prop] !== undefined && opts[prop] !== null) {
                if (opts[prop] === true) {
                    // Flag parameter: just add the name (e.g., ?balance_only)
                    qs += prop + '&';
                } else if (opts[prop] !== false) {
                    // Value parameter: add name=value (e.g., ?year_month=2024-01)
                    qs += prop + '=' + encodeURIComponent(opts[prop]) + '&';
                }
            }
        }
        
        // Remove trailing &
        if (qs) {
            qs = qs.slice(0, -1);
            endpoint += "?" + qs;
        }

        return this._get(endpoint);
    }

    /**
     * Convenience method to get wallet for current user
     */
    async getWallet(options = {}) {
        return this.wallet_get('me', options);
    }

    /**
     * Get a user's listings
     * @param {string} owner - User ID or 'me' (default: 'me')
     * @returns {Promise} listings array
     */
    async listing_of(owner = 'me') {
        const query = { owner: owner, v2: true };
        return this._getList('listing', query);
    }

    /**
     * Search exchanges (purchases or sold listings)
     * @param {object} params - Search parameters (role, buyer, seller, status, etc.)
     * @returns {Promise} exchange search result
     */
    async exchange_search(params = {}) {
        return this._getList('exchange', params);
    }

    /**
     * Query your escrows (subset of data fields) by status
     * @param {object} params - Query options
     *   - status: Either 'received' (default), 'delivered', 'returned'
     *   - limit: # of entries to get (default: 20, max: 100)
     * @returns {Promise} Array of escrows or null if none left
     */
    async escrow_search(params = {}) {
        return this._getList('steam/escrow/mine', params);
    }

    /**
     * Get escrow data, if exists, for given listing id. Caller must own listing.
     * @param {string} id - Listing ID
     * @returns {Promise} escrow data
     */
    async escrow_get(id) {
        return this._get(`steam/escrow/${id}`);
    }

    /**
     * Check if you have a Steam trade ban or hold
     * @returns {Promise} empty object if okay, throws error if trade ban/hold
     */
    async steam_trade_status() {
        return this._get('steam/escrow/hold');
    }

    /**
     * Check if you have a Steam trade ban or hold (alias)
     */
    async check_trade_ban() {
        return this.steam_trade_status();
    }

    // ========== Product methods ==========
    /**
     * Search the product catalog
     * @param {object} query - Search parameters
     * @returns {Promise} Array of products
     */
    async product_search(query = {}) {
        return this._getList('product', query);
    }

    /**
     * Get a single product by id
     * @param {string} id - Product id
     * @returns {Promise} product
     */
    async product_get(id) {
        return this._get(`product/${id}`);
    }

    // ========== Listing methods ==========
    /**
     * Get a single listing by id
     * @param {string} id - Listing id
     * @returns {Promise} listing
     */
    async listing_get(id) {
        return this._get(`listing/${id}`);
    }

    /**
     * Search listings
     * @param {object} query - Search parameters (category, platform, price, tags, etc.)
     * @returns {Promise} Array of listings
     */
    async listing_search(query = {}) {
        query.v2 = true;
        return this._getList('listing', query);
    }

    /**
     * Create a blank listing to be edited and posted
     * @param {object} query - Listing data
     * @returns {Promise} listing
     */
    async listing_post(query) {
        return this._post('listing', query);
    }

    /**
     * Update a listing with new or updated properties
     * @param {string} id - Listing id
     * @param {array} query - JSON Patch operations
     * @returns {Promise} listing
     */
    async listing_patch(id, query) {
        return this._patch(`listing/${id}`, query);
    }

    /**
     * Change a listing's status
     * @param {string} id - Listing id
     * @param {string} status - New status (draft, ready, onsale, sold)
     * @returns {Promise} listing
     */
    async listing_status(id, status) {
        return this.listing_patch(id, [{
            op: 'replace',
            path: '/status',
            value: status
        }]);
    }

    /**
     * Delete a single listing by id
     * @param {string} id - Listing id
     * @returns {Promise} result
     */
    async listing_delete(id) {
        await this.listing_status(id, 'draft');
        return this._delete(`listing/${id}`);
    }

    /**
     * Get digital goods from listing if any available
     * @param {string} id - Listing id
     * @returns {Promise} digital content
     */
    async digital_goods_get(id) {
        return this._get(`listing/${id}/digital_goods`);
    }

    /**
     * Put digital goods/content for digital listing
     * @param {string} id - Listing id
     * @param {string} code - Digital code or content
     * @returns {Promise} result
     */
    async digital_goods_put(id, code) {
        return this._put(`listing/${id}/digital_goods`, { code: code });
    }

    /**
     * Upload an online image to Gameflip for use as the listing's photo
     * @param {string} listing_id - Listing id
     * @param {string} file_or_url - URL or file path
     * @param {number} display_order - Display order (optional, 0 for cover photo)
     * @returns {Promise} result
     */
    async upload_photo(listing_id, file_or_url, display_order) {
        // Simplified version - full implementation would handle file reading
        // For now, assume it's a URL
        const photoUrl = file_or_url;
        
        // Request permission to upload
        const photo_obj = await this._post(`listing/${listing_id}/photo`);
        if (!photo_obj || !photo_obj.upload_url) {
            throw new Error('Failed to get photo upload URL');
        }

        // Download and upload the image
        const FileType = require('file-type');
        const response = await this.axios.get(photoUrl, { responseType: 'arraybuffer' });
        const imageBuffer = response.data;
        const imageType = await FileType.fromBuffer(imageBuffer);

        // Upload to S3
        await this.axios.put(photo_obj.upload_url, imageBuffer, {
            headers: { "Content-Type": imageType.mime }
        });

        // Update listing with photo
        const patch = [{
            op: 'replace',
            path: `/photo/${photo_obj.id}/status`,
            value: 'active'
        }];

        if (display_order >= 0) {
            patch.push({
                op: 'replace',
                path: `/photo/${photo_obj.id}/display_order`,
                value: display_order
            });
        } else {
            patch.push({
                op: 'replace',
                path: '/cover_photo',
                value: photo_obj.id
            });
        }

        return this.listing_patch(listing_id, patch);
    }

    // ========== Bulk/Steam methods ==========
    /**
     * Query your bulk objects by status
     * @param {object} query - Query options (status, limit)
     * @returns {Promise} Array of bulks
     */
    async bulk_mine_get(query = {}) {
        return this._getList('steam/bulk/mine', query);
    }

    /**
     * Get bulk object
     * @param {string} id - Bulk id
     * @returns {Promise} bulk data
     */
    async bulk_get(id) {
        return this._get(`steam/bulk/${id}`);
    }

    /**
     * Create bulk object
     * @returns {Promise} bulk data
     */
    async bulk_post() {
        return this._post('steam/bulk');
    }

    /**
     * Initiate trade offer or gets latest bulk object
     * @param {string} id - Bulk ID
     * @param {object} data - Optional. Items data for trade offer
     * @returns {Promise} bulk data
     */
    async bulk_put(id, data = null) {
        return this._put(`steam/bulk/${id}`, data);
    }

    /**
     * Get public steam inventory (helper function, not part of official API)
     * @param {string} profileId - Steam Profile ID
     * @param {string} appId - Steam App ID
     * @param {object} query - Query parameters
     * @returns {Promise} inventory data
     */
    async steam_inventory_get(profileId, appId, query = {}) {
        if (query.start_assetid === null) {
            return null;
        }

        const contextId = '2'; // Default context ID
        const url = `http://steamcommunity.com/inventory/${profileId}/${appId}/${contextId}${Util.queryString(query)}`;
        this.log.debug(`GET Steam inventory: ${url}`);
        
        try {
            const response = await this.axios.get(url);
            const apiData = response.data || {};
            
            if (apiData.success) {
                if (query) {
                    query.start_assetid = apiData.last_assetid || null;
                }
                return apiData;
            } else {
                throw new Error('Steam inventory request failed');
            }
        } catch (err) {
            this.log.error(`Steam inventory error: ${err.message}`);
            throw err;
        }
    }

    // ========== HTTP methods ==========
    async _post(uri, data = null) {
        await this.rateLimiter.removeTokens(1);
        
        const fullUrl = `${this.baseUrl}/${uri}`;
        const token = Speakeasy.totp({
            secret: this.secret.secret,
            encoding: this.secret.encoding,
            algorithm: this.secret.algorithm,
            digits: this.secret.digits,
            period: this.secret.period
        });

        this.log.debug(`POST ${fullUrl}`);

        try {
            const response = await this.axios.post(fullUrl, data, {
                headers: {
                    "Authorization": `GFAPI ${this.apiKey}:${token}`,
                    "Content-Type": "application/json"
                }
            });

            this.log.debug(`POST ${fullUrl} - Status: ${response.status}`);
            
            const apiData = response.data || {};
            
            if (apiData.status === 'SUCCESS') {
                this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);
                return apiData.data;
            } else {
                const error = apiData.error || {};
                const errorMessage = error.message || JSON.stringify(error) || 'Unknown error';
                const errorCode = error.code || response.status || 500;
                this.log.error(`FAIL: ${fullUrl} - Status: ${errorCode}, Message: ${errorMessage}`);
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            }
        } catch (err) {
            this.log.error(`ERROR ${fullUrl} - ${err.message}`);
            
            if (err.response) {
                const apiData = err.response.data || {};
                const error = apiData.error || {};
                const errorMessage = error.message || err.message || JSON.stringify(apiData) || 'Unknown error';
                const errorCode = error.code || err.response.status || 500;
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            } else if (err.request) {
                throw new Error(`No response from server: ${fullUrl}`);
            } else {
                throw err;
            }
        }
    }

    async _put(uri, data = null) {
        await this.rateLimiter.removeTokens(1);
        
        const fullUrl = `${this.baseUrl}/${uri}`;
        const token = Speakeasy.totp({
            secret: this.secret.secret,
            encoding: this.secret.encoding,
            algorithm: this.secret.algorithm,
            digits: this.secret.digits,
            period: this.secret.period
        });

        this.log.debug(`PUT ${fullUrl}`);

        try {
            const response = await this.axios.put(fullUrl, data, {
                headers: {
                    "Authorization": `GFAPI ${this.apiKey}:${token}`,
                    "Content-Type": "application/json"
                }
            });

            this.log.debug(`PUT ${fullUrl} - Status: ${response.status}`);
            
            const apiData = response.data || {};
            
            if (apiData.status === 'SUCCESS') {
                this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);
                return apiData.data;
            } else {
                const error = apiData.error || {};
                const errorMessage = error.message || JSON.stringify(error) || 'Unknown error';
                const errorCode = error.code || response.status || 500;
                this.log.error(`FAIL: ${fullUrl} - Status: ${errorCode}, Message: ${errorMessage}`);
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            }
        } catch (err) {
            this.log.error(`ERROR ${fullUrl} - ${err.message}`);
            
            if (err.response) {
                const apiData = err.response.data || {};
                const error = apiData.error || {};
                const errorMessage = error.message || err.message || JSON.stringify(apiData) || 'Unknown error';
                const errorCode = error.code || err.response.status || 500;
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            } else if (err.request) {
                throw new Error(`No response from server: ${fullUrl}`);
            } else {
                throw err;
            }
        }
    }

    async _patch(uri, data = null) {
        await this.rateLimiter.removeTokens(1);
        
        const fullUrl = `${this.baseUrl}/${uri}`;
        const token = Speakeasy.totp({
            secret: this.secret.secret,
            encoding: this.secret.encoding,
            algorithm: this.secret.algorithm,
            digits: this.secret.digits,
            period: this.secret.period
        });

        this.log.debug(`PATCH ${fullUrl}`);

        try {
            const response = await this.axios.patch(fullUrl, data, {
                headers: {
                    "Authorization": `GFAPI ${this.apiKey}:${token}`,
                    "Content-Type": "application/json-patch+json"
                }
            });

            this.log.debug(`PATCH ${fullUrl} - Status: ${response.status}`);
            
            const apiData = response.data || {};
            
            if (apiData.status === 'SUCCESS') {
                this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);
                return apiData.data;
            } else {
                const error = apiData.error || {};
                const errorMessage = error.message || JSON.stringify(error) || 'Unknown error';
                const errorCode = error.code || response.status || 500;
                this.log.error(`FAIL: ${fullUrl} - Status: ${errorCode}, Message: ${errorMessage}`);
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            }
        } catch (err) {
            this.log.error(`ERROR ${fullUrl} - ${err.message}`);
            
            if (err.response) {
                const apiData = err.response.data || {};
                const error = apiData.error || {};
                const errorMessage = error.message || err.message || JSON.stringify(apiData) || 'Unknown error';
                const errorCode = error.code || err.response.status || 500;
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            } else if (err.request) {
                throw new Error(`No response from server: ${fullUrl}`);
            } else {
                throw err;
            }
        }
    }

    async _delete(uri) {
        await this.rateLimiter.removeTokens(1);
        
        const fullUrl = `${this.baseUrl}/${uri}`;
        const token = Speakeasy.totp({
            secret: this.secret.secret,
            encoding: this.secret.encoding,
            algorithm: this.secret.algorithm,
            digits: this.secret.digits,
            period: this.secret.period
        });

        this.log.debug(`DELETE ${fullUrl}`);

        try {
            const response = await this.axios.delete(fullUrl, {
                headers: {
                    "Authorization": `GFAPI ${this.apiKey}:${token}`
                }
            });

            this.log.debug(`DELETE ${fullUrl} - Status: ${response.status}`);
            
            const apiData = response.data || {};
            
            if (apiData.status === 'SUCCESS') {
                this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);
                return apiData.data || { success: true };
            } else {
                const error = apiData.error || {};
                const errorMessage = error.message || JSON.stringify(error) || 'Unknown error';
                const errorCode = error.code || response.status || 500;
                this.log.error(`FAIL: ${fullUrl} - Status: ${errorCode}, Message: ${errorMessage}`);
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            }
        } catch (err) {
            this.log.error(`ERROR ${fullUrl} - ${err.message}`);
            
            if (err.response) {
                const apiData = err.response.data || {};
                const error = apiData.error || {};
                const errorMessage = error.message || err.message || JSON.stringify(apiData) || 'Unknown error';
                const errorCode = error.code || err.response.status || 500;
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            } else if (err.request) {
                throw new Error(`No response from server: ${fullUrl}`);
            } else {
                throw err;
            }
        }
    }

    async _getList(uri, query = {}) {
        // Handle pagination with nextPage
        if (query.nextPage === null) {
            return null;
        }

        await this.rateLimiter.removeTokens(1);
        
        // Determine the URL to use
        let fullUrl;
        if (query.nextPage) {
            // Use nextPage URL directly (could be full URL or relative)
            fullUrl = query.nextPage.startsWith('http') 
                ? query.nextPage 
                : `${this.baseUrl}/${query.nextPage.replace(/^\//, '')}`;
            // Remove nextPage from query params
            const { nextPage, ...restParams } = query;
            query = restParams;
        } else {
            // Build URL from uri and query params
            fullUrl = `${this.baseUrl}/${uri}${Util.queryString(query)}`;
        }
        
        const token = Speakeasy.totp({
            secret: this.secret.secret,
            encoding: this.secret.encoding,
            algorithm: this.secret.algorithm,
            digits: this.secret.digits,
            period: this.secret.period
        });

        try {
            const response = await this.axios.get(fullUrl, {
                headers: {
                    "Authorization": `GFAPI ${this.apiKey}:${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            this.log.debug(`GET ${fullUrl} - Status: ${response.status}`);
            
            const apiData = response.data || {};
            
            if (apiData.status === 'SUCCESS') {
                this.log.trace(`SUCCESS: ${JSON.stringify(apiData, null, 2)}`);
                
                // Get next_page from top level (apiData.next_page) or from data (apiData.data.next_page)
                const nextPage = apiData.next_page || (apiData.data && apiData.data.next_page) || null;
                
                // Update query.nextPage for pagination (for internal tracking)
                query.nextPage = nextPage;
                
                // Return data array or object, but also include next_page if it exists
                const data = apiData.data;
                
                // If data is an object and doesn't already have next_page, add it
                if (data && typeof data === 'object' && !Array.isArray(data) && nextPage && !data.next_page) {
                    data.next_page = nextPage;
                }
                
                return data;
            } else {
                const error = apiData.error || {};
                const errorMessage = error.message || JSON.stringify(error) || 'Unknown error';
                const errorCode = error.code || response.status || 500;
                this.log.error(`FAIL: ${fullUrl} - Status: ${errorCode}, Message: ${errorMessage}`);
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            }
        } catch (err) {
            this.log.error(`ERROR ${fullUrl} - ${err.message}`);
            
            if (err.response) {
                const apiData = err.response.data || {};
                const error = apiData.error || {};
                const errorMessage = error.message || err.message || JSON.stringify(apiData) || 'Unknown error';
                const errorCode = error.code || err.response.status || 500;
                throw new Error(`API Error ${errorCode}: ${errorMessage}`);
            } else if (err.request) {
                throw new Error(`No response from server: ${fullUrl}`);
            } else {
                throw err;
            }
        }
    }
}

// ---------------- Función getGf para compatibilidad ----------------
function getGf() {
    // Use production by default unless explicitly set to 'test' or 'development'
    // NODE_ENV=development is for the Express server, not for GameFlip API environment
    let environment = 'production';
    if (process.env.GAMEFLIP_ENV) {
        environment = process.env.GAMEFLIP_ENV;
    } else if (process.env.NODE_ENV === 'test') {
        environment = 'test';
    }
    // Never use 'development' environment unless explicitly set via GAMEFLIP_ENV
    
    return new GfApi(
        process.env.GAMEFLIP_API_KEY || process.env.GFAPI_KEY,
        process.env.GAMEFLIP_API_SECRET || process.env.GFAPI_SECRET,
        {
            environment: environment,
            logLevel: process.env.LOG_LEVEL || 'info'
        }
    );
}

// Add static sleep method
GfApi.sleep = Util.sleep;

// Attach constants to class for easy access (e.g., GfApi.CATEGORY.GAMES)
Object.keys(CONST).forEach(key => {
    if (key !== 'BASE_URL' && key !== 'LOG_NAME_FROM_LEVEL') {
        GfApi[key] = CONST[key];
    }
});

// ---------------- EXPORT ----------------
module.exports = GfApi;
module.exports.getGf = getGf;
module.exports.CONST = CONST;
module.exports.Util = Util;