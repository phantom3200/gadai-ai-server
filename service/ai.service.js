const {getAIClient} = require('../utils/utils')
const {testPrediction, aiPromptText, aiRoleText} = require('../const/const')
require('dotenv').config();

class AiService {
    constructor() {
        this.client = getAIClient();
    }

    async getAIResponse (base64Image) {
        const isTestMode = JSON.parse(process.env.IS_TEST_MODE)

        if (isTestMode) {
            return {success: true, data: testPrediction}
        }

        const response = await this.client.chat.completions.create({
            model: 'grok-2-vision-1212',
            messages: [
                { role: 'system', content: aiRoleText },
                { role: 'user', content: [
                        {type: 'text', text: aiPromptText},
                        { type: 'image_url', image_url: { url: base64Image } }
                    ]},
            ],
            temperature: 0.7,      // Настраиваемый параметр: креативность ответа
            max_tokens: 300,       // Максимальная длина ответа в токенах
            top_p: 1,              // Вероятностный порог для выбора токенов
            frequency_penalty: 0,  // Штраф за повторение слов
            presence_penalty: 0,   // Штраф за новые темы
        }).then(response => {
            console.log(response)
            return {success: true, data: response.choices[0].message.content}
        }).catch(e => {
            console.log(e)
            return ({success: false, data: e})
        })
        return response
    }
}

module.exports = new AiService()
