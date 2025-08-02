const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

module.exports = client;







// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");

// const menu = require("./menu");
// const delivery = require("./delivery");
// const state = require("./state");

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: { headless: true },
// });

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

// client.on("ready", () => {
//   console.log("✅ Bot is ready!");
// });

// client.on("message", async (msg) => {
//   const chat = await msg.getChat();
//   if (chat.isGroup) return;

//   const sender = msg.from;
//   let userState = state.get(sender);
//   const body = msg.body.trim().toLowerCase();

//   // ✅ First message always shows menu
//   if (!userState) {
//     state.set(sender, "MENU");
//     return menu.showWelcomeMenu(client, msg);
//   }

//   userState = state.get(sender);

//   // ✅ Menu command
//   if (body === "menu") {
//     state.set(sender, "MENU");
//     return menu.showWelcomeMenu(client, msg);
//   }

//   // ✅ Delivery trigger (now only for option 6)
//   if (
//     userState === "AWAITING_DELIVERY_DETAILS" ||
//     userState === "DELIVERY_MAIN" ||
//     userState === "AWAITING_COUNTY" ||
//     userState.startsWith("AWAITING_CONFIRM_") ||
//     body === "delivery" ||
//     body === "6"
//   ) {
//     return delivery.handle(client, msg, body);
//   }

//   // ✅ Product selection
//   if (userState.startsWith("PRODUCT_")) {
//     return menu.handleSelection(client, msg, body);
//   }

//   // ✅ Main menu
//   if (userState === "MENU") {
//     return menu.handleSelection(client, msg, body);
//   }

//   // ✅ Fallback
//   msg.reply("Type *menu* for options");
// });

// module.exports = client;




