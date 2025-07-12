// bot.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const menu = require('./menu');
const delivery = require('./delivery');
const state = require('./state');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

client.on('qr', qr => {
  console.log('📱 Scan this QR code:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot is ready!');
});

client.on('message', async msg => {
  const chat = await msg.getChat();
  if (chat.isGroup) return;

  const sender = msg.from;
  const userState = state.get(sender) || 'MENU';
  const body = msg.body.trim().toLowerCase();

  if (body === 'menu') {
    state.set(sender, 'MENU');
    return menu.showMainMenu(client, msg);
  }

  if (userState.startsWith('PRODUCT_')) {
    return menu.handleSelection(client, msg, body);
  }

  if (['delivery', '5'].includes(body) || userState.startsWith('DELIVERY')) {
    return delivery.handle(client, msg, body);
  }

  if (userState === 'MENU') {
    return menu.handleSelection(client, msg, body);
  }

  msg.reply('❌ Invalid option. Type *menu* to start again.');
});

module.exports = client;
