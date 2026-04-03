const API = "http://localhost:3000/api";

const map = {
  'TV & Advertising': 'Commercial & Advertising',
  'Video Production': 'Commercial & Advertising',
  'Corporate Video': 'Corporate',
  'Documentary': 'Documentary & Awareness',
  'Public Awareness': 'Documentary & Awareness',
  'Branding': 'Branding & Design',
  'Subtitling': 'Corporate',
};

async function main() {
  const loginRes = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "editor@6dofreviews.com", password: "Zadokite!13" }),
  });
  const { token } = await loginRes.json();

  const res = await fetch(`${API}/work?limit=100&depth=0`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { docs } = await res.json();

  let updated = 0;
  for (const doc of docs) {
    const oldCats = doc.categories || [];
    const newCats = [...new Set(oldCats.map(c => map[c] || c))];
    if (JSON.stringify(oldCats.sort()) !== JSON.stringify(newCats.sort())) {
      const r = await fetch(`${API}/work/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categories: newCats }),
      });
      const data = await r.json();
      if (!data.errors) { updated++; console.log(`  ✓ ${doc.title} → ${newCats.join(", ")}`); }
      else console.log(`  ERR ${doc.title}`, JSON.stringify(data.errors).slice(0, 100));
    }
  }
  console.log(`\nUpdated: ${updated}`);
}
main().catch(console.error);
