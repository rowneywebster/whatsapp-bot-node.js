const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'delivery-data.json');
let deliveryData = {};

function loadData() {
  try {
    const raw = fs.readFileSync(dataPath);
    deliveryData = JSON.parse(raw);
    console.log("✅ Delivery data loaded successfully.");
  } catch (err) {
    console.error("❌ Failed to load delivery data:", err);
    deliveryData = {};
  }
}

// ✅ Initial Load
loadData();

// ✅ Auto-Reload when file changes
fs.watchFile(dataPath, { interval: 2000 }, () => {
  console.log("🔄 Delivery data updated. Reloading...");
  loadData();
});

exports.getCounties = () => Object.keys(deliveryData);

exports.getPickupPoints = (county) => {
  const countyName = county.trim().toLowerCase();
  const found = Object.keys(deliveryData).find(
    c => c.toLowerCase() === countyName
  );
  if (!found) return null;

  const points = deliveryData[found];
  let msg = `📍 ${found.toUpperCase()} PICKUP POINTS\n\n`;

  points.forEach((p, i) => {
    msg += `${i + 1}. 🏢 ${p.Office}\n`;
    msg += `   👤 Agent: ${p.Agent}\n`;
    msg += `   📞 Contact: ${p.Contact}\n`;
    msg += `   🏠 Location: ${p.Location}\n\n`;
  });

  return msg.trim();
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
