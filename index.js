const { Client, LocalAuth } = require('whatsapp-web.js');
const ffmpeg = require('fluent-ffmpeg');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const colors = require('colors');
const fs = require('fs');
const qr = require("qr-image")
const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        headless: true,
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    },
    authStrategy: new LocalAuth({ clientId: "client" })
});

const config = require('./config/config.json');

let codeBarra;

client.on('qr', (qr) => {
    console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Scan the QR below : `);
    qrcode.generate(qr, { small: true });
    codeBarra = qr

});
app.get('/', async (req, res) => {

    const code = await qr.image(codeBarra, { type: 'svg' })
    res.type('svg')
    code.pipe(res)

});
client.on('ready', () => {
    console.clear();
    const consoleText = './config/console.txt';
    fs.readFile(consoleText, 'utf-8', (err, data) => {
        if (err) {
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Console Text not found!`.yellow);
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} Bot's ready!`.green);
        } else {
            console.log(data.green);
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} Bot's ready!`.green);
        }
    })
});

client.on('message', async (message) => {
    const Chat = await message.getChat();
    if (message.body == "س" && Chat.isGroup) {
        if (message.type == "image") {
            try {
                Chat.sendStateTyping()
                const media = await message.downloadMedia();
                client.sendMessage(message.from, media, {
                    sendMediaAsSticker: true,
                    stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
                    stickerAuthor: `made with vanitasx_d bot` // Sticker Author = Your Whatsapp BOT Number
                }).then(() => {
                    Chat.clearState();
                    message.react("✅");
                });
            } catch {
                Chat.clearState();
                message.react("❌");
            }
        }
        else if (message.hasQuotedMsg) {
            const quotedMsg = await message.getQuotedMessage()
            if (quotedMsg.type == "image") {
                try {
                    Chat.sendStateTyping()
                    const media = await quotedMsg.downloadMedia();
                    client.sendMessage(message.from, media, {
                        sendMediaAsSticker: true,
                        stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
                        stickerAuthor: `made with vanitasx_d bot` // Sticker Author = Your Whatsapp BOT Number
                    }).then(() => {
                        Chat.clearState();
                        quotedMsg.react("✅");
                        message.react("✅");
                    });
                } catch {
                    Chat.clearState();
                    message.react("❌");
                }
            } else {
                message.react("❌");
            }
        }
        else {
            message.react("❌");
        }
    }
    else {
        client.getChatById(message.id.remote).then(async (chat) => {
            await chat.sendSeen();
        });
    }
});

client.initialize();
