const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config()
const crypto = require('crypto');
const { OpenAI } = require('openai');

const getTgLink = (endpoint) => {
    const url = `https://api.telegram.org/bot${process.env.TG_TOKEN}/`
    const testUrl = `${url}test/`
    const useTgTestEnv = JSON.parse(process.env.USE_TG_TEST_ENV)
    const link = useTgTestEnv ? `${testUrl}${endpoint}` : `${url}${endpoint}`
    return link
}

const validateInitTgData = (initData) => {
    const urlSearchParams = new URLSearchParams(initData);
    const data = Object.fromEntries(urlSearchParams.entries());
    const checkString = Object.keys(data).filter(key => key !== 'hash' )
        .map(key =>
        `${key}=${data[key]}`)
        .sort()
        .join('\n');
    const secretkey = crypto.createHmac( 'sha256', 'WebAppData')
        .update(process.env.TG_TOKEN)
        .digest();
    const signature = crypto.createHmac('sha256', secretkey)
        .update(checkString)
        .digest( 'hex');
    return data.hash === signature;
}

const initializeFirebase = () => {
    const rootPath = path.dirname(require.main.filename)
    const configPath = `${rootPath}/${process.env.FIREBASE_CONFIG}`
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(configPath),
        });
    }
    return admin.firestore();
};

const getAIClient = () => {
    const client = new OpenAI({
        apiKey: process.env.AI_API_KEY,
        baseURL: 'https://api.x.ai/v1',
    });
    return client
}

const parsePayload = (payload) => {
    if (!payload || !payload.includes('?')) {
        return {};
    }

    const [, queryString] = payload.split('?');

    const params = queryString.split('&').reduce((acc, param) => {
        const [key, value] = param.split('=');
        acc[key] = value;
        return acc;
    }, {});

    return params;
}

module.exports = {getTgLink, validateInitTgData, initializeFirebase, getAIClient, parsePayload}
