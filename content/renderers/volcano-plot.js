export async function renderFigure(container, dataset, context) {
  const Plotly = context.Plotly;
  const significantThreshold = -Math.log10(0.05);

  const points = dataset.map((row) => ({
    gene: row.gene,
    log2FC: Number(row.log2FC),
    padj: Number(row.padj),
    negLogPadj: -Math.log10(Number(row.padj)),
  }));

  const down = points.filter((point) => point.log2FC <= -1 && point.padj < 0.05);
  const up = points.filter((point) => point.log2FC >= 1 && point.padj < 0.05);
  const neutral = points.filter(
    (point) => !(point.padj < 0.05 && Math.abs(point.log2FC) >= 1),
  );

  const traces = [
    {
      type: "scatter",
      mode: "markers",
      name: "Background",
      x: neutral.map((point) => point.log2FC),
      y: neutral.map((point) => point.negLogPadj),
      text: neutral.map((point) => point.gene),
      hovertemplate:
        "<b>%{text}</b><br>log2FC: %{x:.2f}<br>-log10(adj. p): %{y:.2f}<extra></extra>",
      marker: {
        color: "rgba(89, 103, 117, 0.45)",
        size: 11,
        line: { color: "rgba(255,255,255,0.5)", width: 1 },
      },
    },
    {
      type: "scatter",
      mode: "markers+text",
      name: "Downregulated",
      x: down.map((point) => point.log2FC),
      y: down.map((point) => point.negLogPadj),
      text: down.map((point) => (point.padj < 0.01 ? point.gene : "")),
      textposition: "bottom center",
      hovertemplate:
        "<b>%{customdata}</b><br>log2FC: %{x:.2f}<br>-log10(adj. p): %{y:.2f}<extra></extra>",
      customdata: down.map((point) => point.gene),
      marker: {
        color: "#c45c31",
        size: 13,
        line: { color: "rgba(255,255,255,0.8)", width: 1.2 },
      },
      textfont: { size: 11, color: "#7f3418" },
    },
    {
      type: "scatter",
      mode: "markers+text",
      name: "Upregulated",
      x: up.map((point) => point.log2FC),
      y: up.map((point) => point.negLogPadj),
      text: up.map((point) => (point.padj < 0.01 ? point.gene : "")),
      textposition: "top center",
      hovertemplate:
        "<b>%{customdata}</b><br>log2FC: %{x:.2f}<br>-log10(adj. p): %{y:.2f}<extra></extra>",
      customdata: up.map((point) => point.gene),
      marker: {
        color: "#0f8a83",
        size: 13,
        line: { color: "rgba(255,255,255,0.8)", width: 1.2 },
      },
      textfont: { size: 11, color: "#0c5c56" },
    },
  ];

  const layout = {
    margin: { l: 58, r: 20, t: 18, b: 56 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    legend: {
      orientation: "h",
      y: 1.08,
      x: 0,
      bgcolor: "rgba(255,255,255,0.65)",
    },
    xaxis: {
      title: "log2 fold change",
      zeroline: false,
      gridcolor: "rgba(16, 42, 67, 0.08)",
    },
    yaxis: {
      title: "-log10 adjusted p-value",
      zeroline: false,
      gridcolor: "rgba(16, 42, 67, 0.08)",
    },
    shapes: [
      {
        type: "line",
        x0: -1,
        x1: -1,
        y0: 0,
        y1: 1,
        yref: "paper",
        line: { color: "rgba(16, 42, 67, 0.2)", dash: "dash" },
      },
      {
        type: "line",
        x0: 1,
        x1: 1,
        y0: 0,
        y1: 1,
        yref: "paper",
        line: { color: "rgba(16, 42, 67, 0.2)", dash: "dash" },
      },
      {
        type: "line",
        x0: Math.min(...points.map((point) => point.log2FC)) - 0.2,
        x1: Math.max(...points.map((point) => point.log2FC)) + 0.2,
        y0: significantThreshold,
        y1: significantThreshold,
        line: { color: "rgba(16, 42, 67, 0.2)", dash: "dash" },
      },
    ],
  };

  await Plotly.newPlot(container, traces, layout, {
    displayModeBar: false,
    responsive: true,
  });
}
