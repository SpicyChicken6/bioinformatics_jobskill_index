# Weekly Refresh Playbook

## Goal
Refresh the bioinformatics jobs board once per week and keep a simple longitudinal trend history.

## Scope
- Only use official company career pages or official hosted job-board pages.
- Track live roles whose titles match or clearly map to one of these families:
  - Computational Biologist
  - Bioinformatics Scientist
  - Bioinformatics Engineer
  - Bioinformatics Analyst
- Keep the board focused on bioinformatics and computational biology. Exclude generic data science roles unless the posting is explicitly biology-facing.

## Outputs to update
- `bioinformatics-board/output/bioinformatics-jobs-board.md`
- `bioinformatics-board/output/bioinformatics-jobs-board.csv`
- `bioinformatics-board/output/bioinformatics-skill-trends.md`
- `bioinformatics-board/output/bioinformatics-trend-history.csv`

## Weekly procedure
1. Find currently live roles from the tracked role families.
2. Remove closed roles from the current board.
3. Add newly found live roles.
4. For every role, capture:
   - company
   - title
   - role family
   - focus area
   - location
   - work mode
   - 2 to 3 responsibility bullets
   - 2 to 3 requirement bullets
   - normalized skill tags
   - source URL
5. Recompute headline counts and rewrite the trend summary.
6. Append one row to `bioinformatics-trend-history.csv` for the current snapshot date.
7. If a source is unreachable, note it briefly in the trend summary instead of inventing data.

## Normalized skill taxonomy
Use these tags when they are explicitly supported by the posting text.
- Python
- R
- NGS / genomics
- Pipelines / workflow orchestration
- Statistics / modeling
- Single-cell / multi-omics
- Linux / Unix
- Software engineering / reproducibility
- Cross-functional collaboration
- Scientific writing / communication
- Cancer / liquid biopsy / biomarkers
- Experimental design / assay partnership
- Cloud / scalable compute
- Machine learning / AI
- Workflow engines (Nextflow / WDL / Snakemake)
- Data visualization / reporting
- Clinical / translational applications
- Multi-omics integration
- Containers / CI-CD / production
- Drug discovery
- Natural products / comparative genomics
- Customer-facing / platform migration

## History file schema
Append one row per run with these columns:
- snapshot_date
- total_roles
- unique_companies
- computational_biologist_roles
- bioinformatics_scientist_roles
- bioinformatics_engineer_roles
- bioinformatics_analyst_roles
- python_roles
- pipelines_roles
- ngs_genomics_roles
- r_roles
- statistics_roles
- cancer_biomarker_roles
- cloud_roles
- ml_ai_roles
- single_cell_multiomics_roles
- workflow_engine_roles
- cross_functional_collaboration_roles

## Current baseline
The existing baseline snapshot is dated 2026-03-13.
