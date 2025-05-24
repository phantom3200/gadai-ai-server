const firebaseService = require('../service/firebase.service')
class FirebaseController {
    async firebaseAuth(req, res) {
        const {body: {tgId, initData}} = req

        if (!tgId || !initData) {
            res.status(403).json({success:false, message: `Telegram data is not provided`})
        }

        const {success, data} = await firebaseService.auth(initData, tgId)
        if (success) {
            res.json({success:true, data:data});
        }
        else {
            res.json({success:false, message: `Can't create token: ${data}`});
        }
    }

    async getUserData(req, res){
        const uid = req.user.uid;
        const { success, data } = await firebaseService.getUser(uid);
        if (success) {
            res.json({ success: true, data });
        } else {
            res.json({ success: false, message: data });
        }
    }

    async createUser (req, res){
        const { user: { uid }, body } = req;
        const { success, data } = await firebaseService.createUser(uid, body);
        if (success) {
            res.json({ success: true, data });
        } else {
            res.json({ success: false, message: data });
        }
    }

    async updateUser (req, res){
        const { user: { uid }, body } = req;
        const { success, data } = await firebaseService.updateUser(uid, body);
        if (success) {
            res.json({ success: true, data });
        } else {
            res.json({ success: false, message: data });
        }
    }
}

module.exports = new FirebaseController()
