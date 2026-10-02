# Archived one-off scripts

WARNING: do not run anything in this folder.

These are completed one-off migrations and seed scripts. They write to whatever
`API_URL` or `DATABASE_URI` they are pointed at, and `.env.local` points at the
production database. `migrate-restructure.mjs` deletes all blog posts.

They are kept for reference only. If you need similar behaviour, write a new
script and test it against a Neon branch first.
