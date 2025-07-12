// menu.js — menu logic (full updated)

const products = require('./products');
const state = require('./state');
const { MessageMedia } = require('whatsapp-web.js');

exports.showMainMenu = (client, msg) => {
  msg.reply(`👋 Welcome to BestCart! Here are our products:

${Object.entries(products).map(([key, p]) => `${key}️⃣ ${p.name} - ${p.price}`).join('\n')}
5️⃣ 🚚 Delivery Options

Reply with the product number or *menu* anytime.`);
};

exports.handleSelection = async (client, msg, input) => {
  const chat = await msg.getChat();
  const sender = msg.from;

  const currentState = state.get(sender);

  // Handle follow-up after product shown
  if (currentState && currentState.startsWith('PRODUCT_')) {
    const productKey = currentState.split('_')[1];
    const product = products[productKey];

    if (input === '1') {
      await chat.sendMessage(`🛒 *Order Link for ${product.name}:*\n${product.link || 'https://bestcarteshop.com'}\n\nThank you for shopping with us!`);
      state.clear(sender);
      return;
    }

    if (input === '2') {
      state.set(sender, 'MENU');
      return exports.showMainMenu(client, msg);
    }

    await chat.sendMessage(`❌ Invalid option. Reply with *1* to Order Now or *2* to go Back to Menu.`);
    return;
  }

  // Normalize input to just the number
  const normalizedInput = input.replace(/[^0-9]/g, '');

  if (products[normalizedInput]) {
    const p = products[normalizedInput];
    const caption = `*${p.name}*\n💵 ${p.price}`;

    try {
      const media = await MessageMedia.fromUrl(p.image);
      await chat.sendMessage(media, { caption });
    } catch {
      await chat.sendMessage(caption);
    }

    const optionsMessage = `${p.name}\n💵 ${p.price}\n✅ What would you like to do next?\nReply\n1 Order Now\n2 Go back to menu`;

    await chat.sendMessage(optionsMessage);
    state.set(sender, `PRODUCT_${normalizedInput}`);
  } else {
    await chat.sendMessage(`❌ Invalid option. Please reply with a product number (1-4) or *menu*.`);
  }
};
