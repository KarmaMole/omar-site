/**
 * Seed script: imports portfolio content from Omar's old WordPress site
 * into Payload CMS via the REST API.
 *
 * Usage: node scripts/seed-content.mjs
 */

const API = "http://localhost:3000/api";

async function login() {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "editor@6dofreviews.com",
      password: "Zadokite!13",
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Login failed");
  return data.token;
}

async function create(token, collection, body) {
  const res = await fetch(`${API}/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.errors) {
    console.error(`  ERROR creating ${body.slug || body.name}:`, JSON.stringify(data.errors));
    return null;
  }
  return data.doc;
}

// ─── WORK ITEMS (client/commercial projects) ────────────────────

const workItems = [
  {
    title: "Metro CPU Unit — SM Promo",
    slug: "metro-cpu-unit-sm-promo",
    client: "Metro Markets",
    categories: ["Corporate Video"],
    date: "2022-06-17",
    tags: [{ tag: "Corporate" }, { tag: "Mansour" }, { tag: "Metro" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/721320081" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video showcasing Metro's Central Processing Unit for food products. Part of the Mansour Holdings Company." }] }] } },
  },
  {
    title: "What's Metro's Secret?",
    slug: "whats-metros-secret",
    client: "Metro Markets",
    categories: ["TV & Advertising"],
    date: "2022-06-17",
    tags: [{ tag: "Mansour" }, { tag: "Metro" }, { tag: "TV Ad" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/700958781" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "TV ad produced for Metro. Writing, production, editing, and soundtracking by Omar; directed by Khaled Kamel." }] }] } },
  },
  {
    title: "Metro Market — Covid-19 Measures",
    slug: "metro-market-covid-19-measures",
    client: "Metro Markets",
    categories: ["Corporate Video"],
    date: "2022-01-02",
    tags: [{ tag: "Metro" }, { tag: "Covid-19" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/454072680" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video highlighting Covid-19 measures taken by Metro Markets." }] }] } },
  },
  {
    title: "Working at Mansour: Life & Benefits",
    slug: "working-at-mansour-life-benefits",
    client: "Al Mansour Holdings",
    categories: ["Corporate Video"],
    date: "2022-01-02",
    tags: [{ tag: "Mansour" }, { tag: "Corporate" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/312622439" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video designed to highlight the benefits of a career at Al Mansour Holdings." }] }] } },
  },
  {
    title: "Metro Stores Revamp",
    slug: "metro-stores-revamp-video",
    client: "Metro Markets",
    categories: ["Corporate Video"],
    date: "2022-01-02",
    tags: [{ tag: "Metro" }, { tag: "Retail" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/312622439" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video made for Metro Stores in Egypt, highlighting the revamping of the stores to a more modern and consumer-centric design and layout." }] }] } },
  },
  {
    title: "Christie's Education — Arabic Subtitles",
    slug: "christies-education-subtitles",
    client: "Christie's Education",
    categories: ["Subtitling"],
    date: "2019-03-15",
    tags: [{ tag: "Christie's" }, { tag: "Subtitling" }, { tag: "Arabic" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Arabic subtitling for 29 Christie's Education videos." }] }] } },
  },
  {
    title: "Tanagra CX Journey",
    slug: "tanagra-customer-experience-journey",
    client: "Tanagra",
    categories: ["Corporate Video"],
    date: "2019-12-20",
    tags: [{ tag: "Tanagra" }, { tag: "Customer Experience" }, { tag: "Animation" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Whiteboard animation video created for the Tanagra Customer Experience Team." }] }] } },
  },
  {
    title: "Swarovski CX Journey",
    slug: "swarovski-customer-experience",
    client: "Swarovski",
    categories: ["Corporate Video"],
    date: "2019-08-15",
    tags: [{ tag: "Swarovski" }, { tag: "Customer Experience" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video demonstrating Swarovski's new Customer Experience journey." }] }] } },
  },
  {
    title: "Centrepoint Ramadan Bumpers (Arabic)",
    slug: "centrepoint-ramadan-bumpers-ar",
    client: "Centrepoint / Modern Media Factory",
    categories: ["TV & Advertising"],
    date: "2019-08-20",
    tags: [{ tag: "Centrepoint" }, { tag: "Ramadan" }, { tag: "Dubai" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/120583850" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Part of a series of 30 YouTube bumpers made for Centrepoint. Produced for Modern Media Factory in Dubai, UAE." }] }] } },
  },
  {
    title: "Centrepoint Ramadan Bumpers (English)",
    slug: "centrepoint-ramadan-bumpers-en",
    client: "Centrepoint / Modern Media Factory",
    categories: ["TV & Advertising"],
    date: "2019-08-20",
    tags: [{ tag: "Centrepoint" }, { tag: "Ramadan" }, { tag: "Dubai" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/391181495" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "A series of 30 Bumper Spots for Centrepoint. Produced by Modern Media Factory in Dubai, UAE." }] }] } },
  },
  {
    title: "Metro Markets — 20th Anniversary",
    slug: "20-years-at-metro-anniversary-video",
    client: "Metro Markets",
    categories: ["Corporate Video"],
    date: "2019-08-12",
    tags: [{ tag: "Metro" }, { tag: "Anniversary" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/312622439" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video made to celebrate Metro's 20th Anniversary and, more importantly, the people that have been working there since the beginning!" }] }] } },
  },
  {
    title: "Schneider Electric — Life Is On",
    slug: "schneider-electric-life-on",
    client: "Schneider Electric / Modern Media Factory",
    categories: ["Corporate Video"],
    date: "2019-07-13",
    tags: [{ tag: "Schneider Electric" }, { tag: "Dubai" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/120583850" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video highlighting Schneider Electric's Life is On Campaign. Produced by Modern Media Factory in Dubai." }] }] } },
  },
  {
    title: "Madad Photobook Promo",
    slug: "madad-photobook-promo",
    client: "Photopia",
    categories: ["Video Production"],
    date: "2019-07-12",
    tags: [{ tag: "Photopia" }, { tag: "Photography" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/120583850" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Promo video for the Madad Photobook released by Photopia. Photographs by Mosaab Elshamy. Cairo, Egypt." }] }] } },
  },
  {
    title: "Mansour Corporate Video",
    slug: "mansour-corporate-video",
    client: "Mansour Holdings",
    categories: ["Corporate Video"],
    date: "2015-06-16",
    tags: [{ tag: "Mansour" }, { tag: "Corporate" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/390985763" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Corporate video for the Mansour Holdings Company, for internal and external relations." }] }] } },
  },
  {
    title: "Mansour Distribution — Corporate Video",
    slug: "mansour-distribution-corporate-video",
    client: "Mansour Holdings / Kayan",
    categories: ["Corporate Video"],
    date: "2010-09-23",
    tags: [{ tag: "Mansour" }, { tag: "Kayan" }, { tag: "Bilingual" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15144840" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Full length corporate video for the Mansour Holdings Company, produced under the Kayan label, featuring an overview of the entire Mansour Holdings line-up of companies, brands, and retail outlets. Bilingual." }] }] } },
  },
  {
    title: "Ink — Anti-Pollution TV Spot",
    slug: "ink",
    client: "Mansour Holdings / Kayan",
    categories: ["Public Awareness", "TV & Advertising"],
    date: "2010-08-26",
    tags: [{ tag: "Mansour" }, { tag: "Kayan" }, { tag: "Public Awareness" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/14439357" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "First in a series of 3 anti-pollution TV spots made for the Mansour Holdings Company under the Kayan name. Omar was project manager, writer, director, editor, and composer." }] }] } },
  },
  {
    title: "HIV/AIDS TV Spot",
    slug: "hivaids-awareness-spot",
    client: "Ford Foundation / Egyptian Ministry of Health",
    categories: ["Public Awareness", "TV & Advertising"],
    date: "2010-09-21",
    tags: [{ tag: "Ford Foundation" }, { tag: "Public Health" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15144274" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Television spot produced with the Ford Foundation and with the cooperation of the Egyptian Ministry of Health, designed to better inform viewers about HIV/AIDS." }] }] } },
  },
  {
    title: "Car-Box — Anti-Pollution TV Spot",
    slug: "car-box",
    client: "Mansour Holdings / Kayan",
    categories: ["Public Awareness", "TV & Advertising"],
    date: "2010-08-26",
    tags: [{ tag: "Mansour" }, { tag: "Kayan" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/14440091" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Second in a series of 3 anti-pollution TV spots made for the Mansour Holdings Company under the Kayan name." }] }] } },
  },
  {
    title: "Reverse Garbage",
    slug: "reverse-garbage",
    client: "Mansour Holdings / Kayan",
    categories: ["Public Awareness"],
    date: "2010-08-27",
    tags: [{ tag: "Mansour" }, { tag: "Kayan" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/14441807" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Full length corporate video for the Mansour Holdings Company, produced under the Kayan label. Bilingual." }] }] } },
  },
  {
    title: "Baby — Literacy TV Spot",
    slug: "baby",
    client: "Mansour Holdings / Kayan",
    categories: ["Public Awareness", "TV & Advertising"],
    date: "2010-08-27",
    tags: [{ tag: "Mansour" }, { tag: "Kayan" }, { tag: "Literacy" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/14443651" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "First in a series of 3 literacy-promoting TV spots made for the Mansour Holdings Company under the Kayan name. All roles (PM, Concept, Writer, Director, Editor, Post, Soundtrack): Omar Kamel." }] }] } },
  },
  {
    title: "Learn & Work — Literacy TV Spot",
    slug: "learn-work",
    client: "Mansour Holdings / Kayan",
    categories: ["Public Awareness", "TV & Advertising"],
    date: "2010-08-27",
    tags: [{ tag: "Mansour" }, { tag: "Kayan" }, { tag: "Literacy" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/14476979" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Second in a series of 3 literacy-promoting TV spots made for the Mansour Holdings Company under the Kayan name." }] }] } },
  },
  {
    title: "Ramadan Iftars with Orphans",
    slug: "ramadan-iftars-with-orphans",
    client: "Mansour Holdings",
    categories: ["Public Awareness", "Video Production"],
    date: "2010-09-17",
    tags: [{ tag: "Mansour" }, { tag: "Ramadan" }, { tag: "CSR" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15057877" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video coverage of Mansour's Ramadan Iftars for Orphans, held in partnership with the 'Put a Smile on a Child's Face' program." }] }] } },
  },
  {
    title: "Nada's Journal",
    slug: "nadas-journey",
    client: null,
    categories: ["Documentary"],
    date: "2010-09-19",
    tags: [{ tag: "Short Film" }, { tag: "Soundtrack" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15082056" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Short film by Saad Hendawy about a girl dealing with the pressures and discoveries of growing up. Soundtrack by Omar Kamel." }] }] } },
  },
  {
    title: "Save Water — Coca-Cola Earth Day",
    slug: "coca-cola-earth-day",
    client: "Coca-Cola",
    categories: ["Public Awareness", "TV & Advertising"],
    date: "2010-09-20",
    tags: [{ tag: "Coca-Cola" }, { tag: "Earth Day" }, { tag: "Public Awareness" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15142805" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Public awareness television spot produced by Coca-Cola to promote water conservation. Made for broadcast on Earth Day." }] }] } },
  },
  {
    title: "Kolona (All of Us) — HIV Documentary",
    slug: "hiv-awareness-documentary",
    client: "Ford Foundation / Egyptian Ministry of Health",
    categories: ["Documentary", "Public Awareness"],
    date: "2010-09-21",
    tags: [{ tag: "Ford Foundation" }, { tag: "Documentary" }, { tag: "Public Health" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15141992" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Documentary film produced with the Ford Foundation and with the cooperation of the Egyptian Ministry of Health, designed to better inform viewers about HIV/AIDS." }] }] } },
  },
  {
    title: "Sudan 365 — Beat for Peace",
    slug: "sudan-365-beat-for-peace",
    client: "Sudan365",
    categories: ["Public Awareness", "Video Production"],
    date: "2010-09-21",
    tags: [{ tag: "Sudan365" }, { tag: "Peace" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15139078" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video featuring performer Mounir, produced for Sudan365's Beat for Peace campaign." }] }] } },
  },
  {
    title: "Teach Your Daughter — Literacy TV Spot",
    slug: "teach-your-daughter",
    client: "Mansour Distribution / Kayan",
    categories: ["Public Awareness", "TV & Advertising"],
    date: "2010-09-23",
    tags: [{ tag: "Mansour" }, { tag: "Kayan" }, { tag: "Literacy" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/14479641" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Third in a series of 3 literacy-promoting TV spots made for the Mansour Distribution Company under the Kayan name." }] }] } },
  },
  {
    title: "Saiidi — Upper Egyptian Music Documentary",
    slug: "saiidi",
    client: "Pulse Music World",
    categories: ["Documentary"],
    date: "2010-09-24",
    tags: [{ tag: "Documentary" }, { tag: "Music" }, { tag: "Egypt" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/15242710" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Full-length documentary of the shapes and forms of Upper Egyptian music. Directed by Keti Sharif, produced under the Pulse Music World label. D.O.P., Editor, Post: Omar Kamel / Ubik Media." }] }] } },
  },
  {
    title: "Urban Visions — D-CAF Festival",
    slug: "urban-visions-d-caf",
    client: "Orient Productions / Studio Emad El Din",
    categories: ["Documentary"],
    date: "2015-01-27",
    tags: [{ tag: "D-CAF" }, { tag: "Documentary" }, { tag: "Cairo" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/97933875" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Short video documentary covering the Urban Visions part of the Downtown Contemporary and Arts Festival held by Orient Productions." }] }] } },
  },
  {
    title: "Studio Emad Eddin",
    slug: "studio-emad-eddin",
    client: "Studio Emad Eddin",
    categories: ["Corporate Video"],
    date: "2015-02-25",
    tags: [{ tag: "Studio Emad Eddin" }, { tag: "Arts" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/120583850" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video made for Studio Emad Eddin, highlighting the studio's mission and its accomplishments." }] }] } },
  },
  {
    title: "Mansour Training Academy",
    slug: "mansour-training-academy",
    client: "Mansour Holdings",
    categories: ["Corporate Video"],
    date: "2015-04-17",
    tags: [{ tag: "Mansour" }, { tag: "Training" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/125310598" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Video made for the Mansour Training Academy." }] }] } },
  },
  {
    title: "Transparency International — Action Project",
    slug: "ti-action-project",
    client: "Transparency International",
    categories: ["Public Awareness", "Video Production"],
    date: "2014-04-04",
    tags: [{ tag: "Transparency International" }, { tag: "MENA" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/74036764" }],
    externalLink: "http://action.transparency.org/",
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "A set of 18 videos on the issues of public information in the Middle East and North Africa." }] }] } },
  },
  // ── Newer work from portfolio page ──
  {
    title: "Get Savage — Savage Impulse Promo",
    slug: "savage-impulse-promo",
    client: "Savage Impulse",
    categories: ["Video Production", "Branding"],
    date: "2023-01-01",
    tags: [{ tag: "Savage Impulse" }, { tag: "Agency" }, { tag: "Dubai" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/omarkamel/savagedemo" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Promo video for Dubai-based creative agency Savage Impulse." }] }] } },
  },
  {
    title: "Kitchen — Metro Markets Social Ad",
    slug: "metro-kitchen-social-ad",
    client: "Metro Markets",
    categories: ["TV & Advertising"],
    date: "2023-01-01",
    tags: [{ tag: "Metro" }, { tag: "Social Media" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/omarkamel/metromeatkitchen" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "40-second social media ad for Metro's meat delivery service." }] }] } },
  },
  {
    title: "El Sa7el — Metro Markets Social Ad",
    slug: "metro-sahel-social-ad",
    client: "Metro Markets",
    categories: ["TV & Advertising"],
    date: "2023-01-01",
    tags: [{ tag: "Metro" }, { tag: "Social Media" }],
    media: [{ type: "vimeo", url: "https://vimeo.com/omarkamel/metromeattreadmill" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "45-second companion social media ad featuring resort treadmill scene." }] }] } },
  },
  {
    title: "كل حاجه و الساحل — Metro Commercial",
    slug: "metro-kol-haga-wel-sahel",
    client: "Metro Markets",
    categories: ["TV & Advertising"],
    date: "2022-06-30",
    tags: [{ tag: "Metro" }, { tag: "TV Ad" }],
    media: [{ type: "youtube", url: "https://www.youtube.com/watch?v=rl4nkTlGSZ0" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Metro is not just a supermarket — TV commercial for Metro Markets." }] }] } },
  },
];

// ─── EXPLORE / PROJECTS ITEMS ───────────────────────────────────

const projectItems = [
  {
    title: "Mycelium — Marze (AI Music Video)",
    slug: "mycelium-marze",
    contentType: "music",
    status: "active",
    tags: [{ tag: "AI" }, { tag: "Music Video" }, { tag: "Stable Diffusion" }],
    media: [{ type: "youtube", url: "https://www.youtube.com/watch?v=Cmp9D8I9pRA" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "AI-generated music video for Finnish band Marze using custom Stable Diffusion models, LORA, Automatic1111 with deforum extension, and DaVinci Resolve." }] }] } },
  },
  {
    title: "The Strangers — AI Film Trailer",
    slug: "the-strangers-ai-trailer",
    contentType: "creative-work",
    status: "active",
    tags: [{ tag: "AI" }, { tag: "Film" }, { tag: "Runway Gen-2" }],
    media: [{ type: "youtube", url: "https://www.youtube.com/watch?v=IvhXGIejNKQ" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "AI-generated trailer for fictional Egyptian sci-fi film created with Runway Gen-2, iPhone and CapCut." }] }] } },
  },
  {
    title: "More Fool You — Doc & The Revelators",
    slug: "more-fool-you-revelators",
    contentType: "music",
    status: "active",
    tags: [{ tag: "AI" }, { tag: "Music Video" }, { tag: "Stable Diffusion" }],
    media: [{ type: "youtube", url: "https://www.youtube.com/watch?v=f4gPrs8wRtQ" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "AI music video for British band Doc & The Revelators using custom Stable Diffusion models." }] }] } },
  },
  {
    title: "الوحش الكاسر — El Wa7sh El Kasir",
    slug: "el-wa7sh-el-kasir",
    contentType: "music",
    status: "active",
    streamingUrl: "https://play.anghami.com/album/1024330713",
    tags: [{ tag: "Music" }, { tag: "AI" }, { tag: "MidJourney" }],
    media: [{ type: "youtube", url: "https://www.youtube.com/watch?v=lJp2bpAdA-0" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Music video from album Mamnou3 El Intizar featuring MidJourney-generated graphics." }] }] } },
  },
  {
    title: "Deforum Prompt Keyframe Assistant",
    slug: "deforum-prompt-assistant",
    contentType: "project",
    status: "active",
    links: [{ label: "Try It", url: "https://savageimpulse.com/dpa/index.html" }],
    tags: [{ tag: "Web Tool" }, { tag: "AI" }, { tag: "Deforum" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Web tool for timing prompts to music in deforum animations." }] }] } },
  },
  {
    title: "7 Black — Lunch Box Branding",
    slug: "7-black-lunch-box-branding",
    contentType: "graphic-design",
    status: "active",
    tags: [{ tag: "Branding" }, { tag: "Logo" }, { tag: "Advertising" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "High-end burger chain branding package with logo options and production-light advertising campaign for Lunch Box." }] }] } },
  },
  {
    title: "Ninja Bunnies Are No Joke — Poster Series",
    slug: "ninja-bunnies-poster-series",
    contentType: "graphic-design",
    status: "active",
    tags: [{ tag: "Print-on-Demand" }, { tag: "Posters" }, { tag: "AI Art" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Print-on-demand poster series featuring ninja bunnies." }] }] } },
  },
  {
    title: "Philip K. Dick — Alt Book Covers",
    slug: "pkd-alt-book-covers",
    contentType: "graphic-design",
    status: "active",
    tags: [{ tag: "Book Covers" }, { tag: "AI" }, { tag: "MidJourney" }, { tag: "Illustration" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Alternative book covers for 10+ Philip K. Dick novels using MidJourney, Topaz Gigapixel, and Adobe Illustrator." }] }] } },
  },
  {
    title: "Ree7 Comics — Arabic Comic Series",
    slug: "ree7-comics",
    contentType: "creative-work",
    status: "active",
    tags: [{ tag: "Comics" }, { tag: "Arabic" }, { tag: "Writing" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Arabic comic book about a Cairo street orphan discovering powers. Three issues completed. Illustrations by Sherif Sami." }] }] } },
  },
  {
    title: "Text to Image — D-CAF AI Art Exhibition",
    slug: "text-to-image-dcaf-exhibition",
    contentType: "creative-work",
    status: "active",
    tags: [{ tag: "AI Art" }, { tag: "Exhibition" }, { tag: "D-CAF" }, { tag: "Cairo" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Interactive exhibition at D-CAF Cairo demonstrating text-to-image AI capabilities." }] }] } },
  },
  {
    title: "The Samsara Collective — 5D Egypt VR Branding",
    slug: "samsara-collective-5d-egypt",
    contentType: "vr",
    status: "active",
    tags: [{ tag: "VR" }, { tag: "Branding" }, { tag: "5D Egypt" }, { tag: "Refugees" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "VR experience branding highlighting refugee journeys from MENA to Europe. Created for 5D Egypt." }] }] } },
  },
  {
    title: "Savage Impulse — Creative Agency Website",
    slug: "savage-impulse-website",
    contentType: "project",
    status: "active",
    tags: [{ tag: "Web Design" }, { tag: "Agency" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Website design and development for Dubai-based creative agency Savage Impulse." }] }] } },
  },
  {
    title: "A Fish Called VALIS",
    slug: "a-fish-called-valis",
    contentType: "music",
    status: "active",
    tags: [{ tag: "Music" }, { tag: "Band" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Music project by Omar Kamel." }] }] } },
  },
  {
    title: "SeptiC",
    slug: "septic",
    contentType: "music",
    status: "active",
    tags: [{ tag: "Music" }, { tag: "Band" }],
    description: { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Music project by Omar Kamel." }] }] } },
  },
];

// ─── CLIENTS ────────────────────────────────────────────────────

const clients = [
  { name: "Coca-Cola", sortOrder: 1 },
  { name: "Mansour Holdings", sortOrder: 2 },
  { name: "Metro Markets", sortOrder: 3 },
  { name: "Swarovski", sortOrder: 4 },
  { name: "Cartier", sortOrder: 5 },
  { name: "Tanagra", sortOrder: 6 },
  { name: "Christie's Education", sortOrder: 7 },
  { name: "Centrepoint", sortOrder: 8 },
  { name: "Schneider Electric", sortOrder: 9 },
  { name: "Ford Foundation", sortOrder: 10 },
  { name: "Transparency International", sortOrder: 11 },
  { name: "Studio Emad Eddin", sortOrder: 12 },
  { name: "Publicis Groupe", sortOrder: 13 },
  { name: "Modern Media Factory", sortOrder: 14 },
  { name: "Photopia", sortOrder: 15 },
  { name: "Pulse Music World", sortOrder: 16 },
  { name: "Orient Productions", sortOrder: 17 },
  { name: "Sudan365", sortOrder: 18 },
  { name: "5D Egypt", sortOrder: 19 },
];

// ─── MAIN ───────────────────────────────────────────────────────

async function main() {
  console.log("Logging in...");
  const token = await login();
  console.log("Authenticated.\n");

  // Seed Work items
  console.log(`Seeding ${workItems.length} Work entries...`);
  let workCount = 0;
  for (const item of workItems) {
    const doc = await create(token, "work", {
      ...item,
      sortOrder: workItems.length - workCount, // newest first
    });
    if (doc) {
      workCount++;
      console.log(`  ✓ ${item.title}`);
    }
  }
  console.log(`\nWork: ${workCount}/${workItems.length} created.\n`);

  // Seed Projects/Explore items
  console.log(`Seeding ${projectItems.length} Explore entries...`);
  let projCount = 0;
  for (const item of projectItems) {
    const doc = await create(token, "projects", {
      ...item,
      sortOrder: projectItems.length - projCount,
    });
    if (doc) {
      projCount++;
      console.log(`  ✓ ${item.title}`);
    }
  }
  console.log(`\nExplore: ${projCount}/${projectItems.length} created.\n`);

  // Seed Clients
  console.log(`Seeding ${clients.length} Client entries...`);
  let clientCount = 0;
  for (const item of clients) {
    const doc = await create(token, "clients", item);
    if (doc) {
      clientCount++;
      console.log(`  ✓ ${item.name}`);
    }
  }
  console.log(`\nClients: ${clientCount}/${clients.length} created.\n`);

  console.log("═══════════════════════════════════════");
  console.log(`DONE: ${workCount} work + ${projCount} explore + ${clientCount} clients`);
  console.log("═══════════════════════════════════════");
}

main().catch(console.error);
