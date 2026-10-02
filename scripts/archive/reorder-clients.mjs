/**
 * One-time script to reorder clients by work volume + recency.
 *
 * Usage:
 *   SITE_URL=https://your-vercel-url.vercel.app \
 *   PAYLOAD_EMAIL=editor@6dofreviews.com \
 *   PAYLOAD_PASSWORD=yourpassword \
 *   node scripts/reorder-clients.mjs
 */

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
const EMAIL = process.env.PAYLOAD_EMAIL;
const PASSWORD = process.env.PAYLOAD_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Set PAYLOAD_EMAIL and PAYLOAD_PASSWORD env vars");
  process.exit(1);
}

// New order: weighted by work volume and recency
const newOrder = [
  "Metro Markets",          // 8 work items, most recent (2023)
  "Mansour Holdings",       // 11 work items, recent (2022)
  "Publicis Groupe",        // current employer
  "Centrepoint",            // 2 items (2019)
  "Savage Impulse",         // 1 item (2023)
  "Studio Emad Eddin",      // 2 items (2015)
  "Swarovski",              // 1 item (2019)
  "Christie's Education",   // 1 item (2019)
  "Schneider Electric",     // 1 item (2019)
  "Tanagra",                // 1 item (2019)
  "Photopia",               // 1 item (2019)
  "Modern Media Factory",   // co-client (2019)
  "Ford Foundation",        // 2 items (2010)
  "Orient Productions",     // 1 item (2015)
  "Transparency International", // 1 item (2014)
  "Coca-Cola",              // 1 item (2010)
  "Cartier",                // no work items
  "Pulse Music World",      // 1 item (2010)
  "Sudan365",               // 1 item (2010)
  "5D Egypt",               // no work items
];

async function run() {
  // Login
  console.log("Logging in...");
  const loginRes = await fetch(`${SITE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    console.error("Login failed:", loginData);
    process.exit(1);
  }
  const token = loginData.token;
  console.log("Logged in.");

  // Fetch all clients
  const clientsRes = await fetch(`${SITE_URL}/api/clients?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const clientsData = await clientsRes.json();
  const clients = clientsData.docs;
  console.log(`Found ${clients.length} clients.`);

  // Map name -> id
  const nameToId = {};
  for (const c of clients) {
    nameToId[c.name] = c.id;
  }

  // Update sortOrder
  let updated = 0;
  for (let i = 0; i < newOrder.length; i++) {
    const name = newOrder[i];
    const id = nameToId[name];
    if (!id) {
      console.warn(`  SKIP: "${name}" not found in CMS`);
      continue;
    }
    const sortOrder = i + 1;
    const res = await fetch(`${SITE_URL}/api/clients/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sortOrder }),
    });
    if (res.ok) {
      console.log(`  ${sortOrder}. ${name}`);
      updated++;
    } else {
      console.error(`  FAIL: ${name}`, await res.text());
    }
  }

  console.log(`\nDone. Updated ${updated} clients.`);
}

run().catch(console.error);
