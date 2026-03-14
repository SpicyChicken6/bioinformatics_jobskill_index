const DATA_PATHS = {
  jobs: "./output/bioinformatics-jobs-board.csv",
  history: "./output/bioinformatics-trend-history.csv",
};

const METRIC_LABELS = {
  total_roles: "Total live roles",
  unique_companies: "Unique companies",
  computational_biologist_roles: "Computational biologist roles",
  bioinformatics_scientist_roles: "Bioinformatics scientist roles",
  bioinformatics_engineer_roles: "Bioinformatics engineer roles",
  bioinformatics_analyst_roles: "Bioinformatics analyst roles",
  python_roles: "Python roles",
  pipelines_roles: "Pipeline roles",
  ngs_genomics_roles: "NGS / genomics roles",
  r_roles: "R roles",
  statistics_roles: "Statistics roles",
  cancer_biomarker_roles: "Cancer / biomarker roles",
  cloud_roles: "Cloud roles",
  ml_ai_roles: "ML / AI roles",
  single_cell_multiomics_roles: "Single-cell / multi-omics roles",
  workflow_engine_roles: "Workflow-engine roles",
  cross_functional_collaboration_roles: "Cross-functional roles",
};

const TECHNICAL_PRIORITY = [
  "Pipelines / workflow orchestration",
  "Python",
  "NGS / genomics",
  "Statistics / modeling",
  "Cloud / scalable compute",
  "Machine learning / AI",
];

const state = {
  jobs: [],
  history: [],
  summary: null,
  searchTerm: "",
  roleFilter: "",
  modeFilter: "",
  skillFilter: "",
  historyMetric: "total_roles",
};

const elements = {
  heroCopy: document.querySelector("#heroCopy"),
  heroStats: document.querySelector("#heroStats"),
  trendMeta: document.querySelector("#trendMeta"),
  skillIndex: document.querySelector("#skillIndex"),
  historyMetric: document.querySelector("#historyMetric"),
  historyChart: document.querySelector("#historyChart"),
  historySummary: document.querySelector("#historySummary"),
  roleMix: document.querySelector("#roleMix"),
  modeMix: document.querySelector("#modeMix"),
  insightCards: document.querySelector("#insightCards"),
  jobsMeta: document.querySelector("#jobsMeta"),
  searchInput: document.querySelector("#searchInput"),
  roleFilter: document.querySelector("#roleFilter"),
  modeFilter: document.querySelector("#modeFilter"),
  skillFilter: document.querySelector("#skillFilter"),
  jobGrid: document.querySelector("#jobGrid"),
};

init();

async function init() {
  attachEvents();
  renderLoadingState();

  try {
    const [jobsRows, historyRows] = await Promise.all([
      loadCsv(DATA_PATHS.jobs),
      loadCsv(DATA_PATHS.history),
    ]);

    state.jobs = jobsRows.map(normalizeJob).filter(Boolean);
    state.history = historyRows.map(normalizeHistory).filter(Boolean);
    state.summary = computeSummary(state.jobs, state.history);

    populateFilters();
    populateHistoryMetricSelector();
    renderPage();
  } catch (error) {
    renderErrorState(error instanceof Error ? error.message : String(error));
  }
}

function attachEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderJobs();
  });

  elements.roleFilter.addEventListener("change", (event) => {
    state.roleFilter = event.target.value;
    renderJobs();
  });

  elements.modeFilter.addEventListener("change", (event) => {
    state.modeFilter = event.target.value;
    renderJobs();
  });

  elements.skillFilter.addEventListener("change", (event) => {
    state.skillFilter = event.target.value;
    renderJobs();
  });

  elements.historyMetric.addEventListener("change", (event) => {
    state.historyMetric = event.target.value;
    renderHistory();
  });
}

function renderLoadingState() {
  elements.heroCopy.innerHTML = `
    <p class="section-kicker">Bioinformatics hiring monitor</p>
    <h1>Loading trend index</h1>
    <p class="hero-subtitle">Reading the latest board snapshot and weekly history.</p>
    <p class="hero-intro">This dashboard is static, but the data it reads is refreshed from the files in <code class="code-like">bioinformatics-board/output</code>.</p>
  `;

  elements.heroStats.innerHTML = Array.from({ length: 4 }, () => `
    <article class="stat-card">
      <span class="stat-value">--</span>
      <span class="stat-label">Loading</span>
    </article>
  `).join("");

  elements.skillIndex.innerHTML = createEmptyState("Loading trend index", "Fetching the current skill distribution.");
  elements.historyChart.innerHTML = createEmptyState("Loading history", "Reading the weekly trend-history file.");
  elements.roleMix.innerHTML = createEmptyState("Loading role mix", "Computing role-family counts.");
  elements.modeMix.innerHTML = createEmptyState("Loading work modes", "Computing on-site, hybrid, and remote mix.");
  elements.insightCards.innerHTML = createEmptyState("Loading insights", "Generating headline observations.");
  elements.jobGrid.innerHTML = createEmptyState("Loading jobs", "Reading the live-board CSV.");
}

