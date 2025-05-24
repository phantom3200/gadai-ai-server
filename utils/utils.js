const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config()
const { OpenAI } = require('openai');

const getTgLink = (endpoint) => {
    const url = `https://api.telegram.org/bot${process.env.TG_TOKEN}/`
    const testUrl = `${url}test/`
    const useTgTestEnv = JSON.parse(process.env.USE_TG_TEST_ENV)
    const link = useTgTestEnv ? `${testUrl}${endpoint}` : `${url}${endpoint}`
    return link
}

const initializeFirebase = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG)),
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

module.exports = {getTgLink, initializeFirebase, getAIClient, parsePayload}
