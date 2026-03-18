# Bioinformatics Hiring Trend Index

This folder contains the static site for the live bioinformatics jobs dashboard published at GitHub Pages. The page reads the generated files in `output/` and renders:

- the current skill trend index
- weekly history from `bioinformatics-trend-history.csv`
- role-family and work-mode mix
- a filterable live jobs board

## Data files
- `output/bioinformatics-jobs-board.csv`: current live-role snapshot
- `output/bioinformatics-jobs-board.md`: markdown board export
- `output/bioinformatics-skill-trends.md`: narrative summary
- `output/bioinformatics-trend-history.csv`: weekly history for the dashboard chart
- `output/bioinformatics-tracked-sources.json`: tracked source catalog and LinkedIn coverage status

## CI refresh
Two workflows are included:

- `.github/workflows/deploy-pages.yml`: deploys the site on normal pushes to `main`
- `.github/workflows/refresh-data.yml`: runs every Monday at 14:00 UTC and can also be triggered manually

The scheduled refresh workflow runs `automation/refresh_jobs.py`, updates `output/`, commits the refreshed files back to `main`, and deploys Pages from the same workflow run.

## Source coverage
The CI refresh currently uses these automated source groups:

- Greenhouse API: Neptune Bio, NewLimit, Recursion, Hexagon Bio, Profluent, Natera, Personalis, and LatchBio
- Lever API: GATC Health
- Direct official careers pages: Dana-Farber Cancer Institute

Those sources are published to `output/bioinformatics-tracked-sources.json` and rendered on the dashboard. The active automated list and the next-source backlog now live in `automation/source_registry.json`, so you can expand approved coverage without editing Python constants directly.

LinkedIn is not part of the CI ingestion path. The project intentionally tracks official ATS feeds and official company career pages instead. If you need LinkedIn-specific ingestion, that should be done through approved LinkedIn partner access rather than scraping.

## Current improvement backlog
- Expand the approved-source footprint by promoting vetted companies from `automation/source_registry.json` into the active automated list.
- Prefer ATS feeds that expose posted or updated timestamps so the board can enforce a last-year window when the source supports it.
- Use the source manifest to monitor per-source refresh health and quickly spot coverage regressions before they affect the dashboard.

## View on GitHub Pages
If GitHub Pages is enabled for the repository and the Pages deploy workflow has run on `main`, the site should be available at:

- `https://spicychicken6.github.io/bioinformatics_jobskill_index/`

The repository already includes a Pages deployment workflow in `.github/workflows/deploy-pages.yml`, so publishing is driven by pushes to `main`.

## Local preview
Serve the folder over HTTP so the browser can fetch the CSV files:

```bash
cd /workspace/bioinformatics_jobskill_index
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.
