# Bioinformatics Hiring Trend Index

This folder now contains a static dashboard for the bioinformatics hiring snapshot. The page reads the CSV outputs in `output/` and renders:

- the current skill trend index
- longitudinal history from `bioinformatics-trend-history.csv`
- role-family and work-mode mix
- a filterable live jobs board

## Data files
- `output/bioinformatics-jobs-board.csv`: current live-role snapshot
- `output/bioinformatics-skill-trends.md`: written narrative summary
- `output/bioinformatics-trend-history.csv`: weekly baseline and follow-on history
- `automation/weekly-refresh-playbook.md`: source-of-truth rules for the weekly refresh automation

## Local preview
Serve the folder over HTTP so the browser can fetch the CSV files:

```powershell
cd E:\workdir\bioinformatics-board
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

If Python is not installed locally, use any static file server or rely on GitHub Pages.

## Weekly refresh model
The frontend does not hardcode job data. Weekly refreshes only need to update the files in `output/`; the dashboard will pick up the new trend index and history automatically.
