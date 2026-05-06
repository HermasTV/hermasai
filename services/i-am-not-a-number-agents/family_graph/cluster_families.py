"""Cluster victims into family groups and infer relationship edges.

Algorithm
---------
We use Arabic naming conventions (given + father + grandfather + family) to
infer relationships. All edges are written as `source = 'name-cluster'` and
`verified = 0` -- they are *probable* relationships that need corroboration
from stories or human review before being trusted.

Important: Arabic naming chains are PATRILINEAL. Only fathers appear in the
chain, never mothers. Mothers and spouses are added later from stories.

Phases (run in order, each builds on the previous):

  Phase 1a -- Clans (broad tribal name grouping)
      Group all victims by their normalized clan name (`family_ar`, the
      4th token of the Arabic name). This is the loose grouping that the
      previous design used as "families". It is NOT a claim of direct
      relation -- hundreds of unrelated people may share a clan -- but
      it is the natural root of a family-name TREE: the clan branches
      into grandfather generations, each grandfather into fathers, and
      each father into individual victims. Every victim with a clan name
      gets a `clan_id`.

  Phase 1b -- Nuclear families (strict 3-name groups)
      Within each clan, group by the FULL 3-name ancestor triple
      (family_ar, grandfather_ar, father_ar). Only groups with 2+ members
      become rows in the `families` table -- these are real nuclear
      families (full siblings sharing father + grandfather + clan).
      Solo victims keep `family_id = NULL` but still have `clan_id`.

  Phase 2 -- Father → child edges (independent, name-based)
      Within a family, victim P is father of victim C iff:
          P.sex            == 'm'                      (patrilineal constraint)
          P.given_ar       == C.father_ar              (P's name matches the chain)
          P.father_ar      == C.grandfather_ar         (chain match REQUIRED)
          (age gap, if both known) is plausible        (12-70 years)
      The chain-match requirement is what filters out coincidences in big
      families like Al-Najjar (695 members) where many people are named
      "Mohammed".

  Phase 3 -- Sibling edges (independent, name-based)
      Within a family, A and B are siblings iff:
          A.father_ar      == B.father_ar
          A.grandfather_ar == B.grandfather_ar         (must agree -- no nulls)
      Siblings with grandfather missing on either side are NOT inferred at
      bootstrap; the false-positive rate is too high.

  Phase 4 -- Uncle / aunt edges (DERIVED from Phase 2 + 3)
      For each father → child edge produced in Phase 2:
          For each sibling of the father (from Phase 3):
              That sibling is the uncle (sex=m) or aunt (sex=f) of the child.
      This is much stricter than naive name matching because every uncle edge
      is backed by a confirmed father link AND a confirmed sibling link.

  Phase 5 -- Cousin edges (DERIVED from Phase 2 + 3)
      For each sibling pair (S1, S2) from Phase 3:
          For each child C1 of S1 and child C2 of S2 (from Phase 2):
              C1 and C2 are cousins.
      Same idea -- cousins only exist when both parents and the sibling link
      between them are independently confirmed.

All non-symmetric relations are written as TWO directed edges so that
"find all relatives of X" is a single SELECT.

Run:  python -m family_graph.cluster_families
"""

from collections import defaultdict
from typing import Dict, List, Set, Tuple

from .db import connect


# ---------------------------------------------------------------------------
# Confidence scores
# ---------------------------------------------------------------------------
# Phase 2 -- father → child via name chain
CONF_FATHER = 0.90

# Phase 3 -- siblings via shared father + grandfather
CONF_SIBLING = 0.90

# Phase 4 -- uncle / aunt derived from confirmed father + sibling
# Slightly lower than the source edges because errors compound.
CONF_UNCLE = 0.85

# Phase 5 -- cousin derived from two confirmed father edges + a sibling link
# Lowest because we're now 3 edges deep.
CONF_COUSIN = 0.80

# ---------------------------------------------------------------------------
# Age sanity: SOFT filters. We only reject when BOTH ages are known and the
# gap is implausible. Missing-age records are accepted.
# ---------------------------------------------------------------------------
MIN_PARENT_CHILD_GAP_YEARS = 12
MAX_PARENT_CHILD_GAP_YEARS = 70
MAX_SIBLING_AGE_GAP_YEARS = 35


