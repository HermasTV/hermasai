"""Initialize the local SQLite schema for the family graph pipeline.

Tables:
  - victims:        one row per person from data.json, with parsed name tokens
  - families:       one row per cluster (shared family/tribe name)
  - family_edges:   directed/typed relationship edges between victims
  - meta:           pipeline state and run metadata

Run:  python -m family_graph.init_db
"""

from .db import DB_PATH, connect

SCHEMA = """
-- We DROP and recreate every run so schema changes take effect during dev.
-- Re-importing 60k rows takes a few seconds; this is fine for the local
-- development DB. Order matters: drop tables that hold FK references first.
DROP TABLE IF EXISTS family_edges;
DROP TABLE IF EXISTS victims;
DROP TABLE IF EXISTS families;
DROP TABLE IF EXISTS clans;
DROP TABLE IF EXISTS meta;

-- One row per victim from data.json
CREATE TABLE IF NOT EXISTS victims (
    data_index       INTEGER PRIMARY KEY,        -- index in data.json (0-based)
    name_en          TEXT NOT NULL,              -- raw English name
    name_ar          TEXT NOT NULL,              -- raw Arabic name (source of truth)
    age_str          TEXT,                       -- raw age string ("5", "1 month", "Less than a day")
    age_years        REAL,                       -- normalized age in years (0.0027 for 1 day)
    birth_date       TEXT,                       -- YYYY-MM-DD
    sex              TEXT CHECK (sex IN ('m', 'f')),

    -- Parsed Arabic name tokens (source of truth for clustering)
    given_ar         TEXT,                       -- Token 1: given name
    father_ar        TEXT,                       -- Token 2: father's name
    grandfather_ar   TEXT,                       -- Token 3: grandfather's name
    family_ar        TEXT,                       -- Last token(s): family/tribe name (normalized)
    name_tokens_ar   TEXT,                       -- JSON array of all tokens (post-normalization)

    -- Parsed English equivalents (for display + cross-reference)
    given_en         TEXT,
    father_en        TEXT,
    grandfather_en   TEXT,
    family_en        TEXT,

    clan_id          INTEGER,                    -- FK to clans.id (always set if family_ar is set)
    family_id        INTEGER,                    -- FK to families.id (only set if 2+ siblings exist)

    FOREIGN KEY (clan_id)   REFERENCES clans(id),
    FOREIGN KEY (family_id) REFERENCES families(id)
);

CREATE INDEX IF NOT EXISTS idx_victims_family_ar     ON victims(family_ar);
CREATE INDEX IF NOT EXISTS idx_victims_father_ar     ON victims(father_ar);
CREATE INDEX IF NOT EXISTS idx_victims_grandfather   ON victims(grandfather_ar);
CREATE INDEX IF NOT EXISTS idx_victims_given_ar      ON victims(given_ar);
CREATE INDEX IF NOT EXISTS idx_victims_clan_id       ON victims(clan_id);
CREATE INDEX IF NOT EXISTS idx_victims_family_id     ON victims(family_id);
CREATE INDEX IF NOT EXISTS idx_victims_sex           ON victims(sex);


-- ─────────────────────────────────────────────────────────────────────────
-- TWO LAYERS OF FAMILY GROUPING
-- ─────────────────────────────────────────────────────────────────────────
-- We keep both layers because they answer different questions:
--
--   `clans`     → broad tribal/family-name grouping (e.g. النجار, ابو نصر)
--                 Hundreds of unrelated people may share a clan name.
--                 This is a NAME GROUPING for browsing, not a claim of
--                 direct relation. Useful for "show me everyone whose
--                 family name is Al-Najjar".
--
--   `families`  → nuclear family unit. Group of 2+ victims sharing the
--                 FULL 3-name ancestor triple (father, grandfather, clan).
--                 This IS a claim of direct relation -- members are full
--                 siblings. Useful for "show me the actual relatives".
--
-- A clan contains many nuclear families. A nuclear family always belongs
-- to exactly one clan. A victim always belongs to exactly one clan, and
-- optionally to one nuclear family (NULL if they have no siblings in
-- the dataset).
-- ─────────────────────────────────────────────────────────────────────────

-- Clan / tribal name grouping (broad, browse-only).
CREATE TABLE IF NOT EXISTS clans (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    family_ar             TEXT NOT NULL UNIQUE,   -- normalized Arabic clan name
    family_en             TEXT,                   -- representative English form
    member_count          INTEGER NOT NULL DEFAULT 0,
    nuclear_family_count  INTEGER NOT NULL DEFAULT 0,
    created_at            TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clans_family_ar       ON clans(family_ar);


-- Nuclear family unit (strict 3-name match, 2+ members).
CREATE TABLE IF NOT EXISTS families (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    clan_id          INTEGER NOT NULL,           -- which clan this family belongs to
    family_ar        TEXT NOT NULL,              -- clan / great-grandfather (token 4)
    grandfather_ar   TEXT NOT NULL,              -- grandfather (token 3)
    father_ar        TEXT NOT NULL,              -- father / patriarch (token 2)
    family_en        TEXT,                       -- representative English clan form
    display_name_ar  TEXT,                       -- e.g. "أبناء محمود سليم النجار"
    member_count     INTEGER NOT NULL DEFAULT 0,
    created_at       TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (family_ar, grandfather_ar, father_ar),
    FOREIGN KEY (clan_id) REFERENCES clans(id)
);

CREATE INDEX IF NOT EXISTS idx_families_clan_id      ON families(clan_id);
CREATE INDEX IF NOT EXISTS idx_families_family_ar    ON families(family_ar);
CREATE INDEX IF NOT EXISTS idx_families_triple
    ON families(family_ar, grandfather_ar, father_ar);


-- Typed, directed relationship edges between victims.
-- Edge `(from_id) --[relation]--> (to_id)`.
-- "father" means: from_id IS the father of to_id.
-- All bootstrap edges start as `verified = 0` and `source = 'name-cluster'`.
-- Stories / community / admin can later upgrade to `verified = 1`.
CREATE TABLE IF NOT EXISTS family_edges (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    from_victim      INTEGER NOT NULL,
    to_victim        INTEGER NOT NULL,
    relation         TEXT NOT NULL CHECK (relation IN (
        'father', 'mother', 'child',
        'sibling', 'spouse',
        'grandfather', 'grandmother', 'grandchild',
        'uncle', 'aunt', 'nephew', 'niece',
        'cousin', 'other'
    )),
    confidence       REAL NOT NULL,              -- 0.0 to 1.0
    source           TEXT NOT NULL,              -- 'name-cluster', 'story', 'community', 'manual'
    verified         INTEGER NOT NULL DEFAULT 0, -- 0 = unverified, 1 = verified
    notes            TEXT,
    created_at       TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (from_victim) REFERENCES victims(data_index),
    FOREIGN KEY (to_victim)   REFERENCES victims(data_index),
    UNIQUE (from_victim, to_victim, relation)
);

CREATE INDEX IF NOT EXISTS idx_edges_from            ON family_edges(from_victim);
CREATE INDEX IF NOT EXISTS idx_edges_to              ON family_edges(to_victim);
CREATE INDEX IF NOT EXISTS idx_edges_relation        ON family_edges(relation);
CREATE INDEX IF NOT EXISTS idx_edges_verified        ON family_edges(verified);


-- Pipeline state and run metadata
CREATE TABLE IF NOT EXISTS meta (
    key              TEXT PRIMARY KEY,
    value            TEXT,
    updated_at       TEXT DEFAULT CURRENT_TIMESTAMP
);
"""


def init_db() -> None:
    """Create all tables and indexes if they don't already exist."""
    print(f"[init_db] Database path: {DB_PATH}")
    conn = connect()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
        # Print summary of what exists
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        ).fetchall()
        print(f"[init_db] Schema initialized. Tables: {[t['name'] for t in tables]}")
        for t in tables:
            count = conn.execute(f"SELECT COUNT(*) AS c FROM {t['name']}").fetchone()["c"]
            print(f"  - {t['name']}: {count} rows")
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
