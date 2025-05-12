const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT
const tgbotService = require('./service/tgbot.service')
const router = require('./routes/router')
const {initializeFirebase} = require('./utils/utils')

app.use(express.json({limit: '5mb'}));
app.use(cors());

let start = async() => {
    initializeFirebase();
    await tgbotService.tgbotInit()

    app.listen(port, () => {
        console.log('server has been launched')
    })

    app.use('/', router)

}

start();