def _age_ok_parent_child(parent_age, child_age) -> bool:
    if parent_age is None or child_age is None:
        return True  # missing age → don't reject
    gap = parent_age - child_age
    return MIN_PARENT_CHILD_GAP_YEARS <= gap <= MAX_PARENT_CHILD_GAP_YEARS


def _age_ok_siblings(a_age, b_age) -> bool:
    if a_age is None or b_age is None:
        return True
    return abs(a_age - b_age) <= MAX_SIBLING_AGE_GAP_YEARS


# ---------------------------------------------------------------------------
# Edge buffer helpers
# ---------------------------------------------------------------------------

def _bidir(edges_buf: List[Tuple], a: int, b: int,
           rel_a_to_b: str, rel_b_to_a: str,
           confidence: float, source: str = "name-cluster",
           notes: str = "") -> None:
    edges_buf.append((a, b, rel_a_to_b, confidence, source, 0, notes))
    edges_buf.append((b, a, rel_b_to_a, confidence, source, 0, notes))


def _symmetric(edges_buf: List[Tuple], a: int, b: int, relation: str,
               confidence: float, source: str = "name-cluster",
               notes: str = "") -> None:
    edges_buf.append((a, b, relation, confidence, source, 0, notes))
    edges_buf.append((b, a, relation, confidence, source, 0, notes))


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def cluster_families() -> None:
    conn = connect()
    try:
        # Reset state from any prior run.
        # Order matters: clear FK references on victims BEFORE deleting clans/families.
        conn.execute("DELETE FROM family_edges")
        conn.execute("UPDATE victims SET clan_id = NULL, family_id = NULL")
        conn.execute("DELETE FROM families")
        conn.execute("DELETE FROM clans")
        conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('clans', 'families', 'family_edges')")
        conn.commit()

        # ============================================================
        # PHASE 1a -- clans (broad tribal grouping, root of family tree)
        # ============================================================
        print("[cluster] Phase 1a: clans (clan-name grouping)...")
        clan_rows = conn.execute("""
            SELECT family_ar,
                   MAX(family_en)  AS family_en,
                   COUNT(*)        AS member_count
              FROM victims
             WHERE family_ar IS NOT NULL AND family_ar != ''
          GROUP BY family_ar
          ORDER BY member_count DESC
        """).fetchall()

        clan_id_map: Dict[str, int] = {}
        for r in clan_rows:
            cur = conn.execute(
                "INSERT INTO clans (family_ar, family_en, member_count) VALUES (?, ?, ?)",
                (r["family_ar"], r["family_en"], r["member_count"]),
            )
            clan_id_map[r["family_ar"]] = cur.lastrowid
        conn.commit()

        # Backfill victims.clan_id with a single correlated UPDATE
        # (much faster than per-clan UPDATEs because it uses the index once).
        conn.execute("""
            UPDATE victims
               SET clan_id = (
                   SELECT id FROM clans WHERE clans.family_ar = victims.family_ar
               )
             WHERE family_ar IS NOT NULL AND family_ar != ''
        """)
        conn.commit()
        print(f"[cluster]   {len(clan_id_map)} clans created")

        # ============================================================
        # PHASE 1b -- nuclear families (strict 3-name triple, 2+ members)
        # ============================================================
        print("[cluster] Phase 1b: nuclear families (3-name triple, 2+ members)...")
        rows = conn.execute("""
            SELECT family_ar, grandfather_ar, father_ar,
                   COUNT(*) AS member_count,
                   MAX(family_en) AS family_en
              FROM victims
             WHERE family_ar      IS NOT NULL AND family_ar      != ''
               AND grandfather_ar IS NOT NULL AND grandfather_ar != ''
               AND father_ar      IS NOT NULL AND father_ar      != ''
          GROUP BY family_ar, grandfather_ar, father_ar
            HAVING COUNT(*) >= 2
          ORDER BY member_count DESC
        """).fetchall()

        family_id_map: Dict[Tuple[str, str, str], int] = {}
        for r in rows:
            clan_id = clan_id_map.get(r["family_ar"])
            if clan_id is None:
                continue  # shouldn't happen, but be defensive
            display_ar = f"أبناء {r['father_ar']} {r['grandfather_ar']} {r['family_ar']}"
            cur = conn.execute(
                """
                INSERT INTO families
                    (clan_id, family_ar, grandfather_ar, father_ar, family_en,
                     display_name_ar, member_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (clan_id, r["family_ar"], r["grandfather_ar"], r["father_ar"],
                 r["family_en"], display_ar, r["member_count"]),
            )
            family_id_map[(r["family_ar"], r["grandfather_ar"], r["father_ar"])] = cur.lastrowid
        conn.commit()

        # Backfill victims.family_id with a single correlated UPDATE
        conn.execute("""
            UPDATE victims
               SET family_id = (
                   SELECT id FROM families
                    WHERE families.family_ar      = victims.family_ar
                      AND families.grandfather_ar = victims.grandfather_ar
                      AND families.father_ar      = victims.father_ar
               )
             WHERE family_ar      IS NOT NULL AND family_ar      != ''
               AND grandfather_ar IS NOT NULL AND grandfather_ar != ''
               AND father_ar      IS NOT NULL AND father_ar      != ''
        """)

        # Update nuclear_family_count on each clan
        conn.execute("""
            UPDATE clans SET nuclear_family_count = (
                SELECT COUNT(*) FROM families WHERE families.clan_id = clans.id
            )
        """)
        conn.commit()
        print(f"[cluster]   {len(family_id_map)} nuclear families created (2+ members each)")

        # Load every victim once into memory. We keep grouping by `family_ar`
        # (the clan) here because Phases 2-5 use it as a search space to
        # limit O(n^2) lookups -- it is NOT used as a "family" claim.
        print("[cluster] Loading victims into memory...")
        all_victims = conn.execute("""
            SELECT data_index, given_ar, father_ar, grandfather_ar, family_ar,
                   sex, age_years
              FROM victims
             WHERE family_ar IS NOT NULL AND family_ar != ''
        """).fetchall()

        by_family: Dict[str, List[dict]] = defaultdict(list)
        for v in all_victims:
            by_family[v["family_ar"]].append(dict(v))
        print(f"[cluster]   {len(all_victims)} victims loaded "
              f"(searched within {len(by_family)} clan groups)")

        # Lookup state shared across phases (built in Phase 2 + 3)
        children_of: Dict[int, List[int]] = defaultdict(list)   # parent_id → [child_ids]
        parents_of: Dict[int, List[int]] = defaultdict(list)    # child_id → [parent_ids]
        siblings_of: Dict[int, Set[int]] = defaultdict(set)     # id → {sibling_ids}

        edges_buf: List[Tuple] = []
        stats = {"father": 0, "sibling": 0, "uncle_aunt": 0, "cousin": 0}

        # ============================================================
        # PHASE 2 -- father → child (name chain match, male only)
        # ============================================================
        print("[cluster] Phase 2: father → child (chain match, male only)...")
        for family_ar, members in by_family.items():
            if len(members) < 2:
                continue

            # Index male candidates by their given name for O(1) lookup
            males_by_given: Dict[str, List[dict]] = defaultdict(list)
            for m in members:
                if m["sex"] == "m" and m["given_ar"]:
                    males_by_given[m["given_ar"]].append(m)

            for child in members:
                fname = child["father_ar"]
                gname = child["grandfather_ar"]
                if not fname or not gname:
                    continue  # need both for chain match

                for parent in males_by_given.get(fname, []):
                    if parent["data_index"] == child["data_index"]:
                        continue
                    # Chain match: parent.father_ar must equal child.grandfather_ar
                    if parent["father_ar"] != gname:
                        continue
                    # Age sanity (soft)
                    if not _age_ok_parent_child(parent["age_years"], child["age_years"]):
                        continue

                    _bidir(
                        edges_buf,
                        parent["data_index"], child["data_index"],
                        rel_a_to_b="father", rel_b_to_a="child",
                        confidence=CONF_FATHER, notes="chain-match",
                    )
                    children_of[parent["data_index"]].append(child["data_index"])
                    parents_of[child["data_index"]].append(parent["data_index"])
                    stats["father"] += 1

        # ============================================================
        # PHASE 3 -- siblings (shared father + grandfather)
        # ============================================================
        print("[cluster] Phase 3: siblings (shared father + grandfather)...")
        for family_ar, members in by_family.items():
            if len(members) < 2:
                continue

            # Group by (father_ar, grandfather_ar). Both must be present.
            groups: Dict[Tuple[str, str], List[dict]] = defaultdict(list)
            for m in members:
                if m["father_ar"] and m["grandfather_ar"]:
                    groups[(m["father_ar"], m["grandfather_ar"])].append(m)

            for key, sibs in groups.items():
                if len(sibs) < 2:
                    continue
                for i in range(len(sibs)):
                    for j in range(i + 1, len(sibs)):
                        a, b = sibs[i], sibs[j]
                        if not _age_ok_siblings(a["age_years"], b["age_years"]):
                            continue
                        _symmetric(
                            edges_buf,
                            a["data_index"], b["data_index"],
                            relation="sibling", confidence=CONF_SIBLING,
                            notes="father+grandfather match",
                        )
                        siblings_of[a["data_index"]].add(b["data_index"])
                        siblings_of[b["data_index"]].add(a["data_index"])
                        stats["sibling"] += 1

        # Build a quick id → victim map for sex/age lookup in derived phases
        victim_by_id: Dict[int, dict] = {v["data_index"]: dict(v) for v in all_victims}

        # ============================================================
        # PHASE 4 -- uncle / aunt (derived from Phase 2 + 3)
        # ============================================================
        # For each (child → parent) edge, the parent's siblings become the
        # child's uncles/aunts.
        print("[cluster] Phase 4: uncle/aunt (derived)...")
        for child_id, parent_ids in parents_of.items():
            child = victim_by_id[child_id]
            for parent_id in parent_ids:
                for uncle_id in siblings_of.get(parent_id, ()):
                    uncle = victim_by_id[uncle_id]
                    if uncle["sex"] == "m":
                        rel_uncle, rel_inv = "uncle", ("nephew" if child["sex"] == "m" else "niece")
                    elif uncle["sex"] == "f":
                        rel_uncle, rel_inv = "aunt", ("nephew" if child["sex"] == "m" else "niece")
                    else:
                        continue
                    _bidir(
                        edges_buf,
                        uncle_id, child_id,
                        rel_a_to_b=rel_uncle, rel_b_to_a=rel_inv,
                        confidence=CONF_UNCLE, notes="derived from sibling+father",
                    )
                    stats["uncle_aunt"] += 1

        # ============================================================
        # PHASE 5 -- cousins (derived from sibling pairs' children)
        # ============================================================
        # For each sibling pair, connect their respective children.
        print("[cluster] Phase 5: cousins (derived)...")
        seen_cousin_pairs: Set[Tuple[int, int]] = set()
        for sib_a, sib_set in siblings_of.items():
            for sib_b in sib_set:
                if sib_a >= sib_b:
                    continue  # process each sibling pair once
                children_a = children_of.get(sib_a, [])
                children_b = children_of.get(sib_b, [])
                if not children_a or not children_b:
                    continue
                for ca in children_a:
                    for cb in children_b:
                        if ca == cb:
                            continue
                        key = (min(ca, cb), max(ca, cb))
                        if key in seen_cousin_pairs:
                            continue
                        seen_cousin_pairs.add(key)
                        _symmetric(
                            edges_buf,
                            ca, cb,
                            relation="cousin", confidence=CONF_COUSIN,
                            notes="derived from sibling+father",
                        )
                        stats["cousin"] += 1

        # ============================================================
        # Bulk insert
        # ============================================================
        print()
        print("[cluster] Inferred edge counts (per relationship pair):")
        for k, v in stats.items():
            print(f"    {k:>12}: {v}")
        print(f"[cluster] Total edge rows to insert: {len(edges_buf)}")

        conn.executemany(
            """
            INSERT OR IGNORE INTO family_edges
                (from_victim, to_victim, relation, confidence, source, verified, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            edges_buf,
        )
        conn.commit()

        conn.execute(
            "INSERT OR REPLACE INTO meta (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
            ("cluster_families.last_run", "ok"),
        )
        conn.commit()

        # Final stats
        total_edges = conn.execute("SELECT COUNT(*) AS c FROM family_edges").fetchone()["c"]
        by_relation = conn.execute("""
            SELECT relation, COUNT(*) AS c
              FROM family_edges
          GROUP BY relation
          ORDER BY c DESC
        """).fetchall()
        print(f"\n[cluster] Edges in DB: {total_edges}")
        for r in by_relation:
            print(f"    {r['relation']:>12}: {r['c']}")

    finally:
        conn.close()


if __name__ == "__main__":
    cluster_families()
