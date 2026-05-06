"""Streamlit dev tool for exploring the local family graph database.

Run from the agents/ directory:
    workon gaza
    streamlit run explorer/app.py

Pages:
  1. Overview        — top-level stats and distributions
  2. Family browser  — pick a family, see members + interactive network
  3. Victim search   — search by name, see a victim's relationship tree
  4. Edge inspector  — browse and filter edges by relation/confidence
"""

import json
import sqlite3
from pathlib import Path
from typing import List, Optional

import pandas as pd
import streamlit as st
from pyvis.network import Network

# ---------------------------------------------------------------------------
# Locate the local SQLite DB built by the family_graph pipeline.
# ---------------------------------------------------------------------------
DB_PATH = Path(__file__).parent.parent / "family_graph" / "local.db"


@st.cache_resource
def get_conn() -> sqlite3.Connection:
    """Open a single shared connection (Streamlit reuses across reruns)."""
    if not DB_PATH.exists():
        st.error(
            f"Database not found at {DB_PATH}.\n\n"
            "Run the pipeline first:\n"
            "  python -m family_graph.init_db\n"
            "  python -m family_graph.import_names\n"
            "  python -m family_graph.cluster_families"
        )
        st.stop()
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------------------------------------------------------
# Color palette for relation types — used in the network graph and the
# edge-inspector legend so the same color always means the same relation.
# ---------------------------------------------------------------------------
RELATION_COLORS = {
    "father":      "#e74c3c",
    "mother":      "#e74c3c",
    "child":       "#3498db",
    "sibling":     "#2ecc71",
    "spouse":      "#9b59b6",
    "uncle":       "#f39c12",
    "aunt":        "#f39c12",
    "nephew":      "#16a085",
    "niece":       "#16a085",
    "cousin":      "#1abc9c",
    "grandfather": "#c0392b",
    "grandmother": "#c0392b",
    "grandchild":  "#2980b9",
    "other":       "#95a5a6",
}


# ---------------------------------------------------------------------------
# Pyvis helper: build an interactive HTML network graph from a list of
# (subject_id, edge_rows). Returns the rendered HTML string.
# ---------------------------------------------------------------------------

def render_network(
    nodes: List[dict],
    edges: List[dict],
    height: str = "650px",
    highlight_id: Optional[int] = None,
) -> str:
    """Build a pyvis network and return its HTML.

    `nodes` is a list of victim dicts (must have data_index, name_ar, name_en, sex).
    `edges` is a list of edge dicts (from_victim, to_victim, relation, confidence).
    `highlight_id` is optionally rendered larger and in a distinct color.
    """
    net = Network(
        height=height, width="100%",
        bgcolor="#0e1117", font_color="white",
        directed=True, notebook=False, cdn_resources="in_line",
    )
    net.barnes_hut(gravity=-2000, spring_length=120)

    added = set()
    for v in nodes:
        vid = v["data_index"]
        if vid in added:
            continue
        added.add(vid)

        is_focus = (vid == highlight_id)
        sex_emoji = "♂" if v.get("sex") == "m" else ("♀" if v.get("sex") == "f" else "•")
        label = f"{sex_emoji} {v.get('name_en') or v.get('name_ar') or vid}"
        title = (
            f"<b>{v.get('name_ar', '')}</b><br>"
            f"{v.get('name_en', '')}<br>"
            f"sex: {v.get('sex', '?')}<br>"
            f"age: {v.get('age_years', '?')}<br>"
            f"id: {vid}"
        )
        net.add_node(
            vid,
            label=label,
            title=title,
            color="#ffd700" if is_focus else ("#5dade2" if v.get("sex") == "m" else "#f1948a"),
            size=28 if is_focus else 14,
            borderWidth=3 if is_focus else 1,
        )

    # De-dupe edges so symmetric pairs only render once visually
    seen = set()
    for e in edges:
        a, b, rel = e["from_victim"], e["to_victim"], e["relation"]
        # Symmetric relations: only draw one direction
        if rel in {"sibling", "spouse", "cousin"}:
            key = (min(a, b), max(a, b), rel)
        else:
            key = (a, b, rel)
        if key in seen:
            continue
        seen.add(key)

        if a not in added or b not in added:
            continue  # node not in subgraph

        net.add_edge(
            a, b,
            label=rel,
            title=f"{rel} (confidence={e['confidence']})",
            color=RELATION_COLORS.get(rel, "#aaaaaa"),
            arrows="to" if rel not in {"sibling", "spouse", "cousin"} else "",
            width=1 + 2 * float(e["confidence"]),
        )

    return net.generate_html(notebook=False)


