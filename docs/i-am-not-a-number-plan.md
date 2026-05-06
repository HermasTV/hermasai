# I Am Not a Number — Agentic AI History Reference System

## Context
Build an agentic AI system to create comprehensive historical profiles for 60,199+ Palestinian victims. The project already has a working WebGL particle visualization, Payload CMS with MongoDB Atlas, a `VictimProfiles` collection, and individual profile pages. Each victim currently has only minimal data (name, arabic name, age, DOB, sex). The goal is to enrich profiles with stories, images, family relationships, and sourced references — preserving them as real people, not numbers.

### Core Principles
- **Accuracy over coverage**: These are real people. Never fabricate. Every claim must be sourced.
- **Human-in-the-loop**: AI drafts, humans approve. No published content without review.
- **Dignity over completeness**: A respectful "no story yet" is better than an invented one.
- **Phased, budget-conscious rollout**: Start small, prove the pipeline, scale gradually.

### Key Decisions
- **Database**: Keep MongoDB Atlas + Payload CMS (already in place, scales fine for 60k+)
- **No-data handling**: Show basic data + community contribution CTA
- **Rollout**: Start with 2 featured profiles, then scale in waves
- **LLM flexibility**: Use Claude/OpenAI/Gemini AND cheap alternatives like KIMI via OpenAI-compatible APIs — provider-agnostic design
- **Deep search**: Leverage existing deep-research APIs (OpenAI, Gemini, Perplexity) instead of building one from scratch

---

## User Stories

### As an admin, I want to enrich a single profile from a news URL
I find a news article about a specific victim. I paste the URL into the admin panel, select the victim, and the system fetches the article, extracts relevant details (story, family, circumstances, sources, photos), and pre-fills the profile fields. I review, edit if needed, and approve.

### As an admin, I want to enrich a profile from a manually written report
I have a hand-written report (mine or from a community contributor) about a victim — could be a paragraph, an interview transcript, or a long-form piece. I paste the text, images or even video urls into the admin panel, link it to a victim, and an agent extracts structured data and updates the profile. I review and approve.

### As an admin, I want the system to autonomously research a victim
I select a victim (or a batch) and trigger a research agent. It searches the web (English + Arabic sources), finds relevant articles/memorials, extracts information, and drafts a profile. I review the confidence score and sources, then approve or reject.

### As an admin, I want to bootstrap family relationships from the initial names list
Before any story enrichment, I want to run a one-time script that processes the existing 60k names and clusters them into likely family groups based on shared last names, birth dates, ages, and other patterns in the original dataset. This creates an initial "family graph" skeleton. Later, as stories get enriched, mothers, spouses, and additional relatives get added as new edges/nodes.

### As a visitor, I want to hover on the memorial and see a meaningful glimpse
When I hover over a particle, I see name, age, photo (if available), and a one-line summary of who they were — not just a name. Enriched profiles look subtly distinct from basic ones.

### As a visitor, I want to explore a victim's full story and family
I click a particle, land on a profile page with their story, photos, sources, and an interactive family graph showing connections to other documented relatives. I can navigate from one family member to another.

### As a family member or community contributor, I want to submit a story or correction
I find a profile and notice missing or incorrect information. I fill out a form (name, my relationship, story text, optional photo, optional source URL). My submission goes into a moderation queue for admin review.

### As an admin, I want to control LLM costs and providers
I want the system to support multiple LLM providers — Claude, OpenAI, Gemini, and OpenAI-compatible cheap alternatives like KIMI, DeepSeek, Qwen — so I can route different tasks to different models based on cost and quality. Cheap models for bulk extraction, premium models for sensitive narrative writing.

---

## Pipeline Functionality

### 1. Profile Enrichment Pipeline
The core flow that takes a victim from "basic data only" to "full memorial profile". It accepts input from any of three trigger types and produces a draft profile for human review.

**Inputs (any of):**
- A news article URL (admin-submitted or research-agent-found)
- A manually written report/text (admin or contributor)
- A victim ID alone (triggers autonomous research first)

**Stages:**
1. **Source acquisition** — fetch URL content, accept raw text, OR run research to find sources
2. **Extraction** — LLM reads source(s) and pulls structured data: story details, family mentions, cause of death, location, dates, occupation, neighborhood, photos, quotes
3. **Cross-referencing** — if multiple sources, reconcile facts and flag conflicts
4. **Narrative writing** — synthesize a respectful, factual story (full + one-line summary) in the project's rich-text format
5. **Confidence scoring** — rule-based: more independent sources = higher confidence; conflicts = flagged
6. **Draft creation** — write to database with `reviewStatus: draft` (or `needs-verification`/`ready-for-review` based on score)
7. **Human review** — admin sees the draft, edits, and approves to publish

### 2. Manual Report Ingestion Agent
A focused variant of the enrichment pipeline. The admin pastes free-form text (not a URL) — could be a witness account, a translated memorial, an interview, a personal note. The agent treats this text as an authoritative source, extracts structured data, generates a narrative, and updates the profile. The original text is preserved as a "manual source" with attribution.

