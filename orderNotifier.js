// orderNotifier.js
const { google } = require('googleapis');
const client = require('./bot');

const SPREADSHEET_ID = '1C__2sJ4uROTJepAfH3Dl1Ao5_9nRU8eGHbC0XLkkdgY'; // Your sheet ID
const SHEET_NAME = 'Orders';

// Admin phone numbers (in WhatsApp format)
const ADMIN_PHONES = ['254791365400', '254726884643'];

// Google API auth setup
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account-key.json', // Your service account JSON key path
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Store last processed row index in memory (start 0 = no rows processed)
let lastProcessedRow = 0;

async function initialize() {
  // On app start, read current number of rows to avoid notifying old data
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });
    lastProcessedRow = res.data.values ? res.data.values.length : 0;
    console.log(`✅ Order notifier initialized. Starting from row ${lastProcessedRow + 2}`);
  } catch (err) {
    console.error('❌ Failed to initialize order notifier:', err);
  }
}

async function checkNewOrders() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:L`,
    });

    const rows = res.data.values || [];

    for (let i = lastProcessedRow; i < rows.length; i++) {
      const [
        timestamp, formId, product, orderId, customer,
        phone, altPhone, email, county, address, pieces, status
      ] = rows[i];

      if (!phone) continue; // skip if no phone

      // Compose customer message
      const customerMsg = `
👋 Hello *${customer || 'Customer'}*,
Thank you for your order of *${pieces || 1} x ${product || 'product'}*.
Your order has been received and is being processed.
Joy 0791365400 will get in touch with you soon.
Delivery Address: ${address || 'Not provided'}, ${county || 'Not provided'}.
If you have questions, reply here.
      `.trim();

      const customerChatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;

      // Compose admin message
      const adminMsg = `
🆕 *NEW ORDER ALERT*
Product: ${product}
Order ID: ${orderId}
Customer: ${customer}
Phone: ${phone}
Alt Phone: ${altPhone || 'None'}
Email: ${email || 'None'}
Delivery: ${county}, ${address}
Quantity: ${pieces || 1}
Status: ${status}
      `.trim();

      try {
        // Send confirmation to customer
        await client.sendMessage(customerChatId, customerMsg);
        console.log(`✅ Sent confirmation to customer ${phone}`);

        // Send alert to admins
        for (const adminPhone of ADMIN_PHONES) {
          const adminChatId = `${adminPhone}@c.us`;
          await client.sendMessage(adminChatId, adminMsg);
          console.log(`✅ Sent admin alert to ${adminPhone}`);
        }

      } catch (err) {
        console.error(`❌ Failed sending message: ${err.message}`);
      }

      lastProcessedRow = i + 1; // Update last processed row
    }
  } catch (err) {
    console.error('❌ Google Sheets API error:', err);
  }
}

module.exports = {
  initialize,
  checkNewOrders,
};
