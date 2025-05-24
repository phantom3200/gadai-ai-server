const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();
const { initializeFirebase } = require('../utils/utils')

class FirebaseService {
    constructor() {
        this.db = initializeFirebase();
    }
    async auth (initData, tgId) {
            const result = await admin.auth().createCustomToken(tgId)
                .then(async (customToken) => {
                    const idToken = await this.getIdToken(customToken)
                    return idToken
                })
                .catch((e) => {
                    return {success:false, data:e.message}
                });
            return result
        }

    async getIdToken (customToken) {
        const result = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_WEB_API_KEY}`,
            {
                token: customToken,
                returnSecureToken: true,
            }
        ).then(response => ({success: true, data: response.data.idToken}))
            .catch(e => ({success: false, data: e.message}))
        return result
    }

    async getUser (uid) {
        // эта функция, чтобы взять данные из таблицы аутентификации пользователей
        /*admin.auth().getUser(id)*/
        const userRef = this.db.collection('users').doc(uid);
        const result = await userRef.get()
            .then(response => {
                if (!response.exists) {
                    return { success: false, data: 'User not found in collection' };
                }
                return ({success: true, data: response.data()})
            })
            .catch(e => ({success: false, data: e.message}))
        return result
    }

    async createUser (uid, user) {
        const userRef = this.db.collection('users').doc(uid);
        const result = await userRef.set({
            ...user,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }).then(response => ({ success: true, data: 'User created successfully' }))
            .catch(e => ({success: false, data: e.message}))
        return result
    }

    async updateUser (uid, user) {
        const userRef = this.db.collection('users').doc(uid);
        const result = await userRef.update({
            ...user,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }).then(response => ({ success: true, data: 'User data updated successfully' }))
            .catch(e => ({success: false, data: e.message}))
        return result
    }

    async updateUserBalance (uid) {
        const response = await this.getUser(uid)
        if (response.success) {
            const newBalance = response.data.balance - 1
            const updatedUser = {...response.data, lastPredictionTimestamp: Date.now(), balance: newBalance}
            const {success, data} = await this.updateUser(uid, updatedUser)
            if (success) {
               return ({ success: true, data });
            } else {
                return ({ success: false, message: data });
            }
        }
        return ({success: false, message: 'Unable to update user balance'})
    }
}

module.exports = new FirebaseService();
