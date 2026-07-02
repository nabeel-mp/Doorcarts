const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// LocalAuth saves the session so you only have to scan the QR code once
const client = new Client({
    authStrategy: new LocalAuth() 
});

client.on('qr', (qr) => {
    // Generates a QR code in your terminal
    // Scan it using WhatsApp > Linked Devices on your phone
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp connection ready!');
    
    // Format the number: Country code + number + @c.us (no '+' sign)
    const targetNumber = '919645553003'; 
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    
    client.sendMessage(`${targetNumber}@c.us`, `Your verification code is: ${otpCode}`);
    console.log(`OTP sent to ${targetNumber}`);
});

client.initialize();