function renderErrorState(message) {
  const html = createEmptyState("Dashboard could not load", message);
  elements.skillIndex.innerHTML = html;
  elements.historyChart.innerHTML = html;
  elements.roleMix.innerHTML = html;
  elements.modeMix.innerHTML = html;
  elements.insightCards.innerHTML = html;
  elements.jobGrid.innerHTML = html;
}

function renderPage() {
  renderHero();
  renderSkillIndex();
  renderHistory();
  renderMixPanels();
  renderInsights();
  renderJobs();
}

async function loadCsv(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  const rawText = await response.text();
  if (!window.Papa) {
    throw new Error("PapaParse is unavailable.");
  }

  const parsed = window.Papa.parse(rawText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    throw new Error(parsed.errors[0].message);
  }

  return parsed.data;
}

function normalizeJob(row) {
  if (!row || !row.Company || !row.Title) {
    return null;
  }

  return {
    company: row.Company.trim(),
    title: row.Title.trim(),
    roleFamily: row.RoleFamily.trim(),
    focusArea: row.FocusArea.trim(),
    location: row.Location.trim(),
    workMode: row.WorkMode.trim(),
    responsibilities: splitList(row.Responsibilities),
    requirements: splitList(row.Requirements),
    skillTags: splitList(row.KeySkills),
    sourceUrl: row.SourceUrl.trim(),
  };
}

function normalizeHistory(row) {
  if (!row || !row.snapshot_date) {
    return null;
  }

  const normalized = { snapshot_date: row.snapshot_date.trim() };
  Object.keys(row).forEach((key) => {
    if (key === "snapshot_date") {
      return;
    }

    const value = Number(row[key]);
    normalized[key] = Number.isFinite(value) ? value : 0;
  });

  return normalized;
}

