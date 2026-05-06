"""Print summary statistics and sanity-check samples for the family graph.

Run:  python -m family_graph.stats
"""

from .db import connect


def section(title: str) -> None:
    print()
    print("=" * 78)
    print(title)
    print("=" * 78)


def main() -> None:
    conn = connect()

    section("Database overview")
    for table in ("victims", "families", "family_edges"):
        n = conn.execute(f"SELECT COUNT(*) AS c FROM {table}").fetchone()["c"]
        print(f"  {table:<15} {n:>10}")

    section("Family-size distribution")
    rows = conn.execute("""
        SELECT
          CASE
            WHEN member_count = 1 THEN '1 (solo)'
            WHEN member_count BETWEEN 2 AND 5 THEN '2-5'
            WHEN member_count BETWEEN 6 AND 20 THEN '6-20'
            WHEN member_count BETWEEN 21 AND 100 THEN '21-100'
            WHEN member_count BETWEEN 101 AND 500 THEN '101-500'
            ELSE '500+'
          END AS bucket,
          COUNT(*) AS families,
          SUM(member_count) AS total_members
        FROM families
        GROUP BY bucket
        ORDER BY MIN(member_count)
    """).fetchall()
    print(f"  {'bucket':>10}  {'families':>10}  {'members':>10}")
    for r in rows:
        print(f"  {r['bucket']:>10}  {r['families']:>10}  {r['total_members']:>10}")

    section("Top 10 largest families")
    rows = conn.execute("""
        SELECT family_ar, family_en, member_count
        FROM families
        ORDER BY member_count DESC
        LIMIT 10
    """).fetchall()
    for r in rows:
        en = r["family_en"] or ""
        print(f"  {r['family_ar']:<25} {en:<25} {r['member_count']:>5}")

    section("Edge counts by relation")
    rows = conn.execute("""
        SELECT relation, COUNT(*) AS c, ROUND(AVG(confidence), 2) AS avg_conf
        FROM family_edges
        GROUP BY relation
        ORDER BY c DESC
    """).fetchall()
    print(f"  {'relation':<12} {'count':>10}  {'avg conf':>10}")
    for r in rows:
        print(f"  {r['relation']:<12} {r['c']:>10}  {r['avg_conf']:>10}")

    section("Confidence distribution")
    rows = conn.execute("""
        SELECT
          CASE
            WHEN confidence >= 0.9 THEN '0.90+'
            WHEN confidence >= 0.8 THEN '0.80-0.89'
            WHEN confidence >= 0.7 THEN '0.70-0.79'
            WHEN confidence >= 0.6 THEN '0.60-0.69'
            ELSE '< 0.60'
          END AS band,
          COUNT(*) AS c
        FROM family_edges
        GROUP BY band
        ORDER BY MIN(confidence) DESC
    """).fetchall()
    for r in rows:
        print(f"  {r['band']:>12}  {r['c']:>10}")

    section("Edges per victim — distribution")
    rows = conn.execute("""
        WITH e AS (
          SELECT from_victim AS v FROM family_edges
          UNION ALL
          SELECT to_victim FROM family_edges
        ),
        counts AS (
          SELECT v, COUNT(*) AS edge_count FROM e GROUP BY v
        )
        SELECT
          CASE
            WHEN edge_count = 0 THEN '0'
            WHEN edge_count BETWEEN 1 AND 2 THEN '1-2'
            WHEN edge_count BETWEEN 3 AND 5 THEN '3-5'
            WHEN edge_count BETWEEN 6 AND 10 THEN '6-10'
            WHEN edge_count BETWEEN 11 AND 25 THEN '11-25'
            ELSE '25+'
          END AS bucket,
          COUNT(*) AS victims_in_bucket
        FROM counts
        GROUP BY bucket
        ORDER BY MIN(edge_count)
    """).fetchall()
    isolated = conn.execute("""
        SELECT COUNT(*) AS c FROM victims
        WHERE data_index NOT IN (
          SELECT from_victim FROM family_edges
          UNION SELECT to_victim FROM family_edges
        )
    """).fetchone()["c"]
    print(f"  isolated (no edges): {isolated}")
    for r in rows:
        print(f"  {r['bucket']:>10}  {r['victims_in_bucket']:>10}")

    # ---------------------------------------------------------------
    # Sanity-check samples — pick a real victim with many relatives
    # and pretty-print their connections.
    # ---------------------------------------------------------------
    section("Sample: most connected victims (top 5)")
    rows = conn.execute("""
        WITH e AS (
          SELECT from_victim AS v FROM family_edges
          UNION ALL
          SELECT to_victim FROM family_edges
        )
        SELECT v.data_index, v.name_ar, v.name_en, COUNT(*) AS edges
        FROM e
        JOIN victims v ON v.data_index = e.v
        GROUP BY v.data_index
        ORDER BY edges DESC
        LIMIT 5
    """).fetchall()
    for r in rows:
        print(f"  [{r['data_index']:>6}] {r['name_ar']:<35} ({r['name_en']}) — {r['edges']} edges")

    if rows:
        target = rows[0]["data_index"]
        section(f"Full relationship dump for victim {target}")
        v = conn.execute("SELECT * FROM victims WHERE data_index = ?", (target,)).fetchone()
        print(f"  Subject: {v['name_ar']} ({v['name_en']})")
        print(f"  Sex: {v['sex']}, Age: {v['age_years']}, DOB: {v['birth_date']}")
        print()
        rels = conn.execute("""
            SELECT e.relation, e.confidence, e.notes,
                   v.data_index, v.name_ar, v.name_en, v.sex, v.age_years
            FROM family_edges e
            JOIN victims v ON v.data_index = e.to_victim
            WHERE e.from_victim = ?
            ORDER BY e.relation, e.confidence DESC
        """, (target,)).fetchall()
        for r in rels:
            print(f"    [{r['relation']:>8} c={r['confidence']}] "
                  f"{r['name_ar']} ({r['name_en']}) "
                  f"sex={r['sex']} age={r['age_years']}")

    # ---------------------------------------------------------------
    # Verify father edges look like real chains
    # ---------------------------------------------------------------
    section("10 random father → child edges (manually verifiable chains)")
    rows = conn.execute("""
        SELECT p.name_ar AS p_name, c.name_ar AS c_name,
               e.confidence, e.notes
        FROM family_edges e
        JOIN victims p ON p.data_index = e.from_victim
        JOIN victims c ON c.data_index = e.to_victim
        WHERE e.relation = 'father'
        ORDER BY RANDOM()
        LIMIT 10
    """).fetchall()
    for r in rows:
        print(f"  c={r['confidence']} {r['p_name']:<40} → {r['c_name']}")

    section("10 random sibling pairs")
    rows = conn.execute("""
        SELECT a.name_ar AS a_name, b.name_ar AS b_name, e.confidence
        FROM family_edges e
        JOIN victims a ON a.data_index = e.from_victim
        JOIN victims b ON b.data_index = e.to_victim
        WHERE e.relation = 'sibling' AND e.from_victim < e.to_victim
        ORDER BY RANDOM()
        LIMIT 10
    """).fetchall()
    for r in rows:
        print(f"  c={r['confidence']} {r['a_name']:<40} ↔ {r['b_name']}")

    section("10 random uncle → nephew edges")
    rows = conn.execute("""
        SELECT u.name_ar AS u_name, n.name_ar AS n_name, e.confidence
        FROM family_edges e
        JOIN victims u ON u.data_index = e.from_victim
        JOIN victims n ON n.data_index = e.to_victim
        WHERE e.relation = 'uncle'
        ORDER BY RANDOM()
        LIMIT 10
    """).fetchall()
    for r in rows:
        print(f"  c={r['confidence']} {r['u_name']:<40} → {r['n_name']}")

    section("10 random cousin pairs")
    rows = conn.execute("""
        SELECT a.name_ar AS a_name, b.name_ar AS b_name, e.confidence
        FROM family_edges e
        JOIN victims a ON a.data_index = e.from_victim
        JOIN victims b ON b.data_index = e.to_victim
        WHERE e.relation = 'cousin' AND e.from_victim < e.to_victim
        ORDER BY RANDOM()
        LIMIT 10
    """).fetchall()
    for r in rows:
        print(f"  c={r['confidence']} {r['a_name']:<40} ↔ {r['b_name']}")

    conn.close()


if __name__ == "__main__":
    main()
