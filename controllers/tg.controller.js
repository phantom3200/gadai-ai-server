const tgBotService = require('../service/tgbot.service')


class TgController {

    async getInvoiceLink(req, res) {
        const {title, price, count} = req.body
        const uid = req.user.uid;
        let result = await tgBotService.getInvoice(title, price, count, uid)
        if (result) {
            res.json({success:true, data:result})
        }
        else {
            res.json({success:false, message: `Can't get invoice link: ${result}`})
        }
    }

}

module.exports = new TgController()
