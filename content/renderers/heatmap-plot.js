export async function renderFigure(container, dataset, context) {
  const Plotly = context.Plotly;

  const trace = {
    type: "heatmap",
    x: dataset.samples,
    y: dataset.features,
    z: dataset.values,
    zmid: 0,
    xgap: 4,
    ygap: 4,
    colorscale: [
      [0, "#2a6f97"],
      [0.5, "#f7f2e7"],
      [1, "#c45c31"],
    ],
    colorbar: {
      title: "z-score",
    },
    hovertemplate:
      "<b>%{y}</b><br>%{x}<br>z-score: %{z:.2f}<extra></extra>",
  };

  const layout = {
    margin: { l: 82, r: 20, t: 18, b: 82 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    xaxis: {
      side: "bottom",
      tickangle: -24,
      tickfont: { size: 10 },
    },
    yaxis: {
      automargin: true,
    },
    annotations: dataset.groups.map((group, index) => ({
      x: dataset.samples[index],
      y: 1.08,
      yref: "paper",
      text: group,
      showarrow: false,
      font: {
        size: 10,
        color: group === "Tumor" ? "#7f3418" : "#0c5c56",
      },
    })),
  };

  await Plotly.newPlot(container, [trace], layout, {
    displayModeBar: false,
    responsive: true,
  });
}
