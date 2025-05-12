const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const {getTgLink, parsePayload} = require('../utils/utils')
require('dotenv').config()


class TgbotService {
    isTestMode = JSON.parse(process.env.IS_TEST_MODE)
    bot= null
    async tgbotInit () {
        const isTgTestEnvironment = JSON.parse(process.env.USE_TG_TEST_ENV);
        this.bot = new TelegramBot(process.env.TG_TOKEN, { polling: true, testEnvironment: isTgTestEnvironment });

        this.bot.on('successful_payment', async (msg) => {
            const chatId = msg.chat.id;
            const userID = msg.from.id;
            const paymentChargeID = msg.successful_payment.telegram_payment_charge_id;
            const payload = msg.successful_payment.invoice_payload;

            const params = parsePayload(payload);
            const predictionTitle = params.title

            this.bot.sendMessage(chatId, `Вы получили ${predictionTitle}`);
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

        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;

            if (msg.text === '/start') {
                const welcomeMessage = `Добро пожаловать в Astroface! 🎉\n` +
                    `Загрузи своё селфи / свою ладонь / фото кофейной гущи и получи индивидуальное предсказание на день от Искусственного Интеллекта.`;

                await this.bot.sendMessage(chatId, welcomeMessage);
            }
        });

        console.log('bot Launched')
    }

    async getInvoice(title, price, count, id) {
        const description = `Покупка ${title}`;
        const payload = `prediction_purchase?date=${Date.now()}&id=${id}&quantity=${count}&title=${title}`;
        const provider_token = "";
        const currency = "XTR";
        const amount = this.isTestMode ? 1 : price
        const prices = [{ label: "Price Label", amount }];

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
