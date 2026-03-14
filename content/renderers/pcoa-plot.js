export async function renderFigure(container, dataset, context) {
  const Plotly = context.Plotly;
  const palette = {
    Case: "#0f8a83",
    Control: "#c45c31",
  };

  const grouped = dataset.reduce((accumulator, row) => {
    const key = row.cohort;
    accumulator[key] ??= [];
    accumulator[key].push(row);
    return accumulator;
  }, {});

  const traces = Object.entries(grouped).map(([cohort, rows]) => ({
    type: "scatter",
    mode: "markers+text",
    name: cohort,
    x: rows.map((row) => Number(row.pc1)),
    y: rows.map((row) => Number(row.pc2)),
    text: rows.map((row) => row.sample),
    textposition: "top center",
    hovertemplate:
      "<b>%{text}</b><br>Cohort: " +
      cohort +
      "<br>PCoA1: %{x:.2f}<br>PCoA2: %{y:.2f}<extra></extra>",
    marker: {
      size: 15,
      color: palette[cohort] ?? "#596775",
      line: { color: "rgba(255,255,255,0.84)", width: 1.2 },
    },
    textfont: {
      size: 10,
      color: palette[cohort] ?? "#596775",
    },
  }));

  const layout = {
    margin: { l: 56, r: 20, t: 18, b: 56 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    xaxis: {
      title: "PCoA 1 (43.2%)",
      zeroline: true,
      zerolinecolor: "rgba(16, 42, 67, 0.08)",
      gridcolor: "rgba(16, 42, 67, 0.08)",
    },
    yaxis: {
      title: "PCoA 2 (21.4%)",
      zeroline: true,
      zerolinecolor: "rgba(16, 42, 67, 0.08)",
      gridcolor: "rgba(16, 42, 67, 0.08)",
    },
    legend: {
      orientation: "h",
      x: 0,
      y: 1.08,
      bgcolor: "rgba(255,255,255,0.64)",
    },
  };

  await Plotly.newPlot(container, traces, layout, {
    displayModeBar: false,
    responsive: true,
  });
}
