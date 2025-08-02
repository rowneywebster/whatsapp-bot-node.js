const client = require('./bot');
const orderNotifier = require('./orderNotifier');
const { getReport } = require('./report');
const cron = require('node-cron');
const state = require('./state');
const menu = require('./menu');

const ADMIN_NUMBERS = ['254726884643', '254791365400'];
const invalidAttempts = {};

async function start() {
  client.initialize();

  client.on('ready', async () => {
    console.log('✅ WhatsApp Bot Ready');
    await orderNotifier.initialize();
    console.log(`📊 Auto reports scheduled for admins: ${ADMIN_NUMBERS}`);
    setInterval(() => orderNotifier.checkNewOrders(), 60 * 1000);
  });

  client.on('message', async msg => {
    if (msg.from.includes('@g.us') || msg.from.includes('status@broadcast')) return; // Ignore groups & statuses

    const text = msg.body.trim().toLowerCase();
    const sender = msg.from;

    // ✅ First message always shows menu
    if (!state.get(sender)) {
      state.set(sender, "MENU");
      return menu.showWelcomeMenu(client, msg);
    }

    if (text === 'menu') {
      state.set(sender, "MENU");
      return menu.showWelcomeMenu(client, msg);
    }

    // ✅ Manual report
    if (text.startsWith('report ')) {
      const period = text.split(' ')[1];
      try {
        const report = await getReport(period);
        return msg.reply(report);
      } catch {
        return msg.reply('⚠️ Failed to generate report.');
      }
    }

    // ✅ Handle menu selections
    await menu.handleSelection(client, msg, text);

    // ✅ Invalid input counter
    if (!['menu', '1', '2', '3', '4', '5', '6'].includes(text)) {
      invalidAttempts[sender] = (invalidAttempts[sender] || 0) + 1;
      if (invalidAttempts[sender] >= 2) {
        invalidAttempts[sender] = 0;
        await msg.reply(`🤝 Chat transferred to an agent. Please wait for a response.`);
        ADMIN_NUMBERS.forEach(num => client.sendMessage(`${num}@c.us`, `🚨 Agent Needed!\n\nCustomer: ${sender}\nMessage: "${msg.body}"\n⚠️ Chat has been transferred.`));
      }
    } else {
      invalidAttempts[sender] = 0;
    }
  });
}

start();







// const client = require('./bot');
// const orderNotifier = require('./orderNotifier');
// const { getReport } = require('./report');
// const cron = require('node-cron');
// const state = require('./state');

// const ADMIN_NUMBERS = ['254726884643', '254791365400'];
// const invalidAttempts = {};

// async function start() {
//   client.initialize();

//   client.on('ready', async () => {
//     console.log('✅ WhatsApp Bot Ready');
//     await orderNotifier.initialize();

//     // ✅ Check orders every 1 minute
//     setInterval(() => orderNotifier.checkNewOrders(), 60 * 1000);

//     console.log(`📊 Auto reports scheduled for admins: ${ADMIN_NUMBERS}`);

//     // 🔹 Scheduled reports
//     cron.schedule('0 8 * * *', async () => {
//       const report = await getReport('daily');
//       ADMIN_NUMBERS.forEach(num => client.sendMessage(`${num}@c.us`, report));
//     });

//     cron.schedule('0 8 * * 1', async () => {
//       const report = await getReport('weekly');
//       ADMIN_NUMBERS.forEach(num => client.sendMessage(`${num}@c.us`, report));
//     });

//     cron.schedule('0 8 1 * *', async () => {
//       const report = await getReport('monthly');
//       ADMIN_NUMBERS.forEach(num => client.sendMessage(`${num}@c.us`, report));
//     });
//   });

//   // ✅ Message handler
//   client.on('message', async msg => {
//     const text = msg.body.trim().toLowerCase();
//     const sender = msg.from;

//     // ✅ Ignore statuses and group messages
//     if (sender === 'status@broadcast' || sender.endsWith('@g.us')) {
//       return;
//     }

//     // ✅ Manual report commands
//     if (text === 'report daily' || text === 'report weekly' || text === 'report monthly') {
//       try {
//         const period = text.split(' ')[1];
//         const report = await getReport(period);
//         return msg.reply(report);
//       } catch (err) {
//         console.error('❌ Error generating manual report:', err.message);
//         return msg.reply('⚠️ Failed to generate report, please try again.');
//       }
//     }