# ---------------------------------------------------------------------------
# Hierarchical clan-tree rendering.
#
# A clan tree has 4 levels derived from the Arabic ancestor tokens:
#
#   Level 0  ROOT       clan name (e.g. "النجار")
#   Level 1  GRANDFATHER each unique grandfather name within the clan
#   Level 2  FATHER     each unique father under each grandfather
#                       (= one nuclear family of siblings)
#   Level 3  PERSON     individual victims (leaves)
#
# Intermediate node IDs are constructed from the path so that two unrelated
# "Mahmouds" in different branches don't collide.
# ---------------------------------------------------------------------------

def render_clan_tree(
    clan_ar: str,
    members: List[dict],
    height: str = "750px",
) -> str:
    """Render a clan as a top-down hierarchical tree.

    `members` is a list of victim dicts with keys: data_index, name_ar,
    name_en, sex, age_years, given_ar, father_ar, grandfather_ar.
    """
    net = Network(
        height=height, width="100%",
        bgcolor="#0e1117", font_color="white",
        directed=True, notebook=False, cdn_resources="in_line",
    )
    # Hierarchical layout, top-down. `directed` sort uses our edge directions
    # to lay out generations in the right order.
    net.set_options("""
    {
      "layout": {
        "hierarchical": {
          "enabled": true,
          "direction": "UD",
          "sortMethod": "directed",
          "levelSeparation": 130,
          "nodeSpacing": 110,
          "treeSpacing": 180
        }
      },
      "physics": {
        "enabled": false
      },
      "interaction": {
        "dragNodes": true,
        "hover": true,
        "navigationButtons": true,
        "keyboard": true
      },
      "edges": {
        "smooth": {"type": "cubicBezier", "forceDirection": "vertical", "roundness": 0.4}
      }
    }
    """)

    # Root clan node
    root_id = f"clan::{clan_ar}"
    net.add_node(
        root_id,
        label=clan_ar,
        title=f"<b>Clan:</b> {clan_ar}<br>Members: {len(members)}",
        color="#ffd700",
        shape="box",
        size=40,
        level=0,
        font={"size": 22, "color": "#000000", "bold": True},
    )

    # Group members by grandfather, then by father
    # Missing tokens get a placeholder so the tree is still well-formed.
    by_gf: Dict[str, Dict[str, List[dict]]] = {}
    for m in members:
        gf = m.get("grandfather_ar") or "(unknown)"
        fa = m.get("father_ar") or "(unknown)"
        by_gf.setdefault(gf, {}).setdefault(fa, []).append(m)

    # Sort branches by size (biggest grandfather subtrees first)
    sorted_gfs = sorted(by_gf.items(), key=lambda kv: -sum(len(v) for v in kv[1].values()))

    for gf_name, fathers in sorted_gfs:
        gf_node = f"gf::{clan_ar}::{gf_name}"
        gf_total = sum(len(v) for v in fathers.values())
        net.add_node(
            gf_node,
            label=gf_name,
            title=f"<b>Grandfather:</b> {gf_name}<br>Descendants in dataset: {gf_total}",
            color="#e67e22",
            shape="ellipse",
            level=1,
            font={"size": 16, "color": "#ffffff"},
        )
        net.add_edge(root_id, gf_node, color="#666", arrows="")

        # Sort fathers by sibling count
        sorted_fathers = sorted(fathers.items(), key=lambda kv: -len(kv[1]))
        for fa_name, kids in sorted_fathers:
            fa_node = f"fa::{clan_ar}::{gf_name}::{fa_name}"
            net.add_node(
                fa_node,
                label=fa_name,
                title=f"<b>Father:</b> {fa_name}<br>Children: {len(kids)}",
                color="#3498db",
                shape="ellipse",
                level=2,
                font={"size": 14, "color": "#ffffff"},
            )
            net.add_edge(gf_node, fa_node, color="#666", arrows="")

            # Sort siblings by age (oldest first), missing age last
            sorted_kids = sorted(
                kids,
                key=lambda k: (k.get("age_years") is None, -(k.get("age_years") or 0)),
            )
            for kid in sorted_kids:
                kid_id = f"p::{kid['data_index']}"
                sex_emoji = "♂" if kid.get("sex") == "m" else ("♀" if kid.get("sex") == "f" else "•")
                age = kid.get("age_years")
                age_str = f" ({age:.0f}y)" if age is not None else ""
                given = kid.get("given_ar") or kid.get("name_ar", "")
                label = f"{sex_emoji} {given}{age_str}"
                net.add_node(
                    kid_id,
                    label=label,
                    title=(
                        f"<b>{kid.get('name_ar', '')}</b><br>"
                        f"{kid.get('name_en', '')}<br>"
                        f"sex: {kid.get('sex', '?')}<br>"
                        f"age: {age if age is not None else '?'}<br>"
                        f"id: {kid['data_index']}"
                    ),
                    color="#5dade2" if kid.get("sex") == "m" else "#f1948a",
                    shape="dot",
                    size=14,
                    level=3,
                    font={"size": 12, "color": "#ffffff"},
                )
                net.add_edge(fa_node, kid_id, color="#888", arrows="")

    return net.generate_html(notebook=False)


