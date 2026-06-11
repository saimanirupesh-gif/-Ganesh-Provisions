/**
 * Ganesh Provisions – Backend Server
 * ───────────────────────────────────
 * Express API that receives order receipts from the frontend
 * and sends them directly to the customer's WhatsApp via
 * Meta WhatsApp Business Cloud API.
 *
 * No receipt UI is shown on the website – the message goes
 * straight to WhatsApp in the background.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const vm = require('vm');

const app = express();
const PORT = process.env.PORT || 3001;

// --- JSON Database Setup ---
const dbDir = path.join(__dirname, 'db');
const DB_FILES = {
  catalog: path.join(dbDir, 'catalog.json'),
  coupons: path.join(dbDir, 'coupons.json'),
  pincodes: path.join(dbDir, 'pincodes.json'),
  settings: path.join(dbDir, 'settings.json'),
  orders: path.join(dbDir, 'orders.json')
};

// Extract defaults from data.js dynamically using Node's vm module
function loadDefaultsFromDataJs() {
  try {
    const dataJsPath = path.join(__dirname, '..', 'data.js');
    if (fs.existsSync(dataJsPath)) {
      let content = fs.readFileSync(dataJsPath, 'utf8');
      content += '\n; this.GROCERY_PRODUCTS = GROCERY_PRODUCTS; this.PROMO_COUPONS = PROMO_COUPONS;';
      const sandbox = {};
      vm.runInNewContext(content, sandbox);
      return {
        catalog: sandbox.GROCERY_PRODUCTS || [],
        coupons: sandbox.PROMO_COUPONS || {}
      };
    }
  } catch (err) {
    console.error("❌ Error loading defaults from data.js:", err);
  }
  return { catalog: [], coupons: {} };
}

function syncCatalogAndDataJs(forceWriteToDataJs = false) {
  try {
    const dataJsPath = path.join(__dirname, '..', 'data.js');
    if (!fs.existsSync(dataJsPath)) return;

    const catalogPath = DB_FILES.catalog;
    const couponsPath = DB_FILES.coupons;

    const hasCatalog = fs.existsSync(catalogPath);
    const hasCoupons = fs.existsSync(couponsPath);

    if (!hasCatalog || !hasCoupons) {
      // Seed them from data.js if they don't exist
      const defaults = loadDefaultsFromDataJs();
      if (!hasCatalog) {
        fs.writeFileSync(catalogPath, JSON.stringify(defaults.catalog, null, 2), 'utf8');
        console.log("💾 Seeded catalog.json from data.js");
      }
      if (!hasCoupons) {
        fs.writeFileSync(couponsPath, JSON.stringify(defaults.coupons, null, 2), 'utf8');
        console.log("💾 Seeded coupons.json from data.js");
      }
      return;
    }

    if (forceWriteToDataJs) {
      // Force update data.js from database json files (e.g. after POST)
      console.log("🔄 Force-syncing database changes back to data.js...");
      const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      const couponsData = JSON.parse(fs.readFileSync(couponsPath, 'utf8'));
      
      const content = `const GROCERY_PRODUCTS = ${JSON.stringify(catalogData, null, 2)};\n\nconst PROMO_COUPONS = ${JSON.stringify(couponsData, null, 2)};\n`;
      fs.writeFileSync(dataJsPath, content, 'utf8');
      
      // Sync their modification times exactly
      const now = new Date();
      fs.utimesSync(catalogPath, now, now);
      fs.utimesSync(couponsPath, now, now);
      fs.utimesSync(dataJsPath, now, now);
      return;
    }

    // Both files exist, compare modification times
    const dataJsStats = fs.statSync(dataJsPath);
    const catalogStats = fs.statSync(catalogPath);

    const dataJsMtime = dataJsStats.mtimeMs;
    const catalogMtime = catalogStats.mtimeMs;

    // 100ms buffer to avoid small write race conditions
    if (dataJsMtime > catalogMtime + 100) {
      // data.js was edited manually (e.g. products added/removed in code).
      // SMART MERGE: preserve existing catalog.json customisations (images,
      // prices, inStock flags, etc.) for products that already exist.
      // Only add genuinely new products and drop deleted ones.
      console.log("🔄 Detecting manual edit in data.js. Smart-merging into catalog.json...");
      const defaults = loadDefaultsFromDataJs();
      if (defaults.catalog && defaults.catalog.length > 0) {
        // Load existing catalog to preserve user-set field values
        let existingCatalog = [];
        try {
          existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        } catch (e) { /* ignore parse error, start fresh */ }

        const existingMap = {};
        existingCatalog.forEach(p => { existingMap[p.id] = p; });

        // Build merged catalog: for each product in data.js, use existing
        // catalog.json entry if present (preserving custom fields), otherwise
        // use the data.js entry as a fresh seed.
        const merged = defaults.catalog.map(seedProduct => {
          const existing = existingMap[seedProduct.id];
          if (existing) {
            // Product already exists — keep ALL existing values (image, price, etc.)
            // but allow structural fields added to data.js to come through if missing.
            return Object.assign({}, seedProduct, existing);
          }
          return seedProduct; // New product from data.js — add as-is
        });

        fs.writeFileSync(catalogPath, JSON.stringify(merged, null, 2), 'utf8');
        console.log(`✅ Smart-merged catalog.json (${merged.length} products, existing customisations preserved)`);
      }
      if (defaults.coupons && Object.keys(defaults.coupons).length > 0) {
        fs.writeFileSync(couponsPath, JSON.stringify(defaults.coupons, null, 2), 'utf8');
      }
      
      // Set database files mtimes to match data.js to avoid looping/skew
      const now = new Date();
      fs.utimesSync(catalogPath, now, dataJsStats.mtime);
      fs.utimesSync(couponsPath, now, dataJsStats.mtime);
    } else if (catalogMtime > dataJsMtime + 100) {
      // Database was edited via UI or another process. Update data.js.
      console.log("🔄 Syncing catalog database changes back to data.js...");
      const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      const couponsData = JSON.parse(fs.readFileSync(couponsPath, 'utf8'));
      
      const content = `const GROCERY_PRODUCTS = ${JSON.stringify(catalogData, null, 2)};\n\nconst PROMO_COUPONS = ${JSON.stringify(couponsData, null, 2)};\n`;
      fs.writeFileSync(dataJsPath, content, 'utf8');
      
      // Sync data.js mtime to match catalog.json
      const newStats = fs.statSync(catalogPath);
      fs.utimesSync(dataJsPath, new Date(), newStats.mtime);
    }
  } catch (err) {
    console.error("❌ Error during bidirectional catalog sync:", err);
  }
}


