const aiService = require('../service/ai.service')
const firebaseService = require('../service/firebase.service')

class AiController {

    async getPrediction(req, res) {
        const uid = req.user.uid;
        const { base64Image } = req.body;
        const {success, data} = await aiService.getAIResponse(base64Image)

        if (success) {
           await firebaseService.updateUserBalance(uid)
            res.json({success:true, data:data})
        }
        else {
            res.json({success:false, message: data})
        }
    }
}

module.exports = new AiController()