# ===========================================================================
# PAGES
# ===========================================================================

def page_overview() -> None:
    st.header("Database overview")

    conn = get_conn()

    col1, col2, col3 = st.columns(3)
    n_victims = conn.execute("SELECT COUNT(*) AS c FROM victims").fetchone()["c"]
    n_families = conn.execute("SELECT COUNT(*) AS c FROM families").fetchone()["c"]
    n_edges = conn.execute("SELECT COUNT(*) AS c FROM family_edges").fetchone()["c"]
    col1.metric("Victims", f"{n_victims:,}")
    col2.metric("Families", f"{n_families:,}")
    col3.metric("Relationship edges", f"{n_edges:,}")

    isolated = conn.execute("""
        SELECT COUNT(*) AS c FROM victims
        WHERE data_index NOT IN (
          SELECT from_victim FROM family_edges
          UNION SELECT to_victim FROM family_edges
        )
    """).fetchone()["c"]
    pct_connected = 100 * (n_victims - isolated) / n_victims if n_victims else 0
    col1.metric("Connected victims", f"{n_victims - isolated:,}", f"{pct_connected:.1f}%")
    col2.metric("Isolated victims", f"{isolated:,}", f"{100 - pct_connected:.1f}%")

    st.divider()
    n_clans = conn.execute("SELECT COUNT(*) AS c FROM clans").fetchone()["c"]
    n_nuclear = conn.execute("SELECT COUNT(*) AS c FROM families").fetchone()["c"]
    col1, col2 = st.columns(2)
    col1.metric("Clans (broad name groups)", f"{n_clans:,}")
    col2.metric("Nuclear families (strict 3-name)", f"{n_nuclear:,}")

    st.subheader("Clan-size distribution")
    st.caption("How many victims share the same clan name.")
    df = pd.read_sql_query("""
        SELECT
          CASE
            WHEN member_count = 1 THEN '1 (solo)'
            WHEN member_count BETWEEN 2 AND 5 THEN '2-5'
            WHEN member_count BETWEEN 6 AND 20 THEN '6-20'
            WHEN member_count BETWEEN 21 AND 100 THEN '21-100'
            WHEN member_count BETWEEN 101 AND 500 THEN '101-500'
            ELSE '500+'
          END AS bucket,
          COUNT(*) AS clans,
          SUM(member_count) AS total_members,
          MIN(member_count) AS sort_key
        FROM clans
        GROUP BY bucket
        ORDER BY sort_key
    """, conn)
    df = df.drop(columns=["sort_key"])
    st.dataframe(df, use_container_width=True, hide_index=True)

    st.subheader("Nuclear-family-size distribution")
    st.caption("How many full siblings (sharing father + grandfather + clan) are in the same family.")
    df_nf = pd.read_sql_query("""
        SELECT
          CASE
            WHEN member_count BETWEEN 2 AND 3 THEN '2-3'
            WHEN member_count BETWEEN 4 AND 6 THEN '4-6'
            WHEN member_count BETWEEN 7 AND 10 THEN '7-10'
            WHEN member_count BETWEEN 11 AND 20 THEN '11-20'
            ELSE '20+'
          END AS bucket,
          COUNT(*) AS families,
          SUM(member_count) AS total_members,
          MIN(member_count) AS sort_key
        FROM families
        GROUP BY bucket
        ORDER BY sort_key
    """, conn)
    df_nf = df_nf.drop(columns=["sort_key"])
    st.dataframe(df_nf, use_container_width=True, hide_index=True)

    st.subheader("Top 20 largest clans (broad family-name groups)")
    df_top_clans = pd.read_sql_query("""
        SELECT family_ar, family_en, member_count, nuclear_family_count
        FROM clans
        ORDER BY member_count DESC
        LIMIT 20
    """, conn)
    st.dataframe(df_top_clans, use_container_width=True, hide_index=True)
    st.bar_chart(df_top_clans.set_index("family_en")["member_count"])

    st.subheader("Top 20 largest nuclear families (strict 3-name match)")
    st.caption("Each row is a group of full siblings sharing father + grandfather + clan.")
    df_top_fams = pd.read_sql_query("""
        SELECT display_name_ar, family_en, member_count
        FROM families
        ORDER BY member_count DESC
        LIMIT 20
    """, conn)
    st.dataframe(df_top_fams, use_container_width=True, hide_index=True)

    st.subheader("Edges by relation type")
    df_rel = pd.read_sql_query("""
        SELECT relation, COUNT(*) AS count, ROUND(AVG(confidence), 3) AS avg_confidence
        FROM family_edges
        GROUP BY relation
        ORDER BY count DESC
    """, conn)
    st.dataframe(df_rel, use_container_width=True, hide_index=True)
    st.bar_chart(df_rel.set_index("relation")["count"])

    st.subheader("Confidence distribution")
    df_conf = pd.read_sql_query("""
        SELECT
          CASE
            WHEN confidence >= 0.9 THEN '0.90+'
            WHEN confidence >= 0.8 THEN '0.80-0.89'
            WHEN confidence >= 0.7 THEN '0.70-0.79'
            WHEN confidence >= 0.6 THEN '0.60-0.69'
            ELSE '< 0.60'
          END AS band,
          COUNT(*) AS edges,
          MIN(confidence) AS sort_key
        FROM family_edges
        GROUP BY band
        ORDER BY sort_key DESC
    """, conn)
    df_conf = df_conf.drop(columns=["sort_key"])
    st.dataframe(df_conf, use_container_width=True, hide_index=True)


