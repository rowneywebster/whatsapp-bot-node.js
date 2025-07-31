const deliveryOffices = require('./delivery-data.json');
const state = require('./state');

// 🔍 Match county function
function findClosestCounty(input) {
  input = input.toLowerCase().replace(/['"]/g, '').trim();
  const counties = Object.keys(deliveryOffices).map(c => c.toLowerCase().replace(/['"]/g, '').trim());

  const matchIndex = counties.indexOf(input);
  if (matchIndex !== -1) return Object.keys(deliveryOffices)[matchIndex];

  const closeMatch = counties.find(c => c.startsWith(input) || c.includes(input));
  if (closeMatch) {
    const idx = counties.indexOf(closeMatch);
    return Object.keys(deliveryOffices)[idx];
  }

  return null;
}

// ✅ Send pickup points
async function sendCountyPickupPoints(chat, sender, county) {
  const offices = deliveryOffices[county];

  if (!offices || offices.length === 0) {
    state.set(sender, 'MENU');
    return chat.sendMessage(
      `❌ *No pickup points found for ${county}*\n\n` +
      `Type *menu* to go back.`
    );
  }

  let response = `📍 *${county.toUpperCase()} PICKUP POINTS*\n\n`;

  offices.forEach((office, index) => {
    response += `${index + 1}. 🏢 *${office.Office}*\n` +
                `   👤 Agent: ${office.Agent}\n` +
                `   📞 Contact: ${office.Contact}\n` +
                `   🏠 Location: ${office.Location}\n\n`;
  });

  await chat.sendMessage(response);
  state.set(sender, 'MENU');
}

// ✅ Main handler
exports.handle = async (client, msg, input) => {
  const chat = await msg.getChat();
  const sender = msg.from;
  const userState = state.get(sender) || '';
  input = input.trim();

  // 1️⃣ Delivery details submission
  if (userState === 'AWAITING_DELIVERY_DETAILS') {
    if (input.toLowerCase() === 'cancel') {
      state.set(sender, 'MENU');
      return chat.sendMessage(`🚫 Request cancelled. Type *menu* for options.`);
    }

    state.set(sender, 'MENU');
    return chat.sendMessage(
      `✅ *THANK YOU!*\n\n` +
      `We've received your delivery details.\n` +
      `Joy will contact you shortly to confirm your order! 📞\n\n` +
      `_Type *menu* for other options._`
    );
  }

  // 2️⃣ Delivery options menu
  if (input === 'delivery' || input === '5') {
    state.set(sender, 'DELIVERY_MAIN');
    return chat.sendMessage(
      `🚚 *DELIVERY OPTIONS*\n\n` +
      `1️⃣ *SAME-DAY DELIVERY*\n` +
      `   📍 Available in Nairobi, Kiambu, Machakos (partial), Kajiado (partial)\n\n` +
      `2️⃣ *COUNTY PICKUP POINTS*\n` +
      `   📍 Multiple locations nationwide\n\n` +
      `💬 Reply with *1* or *2*`
    );
  }

  // 3️⃣ Same-day delivery request
  if (input === '1' && userState === 'DELIVERY_MAIN') {
    state.set(sender, 'AWAITING_DELIVERY_DETAILS');
    return chat.sendMessage(
      `📬 *SAME-DAY DELIVERY REQUEST*\n\n` +
      `Just send:\n` +
      `• Your full address\n` +
      `• Preferred time (e.g. "today 2-4 PM")\n` +
      `• Your phone number\n` +
      `• Product name\n\n` +
      `_Type 'cancel' to stop_`
    );
  }

  // 4️⃣ County pickup points
  if (input === '2' && userState === 'DELIVERY_MAIN') {
    state.set(sender, 'AWAITING_COUNTY');
    return chat.sendMessage(
      `🌍 *COUNTY PICKUP LOCATIONS*\n\n` +
      `Enter your county name (e.g. Nairobi):\n\n` +
      `_Type 'cancel' to stop_`
    );
  }

  // 5️⃣ Handle county input
  if (userState === 'AWAITING_COUNTY') {
    const normalized = input.toLowerCase().replace(/['"]/g, '').trim();

    if (normalized === 'cancel' || normalized === 'menu') {
      state.set(sender, 'MENU');
      return chat.sendMessage(`🚫 Request cancelled. Type *menu* for options.`);
    }

    const matchedCounty = findClosestCounty(normalized);
    if (!matchedCounty) {
      return chat.sendMessage(
        `❌ County not found.\n\n` +
        `Examples: Nairobi, Bungoma, Uasin Gishu\n\n` +
        `_Type 'cancel' to stop_`
      );
    }

    return sendCountyPickupPoints(chat, sender, matchedCounty);
  }

  // 6️⃣ Fallback
  return chat.sendMessage(
    `⚠️ *Invalid option*\n\n` +
    `Type *menu* for main options\n` +
    `Type *help* for assistance`
  );
};






// const deliveryOffices = require('./delivery-data.json');
// const state = require('./state');

// function findClosestCounty(input) {
//   input = input.toLowerCase();
//   const counties = Object.keys(deliveryOffices);

  
//   for (const county of counties) {
//     if (county.toLowerCase() === input) {
//       return { exact: county };
//     }
//   }

  
//   for (const county of counties) {
//     if (county.toLowerCase().startsWith(input) || county.toLowerCase().includes(input)) {
//       return { close: county };
//     }
//   }

//   return null;
// }

// exports.handle = async (client, msg, input) => {
//   const chat = await msg.getChat();
//   const sender = msg.from;
//   let userState = state.get(sender) || '';

//   input = input.trim();

//   if (input === 'delivery' || input === '5') {
//     state.set(sender, 'DELIVERY_MAIN');
//     return chat.sendMessage(
//       `🚚 *DELIVERY OPTIONS*\n\n` +
//       `1️⃣ *SAME-DAY DELIVERY*\n` +
//       `   📍 Coverage:\n` +
//       `      → Nairobi\n` +
//       `      → Kiambu\n` +
//       `      → Machakos (partial)\n` +
//       `      → Kajiado (partial)\n\n` +
//       `2️⃣ *COUNTY PICKUP POINTS*\n` +
//       `   📍 Multiple locations available\n\n` +
//       `Reply with 1 or 2`  
    
//     );
//   }

//   if (input === '1' && userState === 'DELIVERY_MAIN') {
//     state.set(sender, 'MENU');
//     return chat.sendMessage(`📍 Please provide:\n• Full address\n• Delivery window\n• Phone number`);
//   }

//   if (input === '2' && userState === 'DELIVERY_MAIN') {
//     state.set(sender, 'AWAITING_COUNTY');
//     return chat.sendMessage(`🌍 Enter your county for pickup locations.`);
//   }

//   if (userState === 'AWAITING_COUNTY') {
//     const normalizedInput = input.toLowerCase();

    
//     if (userState.startsWith('AWAITING_CONFIRM_')) {
//       if (['yes', 'y'].includes(normalizedInput)) {
//         const suggestedCounty = userState.replace('AWAITING_CONFIRM_', '');
//         const offices = deliveryOffices[suggestedCounty];
//         if (!offices) {
//           state.set(sender, 'MENU');
//           return chat.sendMessage(`❌ Sorry, no data found for ${suggestedCounty}. Returning to menu.`);
//         }
//         let response = `🏢 *${suggestedCounty.toUpperCase()} PICKUP POINTS*\n\n`;
//         offices.forEach(office => {
//           response += `📍 *${office.Office}*\n👤 Agent: ${office.Agent}\n📞 Contact: ${office.Contact}\n🏠 Location: ${office.Location}\n\n`;
//         });
//         state.set(sender, 'MENU');
//         return chat.sendMessage(response);
//       } else if (['no', 'n'].includes(normalizedInput)) {
//         state.set(sender, 'AWAITING_COUNTY');
//         return chat.sendMessage(`❌ Okay, please re-enter your county name or type *menu* to cancel.`);
//       } else {
//         return chat.sendMessage(`❓ Please reply with *YES* or *NO*.`);
//       }
//     }

    
//     const match = findClosestCounty(normalizedInput);

//     if (match) {
//       if (match.exact) {
//         const offices = deliveryOffices[match.exact];
//         let response = `🏢 *${match.exact.toUpperCase()} PICKUP POINTS*\n\n`;
//         offices.forEach(office => {
//           response += `📍 *${office.Office}*\n👤 Agent: ${office.Agent}\n📞 Contact: ${office.Contact}\n🏠 Location: ${office.Location}\n\n`;
//         });
//         state.set(sender, 'MENU');
//         return chat.sendMessage(response);
//       }
//       if (match.close) {
//         state.set(sender, `AWAITING_CONFIRM_${match.close}`);
//         return chat.sendMessage(`❓ Did you mean *${match.close}*? Reply YES or NO.`);
//       }
//     }

//     return chat.sendMessage(`❌ County not found. Please try again or type *menu* to cancel.`);
//   }

//   return chat.sendMessage(`❌ Invalid option. Type *menu* to start again.`);
// };
