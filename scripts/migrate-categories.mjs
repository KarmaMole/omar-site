/**
 * Migration: Projects contentType → categories
 *
 * Payload v3 stores hasMany select fields in a junction table.
 * This script:
 * 1. Creates the projects_categories table and enum if they don't exist
 * 2. Creates the blog_posts_categories table and enum if they don't exist
 * 3. Migrates existing projects.content_type values into projects_categories
 * 4. Drops the old content_type column and enum
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create the projects categories enum with capitalized values
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_projects_categories" AS ENUM ('Music', 'Visual', 'Comics', 'Film', 'AI', 'Photography', 'Research');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // 2. Create the projects_categories junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "projects_categories" (
        "order" integer NOT NULL,
        "parent_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "value" "enum_projects_categories",
        "id" serial PRIMARY KEY
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "projects_categories_order_idx" ON "projects_categories" ("order");
      CREATE INDEX IF NOT EXISTS "projects_categories_parent_idx" ON "projects_categories" ("parent_id");
    `);

    // 3. Create the blog_posts categories enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_blog_posts_categories" AS ENUM ('AI Production', 'Workflows', 'Industry', 'Tools', 'Case Studies');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // 4. Create the blog_posts_categories junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts_categories" (
        "order" integer NOT NULL,
        "parent_id" integer NOT NULL REFERENCES "blog_posts"("id") ON DELETE CASCADE,
        "value" "enum_blog_posts_categories",
        "id" serial PRIMARY KEY
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "blog_posts_categories_order_idx" ON "blog_posts_categories" ("order");
      CREATE INDEX IF NOT EXISTS "blog_posts_categories_parent_idx" ON "blog_posts_categories" ("parent_id");
    `);

    // 5. Migrate existing content_type data to projects_categories
    // Map lowercase values to capitalized
    const VALUE_MAP = {
      music: 'Music',
      visual: 'Visual',
      comics: 'Comics',
      film: 'Film',
      ai: 'AI',
      photography: 'Photography',
      research: 'Research',
    };

    const { rows: projects } = await client.query(
      'SELECT id, content_type FROM projects WHERE content_type IS NOT NULL'
    );

    console.log(`Migrating ${projects.length} projects...`);

    for (const project of projects) {
      const capitalized = VALUE_MAP[project.content_type];
      if (!capitalized) {
        console.warn(`  Unknown content_type "${project.content_type}" for project ${project.id}, skipping`);
        continue;
      }

      // Check if already migrated
      const { rows: existing } = await client.query(
        'SELECT id FROM projects_categories WHERE parent_id = $1 AND value = $2',
        [project.id, capitalized]
      );

      if (existing.length === 0) {
        await client.query(
          'INSERT INTO projects_categories ("order", parent_id, value) VALUES ($1, $2, $3)',
          [1, project.id, capitalized]
        );
        console.log(`  Migrated project ${project.id}: ${project.content_type} → ${capitalized}`);
      } else {
        console.log(`  Project ${project.id} already migrated, skipping`);
      }
    }

    // 6. Drop old content_type column and enum
    await client.query('ALTER TABLE projects DROP COLUMN IF EXISTS content_type');
    await client.query('DROP TYPE IF EXISTS "enum_projects_content_type"');
    console.log('Dropped old content_type column and enum');

    await client.query('COMMIT');
    console.log('Migration complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