function initializeDatabase() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // First sync files to make sure they are up-to-date
  syncCatalogAndDataJs();

  const defaults = loadDefaultsFromDataJs();

  if (!fs.existsSync(DB_FILES.catalog)) {
    fs.writeFileSync(DB_FILES.catalog, JSON.stringify(defaults.catalog, null, 2));
    console.log("💾 Created default catalog.json");
  }
  if (!fs.existsSync(DB_FILES.coupons)) {
    fs.writeFileSync(DB_FILES.coupons, JSON.stringify(defaults.coupons, null, 2));
    console.log("💾 Created default coupons.json");
  }
  if (!fs.existsSync(DB_FILES.pincodes)) {
    const defaultPincodes = [
      { val: '600001', fee: 0, status: 'active' },
      { val: '600002', fee: 0, status: 'active' },
      { val: '600020', fee: 20, status: 'active' }
    ];
    fs.writeFileSync(DB_FILES.pincodes, JSON.stringify(defaultPincodes, null, 2));
    console.log("💾 Created default pincodes.json");
  }
  if (!fs.existsSync(DB_FILES.settings)) {
    const defaultSettings = {
      name: 'Ganesh Provisions',
      phone: '9150436455',
      minFreeShip: 299,
      shipFee: 40,
      status: 'open'
    };
    fs.writeFileSync(DB_FILES.settings, JSON.stringify(defaultSettings, null, 2));
    console.log("💾 Created default settings.json");
  }
  if (!fs.existsSync(DB_FILES.orders)) {
    fs.writeFileSync(DB_FILES.orders, JSON.stringify([], null, 2));
    console.log("💾 Created default orders.json");
  }
}

