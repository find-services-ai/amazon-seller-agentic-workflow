import Database from 'better-sqlite3'
import * as sqliteVec from 'sqlite-vec'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = join(DATA_DIR, 'seller-platform.db')

const db = new Database(DB_PATH, { verbose: process.env.DB_VERBOSE ? console.log : undefined })

// Load sqlite-vec vector search extension
sqliteVec.load(db)

// Performance pragmas
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('foreign_keys = ON')
db.pragma('cache_size = -64000') // 64MB cache

// ─── Schema Migrations ──────────────────────────────────────

const MIGRATIONS = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      -- Categories / niches
      CREATE TABLE IF NOT EXISTS categories (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL UNIQUE,
        parent_id    INTEGER REFERENCES categories(id),
        amazon_node  TEXT,
        description  TEXT,
        created_at   TEXT DEFAULT (datetime('now'))
      );

      -- Product catalog (multi-product)
      CREATE TABLE IF NOT EXISTS products (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        slug           TEXT NOT NULL UNIQUE,
        name           TEXT NOT NULL,
        category_id    INTEGER REFERENCES categories(id),
        status         TEXT DEFAULT 'idea' CHECK(status IN ('idea','researching','validated','sourcing','launching','active','paused','discontinued')),
        description    TEXT,
        target_price   REAL,
        unit_cost      REAL,
        expected_margin REAL,
        validation_score INTEGER,
        confidence     INTEGER,
        budget_limit   REAL DEFAULT 1500,
        image_url      TEXT,
        tags           TEXT, -- JSON array
        meta           TEXT, -- JSON object for extensible data
        created_at     TEXT DEFAULT (datetime('now')),
        updated_at     TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

      -- Product trend snapshots (daily/weekly)
      CREATE TABLE IF NOT EXISTS product_trends (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id   INTEGER REFERENCES products(id) ON DELETE CASCADE,
        period       TEXT NOT NULL CHECK(period IN ('daily','weekly','monthly')),
        date         TEXT NOT NULL,
        bsr_rank     INTEGER,
        search_volume INTEGER,
        price_avg    REAL,
        price_low    REAL,
        price_high   REAL,
        review_count INTEGER,
        rating_avg   REAL,
        demand_score INTEGER,
        competition_score INTEGER,
        trend_direction TEXT CHECK(trend_direction IN ('rising','stable','declining')),
        source       TEXT, -- where data came from
        raw_data     TEXT, -- JSON blob of raw research
        created_at   TEXT DEFAULT (datetime('now')),
        UNIQUE(product_id, period, date)
      );

      CREATE INDEX IF NOT EXISTS idx_trends_product_date ON product_trends(product_id, date);
      CREATE INDEX IF NOT EXISTS idx_trends_date ON product_trends(date);

      -- Trend discovery (category-level, not product-specific)
      CREATE TABLE IF NOT EXISTS trend_discoveries (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id    INTEGER REFERENCES categories(id),
        keyword        TEXT NOT NULL,
        search_volume  INTEGER,
        growth_rate    REAL,
        competition    TEXT CHECK(competition IN ('low','medium','high')),
        opportunity_score INTEGER,
        source         TEXT,
        notes          TEXT,
        discovered_at  TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_discoveries_score ON trend_discoveries(opportunity_score DESC);

      -- Suppliers directory
      CREATE TABLE IF NOT EXISTS suppliers (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        platform     TEXT, -- 'made-in-china', 'alibaba', '1688', 'domestic'
        country      TEXT DEFAULT 'CN',
        contact_email TEXT,
        contact_name TEXT,
        website      TEXT,
        rating       REAL,
        verified     INTEGER DEFAULT 0,
        notes        TEXT,
        meta         TEXT, -- JSON
        created_at   TEXT DEFAULT (datetime('now'))
      );

      -- Supplier quotes (per product per supplier)
      CREATE TABLE IF NOT EXISTS supplier_quotes (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id   INTEGER REFERENCES products(id) ON DELETE CASCADE,
        supplier_id  INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
        price_low    REAL,
        price_high   REAL,
        moq          INTEGER,
        lead_time_days INTEGER,
        shipping_cost REAL,
        landed_cost  REAL,
        sample_cost  REAL,
        status       TEXT DEFAULT 'quoted' CHECK(status IN ('quoted','negotiating','accepted','rejected')),
        quoted_at    TEXT DEFAULT (datetime('now')),
        notes        TEXT,
        UNIQUE(product_id, supplier_id)
      );

      -- Seller profiles (extends auth users)
      CREATE TABLE IF NOT EXISTS sellers (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email     TEXT NOT NULL UNIQUE,
        store_name     TEXT,
        store_slug     TEXT UNIQUE,
        amazon_seller_id TEXT,
        bio            TEXT,
        logo_url       TEXT,
        settings       TEXT, -- JSON
        plan           TEXT DEFAULT 'free' CHECK(plan IN ('free','starter','pro')),
        created_at     TEXT DEFAULT (datetime('now'))
      );

      -- Listings (Amazon + own storefront)
      CREATE TABLE IF NOT EXISTS listings (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id   INTEGER REFERENCES products(id) ON DELETE CASCADE,
        seller_id    INTEGER REFERENCES sellers(id),
        channel      TEXT NOT NULL CHECK(channel IN ('amazon','storefront','both')),
        asin         TEXT,
        listing_url  TEXT,
        title        TEXT,
        price        REAL,
        status       TEXT DEFAULT 'draft' CHECK(status IN ('draft','active','paused','suppressed')),
        bullets      TEXT, -- JSON array
        description  TEXT,
        images       TEXT, -- JSON array of URLs
        keywords     TEXT, -- JSON array
        created_at   TEXT DEFAULT (datetime('now')),
        updated_at   TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_listings_product ON listings(product_id);
      CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);

      -- Orders (buyer purchases)
      CREATE TABLE IF NOT EXISTS orders (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number    TEXT NOT NULL UNIQUE,
        listing_id      INTEGER REFERENCES listings(id),
        seller_id       INTEGER REFERENCES sellers(id),
        buyer_email     TEXT,
        buyer_name      TEXT,
        channel         TEXT NOT NULL CHECK(channel IN ('amazon','storefront')),
        quantity        INTEGER DEFAULT 1,
        unit_price      REAL,
        total           REAL,
        status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','shipped','delivered','returned','cancelled')),
        shipping_address TEXT,
        tracking_number TEXT,
        ordered_at      TEXT DEFAULT (datetime('now')),
        shipped_at      TEXT,
        delivered_at    TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

      -- Agent runs (track every AI execution)
      CREATE TABLE IF NOT EXISTS agent_runs (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name   TEXT NOT NULL,
        product_id   INTEGER REFERENCES products(id),
        phase        TEXT,
        input        TEXT, -- JSON
        output       TEXT, -- JSON
        score        INTEGER,
        confidence   INTEGER,
        tokens_used  INTEGER,
        duration_ms  INTEGER,
        status       TEXT DEFAULT 'completed' CHECK(status IN ('running','completed','failed')),
        error        TEXT,
        created_at   TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_agent_runs_product ON agent_runs(product_id);
      CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs(agent_name);

      -- Research sessions (links validation pipeline to products)
      CREATE TABLE IF NOT EXISTS research_sessions (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id   INTEGER REFERENCES products(id) ON DELETE CASCADE,
        phase_id     TEXT NOT NULL,
        score        INTEGER,
        confidence   INTEGER,
        verdict      TEXT,
        result_data  TEXT, -- JSON blob of full phase result
        created_at   TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_research_product ON research_sessions(product_id);

      -- Schema version tracker
      CREATE TABLE IF NOT EXISTS schema_version (
        version      INTEGER PRIMARY KEY,
        name         TEXT,
        applied_at   TEXT DEFAULT (datetime('now'))
      );
    `
  },
  {
    version: 2,
    name: 'vector_embeddings',
    up: `
      -- Metadata table for vector embeddings
      CREATE TABLE IF NOT EXISTS embeddings_meta (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        type         TEXT NOT NULL CHECK(type IN ('research','agent_run','product','supplier','listing')),
        ref_id       INTEGER,
        product_id   INTEGER REFERENCES products(id) ON DELETE CASCADE,
        phase_id     TEXT,
        summary      TEXT,
        metadata     TEXT,
        created_at   TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_emb_meta_type ON embeddings_meta(type);
      CREATE INDEX IF NOT EXISTS idx_emb_meta_product ON embeddings_meta(product_id);
      CREATE INDEX IF NOT EXISTS idx_emb_meta_phase ON embeddings_meta(phase_id);
    `
  },
  {
    version: 3,
    name: 'monetization_billing',
    up: `
      -- Plan definitions with limits and revenue share rates
      CREATE TABLE IF NOT EXISTS plan_definitions (
        id           TEXT PRIMARY KEY, -- 'free', 'starter', 'pro'
        name         TEXT NOT NULL,
        max_products INTEGER NOT NULL DEFAULT 3,
        max_agent_runs_monthly INTEGER NOT NULL DEFAULT 20,
        revenue_share_pct REAL NOT NULL DEFAULT 0, -- % of GMV taken as platform fee
        features     TEXT, -- JSON array of feature flags
        price_monthly REAL DEFAULT 0,
        created_at   TEXT DEFAULT (datetime('now'))
      );

      -- Seller usage tracking (monthly rollup)
      CREATE TABLE IF NOT EXISTS seller_usage (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id       INTEGER NOT NULL REFERENCES sellers(id),
        period          TEXT NOT NULL, -- 'YYYY-MM'
        agent_runs_used INTEGER DEFAULT 0,
        products_active INTEGER DEFAULT 0,
        gmv             REAL DEFAULT 0, -- gross merchandise value for the period
        revenue_share_owed REAL DEFAULT 0, -- platform fee = gmv * rate
        tokens_consumed INTEGER DEFAULT 0,
        created_at      TEXT DEFAULT (datetime('now')),
        UNIQUE(seller_id, period)
      );

      CREATE INDEX IF NOT EXISTS idx_usage_seller ON seller_usage(seller_id);
      CREATE INDEX IF NOT EXISTS idx_usage_period ON seller_usage(period);

      -- Revenue share ledger (tracks every transaction-level fee)
      CREATE TABLE IF NOT EXISTS revenue_share_ledger (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id       INTEGER NOT NULL REFERENCES sellers(id),
        order_id        INTEGER REFERENCES orders(id),
        order_total     REAL NOT NULL,
        share_pct       REAL NOT NULL,
        platform_fee    REAL NOT NULL, -- actual $ amount owed
        status          TEXT DEFAULT 'accrued' CHECK(status IN ('accrued','invoiced','paid','waived')),
        period          TEXT NOT NULL, -- 'YYYY-MM'
        created_at      TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_ledger_seller ON revenue_share_ledger(seller_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_period ON revenue_share_ledger(period);

      -- Agent workflow templates (agent marketplace)
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        slug            TEXT NOT NULL UNIQUE,
        name            TEXT NOT NULL,
        description     TEXT,
        author_seller_id INTEGER REFERENCES sellers(id),
        category        TEXT, -- 'research', 'outreach', 'ppc', 'listing', 'inventory'
        phases          TEXT NOT NULL, -- JSON array of phase definitions
        is_public       INTEGER DEFAULT 0,
        price           REAL DEFAULT 0, -- 0 = free template
        installs        INTEGER DEFAULT 0,
        rating          REAL,
        tags            TEXT, -- JSON array
        created_at      TEXT DEFAULT (datetime('now')),
        updated_at      TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_templates_category ON workflow_templates(category);
      CREATE INDEX IF NOT EXISTS idx_templates_public ON workflow_templates(is_public);
      CREATE INDEX IF NOT EXISTS idx_templates_author ON workflow_templates(author_seller_id);

      -- Marketplace purchases / installs
      CREATE TABLE IF NOT EXISTS template_installs (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id     INTEGER NOT NULL REFERENCES workflow_templates(id),
        seller_id       INTEGER NOT NULL REFERENCES sellers(id),
        price_paid      REAL DEFAULT 0,
        installed_at    TEXT DEFAULT (datetime('now')),
        UNIQUE(template_id, seller_id)
      );

      -- Shared supplier intelligence (anonymized ratings pool)
      CREATE TABLE IF NOT EXISTS supplier_intelligence (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id     INTEGER NOT NULL REFERENCES suppliers(id),
        seller_id       INTEGER NOT NULL REFERENCES sellers(id),
        quality_score   INTEGER CHECK(quality_score BETWEEN 1 AND 10),
        communication_score INTEGER CHECK(communication_score BETWEEN 1 AND 10),
        reliability_score INTEGER CHECK(reliability_score BETWEEN 1 AND 10),
        lead_time_actual INTEGER, -- actual days experienced
        defect_rate_pct  REAL,
        notes           TEXT,
        is_anonymous     INTEGER DEFAULT 1,
        created_at      TEXT DEFAULT (datetime('now')),
        UNIQUE(supplier_id, seller_id)
      );

      CREATE INDEX IF NOT EXISTS idx_supint_supplier ON supplier_intelligence(supplier_id);

      -- Deal scoring requests (AI Deal Scoring as a Service)
      CREATE TABLE IF NOT EXISTS deal_scores (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id       INTEGER NOT NULL REFERENCES sellers(id),
        asin            TEXT,
        keyword         TEXT,
        input_data      TEXT, -- JSON
        demand_score    INTEGER,
        competition_score INTEGER,
        pricing_score   INTEGER,
        supply_score    INTEGER,
        risk_score      INTEGER,
        overall_score   INTEGER,
        confidence      INTEGER,
        report          TEXT, -- full JSON report
        tokens_used     INTEGER,
        created_at      TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_deals_seller ON deal_scores(seller_id);

      -- Seed plan definitions
      INSERT OR IGNORE INTO plan_definitions (id, name, max_products, max_agent_runs_monthly, revenue_share_pct, features, price_monthly) VALUES
        ('free', 'Free', 3, 20, 0, '["deal_scoring","basic_research","storefront"]', 0),
        ('starter', 'Starter', 15, 100, 3.5, '["deal_scoring","full_research","storefront","supplier_intel","ppc_basic","marketplace_browse"]', 0),
        ('pro', 'Pro', -1, -1, 5.0, '["deal_scoring","full_research","storefront","supplier_intel","ppc_advanced","marketplace_full","white_label","autopilot","api_access"]', 0);
    `
  }
]

// vec0 virtual tables can't be created in exec() multi-statement — done separately after migration
function ensureVecTable() {
  try {
    db.prepare("SELECT count(*) FROM embeddings_vec").get()
  } catch {
    db.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS embeddings_vec USING vec0(id INTEGER PRIMARY KEY, embedding float[768])`).run()
    console.log('[DB] Created embeddings_vec virtual table')
  }
}

// Run migrations
function migrate() {
  const currentVersion = (() => {
    try {
      const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get()
      return row?.v || 0
    } catch {
      return 0
    }
  })()

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`[DB] Running migration ${migration.version}: ${migration.name}`)
      db.exec(migration.up)
      db.prepare('INSERT INTO schema_version (version, name) VALUES (?, ?)').run(
        migration.version,
        migration.name
      )
    }
  }
}

migrate()
ensureVecTable()
console.log(`[DB] SQLite + vec ready at ${DB_PATH}`)

// ─── Helper: Seed initial categories if empty ─────────────────

function seedCategories() {
  const count = db.prepare('SELECT COUNT(*) as c FROM categories').get().c
  if (count > 0) return

  const categories = [
    'Pet Supplies', 'Home & Kitchen', 'Beauty & Personal Care',
    'Health & Household', 'Sports & Outdoors', 'Tools & Home Improvement',
    'Baby', 'Automotive', 'Garden & Outdoor', 'Office Products',
    'Electronics Accessories', 'Toys & Games', 'Arts & Crafts'
  ]
  const insert = db.prepare('INSERT INTO categories (name) VALUES (?)')
  const tx = db.transaction((cats) => { for (const c of cats) insert.run(c) })
  tx(categories)
  console.log(`[DB] Seeded ${categories.length} categories`)
}

seedCategories()

// ─── Seed pet-slicker-brush if products table empty ──────────

function seedInitialProduct() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c
  if (count > 0) return

  const catRow = db.prepare("SELECT id FROM categories WHERE name = 'Pet Supplies'").get()
  db.prepare(`
    INSERT INTO products (slug, name, category_id, status, target_price, unit_cost, expected_margin, validation_score, confidence, budget_limit, tags, meta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'pet-slicker-brush',
    'Self-Cleaning Pet Slicker Brush',
    catRow?.id || null,
    'sourcing',
    13.99,
    2.20,
    54,
    38,
    83,
    1500,
    JSON.stringify(['pet', 'grooming', 'brush']),
    JSON.stringify({
      marketSize: '$14.69B', cagr: '6%', usMarketShare: '78.2%',
      maxScore: 50, currentPhase: 'supplier-outreach'
    })
  )
  console.log('[DB] Seeded initial product: pet-slicker-brush')
}

seedInitialProduct()

export default db
