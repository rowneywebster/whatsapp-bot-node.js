const products = require("./products");
const state = require("./state");
const { MessageMedia } = require("whatsapp-web.js");
const delivery = require("./delivery");

exports.showWelcomeMenu = (client, msg) => {
  msg.reply(
    `👋 Hi! I’m *Joy*, welcome to our store!\n\n🛍️ Here are our products:\n\n${Object.entries(products)
      .map(([key, p]) => `${key}️⃣ ${p.name} - ${p.price}`)
      .join("\n")}\n6️⃣ 🚚 Delivery Options\n\nReply with the product number or *menu* anytime.`
  );
};

exports.handleSelection = async (client, msg, input) => {
  const chat = await msg.getChat();
  const sender = msg.from;

  const currentState = state.get(sender);

  // 🔹 Delivery Flow: waiting for county input
  if (currentState === "DELIVERY_COUNTY") {
    if (input.toLowerCase() === "cancel") {
      state.clear(sender);
      return chat.sendMessage("❌ Delivery cancelled. Type *menu* to see options.");
    }

    const result = delivery.getPickupPoints(input);
    if (!result) {
      const available = delivery.getCounties().map((c, i) => `${i + 1}. ${c}`).join("\n");
      return chat.sendMessage(`🙃 County not found.\n\n📍 Available counties:\n${available}`);
    }

    await chat.sendMessage(result);
    state.clear(sender);
    return;
  }

  // ✅ Product flow
  if (currentState && currentState.startsWith("PRODUCT_")) {
    const productKey = currentState.split("_")[1];
    const product = products[productKey];

    if (input === "1") {
      await chat.sendMessage(`🛒 *Order Link for ${product.name}:*\n${product.link}`);
      state.clear(sender);
      return;
    }

    if (input === "2") {
      state.set(sender, "MENU");
      return exports.showWelcomeMenu(client, msg);
    }

    await chat.sendMessage(`🙃 Sorry, no good match found. Reply with *1* to Order Now or *2* to go Back to Menu.`);
    return;
  }

  const normalizedInput = input.replace(/[^0-9]/g, "");

  // ✅ Delivery Option
  if (normalizedInput === "6") {
    await chat.sendMessage(`🚚 DELIVERY OPTIONS\n\n1️⃣ SAME-DAY DELIVERY\n   📍 Coverage:\n      → Nairobi\n      → Kiambu\n      → Machakos (partial)\n      → Kajiado (partial)\n\n2️⃣ COUNTY PICKUP POINTS\n   📍 Multiple locations available\n\nReply with 1 or 2`);
    state.set(sender, "DELIVERY");
    return;
  }

  if (state.get(sender) === "DELIVERY" && normalizedInput === "1") {
    await chat.sendMessage(`📍 Please provide:\n* Full address\n* Delivery window\n* Phone number`);
    state.clear(sender);
    return;
  }

  if (state.get(sender) === "DELIVERY" && normalizedInput === "2") {
    await chat.sendMessage(`🌍 COUNTY PICKUP LOCATIONS\n\nEnter your county name (e.g. Nakuru, Mombasa):\n\nType 'cancel' to stop`);
    state.set(sender, "DELIVERY_COUNTY");
    return;
  }

  // ✅ Product Selection
  if (products[normalizedInput]) {
    const p = products[normalizedInput];

    if (normalizedInput === "5") {
      // 🔥 Special case for Full Catalogue
      try {
        const media = await MessageMedia.fromUrl(p.image);
        await chat.sendMessage(media, { caption: `🛍️ Full Product Catalogue 💸\n🔥 Flash Sale – Starting from KES 1,000!` });
      } catch {
        await chat.sendMessage(`🛍️ Full Product Catalogue 💸\n🔥 Flash Sale – Starting from KES 1,000!`);
      }
      await chat.sendMessage(p.link);
      state.clear(sender);
      return;
    }

    const caption = `*${p.name}*\n💵 ${p.price}`;
    try {
      const media = await MessageMedia.fromUrl(p.image);
      await chat.sendMessage(media, { caption });
    } catch {
      await chat.sendMessage(caption);
    }

    await chat.sendMessage(`${p.name}\n💵 ${p.price}\n✅ What would you like to do next?\nReply\n1 Order Now\n2 Go back to menu`);
    state.set(sender, `PRODUCT_${normalizedInput}`);
    return;
  }
};








// const products = require("./products");
// const state = require("./state");
// const { MessageMedia } = require("whatsapp-web.js");

// exports.showWelcomeMenu = (client, msg) => {
//   msg.reply(
//     `👋 Hi! I’m *Joy*, welcome to our store!\n\n🛍️ Here are our products:\n\n${Object.entries(
//       products
//     )
//       .map(([key, p]) => `${key}️⃣ ${p.name} - ${p.price}`)
//       .join(
//         "\n"
//       )}\n5️⃣ 🚚 Delivery Options\n\nReply with the product number or *menu* anytime.`
//   );
// };

// exports.handleSelection = async (client, msg, input) => {
//   const chat = await msg.getChat();
//   const sender = msg.from;

//   const currentState = state.get(sender);

//   // ✅ If user is inside a product flow
//   if (currentState && currentState.startsWith("PRODUCT_")) {
//     const productKey = currentState.split("_")[1];
//     const product = products[productKey];

//     if (input === "1") {
//       await chat.sendMessage(
//         `🛒 *Order Link for ${product.name}:*\n${product.link}\n\nThank you for shopping with us!`
//       );
//       state.clear(sender);
//       return;
//     }

//     if (input === "2") {
//       state.set(sender, "MENU");
//       return exports.showWelcomeMenu(client, msg);
//     }

//     await chat.sendMessage(
//       `🙃 Sorry, no good match found. Reply with *1* to Order Now or *2* to go Back to Menu.`
//     );
//     return;
//   }

//   const normalizedInput = input.replace(/[^0-9]/g, "");

//   // ✅ Product selection
//   if (products[normalizedInput]) {
//     const p = products[normalizedInput];
//     const caption = `*${p.name}*\n💵 ${p.price}`;

//     try {
//       const media = await MessageMedia.fromUrl(p.image);
//       await chat.sendMessage(media, { caption });
//     } catch {
//       await chat.sendMessage(caption);
//     }

//     const optionsMessage = `${p.name}\n💵 ${p.price}\n✅ What would you like to do next?\nReply\n1 Order Now\n2 Go back to menu`;

//     await chat.sendMessage(optionsMessage);
//     state.set(sender, `PRODUCT_${normalizedInput}`);
//   } else {
//     // ❌ Removed double fallback here. Index.js will handle invalid inputs.
//     return;
//   }
// };


