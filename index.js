const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');

// إعداد العميل
const client = new Client({
    authStrategy: new LocalAuth(),
});

// الردود التلقائية
const responses = {
    initial: () => ({ text: 'أهلاً بك في بوت WhatsApp', imageUrl: null }),
    sad: () => ({ text: 'آسف لأنك حزين، هل يمكنني المساعدة؟', imageUrl: null }),
    weather: () => ({ text: 'الطقس اليوم مشمس!', imageUrl: null }),
    farewell: () => ({ text: 'وداعاً، أتمنى لك يوماً سعيداً!', imageUrl: null })
};

// دالة لاستجابة الذكاء الاصطناعي
const getAIResponse = async (message) => {
    try {
        const response = await axios.post('YOUR_AI_API_URL', { message: message.body });
        return response.data.reply;
    } catch (error) {
        console.error('Error:', error);
        return "حدث خطأ في استجابة الذكاء الاصطناعي.";
    }
};

// توليد QR كود لتسجيل الدخول
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// عند جاهزية العميل
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

// الرد على الرسائل
client.on('message', async (message) => {
    let response;

    if (message.body.toLowerCase().includes('حزين')) {
        response = responses.sad();
    } else if (message.body.toLowerCase().includes('طقس')) {
        response = responses.weather();
    } else if (message.body.toLowerCase().includes('وداع')) {
        response = responses.farewell();
    } else {
        response = await getAIResponse(message);
    }

    await message.reply(response.text);
    if (response.imageUrl) {
        const media = MessageMedia.fromFilePath(response.imageUrl);
        await message.reply(media);
    }
});

// بدء تشغيل العميل
client.initialize();
