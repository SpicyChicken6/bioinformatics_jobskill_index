# Weekly Refresh Playbook

## Goal
Refresh the bioinformatics jobs board once per week and keep a simple longitudinal trend history.

## Scope
- Use official company career pages or official hosted job-board APIs only.
- Track live roles whose titles match one of these families:
  - Computational Biologist
  - Bioinformatics Scientist
  - Bioinformatics Engineer
  - Bioinformatics Analyst
- Keep the board focused on bioinformatics and computational biology. Exclude generic data science roles unless the posting is explicitly biology-facing.

## Outputs to update
- `output/bioinformatics-jobs-board.csv`
- `output/bioinformatics-jobs-board.md`
- `output/bioinformatics-skill-trends.md`
- `output/bioinformatics-trend-history.csv`
- `output/bioinformatics-tracked-sources.json`

## Workflow
1. Review `automation/source_registry.json` and confirm the active sources plus backlog are still accurate.
2. Pull jobs from the tracked public Greenhouse and Lever sources.
3. Pull the small direct official-page fallback set.
4. Record source-level collection status so the dashboard can show refresh health and coverage gaps.
5. Remove closed roles that no longer appear.
6. Normalize each role into:
   - company
   - title
   - role family
   - focus area
   - location
   - work mode
   - 2 to 3 responsibilities
   - 2 to 3 requirements
   - normalized skill tags
   - source URL
7. Recompute the trend summary and append or replace the current snapshot-date row in the history file.
8. Commit the refreshed `output/` files from CI and deploy Pages.

## Current schedule
The GitHub Actions workflow runs every Monday at 14:00 UTC. That is 9:00 AM during daylight saving time in America/Chicago and 8:00 AM during standard time.

## Notes
- The refresh date is the retrieval date, not the posting date.
- Non-API boards may require occasional source maintenance if their HTML structure changes.
- If all live fetches fail, the refresh script now falls back to the existing jobs CSV instead of overwriting the site with an empty dataset.