// Initialise DB files on startup
initializeDatabase();

const OWNER_USERNAME = process.env.OWNER_USERNAME || 'owner';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'owner123';

const PLACEHOLDER_VALUES = new Set([
  'your_whatsapp_cloud_api_token_here',
  'your_phone_number_id_here'
]);

function isWhatsAppConfigured() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_API_TOKEN;
  return Boolean(
    phoneId &&
    token &&
    !PLACEHOLDER_VALUES.has(phoneId.trim()) &&
    !PLACEHOLDER_VALUES.has(token.trim())
  );
}

// ─── Middleware ───
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like file:// pages send 'null')
    // and localhost origins
    if (!origin || origin === 'null' || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev
    }
  },
  credentials: true
}));
app.use(express.json());

// Serve the frontend static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// ─── WhatsApp Cloud API Config ───
function getWhatsAppApiUrl() {
  return `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
}

/**
 * Format a phone number into the WhatsApp-required international format.
 * Accepts: 9876543210, +919876543210, 919876543210, 09876543210
 * Returns: 919876543210  (no leading +)
 */
function formatPhoneForWhatsApp(phone) {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // If it starts with +, remove it
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);

  // If 10 digits (Indian local), prepend 91
  if (/^\d{10}$/.test(cleaned)) cleaned = '91' + cleaned;

  // If starts with 0 and is 11 digits (e.g. 09876543210), strip the 0 and prepend 91
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '91' + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Build a beautiful, readable plain-text receipt for WhatsApp.
 */
function buildReceiptMessage(order) {
  const line = '─'.repeat(28);
  const doubleLine = '═'.repeat(28);

  let itemsBlock = '';
  order.items.forEach((item, idx) => {
    const lineTotal = item.price * item.qty;
    itemsBlock += `  ${idx + 1}. ${item.name}\n`;
    itemsBlock += `     ${item.size} × ${item.qty}  →  ₹${lineTotal}\n`;
  });

  const paymentLabel = {
    cod: '💵 Cash on Delivery',
    upi: '📱 UPI (GPay / PhonePe)',
    card: '💳 Credit / Debit Card'
  }[order.paymentMethod] || order.paymentMethod;

  const deliverySlotLabel = (order.deliverySlot || 'standard').replace(/_/g, ' ');

  const msg = `
🛒 *GANESH PROVISIONS*
${doubleLine}
   *Order Receipt*
${line}

📋 *Order ID:*  ${order.orderId}
📅 *Date:*  ${order.date}
🚚 *Delivery:*  ${deliverySlotLabel}
💳 *Payment:*  ${paymentLabel}

${line}
📦 *Items Ordered*
${line}
${itemsBlock}
${line}
  Subtotal       ₹${order.subtotal}
${order.discount > 0 ? `  Discount      -₹${order.discount}\n` : ''}  Delivery       ${order.delivery === 0 ? 'FREE ✅' : '₹' + order.delivery}
${doubleLine}
  *TOTAL          ₹${order.total}*
${doubleLine}

👤 *Deliver To:*
   ${order.customerName}
   📞 ${order.customerPhone}
   📍 ${order.address}${order.pincode ? ', ' + order.pincode : ''}

${line}
🙏 Thank you for shopping with
   *Ganesh Provisions!*
   Quality Groceries • Delivered Fresh
${line}
`.trim();

  return msg;
}

// ═══════════════════════════════════════════
// POST /api/owner-login
// ═══════════════════════════════════════════
app.post('/api/owner-login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    const isValid = (trimmedUser === OWNER_USERNAME || trimmedUser === '9999999999') && trimmedPass === OWNER_PASSWORD;

    if (isValid) {
      console.log(`🔒 Owner login successful: ${trimmedUser}`);
      return res.json({
        success: true,
        user: {
          name: "Store Manager",
          phone: "9999999999",
          email: "owner@ganeshprovisions.com",
          role: 'owner'
        }
      });
    } else {
      console.warn(`⚠️ Failed owner login attempt: ${trimmedUser}`);
      return res.status(401).json({
        success: false,
        error: 'Incorrect username or password'
      });
    }
  } catch (error) {
    console.error('❌ Owner login error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
});

// ═══════════════════════════════════════════
// POST /api/send-receipt
// ═══════════════════════════════════════════
app.post('/api/send-receipt', async (req, res) => {
  try {
    const {
      orderId,
      date,
      items,
      subtotal,
      discount,
      delivery,
      total,
      paymentMethod,
      deliverySlot,
      customerName,
      customerPhone,
      whatsappNumber,
      address,
      pincode
    } = req.body;

    // ── Validation ──
    if (!orderId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, items'
      });
    }

    let customerSent = false;
    let customerError = null;
    let customerDemo = false;

    // ── Send Customer Receipt (if customer provided a number) ──
    if (whatsappNumber) {
      const formattedPhone = formatPhoneForWhatsApp(whatsappNumber);
      const receiptText = buildReceiptMessage({
        orderId,
        date,
        items,
        subtotal,
        discount,
        delivery,
        total,
        paymentMethod,
        deliverySlot,
        customerName,
        customerPhone,
        address,
        pincode
      });

      console.log('\n📤 Sending receipt to Customer WhatsApp:', formattedPhone);
      console.log('─'.repeat(50));
      console.log(receiptText);
      console.log('─'.repeat(50));

      if (isWhatsAppConfigured()) {
        const waPayload = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: receiptText
          }
        };

        try {
          const waResponse = await axios.post(getWhatsAppApiUrl(), waPayload, {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Customer WhatsApp API response:', waResponse.data);
          customerSent = true;
        } catch (err) {
          console.error('❌ Customer WhatsApp send error:', err?.response?.data || err.message);
          customerError = err?.response?.data?.error?.message || err.message;
        }
      } else {
        console.warn('⚠️  WhatsApp API not configured — customer receipt logged only (demo mode)');
        customerDemo = true;
        customerSent = true;
      }
    }

    // ── Send Notification to Store Owner ──
    const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER;
    let ownerSent = false;
    let ownerError = null;
    let ownerDemo = false;

    if (ownerPhone) {
      const formattedOwnerPhone = formatPhoneForWhatsApp(ownerPhone);
      const ownerMsg = `
🔔 *NEW ORDER PLACED!*
════════════════════════════
An order has been placed on Ganesh Provisions!

📋 *Order ID:* ${orderId}
👤 *Customer:* ${customerName} (Ph: ${customerPhone})
💰 *Total Amount:* ₹${total}
🚚 *Delivery Slot:* ${(deliverySlot || 'standard').replace(/_/g, ' ')}
📍 *Address:* ${address}${pincode ? ', ' + pincode : ''}

Please login to your Owner Dashboard to accept and process this order.
════════════════════════════
      `.trim();

      console.log('\n📤 Sending order notification to Owner WhatsApp:', formattedOwnerPhone);
      console.log('─'.repeat(50));
      console.log(ownerMsg);
      console.log('─'.repeat(50));

      if (isWhatsAppConfigured()) {
        const ownerPayload = {
          messaging_product: 'whatsapp',
          to: formattedOwnerPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: ownerMsg
          }
        };

        try {
          const ownerResponse = await axios.post(getWhatsAppApiUrl(), ownerPayload, {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Owner WhatsApp API response:', ownerResponse.data);
          ownerSent = true;
        } catch (err) {
          console.error('❌ Owner WhatsApp send error:', err?.response?.data || err.message);
          ownerError = err?.response?.data?.error?.message || err.message;
        }
      } else {
        console.warn('⚠️  WhatsApp API not configured — owner notification logged only (demo mode)');
        ownerDemo = true;
        ownerSent = true;
      }
    }

    return res.json({
      success: true,
      demo: customerDemo || ownerDemo,
      customerSent,
      customerError,
      ownerSent,
      ownerError,
      message: 'Order processing handled successfully.'
    });

  } catch (error) {
    console.error('❌ WhatsApp send error:', error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: 'Failed to send WhatsApp receipt',
      details: error?.response?.data?.error?.message || error.message
    });
  }
});

// ═══════════════════════════════════════════
// Database Synchronization Endpoints
// ═══════════════════════════════════════════

// GET /api/db - fetch all DB resources
app.get('/api/db', (req, res) => {
  try {
    initializeDatabase();
    const catalog = JSON.parse(fs.readFileSync(DB_FILES.catalog, 'utf8'));
    const coupons = JSON.parse(fs.readFileSync(DB_FILES.coupons, 'utf8'));
    const pincodes = JSON.parse(fs.readFileSync(DB_FILES.pincodes, 'utf8'));
    const storeSettings = JSON.parse(fs.readFileSync(DB_FILES.settings, 'utf8'));
    const orders = JSON.parse(fs.readFileSync(DB_FILES.orders, 'utf8'));

    return res.json({
      catalog,
      coupons,
      pincodes,
      settings: storeSettings,
      orders
    });
  } catch (err) {
    console.error("❌ Failed to read database:", err);
    return res.status(500).json({ error: "Failed to read database" });
  }
});

// GET /api/db/:key
app.get('/api/db/:key', (req, res) => {
  const { key } = req.params;
  if (!DB_FILES[key]) {
    return res.status(400).json({ error: `Invalid db key: ${key}` });
  }
  try {
    initializeDatabase();
    const data = JSON.parse(fs.readFileSync(DB_FILES[key], 'utf8'));
    return res.json(data);
  } catch (err) {
    console.error(`❌ Failed to read db key ${key}:`, err);
    return res.status(500).json({ error: `Failed to read db key: ${key}` });
  }
});

// POST /api/db/:key
app.post('/api/db/:key', (req, res) => {
  const { key } = req.params;
  if (!DB_FILES[key]) {
    return res.status(400).json({ error: `Invalid db key: ${key}` });
  }
  try {
    initializeDatabase();
    const data = req.body;
    fs.writeFileSync(DB_FILES[key], JSON.stringify(data, null, 2));
    console.log(`💾 DB updated and saved: ${key}`);
    
    if (key === 'catalog' || key === 'coupons') {
      syncCatalogAndDataJs(true);
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error(`❌ Failed to write db key ${key}:`, err);
    return res.status(500).json({ error: `Failed to write db key: ${key}` });
  }
});

// POST /api/db/orders/add - Prepend a single order safely
app.post('/api/db/orders/add', (req, res) => {
  try {
    initializeDatabase();
    const newOrder = req.body;
    if (!newOrder || !newOrder.orderId) {
      return res.status(400).json({ error: "Invalid order object" });
    }
    const orders = JSON.parse(fs.readFileSync(DB_FILES.orders, 'utf8'));
    orders.unshift(newOrder);
    fs.writeFileSync(DB_FILES.orders, JSON.stringify(orders, null, 2));
    console.log(`💾 New order ${newOrder.orderId} appended to server database.`);
    return res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Failed to add order to db:", err);
    return res.status(500).json({ error: "Failed to add order to db" });
  }
});

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ganesh Provisions Backend',
    whatsappConfigured: isWhatsAppConfigured()
  });
});

// SPA fallback — serve index.html for unknown routes (not API)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── Start server ───
app.listen(PORT, () => {
  console.log(`\n🟢 Ganesh Provisions running at http://localhost:${PORT}`);
  console.log(`   Open this URL in your browser (do not open index.html directly).`);
  console.log(`   WhatsApp Phone ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || '⚠️  NOT SET'}`);
  console.log(`   API Token: ${isWhatsAppConfigured() ? '✅ Configured' : '⚠️  NOT SET (demo mode — receipts logged only)'}\n`);
});