function splitList(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function computeSummary(jobs, history) {
  const totalRoles = jobs.length;
  const uniqueCompanies = new Set(jobs.map((job) => job.company)).size;
  const roleMix = countBy(jobs, "roleFamily");
  const modeMix = countBy(jobs, "workMode");
  const focusMix = countBy(jobs, "focusArea");
  const skillIndex = countNested(jobs, "skillTags");
  const latestHistory = history[history.length - 1] || null;

  const oncologyCount = getCount(skillIndex, "Cancer / liquid biopsy / biomarkers");
  const singleCellCount = getCount(skillIndex, "Single-cell / multi-omics");
  const cloudCount = getCount(skillIndex, "Cloud / scalable compute");
  const mlCount = getCount(skillIndex, "Machine learning / AI");
  const workflowCount = getCount(skillIndex, "Workflow engines (Nextflow / WDL / Snakemake)");
  const pipelinesCount = getCount(skillIndex, "Pipelines / workflow orchestration");
  const pythonCount = getCount(skillIndex, "Python");
  const remoteCount = getCount(modeMix, "Remote");
  const hybridCount = getCount(modeMix, "Hybrid");
  const onsiteCount = getCount(modeMix, "On-site");

  const leadingTechnicalSkill = TECHNICAL_PRIORITY.map((label) => skillIndex.find((entry) => entry.label === label)).find(Boolean) || skillIndex[0] || null;

  return {
    totalRoles,
    uniqueCompanies,
    roleMix,
    modeMix,
    focusMix,
    skillIndex,
    history,
    latestHistory,
    latestSnapshotDate: latestHistory?.snapshot_date || null,
    leadingTechnicalSkill,
    oncologyCount,
    singleCellCount,
    cloudCount,
    mlCount,
    workflowCount,
    pipelinesCount,
    pythonCount,
    remoteCount,
    hybridCount,
    onsiteCount,
  };
}

function countBy(items, key) {
  const counts = new Map();
  items.forEach((item) => {
    const value = item[key];
    if (!value) {
      return;
    }
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, share: roundShare(count, items.length) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function countNested(items, key) {
  const counts = new Map();
  items.forEach((item) => {
    (item[key] || []).forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, share: roundShare(count, items.length) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function roundShare(count, total) {
  if (!total) {
    return 0;
  }
  return Number(((count / total) * 100).toFixed(1));
}

function getCount(entries, label) {
  return entries.find((entry) => entry.label === label)?.count || 0;
}

function renderHero() {
  const { totalRoles, uniqueCompanies, latestSnapshotDate, leadingTechnicalSkill, oncologyCount, onsiteCount, hybridCount, remoteCount } = state.summary;
  const formattedDate = latestSnapshotDate ? formatDate(latestSnapshotDate) : "No snapshot date";
  const footprintShare = roundShare(onsiteCount + hybridCount, totalRoles);
  const oncologyShare = roundShare(oncologyCount, totalRoles);

  elements.heroCopy.innerHTML = `
    <p class="section-kicker">Bioinformatics hiring monitor</p>
    <h1>Trend index for live bioinformatics roles</h1>
    <p class="hero-subtitle">A static dashboard fed by the weekly board snapshot and history files.</p>
    <p class="hero-intro">This page reads <code class="code-like">bioinformatics-jobs-board.csv</code> and <code class="code-like">bioinformatics-trend-history.csv</code> directly from the <code class="code-like">output</code> folder. Refresh the data files and the dashboard updates automatically.</p>
    <div class="callout-row">
      <span class="callout-pill">Last snapshot: ${escapeHtml(formattedDate)}</span>
      <span class="callout-pill">Tracked families: 4</span>
      <span class="callout-pill">Weekly baseline stored in trend history</span>
    </div>
    <div class="meta-row">
      <a class="resource-link" href="./output/bioinformatics-jobs-board.csv">Open jobs CSV</a>
      <a class="resource-link" href="./output/bioinformatics-skill-trends.md">Open trend summary</a>
      <a class="resource-link" href="./automation/weekly-refresh-playbook.md">Open refresh playbook</a>
    </div>
  `;

  elements.heroStats.innerHTML = `
    <article class="stat-card">
      <span class="stat-value">${totalRoles}</span>
      <span class="stat-label">Live roles in the current board</span>
    </article>
    <article class="stat-card">
      <span class="stat-value">${uniqueCompanies}</span>
      <span class="stat-label">Unique companies in the sample</span>
    </article>
    <article class="stat-card">
      <span class="stat-value">${leadingTechnicalSkill ? `${leadingTechnicalSkill.count}/${totalRoles}` : "--"}</span>
      <span class="stat-label">Top technical signal: ${escapeHtml(leadingTechnicalSkill?.label || "Unavailable")}</span>
    </article>
    <article class="stat-card">
      <span class="stat-value">${oncologyShare}%</span>
      <span class="stat-label">Cancer-linked roles; ${footprintShare}% are on-site or hybrid and ${remoteCount}/${totalRoles} are remote</span>
    </article>
  `;
}

function renderSkillIndex() {
  const { skillIndex, totalRoles } = state.summary;
  elements.trendMeta.textContent = `${skillIndex.length} normalized skills tracked across ${totalRoles} live roles`;

  elements.skillIndex.innerHTML = skillIndex
    .slice(0, 14)
    .map((entry) => `
      <article class="skill-row">
        <div class="skill-copy">
          <strong>${escapeHtml(entry.label)}</strong>
          <span>${entry.count} of ${totalRoles} roles</span>
        </div>
        <div class="meter" aria-hidden="true"><span style="width:${entry.share}%"></span></div>
        <strong>${entry.share}%</strong>
      </article>
    `)
    .join("");
}

function populateHistoryMetricSelector() {
  const availableMetrics = state.history.length ? Object.keys(state.history[0]).filter((key) => key !== "snapshot_date") : Object.keys(METRIC_LABELS);
  elements.historyMetric.innerHTML = availableMetrics
    .map((metricKey) => `<option value="${escapeHtml(metricKey)}">${escapeHtml(METRIC_LABELS[metricKey] || humanizeMetric(metricKey))}</option>`)
    .join("");

  if (!availableMetrics.includes(state.historyMetric)) {
    state.historyMetric = availableMetrics[0] || "total_roles";
  }
  elements.historyMetric.value = state.historyMetric;
}

function renderHistory() {
  const { history } = state.summary;
  const metricKey = state.historyMetric;
  const metricLabel = METRIC_LABELS[metricKey] || humanizeMetric(metricKey);

  if (!history.length) {
    elements.historyChart.innerHTML = createEmptyState("No history yet", "Run the weekly refresh to seed the longitudinal chart.");
    elements.historySummary.innerHTML = "";
    return;
  }

  const points = history.map((row) => ({ date: row.snapshot_date, value: Number(row[metricKey] || 0) }));
  elements.historyChart.innerHTML = createHistoryChart(points, metricLabel);
  elements.historySummary.innerHTML = createHistorySummary(points, metricLabel);
}

function createHistoryChart(points, label) {
  const width = 620;
  const height = 220;
  const left = 28;
  const right = 18;
  const top = 18;
  const bottom = 36;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const chartPoints = points.map((point, index) => {
    const x = points.length === 1 ? left + innerWidth / 2 : left + (index * innerWidth) / (points.length - 1);
    const y = top + innerHeight - (point.value / maxValue) * innerHeight;
    return { ...point, x, y };
  });

  const polyline = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const yTicks = Array.from({ length: 4 }, (_, index) => {
    const tickValue = Math.round((maxValue * index) / 3);
    const y = top + innerHeight - (tickValue / maxValue) * innerHeight;
    return { tickValue, y };
  });

  return `
    <div class="chart-wrap">
      <div class="chart-legend">
        <strong>${escapeHtml(label)}</strong>
        <span>${points.length > 1 ? `${points.length} weekly snapshots` : "One snapshot so far"}</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)} over time">
        ${yTicks
          .map(
            (tick) => `
              <line x1="${left}" y1="${tick.y}" x2="${width - right}" y2="${tick.y}" stroke="rgba(18,45,53,0.09)" stroke-width="1" />
              <text x="${left - 8}" y="${tick.y + 4}" text-anchor="end" fill="#596d73" font-size="11" font-family="IBM Plex Mono">${tick.tickValue}</text>
            `,
          )
          .join("")}
        <line x1="${left}" y1="${top + innerHeight}" x2="${width - right}" y2="${top + innerHeight}" stroke="rgba(18,45,53,0.18)" stroke-width="1.5" />
        ${chartPoints.length > 1 ? `<polyline fill="none" stroke="#0d7d72" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polyline}" />` : ""}
        ${chartPoints
          .map(
            (point) => `
              <circle cx="${point.x}" cy="${point.y}" r="5.5" fill="#cf7440" stroke="white" stroke-width="2" />
              <text x="${point.x}" y="${height - 12}" text-anchor="middle" fill="#596d73" font-size="11" font-family="IBM Plex Mono">${escapeHtml(shortDate(point.date))}</text>
            `,
          )
          .join("")}
      </svg>
      <p class="chart-caption">${points.length > 1 ? "The line tracks how this metric moves as weekly snapshots accumulate." : "A second weekly run will turn this baseline point into a trend line."}</p>
    </div>
  `;
}

function createHistorySummary(points, label) {
  const latest = points[points.length - 1];
  const prior = points.length > 1 ? points[points.length - 2] : null;
  const baseline = points[0];
  const delta = prior ? latest.value - prior.value : 0;
  const baselineDelta = latest.value - baseline.value;

  return `
    <article class="metric-card">
      <h3>${escapeHtml(label)}</h3>
      <strong>${latest.value}</strong>
      <small>Latest snapshot on ${escapeHtml(formatDate(latest.date))}</small>
    </article>
    <article class="metric-card">
      <h3>Week-over-week</h3>
      <strong>${prior ? formatDelta(delta) : "Baseline"}</strong>
      <small>${prior ? `Compared with ${formatDate(prior.date)}` : "Run another weekly refresh to compute delta."}</small>
    </article>
    <article class="metric-card">
      <h3>Baseline delta</h3>
      <strong>${points.length > 1 ? formatDelta(baselineDelta) : "0"}</strong>
      <small>Relative to ${formatDate(baseline.date)}</small>
    </article>
  `;
}

function renderMixPanels() {
  renderBarStack(elements.roleMix, state.summary.roleMix, state.summary.totalRoles);
  renderBarStack(elements.modeMix, state.summary.modeMix, state.summary.totalRoles);
}

function renderBarStack(mount, entries, totalRoles) {
  mount.innerHTML = entries
    .map((entry) => `
      <article class="mix-row">
        <div class="mix-copy">
          <strong>${escapeHtml(entry.label)}</strong>
          <span>${entry.count} of ${totalRoles} roles</span>
        </div>
        <div class="mini-meter" aria-hidden="true"><span style="width:${entry.share}%"></span></div>
        <strong>${entry.share}%</strong>
      </article>
    `)
    .join("");
}

function renderInsights() {
  const { totalRoles, pythonCount, pipelinesCount, oncologyCount, cloudCount, mlCount, workflowCount, singleCellCount, remoteCount, hybridCount, onsiteCount } = state.summary;
  const insights = [
    {
      title: "Baseline stack",
      body: `Python appears in ${pythonCount}/${totalRoles} roles and pipeline work appears in ${pipelinesCount}/${totalRoles}. That is the clearest common denominator across the board.`
    },
    {
      title: "Commercial concentration",
      body: `${oncologyCount}/${totalRoles} roles are linked to oncology, liquid biopsy, or biomarker programs. The current market sample is commercially cancer-heavy.`
    },
    {
      title: "Execution requirements",
      body: `Cloud shows up in ${cloudCount}/${totalRoles} roles, ML in ${mlCount}/${totalRoles}, and explicit workflow engines in ${workflowCount}/${totalRoles}. The bar is not just analysis; it is delivery.`
    },
    {
      title: "Work footprint",
      body: `${onsiteCount + hybridCount}/${totalRoles} roles are on-site or hybrid, while ${remoteCount}/${totalRoles} are remote. Location flexibility is the exception in this sample.`
    },
    {
      title: "Research frontier",
      body: `${singleCellCount}/${totalRoles} roles explicitly ask for single-cell or multi-omics depth. It is still a differentiator, but not yet the universal baseline.`
    },
  ];

  elements.insightCards.innerHTML = insights
    .map(
      (insight) => `
        <article class="insight-card">
          <h3>${escapeHtml(insight.title)}</h3>
          <p>${escapeHtml(insight.body)}</p>
        </article>
      `,
    )
    .join("");
}

function populateFilters() {
  populateSelect(elements.roleFilter, uniqueValues(state.jobs.map((job) => job.roleFamily)));
  populateSelect(elements.modeFilter, uniqueValues(state.jobs.map((job) => job.workMode)));
  populateSelect(elements.skillFilter, uniqueValues(state.jobs.flatMap((job) => job.skillTags)));
}

function populateSelect(select, options) {
  select.innerHTML = ["<option value=\"\">All</option>"]
    .concat(options.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
    .join("");
}

function renderJobs() {
  const filteredJobs = getFilteredJobs();
  elements.jobsMeta.textContent = `${filteredJobs.length} of ${state.jobs.length} live roles shown`;

  if (!filteredJobs.length) {
    elements.jobGrid.innerHTML = createEmptyState("No roles match the current filters", "Broaden the search term or clear one of the filters.");
    return;
  }

  elements.jobGrid.innerHTML = filteredJobs
    .map((job) => `
      <article class="job-card">
        <div class="job-head">
          <div class="job-topline">
            <div>
              <h3 class="job-title">${escapeHtml(job.title)}</h3>
              <p class="job-company">${escapeHtml(job.company)}</p>
            </div>
            <span class="mode-pill">${escapeHtml(job.workMode)}</span>
          </div>
          <div class="inline-meta">
            <span>${escapeHtml(job.roleFamily)}</span>
            <span>${escapeHtml(job.focusArea)}</span>
            <span>${escapeHtml(job.location)}</span>
          </div>
        </div>

        <div class="list-block">
          <strong>Responsibilities</strong>
          <ul>
            ${job.responsibilities.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>

        <div class="list-block">
          <strong>Requirements</strong>
          <ul>
            ${job.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>

        <div class="list-block">
          <strong>Skill tags</strong>
          <div class="job-tags">
            ${job.skillTags.map((tag) => `<span class="skill-pill">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>

        <div class="job-footer">
          <span>${escapeHtml(job.company)} source</span>
          <a class="resource-link" href="${escapeHtml(job.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a>
        </div>
      </article>
    `)
    .join("");
}

function getFilteredJobs() {
  return state.jobs.filter((job) => {
    const haystack = [
      job.company,
      job.title,
      job.roleFamily,
      job.focusArea,
      job.location,
      ...job.skillTags,
      ...job.responsibilities,
      ...job.requirements,
    ]
      .join(" ")
      .toLowerCase();

    return (!state.searchTerm || haystack.includes(state.searchTerm))
      && (!state.roleFilter || job.roleFamily === state.roleFilter)
      && (!state.modeFilter || job.workMode === state.modeFilter)
      && (!state.skillFilter || job.skillTags.includes(state.skillFilter));
  });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function createEmptyState(title, message) {
  return `
    <div class="empty-state">
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function formatDate(rawDate) {
  const [year, month, day] = String(rawDate).split("-").map(Number);
  if (!year || !month || !day) {
    return String(rawDate);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function shortDate(rawDate) {
  const [year, month, day] = String(rawDate).split("-").map(Number);
  if (!year || !month || !day) {
    return String(rawDate);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatDelta(value) {
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}

function humanizeMetric(metricKey) {
  return metricKey.replaceAll("_", " ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
