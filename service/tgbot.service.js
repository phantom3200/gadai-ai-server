const { Telegraf } = require("telegraf")
const axios = require('axios');
require('dotenv').config()


class TgbotService {
    bot=""
    async tgbotInit () {
        this.bot = new Telegraf(process.env.TG_TOKEN);

        this.bot.on('successful_payment', async ctx => {
            ctx.reply('Вы получили Pro версию')
            const userID = ctx.update.message.from.id
            const paymentChargeID = ctx.update.message?.successful_payment.telegram_payment_charge_id
            console.log('successful_payment: ', ctx.update.message?.successful_payment)
            console.log('payment_charge_id: ', paymentChargeID)
            try {
                const isRefunded = await this.refundStarPayment(userID, paymentChargeID)
                console.log('is_refunded: ', isRefunded)
            }
            catch(err) {
                console.error("Can't refund on successful_payment: ", err)
            }
        })

        this.bot.launch()
        console.log('bot Launched')
    }

    async buySubscription() {
        let titleText = "Some Title" 
        let descriptionText = "Some Description" 
        let payload = {}
        let providerToken = "" 
        let currency = "XTR"
        let prices = [{label:"Price Label", amount:1}]
        let obj = {title:titleText, description:descriptionText, payload:payload, provider_token:providerToken, currency:currency, prices:prices }
        let result = await this.bot.telegram.createInvoiceLink(obj)
        return result
    }

    // Метод для вызова refundStarPayment
    async refundStarPayment(userId, telegramPaymentChargeId) {
        try {
            const response = await axios.post(
                `https://api.telegram.org/bot${process.env.TG_TOKEN}/refundStarPayment`,
                {
                    user_id: userId,
                    telegram_payment_charge_id: telegramPaymentChargeId,
                }
            );

            if (response.data.ok) {
                return response.data.result; // Возврат успешен
            } else {
                throw new Error(response.data.description); // Ошибка Telegram API
            }
        } catch (error) {
            console.error('Ошибка при возврате платежа:', error.message);
            throw error;
        }
    }
}


module.exports = new TgbotService()
