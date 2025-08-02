const { google } = require("googleapis");
const dayjs = require("dayjs");
const cron = require("node-cron");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ✅ Auto-detect first sheet/tab name
async function getFirstSheetName() {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  return metadata.data.sheets[0].properties.title;
}

// 📌 Fetch rows
async function getOrders() {
  const sheetName = await getFirstSheetName();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A2:K`,
  });
  return res.data.values || [];
}

// 📌 Filter by period
function filterOrders(rows, period) {
  const now = dayjs();
  return rows.filter((row) => {
    const orderDate = dayjs(row[0]);
    if (period === "daily") return orderDate.isSame(now, "day");
    if (period === "weekly") return orderDate.isSame(now, "week");
    if (period === "monthly") return orderDate.isSame(now, "month");
    return false;
  });
}

// 📌 Aggregate stats
function aggregate(rows) {
  let totalOrders = rows.length;
  let productCount = {};
  let countyCount = {};

  rows.forEach((row) => {
    const product = row[2] || "Unknown"; // Product column C
    const county = row[8] || "Unknown"; // County column I

    productCount[product] = (productCount[product] || 0) + 1;
    countyCount[county] = (countyCount[county] || 0) + 1;
  });

  const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]);
  const topCounties = Object.entries(countyCount).sort((a, b) => b[1] - a[1]);

  return { totalOrders, topProducts, topCounties };
}

// 📌 Format WhatsApp report
function formatReport(period, stats) {
  const title =
    period === "daily"
      ? "📅 Daily Sales Report"
      : period === "weekly"
      ? "🗓️ Weekly Sales Report"
      : "📊 Monthly Sales Report";

  let msg = `${title}\n\n✅ Total Orders: ${stats.totalOrders}\n\n🏆 Top Products:\n`;
  stats.topProducts.slice(0, 3).forEach(([prod, count], i) => {
    msg += `${i + 1}. ${prod} (${count})\n`;
  });

  msg += `\n🏅 Top Counties:\n`;
  stats.topCounties.slice(0, 3).forEach(([county, count], i) => {
    msg += `${i + 1}. ${county} (${count})\n`;
  });

  return msg;
}

// 📌 Manual report call
async function getReport(period = "daily") {
  const rows = await getOrders();
  const filtered = filterOrders(rows, period);
  const stats = aggregate(filtered);
  return formatReport(period, stats);
}

// ✅ Schedule automatic WhatsApp reports
function scheduleReports(sendToWhatsApp) {
  // Daily at 7AM
  cron.schedule("0 7 * * *", async () => {
    const msg = await getReport("daily");
    sendToWhatsApp(msg);
  });

  // Weekly Monday at 8AM
  cron.schedule("0 8 * * MON", async () => {
    const msg = await getReport("weekly");
    sendToWhatsApp(msg);
  });

  // Monthly 1st at 9AM
  cron.schedule("0 9 1 * *", async () => {
    const msg = await getReport("monthly");
    sendToWhatsApp(msg);
  });
}

module.exports = { getReport, scheduleReports };