def page_family_browser() -> None:
    st.header("Family browser")
    st.caption(
        "Pick a clan, see its hierarchical name tree (clan → grandfather → father → individual), "
        "the nuclear families inside it, and the relationship network."
    )

    conn = get_conn()

    # ----------------------------------------------------------------
    # Clan picker
    # ----------------------------------------------------------------
    clans_df = pd.read_sql_query("""
        SELECT id, family_ar, family_en, member_count, nuclear_family_count
        FROM clans
        ORDER BY member_count DESC
    """, conn)

    search = st.text_input(
        "Filter clan name (Arabic or English contains)",
        placeholder="e.g. Najjar, ابو نصر",
    ).strip()
    if search:
        mask = (
            clans_df["family_ar"].str.contains(search, case=False, na=False)
            | clans_df["family_en"].fillna("").str.contains(search, case=False, na=False)
        )
        clans_df = clans_df[mask]

    if clans_df.empty:
        st.warning("No clans match that filter.")
        return

    clans_df["label"] = clans_df.apply(
        lambda r: (
            f"{r['family_ar']}  ({r['family_en'] or '?'})  — "
            f"{r['member_count']} members, {r['nuclear_family_count']} nuclear families"
        ),
        axis=1,
    )
    selected_label = st.selectbox("Clan", options=clans_df["label"].tolist(), index=0)
    selected_row = clans_df[clans_df["label"] == selected_label].iloc[0]
    clan_id = int(selected_row["id"])
    clan_ar = selected_row["family_ar"]
    clan_member_count = int(selected_row["member_count"])
    clan_nf_count = int(selected_row["nuclear_family_count"])

    col1, col2, col3 = st.columns(3)
    col1.metric("Clan name", clan_ar)
    col2.metric("Members in dataset", f"{clan_member_count:,}")
    col3.metric("Nuclear families inside", f"{clan_nf_count:,}")

    # ----------------------------------------------------------------
    # Load all members of the clan once -- used by every section below.
    # ----------------------------------------------------------------
    members_df = pd.read_sql_query("""
        SELECT data_index, name_ar, name_en, sex, age_years, birth_date,
               given_ar, father_ar, grandfather_ar, family_id
        FROM victims
        WHERE clan_id = ?
        ORDER BY grandfather_ar, father_ar, given_ar
    """, conn, params=(clan_id,))

    # ----------------------------------------------------------------
    # Tabs: Tree | Nuclear families | All members | Network
    # ----------------------------------------------------------------
    tab_tree, tab_nf, tab_members, tab_network = st.tabs([
        "🌳 Family name tree",
        f"👨‍👩‍👧‍👦 Nuclear families ({clan_nf_count})",
        f"📋 All members ({len(members_df)})",
        "🕸️ Relationship network",
    ])

    # ---- Family name tree ----
    with tab_tree:
        st.caption(
            "Hierarchical view: **clan → grandfather → father → individuals**. "
            "Each grandfather node groups branches that share the same paternal "
            "line. Each father node corresponds to a nuclear sibling group. "
            "Names at intermediate levels are inferred from the ancestor tokens "
            "in the dataset and may not themselves be in the database."
        )
        if len(members_df) > 250:
            st.warning(
                f"This clan has {len(members_df)} members — the full tree may be "
                "dense. The hierarchical layout still renders, but consider "
                "drilling into a single nuclear family for clarity."
            )
        members = members_df.to_dict("records")
        html = render_clan_tree(clan_ar, members, height="780px")
        st.components.v1.html(html, height=800, scrolling=False)

    # ---- Nuclear families ----
    with tab_nf:
        st.caption(
            "Each row is a group of 2+ victims sharing father, grandfather, "
            "AND clan name — i.e. full siblings."
        )
        nf_df = pd.read_sql_query("""
            SELECT id, display_name_ar, father_ar, grandfather_ar, member_count
            FROM families
            WHERE clan_id = ?
            ORDER BY member_count DESC, father_ar
        """, conn, params=(clan_id,))

        if nf_df.empty:
            st.info("No nuclear families in this clan (no sibling groups detected).")
        else:
            st.dataframe(
                nf_df[["display_name_ar", "father_ar", "grandfather_ar", "member_count"]],
                use_container_width=True,
                hide_index=True,
            )

            # Drill-in: pick one nuclear family and see its dedicated network
            nf_df["label"] = nf_df.apply(
                lambda r: f"{r['display_name_ar']} — {r['member_count']} siblings",
                axis=1,
            )
            chosen = st.selectbox(
                "Drill into a nuclear family",
                options=[""] + nf_df["label"].tolist(),
            )
            if chosen:
                nf_row = nf_df[nf_df["label"] == chosen].iloc[0]
                nf_id = int(nf_row["id"])
                sibling_df = pd.read_sql_query("""
                    SELECT data_index, name_ar, name_en, sex, age_years, birth_date
                    FROM victims
                    WHERE family_id = ?
                    ORDER BY age_years DESC
                """, conn, params=(nf_id,))
                st.write(f"**{len(sibling_df)} siblings**")
                st.dataframe(sibling_df, use_container_width=True, hide_index=True)

    # ---- All members ----
    with tab_members:
        st.dataframe(
            members_df[["data_index", "name_ar", "name_en", "sex", "age_years",
                        "birth_date", "given_ar", "father_ar", "grandfather_ar"]],
            use_container_width=True,
            hide_index=True,
        )

    # ---- Relationship network ----
    with tab_network:
        st.caption(
            "Interactive force-directed graph of all confirmed relationship edges "
            "(siblings, parents, uncles, cousins) within this clan. Edges only "
            "exist where ALL 3 ancestor names match — false positives from "
            "shared clan-name alone are excluded."
        )
        member_ids = tuple(int(x) for x in members_df["data_index"].tolist())
        if len(member_ids) < 2:
            st.warning("Clan has fewer than 2 members — no graph to render.")
            return

        placeholder = ",".join("?" * len(member_ids))
        edges_df = pd.read_sql_query(
            f"""
            SELECT from_victim, to_victim, relation, confidence, notes
            FROM family_edges
            WHERE from_victim IN ({placeholder})
              AND to_victim   IN ({placeholder})
            """,
            conn,
            params=member_ids + member_ids,
        )

        if edges_df.empty:
            st.warning("No internal edges between clan members. Most likely none of the members share a 3-name ancestor chain.")
            return

        st.write(f"**{len(edges_df)}** directed edges")
        min_conf = st.slider("Min confidence", 0.0, 1.0, 0.6, 0.05, key="fb_conf")
        edges_df = edges_df[edges_df["confidence"] >= min_conf]

        if len(members_df) > 200:
            st.warning(
                f"This clan has {len(members_df)} members — rendering may be slow."
            )

        nodes = members_df.to_dict("records")
        edges = edges_df.to_dict("records")
        html = render_network(nodes, edges, height="700px")
        st.components.v1.html(html, height=720, scrolling=False)


