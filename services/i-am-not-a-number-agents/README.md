# I Am Not a Number — Agents

Standalone Python module for the agentic AI pipeline that enriches victim profiles with stories, family relationships, and sourced references.

This service is **independent** of the main Next.js app and Payload CMS. It uses a local SQLite database during development. Data will be migrated to the production MongoDB later.

## Modules

### `family_graph/`
Bootstraps a family relationship graph from the original 60k+ names dataset by clustering on shared family names and inferring father/child/sibling/uncle/cousin relationships from Arabic naming patterns.

**Pipeline:**
1. `init_db.py` — initialize the local SQLite schema
2. `import_names.py` — load `data.json` (60,199 victims) into SQLite
3. `cluster_families.py` — run the clustering algorithm and write family edges
4. `stats.py` — print summary statistics

## Setup

This service uses a virtualenvwrapper environment named `gaza`.

```bash
mkvirtualenv gaza        # one-time
workon gaza
cd services/i-am-not-a-number-agents
pip install -r requirements.txt
```

## Running the family graph pipeline

```bash
workon gaza
python -m family_graph.init_db
python -m family_graph.import_names
python -m family_graph.cluster_families
python -m family_graph.stats
```

The local database is written to `family_graph/local.db` (gitignored).

## Running the explorer (Streamlit dev tool)

```bash
workon gaza
cd services/i-am-not-a-number-agents
streamlit run explorer/app.py
```

Pages:
- **Overview** — totals, family-size distribution, top families, edges by relation, confidence bands
- **Family browser** — pick a family, see members + interactive network graph with confidence filter
- **Victim search** — search by Arabic or English name, drill into a person and see their 1-hop relationship tree
- **Edge inspector** — filter edges by relation/confidence, randomized sampling for spot-checking false positives
