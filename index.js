// index.js
const client = require('./bot');
const orderNotifier = require('./orderNotifier');

async function start() {
  client.initialize();

  // Wait for WhatsApp client to be ready before starting order checks
  client.on('ready', async () => {
    console.log('✅ WhatsApp Bot Ready');

    // Initialize order notifier (get current sheet length)
    await orderNotifier.initialize();

    // Check for new orders every 60 seconds
    setInterval(() => {
      orderNotifier.checkNewOrders();
    }, 60 * 1000);
  });
}

start();
