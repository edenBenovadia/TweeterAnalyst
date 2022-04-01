const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const BACKEND_URL = 'https://mars.larium.ai:8002'

export class TweetsRetriever {
    private headers: string;
    private userName: string;
    private password: string;

    constructor(username: string, password: string) {
        this.userName = username;
        this.password = password;
    }

    public async getHeaders(): Promise<string> {
        const token_route = '/token/'
        const params = {
            username: this.userName,
            password: this.password,
            grant_type: 'password',
        };

        try {
            const result = await axios.post(BACKEND_URL + token_route, params, {timeout: 6500, verify: false});
            if (!result.text) {
                return undefined;
            }

            this.headers = result.text['access_token'];
            return this.headers;
        } catch (err) {
            console.log('error loading ' + err);
            return undefined;
        }
    }

}