def page_victim_search() -> None:
    st.header("Victim search")
    st.caption("Search by Arabic or English name, then drill into a person's relationship tree.")

    conn = get_conn()
    query = st.text_input(
        "Search by name",
        placeholder="e.g. Ahmed, فتحي, Abu Nasr",
    ).strip()

    if not query:
        st.info("Type a name above to begin.")
        return

    like = f"%{query}%"
    results_df = pd.read_sql_query("""
        SELECT data_index, name_ar, name_en, sex, age_years, birth_date,
               family_ar, family_en
        FROM victims
        WHERE name_ar LIKE ? OR name_en LIKE ?
        ORDER BY name_en
        LIMIT 200
    """, conn, params=(like, like))

    if results_df.empty:
        st.warning("No matches.")
        return

    st.write(f"**{len(results_df)} match(es)** (showing up to 200)")
    st.dataframe(results_df, use_container_width=True, hide_index=True)

    # Pick one to drill into
    results_df["label"] = results_df.apply(
        lambda r: f"[{r['data_index']}] {r['name_ar']} ({r['name_en']})", axis=1
    )
    chosen_label = st.selectbox(
        "Drill into a victim",
        options=results_df["label"].tolist(),
    )
    if not chosen_label:
        return
    target_id = int(results_df[results_df["label"] == chosen_label].iloc[0]["data_index"])

    # Subject details
    subject = conn.execute("""
        SELECT * FROM victims WHERE data_index = ?
    """, (target_id,)).fetchone()
    if subject is None:
        st.error("Victim not found")
        return

    st.divider()
    st.subheader(f"{subject['name_ar']}  ({subject['name_en']})")
    cols = st.columns(4)
    cols[0].metric("Sex", subject["sex"] or "?")
    cols[1].metric("Age", f"{subject['age_years']:.1f}" if subject["age_years"] is not None else "?")
    cols[2].metric("DOB", subject["birth_date"] or "?")
    cols[3].metric("Family", subject["family_ar"] or "?")

    # All edges TO/FROM this victim
    edges_df = pd.read_sql_query("""
        SELECT e.from_victim, e.to_victim, e.relation, e.confidence, e.notes,
               v_to.name_ar AS to_name_ar, v_to.name_en AS to_name_en, v_to.sex AS to_sex,
               v_to.age_years AS to_age
        FROM family_edges e
        JOIN victims v_to ON v_to.data_index = e.to_victim
        WHERE e.from_victim = ?
        ORDER BY e.relation, e.confidence DESC
    """, conn, params=(target_id,))
    st.write(f"**{len(edges_df)} relationship edges**")

    if edges_df.empty:
        st.warning("This victim has no relatives in the database. They may be isolated, or the chain match failed.")
        return

    # Display table grouped by relation
    display_df = edges_df[["relation", "to_name_ar", "to_name_en", "to_sex", "to_age", "confidence", "notes"]]
    display_df.columns = ["Relation", "Name (AR)", "Name (EN)", "Sex", "Age", "Confidence", "Notes"]
    st.dataframe(display_df, use_container_width=True, hide_index=True)

    # Build a small subgraph: target + all 1-hop neighbors
    neighbor_ids = set(int(x) for x in edges_df["to_victim"].tolist())
    neighbor_ids.add(target_id)

    placeholder = ",".join("?" * len(neighbor_ids))
    nodes_df = pd.read_sql_query(
        f"SELECT data_index, name_ar, name_en, sex, age_years FROM victims WHERE data_index IN ({placeholder})",
        conn,
        params=tuple(neighbor_ids),
    )
    sub_edges_df = pd.read_sql_query(
        f"""
        SELECT from_victim, to_victim, relation, confidence
        FROM family_edges
        WHERE from_victim IN ({placeholder}) AND to_victim IN ({placeholder})
        """,
        conn,
        params=tuple(neighbor_ids) + tuple(neighbor_ids),
    )

    st.subheader("Relationship network (1 hop)")
    html = render_network(
        nodes_df.to_dict("records"),
        sub_edges_df.to_dict("records"),
        height="600px",
        highlight_id=target_id,
    )
    st.components.v1.html(html, height=620, scrolling=False)


