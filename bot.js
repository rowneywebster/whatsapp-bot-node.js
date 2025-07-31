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
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot is ready!');
});

client.on('message', async msg => {
  const chat = await msg.getChat();
  if (chat.isGroup) return;

  const sender = msg.from;
  let userState = state.get(sender);
  const body = msg.body.trim().toLowerCase();

  // Welcome message
  if (!userState) {
    state.set(sender, 'MENU');
    return menu.showWelcomeMenu(client, msg);
  }

  userState = state.get(sender);

  // Menu command
  if (body === 'menu') {
    state.set(sender, 'MENU');
    return menu.showWelcomeMenu(client, msg);
  }

  // Delivery handling
  if (
    userState === 'AWAITING_DELIVERY_DETAILS' ||
    userState === 'DELIVERY_MAIN' ||
    userState === 'AWAITING_COUNTY' ||
    userState.startsWith('AWAITING_CONFIRM_') ||
    body === 'delivery' ||
    body === '5'
  ) {
    return delivery.handle(client, msg, body);
  }

  // Product selection
  if (userState.startsWith('PRODUCT_')) {
    return menu.handleSelection(client, msg, body);
  }

  // Main menu
  if (userState === 'MENU') {
    return menu.handleSelection(client, msg, body);
  }

  // Fallback
  msg.reply('Type *menu* for options');
});

module.exports = client;




// const { Client, LocalAuth } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');

// const menu = require('./menu');
// const delivery = require('./delivery');
// const state = require('./state');

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: { headless: true }
// });

// client.on('qr', qr => {
//   console.log('📱 Scan this QR code:');
//   qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//   console.log('✅ Bot is ready!');
// });

// client.on('message', async msg => {
//   const chat = await msg.getChat();
//   if (chat.isGroup) return;

//   const sender = msg.from;
//   let userState = state.get(sender);
//   const body = msg.body.trim().toLowerCase();

//   // If no state yet, treat as first message and send Joy's welcome + menu
//   if (!userState) {
//     state.set(sender, 'MENU');
//     return menu.showWelcomeMenu(client, msg);
//   }

//   userState = state.get(sender);

//   if (body === 'menu') {
//     state.set(sender, 'MENU');
//     return menu.showWelcomeMenu(client, msg);
//   }

//   if (userState.startsWith('PRODUCT_')) {
//     return menu.handleSelection(client, msg, body);
//   }

//   if (['delivery', '5'].includes(body) || userState.startsWith('DELIVERY')) {
//     return delivery.handle(client, msg, body);
//   }

//   if (userState === 'MENU') {
//     return menu.handleSelection(client, msg, body);
//   }

//   msg.reply('❌ Invalid option. Type *menu* to start again.');
// });

// module.exports = client;