### 3. Deep Research Agent
Wraps a deep-research API (OpenAI's deep research, Gemini deep research, Perplexity, or a custom Tavily+LLM chain). Given a victim's name + basic data, it autonomously runs multi-step research: searches multiple queries, follows links, reads articles, cross-references sources, and returns a research report with citations. The report then feeds the extraction stage. We use external deep-research APIs because they're cheaper and better-tuned than building our own multi-step research loop.

### 4. LLM Provider Abstraction
A thin abstraction layer that lets the system call any OpenAI-compatible API:
- **Premium tier** (sensitive writing, final narratives): Claude Sonnet, GPT-4o, Gemini Pro
- **Cheap tier** (bulk extraction, summarization): KIMI, DeepSeek, Qwen, Claude Haiku, GPT-4o-mini
- **Deep research tier**: OpenAI Deep Research, Gemini Deep Research, Perplexity Sonar
- Each task in the pipeline declares which tier it needs; provider can be swapped via config without code changes
- Cost tracking per task type to monitor budget burn

### 5. Family Graph Bootstrap Pipeline
A one-time batch script (run before story enrichment begins) that processes the original 60k names dataset and produces an initial family graph.

**Phase A — Name-based clustering (initial bootstrap):**
- Parse Arabic naming conventions: traditional names follow `given name + father's name + grandfather's name + family/tribe name`
- Group records sharing the same family/tribe name (last token)
- Sub-cluster by paternal chain (matching father's name within a family group)
- Use age + birth date to infer generational relationships (parent/child)
- Use neighborhood (when available) to refine clusters
- Output: initial `relationshipType` edges with `relation: probable-parent | probable-child | probable-sibling` and a confidence score
- All initial edges marked as `unverified` until corroborated by stories or human review

**Phase B — Enrichment from stories (ongoing):**
- As profiles get enriched with stories, the extraction agent identifies named relatives mentioned in articles
- New edges added: mothers (often missing from name-based clustering since Arabic naming is patrilineal), spouses, in-laws, cousins
- Existing probable edges get upgraded to `verified` when corroborated by sources
- Conflicts flagged for human review

**Phase C — Continuous refinement:**
- Community submissions add/correct family relationships
- Admin tools for manual edge editing in Payload CMS

### 6. Community Contribution Pipeline
Public-facing form on each profile page. Submissions go to a moderation queue. Admin reviews each submission, can approve (merges into the profile, optionally triggers re-extraction), reject, or mark as needs-more-info. Submissions support text, photos, source URLs, and corrections.

### 7. Verification & Publishing
Every AI-generated draft requires human approval before publishing. Admin sees confidence score, source list, and a diff against existing profile data. Once approved, profile becomes publicly visible. Verified profiles get a visible badge.

---

## Phased Rollout

### Phase 1: Manual & Report Ingestion (10 featured profiles)
Build the URL-extraction agent and manual-report agent. Build the LLM provider abstraction. Manually select 10 well-documented victims, run them through the pipeline, refine prompts based on results. Goal: prove the extraction quality and the human review workflow.

### Phase 2: Family Graph Bootstrap
Build and run the one-time clustering script on the full 60k dataset. Generate initial family edges. Build a basic family graph visualization on profile pages so the 10 featured profiles can show their connections.

### Phase 3: Deep Research Agent
Integrate a deep research API. Test on a few known victims. Wire it into the pipeline so admins can trigger autonomous research per profile.

### Phase 4: Community Contributions
Build the public submission form and admin moderation queue. Open contributions on the 10 featured profiles first, then expand.

### Phase 5: Batch Processing & Scale
Add async task queue. Process profiles in waves (100 → 500 → 1000 per batch). Refine family edges as stories come in. Monitor cost, accuracy, and pipeline health.

### Phase 6: Continuous Operation
Ongoing waves of enrichment. Community moderation flow. Periodic re-runs of family clustering as new data arrives. Updates from new MoH releases (current count is 73,188+ vs our 60,199 dataset).

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Common Arabic names → wrong-person matches | Combine name + age + DOB + neighborhood. Confidence scoring. Human review always required. |
| LLM hallucination on sensitive content | Strict prompts: "Only state what sources confirm." Verification layer. Never publish without human approval. |
| Cheap LLMs producing lower-quality narratives | Tier system: cheap models for extraction only, premium models for final narrative writing. |
| Family graph false positives (wrong relationships) | All bootstrap edges marked `unverified` with confidence scores. Stories upgrade to `verified`. Easy admin correction tools. |
| Many victims have zero online presence | Show basic data with dignity. "No story yet — contribute" CTA. Don't fabricate. |
| Image sourcing for 60k+ people | Most won't have photos. Keep silhouettes as fallback. Only use real, sourced images. |
| Cost escalation at scale | Provider abstraction lets us route to cheapest viable model per task. Track cost per profile. Phase rollout. |
| Deep research API costs | Only invoke deep research for profiles where cheap extraction yields nothing useful. |

---

## Open Questions / TODOs
- [ ] Which deep-research API to start with (OpenAI Deep Research vs Gemini vs Perplexity vs custom)?
--> openAI. 
- [ ] Which cheap LLM provider for KIMI-tier extraction (KIMI, DeepSeek, Qwen, Moonshot)?
-->  ignore that for now, lets use openai api for now as its the only one I've credit for ATM.
- [ ] Which 2 victims to feature in Phase 1?
--> not relivant, as it should be done by the current tools, for example, I will privide a report manually for 1, and ask for deep reasearch for another one by providing current database details. 
- [ ] Family graph: minimum confidence threshold to display an edge publicly?
--> Family sharing 2 
- [ ] Should community contributions require email verification?
--> Yes
- [ ] How to handle the gap between our 60,199 dataset and current 73,188+ count?
--> report that there are 73k+ people, add the option to add names manually as admin or visitor (admin verify)
- [ ] Image sourcing/rights framework — what's permissible?
--> All images are permissible even graphic images as its a real refference.
- [ ] Manual report ingestion: support multiple languages (Arabic input, English output)?
- Yes.