//     // ✅ Always route option 6 to delivery handler
//     if (text === '6' || text === 'delivery') {
//       const delivery = require('./delivery');
//       return delivery.handle(client, msg, text);
//     }

//     // ✅ Handle invalid input & agent transfer
//     if (!['menu', '1', '2', '3', '4', '5', '6'].includes(text)) {
//       invalidAttempts[sender] = (invalidAttempts[sender] || 0) + 1;

//       if (invalidAttempts[sender] >= 2) {
//         invalidAttempts[sender] = 0;
//         await msg.reply(`🤝 Chat transferred to an agent. Please wait for a response.`);
//         ADMIN_NUMBERS.forEach(num => client.sendMessage(
//           `${num}@c.us`,
//           `🚨 Agent Needed!\n\nCustomer: ${sender}\nMessage: "${msg.body}"\n⚠️ Chat has been transferred.`
//         ));
//         return;
//       }

//       return msg.reply('🙃 Sorry, no good match found. Please reply with a product number (1-6) or menu.');
//     } else {
//       invalidAttempts[sender] = 0; // ✅ reset counter if valid input
//     }
//   });
// }

// start();





// // const client = require('./bot');
// // const orderNotifier = require('./orderNotifier');
// // const { getReport } = require('./report');
// // const cron = require('node-cron');
// // const state = require('./state');
// // const menu = require('./menu');

// // const ADMIN_NUMBERS = ['254726884643', '254791365400'];
// // const invalidAttempts = {};

// // async function start() {
// //   client.initialize();

// //   client.on('ready', async () => {
// //     console.log('✅ WhatsApp Bot Ready');
// //     await orderNotifier.initialize();

// //     setInterval(() => orderNotifier.checkNewOrders(), 60 * 1000);

// //     console.log(`📊 Auto reports scheduled for admins: ${ADMIN_NUMBERS}`);

// //     // 🔹 Scheduled reports
// //     cron.schedule('0 8 * * *', async () => {
// //       const report = await getReport('daily');
// //       ADMIN_NUMBERS.forEach(num => client.sendMessage(`${num}@c.us`, report));
// //     });

// //     cron.schedule('0 8 * * 1', async () => {
// //       const report = await getReport('weekly');
// //       ADMIN_NUMBERS.forEach(num => client.sendMessage(`${num}@c.us`, report));
// //     });

// //     cron.schedule('0 8 1 * *', async () => {
// //       const report = await getReport('monthly');
// //       ADMIN_NUMBERS.forEach(num => client.sendMessage(`${num}@c.us`, report));
// //     });
// //   });

// //   client.on('message', async msg => {
// //     const text = msg.body.trim().toLowerCase();
// //     const sender = msg.from;

// //     // ✅ Manual report commands
// //     if (text === 'report daily' || text === 'report weekly' || text === 'report monthly') {
// //       try {
// //         const period = text.split(' ')[1];
// //         const report = await getReport(period);
// //         return msg.reply(report);
// //       } catch (err) {
// //         console.error('❌ Error generating manual report:', err.message);
// //         return msg.reply('⚠️ Failed to generate report, please try again.');
// //       }
// //     }

// //     // ✅ First interaction → always show menu
// //     if (!state.get(sender)) {
// //       state.set(sender, 'MENU');
// //       invalidAttempts[sender] = 0;
// //       return menu.showWelcomeMenu(client, msg);
// //     }

// //     // ✅ Reset attempts if user types menu
// //     if (text === 'menu') {
// //       state.set(sender, 'MENU');
// //       invalidAttempts[sender] = 0;
// //       return menu.showWelcomeMenu(client, msg);
// //     }

// //     // ✅ Handle invalid input and agent transfer
// //     if (!['1','2','3','4','5','menu'].includes(text)) {
// //       invalidAttempts[sender] = (invalidAttempts[sender] || 0) + 1;

// //       if (invalidAttempts[sender] >= 2) {
// //         invalidAttempts[sender] = 0;
// //         await msg.reply(`🤝 Chat transferred to an agent. Please wait for a response.`);
// //         ADMIN_NUMBERS.forEach(num => client.sendMessage(
// //           `${num}@c.us`,
// //           `🚨 Agent Needed!\n\nCustomer: ${sender}\nMessage: "${msg.body}"\n⚠️ Chat has been transferred.`
// //         ));
// //         return;
// //       }

// //       return msg.reply('🙃 Sorry, no good match found. Please reply with a product number (1-4) or menu.');
// //     } else {
// //       invalidAttempts[sender] = 0;
// //     }
// //   });
// // }

// // start();
