const deliveryOffices = require('./delivery-data.json');
const state = require('./state');

function findClosestCounty(input) {
  input = input.toLowerCase();
  const counties = Object.keys(deliveryOffices);

  // Exact match
  for (const county of counties) {
    if (county.toLowerCase() === input) {
      return { exact: county };
    }
  }

  // Partial or close match (start with or includes)
  for (const county of counties) {
    if (county.toLowerCase().startsWith(input) || county.toLowerCase().includes(input)) {
      return { close: county };
    }
  }

  return null;
}

exports.handle = async (client, msg, input) => {
  const chat = await msg.getChat();
  const sender = msg.from;
  let userState = state.get(sender) || '';

  input = input.trim();

  if (input === 'delivery' || input === '5') {
    state.set(sender, 'DELIVERY_MAIN');
    return chat.sendMessage(
      `🚚 DELIVERY OPTIONS:\n\n` +
      `1️⃣ Same-Day Delivery - Available in 📍 Nairobi, 📍 Kiambu, parts of 📍 Machakos and 📍 Kajiado\n` +
      `2️⃣ County Pickup Points\n\n` +
      `Reply with 1 or 2`
    );
  }

  if (input === '1' && userState === 'DELIVERY_MAIN') {
    state.set(sender, 'MENU');
    return chat.sendMessage(`📍 Please provide:\n• Full address\n• Delivery window\n• Phone number`);
  }

  if (input === '2' && userState === 'DELIVERY_MAIN') {
    state.set(sender, 'AWAITING_COUNTY');
    return chat.sendMessage(`🌍 Enter your county for pickup locations.`);
  }

  if (userState === 'AWAITING_COUNTY') {
    const normalizedInput = input.toLowerCase();

    // Confirmation logic if user was asked “Did you mean ...?”
    if (userState.startsWith('AWAITING_CONFIRM_')) {
      if (['yes', 'y'].includes(normalizedInput)) {
        const suggestedCounty = userState.replace('AWAITING_CONFIRM_', '');
        const offices = deliveryOffices[suggestedCounty];
        if (!offices) {
          state.set(sender, 'MENU');
          return chat.sendMessage(`❌ Sorry, no data found for ${suggestedCounty}. Returning to menu.`);
        }
        let response = `🏢 *${suggestedCounty.toUpperCase()} PICKUP POINTS*\n\n`;
        offices.forEach(office => {
          response += `📍 *${office.Office}*\n👤 Agent: ${office.Agent}\n📞 Contact: ${office.Contact}\n🏠 Location: ${office.Location}\n\n`;
        });
        state.set(sender, 'MENU');
        return chat.sendMessage(response);
      } else if (['no', 'n'].includes(normalizedInput)) {
        state.set(sender, 'AWAITING_COUNTY');
        return chat.sendMessage(`❌ Okay, please re-enter your county name or type *menu* to cancel.`);
      } else {
        return chat.sendMessage(`❓ Please reply with *YES* or *NO*.`);
      }
    }

    // Regular county input handling
    const match = findClosestCounty(normalizedInput);

    if (match) {
      if (match.exact) {
        const offices = deliveryOffices[match.exact];
        let response = `🏢 *${match.exact.toUpperCase()} PICKUP POINTS*\n\n`;
        offices.forEach(office => {
          response += `📍 *${office.Office}*\n👤 Agent: ${office.Agent}\n📞 Contact: ${office.Contact}\n🏠 Location: ${office.Location}\n\n`;
        });
        state.set(sender, 'MENU');
        return chat.sendMessage(response);
      }
      if (match.close) {
        state.set(sender, `AWAITING_CONFIRM_${match.close}`);
        return chat.sendMessage(`❓ Did you mean *${match.close}*? Reply YES or NO.`);
      }
    }

    return chat.sendMessage(`❌ County not found. Please try again or type *menu* to cancel.`);
  }

  return chat.sendMessage(`❌ Invalid option. Type *menu* to start again.`);
};
