"""Import the data.json names dataset into the local SQLite database.

Reads:  ../../../i-am-not-a-number/public/data.json   (60,199 victims)
Writes: family_graph/local.db (victims table)

Each record from data.json is parsed via name_parser and stored with
both raw and parsed name fields. The family clustering script runs
afterwards in a separate pass.

Run:  python -m family_graph.import_names
"""

import json
import re
from pathlib import Path
from typing import Optional

from .db import connect
from .name_parser import parse_name, parse_english_name

# data.json lives in the visualization service.
# Path is relative to this file (.../services/i-am-not-a-number-agents/family_graph/import_names.py)
DATA_JSON_PATH = (
    Path(__file__).parent.parent.parent
    / "i-am-not-a-number"
    / "public"
    / "data.json"
)


# ---------------------------------------------------------------------------
# Age normalization. The dataset's `g` field is a free-form string:
#   "5", "12", "1 month", "2 months", "Less than a day", "Stillborn", ...
# We convert it to a float number of years (or None if unparseable).
# ---------------------------------------------------------------------------

_NUM_RE = re.compile(r"(\d+(?:\.\d+)?)")


def parse_age(age_str: Optional[str]) -> Optional[float]:
    """Parse the dataset's age string into a float number of years."""
    if not age_str:
        return None

    s = age_str.strip().lower()

    if not s:
        return None

    # Special tokens
    if "stillborn" in s or "less than a day" in s or s in {"0", "newborn"}:
        return 0.0

    match = _NUM_RE.search(s)
    if not match:
        return None
    value = float(match.group(1))

    if "month" in s:
        return round(value / 12.0, 4)
    if "week" in s:
        return round(value / 52.0, 4)
    if "day" in s:
        return round(value / 365.0, 4)
    if "year" in s or s.replace(".", "").isdigit() or match.group(1) == s:
        return value

    # Plain number, no unit → assume years
    return value


# ---------------------------------------------------------------------------
# Main import
# ---------------------------------------------------------------------------

def import_names() -> None:
    if not DATA_JSON_PATH.exists():
        raise FileNotFoundError(f"Source dataset not found at {DATA_JSON_PATH}")

    print(f"[import_names] Loading {DATA_JSON_PATH}")
    with open(DATA_JSON_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)
    print(f"[import_names] Loaded {len(records)} records")

    conn = connect()
    try:
        # Wipe and re-import for idempotency. The pipeline is meant to be
        # re-runnable while we iterate on the parser/clustering.
        conn.execute("DELETE FROM family_edges")
        conn.execute("DELETE FROM victims")
        conn.execute("DELETE FROM families")
        conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('families', 'family_edges')")
        conn.commit()

        rows = []
        skipped = 0
        for idx, rec in enumerate(records):
            name_ar = rec.get("a", "")
            name_en = rec.get("n", "")
            age_str = rec.get("g", "")
            birth = rec.get("b", "")
            sex = rec.get("s", "")

            if not name_ar and not name_en:
                skipped += 1
                continue

            # Parse Arabic (source of truth)
            given_ar, father_ar, grandfather_ar, family_ar, tokens_ar = parse_name(name_ar)
            # Parse English (display + cross-reference)
            given_en, father_en, grandfather_en, family_en = parse_english_name(name_en)

            rows.append((
                idx,
                name_en,
                name_ar,
                age_str,
                parse_age(age_str),
                birth or None,
                sex if sex in ("m", "f") else None,
                given_ar or None,
                father_ar or None,
                grandfather_ar or None,
                family_ar or None,
                json.dumps(tokens_ar, ensure_ascii=False),
                given_en or None,
                father_en or None,
                grandfather_en or None,
                family_en or None,
            ))

        print(f"[import_names] Parsed {len(rows)} records (skipped {skipped})")

        conn.executemany(
            """
            INSERT INTO victims (
                data_index,
                name_en, name_ar,
                age_str, age_years,
                birth_date, sex,
                given_ar, father_ar, grandfather_ar, family_ar, name_tokens_ar,
                given_en, father_en, grandfather_en, family_en
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        conn.commit()

        # Update meta
        conn.execute(
            "INSERT OR REPLACE INTO meta (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
            ("import_names.last_count", str(len(rows))),
        )
        conn.execute(
            "INSERT OR REPLACE INTO meta (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
            ("import_names.source", str(DATA_JSON_PATH)),
        )
        conn.commit()

        # Sanity stats
        total = conn.execute("SELECT COUNT(*) AS c FROM victims").fetchone()["c"]
        with_family = conn.execute(
            "SELECT COUNT(*) AS c FROM victims WHERE family_ar IS NOT NULL AND family_ar != ''"
        ).fetchone()["c"]
        with_father = conn.execute(
            "SELECT COUNT(*) AS c FROM victims WHERE father_ar IS NOT NULL AND father_ar != ''"
        ).fetchone()["c"]
        with_grandfather = conn.execute(
            "SELECT COUNT(*) AS c FROM victims WHERE grandfather_ar IS NOT NULL AND grandfather_ar != ''"
        ).fetchone()["c"]

        print(f"[import_names] Inserted {total} victims into local.db")
        print(f"  with family name:      {with_family} ({100*with_family/total:.1f}%)")
        print(f"  with father name:      {with_father} ({100*with_father/total:.1f}%)")
        print(f"  with grandfather name: {with_grandfather} ({100*with_grandfather/total:.1f}%)")

    finally:
        conn.close()


if __name__ == "__main__":
    import_names()
