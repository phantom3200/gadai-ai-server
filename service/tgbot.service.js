const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const {getTgLink} = require('../utils/utils')
require('dotenv').config()


class TgbotService {
    bot= null
    async tgbotInit () {
        const isTgTestEnvironment = JSON.parse(process.env.USE_TG_TEST_ENV)
        this.bot = new TelegramBot(process.env.TG_TOKEN, { polling: true, testEnvironment: isTgTestEnvironment });

        this.bot.on('successful_payment', async (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, 'Вы получили Pro версию');
            const userID = msg.from.id;
            const paymentChargeID = msg.successful_payment.telegram_payment_charge_id;
            console.log('successful_payment: ', msg.successful_payment);
            console.log('payment_charge_id: ', paymentChargeID);
           /* try {
                const isRefunded = await this.refundStarPayment(userID, paymentChargeID);
                console.log('is_refunded: ', isRefunded);
            } catch (err) {
                console.error("Can't refund on successful_payment: ", err);
            }*/
        });

        this.bot.on("pre_checkout_query", (query) => {
            console.log('preCheckoutQuery')
            this.bot.answerPreCheckoutQuery(query.id, true).then(() => {
                console.log('success preCheckout')
            }).catch(() => {
                console.error("answerPreCheckoutQuery failed");
            });
        });

        console.log('bot Launched')
    }

    async getInvoice() {
        const title = "Some Title";
        const description = "Some Description";
        const payload = '123';
        const provider_token = "";
        const currency = "XTR";
        const prices = [{ label: "Price Label", amount: 1 }];

        const result = await this.bot.createInvoiceLink(title, description, payload, provider_token, currency, prices);
        return result;
    }

    // Метод для вызова refundStarPayment
    async refundStarPayment(userId, telegramPaymentChargeId) {
        const url = getTgLink('refundStarPayment')
        try {
            const response = await axios.post(
                url,
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