def page_edge_inspector() -> None:
    st.header("Edge inspector")
    st.caption("Filter and spot-check edges to find false positives.")

    conn = get_conn()

    relations = [r["relation"] for r in conn.execute(
        "SELECT DISTINCT relation FROM family_edges ORDER BY relation"
    ).fetchall()]

    col1, col2, col3 = st.columns(3)
    selected_relations = col1.multiselect("Relations", options=relations, default=relations)
    min_conf = col2.slider("Min confidence", 0.0, 1.0, 0.0, 0.05)
    max_conf = col3.slider("Max confidence", 0.0, 1.0, 1.0, 0.05)

    sample_size = st.select_slider(
        "Sample size",
        options=[20, 50, 100, 200, 500, 1000],
        value=100,
    )
    randomize = st.checkbox("Randomize order (good for spot-checking)", value=True)

    if not selected_relations:
        st.warning("Select at least one relation type.")
        return

    placeholder = ",".join("?" * len(selected_relations))
    order_clause = "ORDER BY RANDOM()" if randomize else "ORDER BY e.id"
    query = f"""
        SELECT e.id, e.relation, e.confidence, e.notes,
               f.name_ar AS from_name_ar, f.name_en AS from_name_en, f.sex AS from_sex,
               f.age_years AS from_age,
               t.name_ar AS to_name_ar, t.name_en AS to_name_en, t.sex AS to_sex,
               t.age_years AS to_age
        FROM family_edges e
        JOIN victims f ON f.data_index = e.from_victim
        JOIN victims t ON t.data_index = e.to_victim
        WHERE e.relation IN ({placeholder})
          AND e.confidence BETWEEN ? AND ?
        {order_clause}
        LIMIT ?
    """
    params = tuple(selected_relations) + (min_conf, max_conf, sample_size)
    df = pd.read_sql_query(query, conn, params=params)
    st.write(f"**{len(df)} edges** (filter matched)")
    st.dataframe(df, use_container_width=True, hide_index=True)

    # Color legend for relation types
    st.subheader("Relation color legend")
    legend_html = "<div style='display:flex;flex-wrap:wrap;gap:8px;'>"
    for rel in relations:
        color = RELATION_COLORS.get(rel, "#aaaaaa")
        legend_html += (
            f"<div style='padding:4px 10px;border-radius:4px;background:{color};color:white;'>"
            f"{rel}</div>"
        )
    legend_html += "</div>"
    st.markdown(legend_html, unsafe_allow_html=True)


# ===========================================================================
# Main
# ===========================================================================

def main() -> None:
    st.set_page_config(
        page_title="Family Graph Explorer",
        page_icon="🕊️",
        layout="wide",
    )
    st.title("Family Graph Explorer")
    st.caption(
        "Local development tool for the I-Am-Not-A-Number agent pipeline. "
        f"Database: `{DB_PATH}`"
    )

    page = st.sidebar.radio(
        "Page",
        options=[
            "Overview",
            "Family browser",
            "Victim search",
            "Edge inspector",
        ],
    )

    if page == "Overview":
        page_overview()
    elif page == "Family browser":
        page_family_browser()
    elif page == "Victim search":
        page_victim_search()
    elif page == "Edge inspector":
        page_edge_inspector()


if __name__ == "__main__":
    main()
