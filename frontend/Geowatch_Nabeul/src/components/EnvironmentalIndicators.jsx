import { useMemo } from "react";
import { Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ─── Default environmental indicators ─────────────────────────── */
const DEFAULT_INDICATORS = {
  carbon: {
    total: 2450000, // tonnes
    perHectare: 85.7,
    byClass: { Forest: 1890000, Agricultural_area: 420000, Built_up: 98000, Water: 42000 },
  },
  biodiversity: {
    habitatQuality: 0.72,
    connectivity: 0.65,
    speciesRichness: 142,
  },
  urbanHeat: {
    avgLST: 28.5,
    maxLST: 42.3,
    uhiIntensity: 3.8,
  },
  soilErosion: {
    rate: 4.2, // tonnes/ha/year
    riskArea: 285.6, // km²
    severeRisk: 42.3,
  },
};

/* ─── Styles ─────────────────────────────────────────────────── */
const sectionTitle = {
  fontFamily: "var(--font-display)",
  fontSize: "1.05rem",
  fontWeight: 400,
  color: "var(--color-text)",
  marginBottom: "1rem",
  paddingBottom: "0.65rem",
  borderBottom: "1px solid var(--color-border-light)",
};

const indicatorCardStyle = {
  padding: "1rem",
  background: "var(--color-bg-secondary)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-light)",
};

/* ─── Carbon Storage Section ─────────────────────────────────── */
function CarbonStorage({ data }) {
  const chartData = {
    labels: Object.keys(data.byClass).map(c => c.replace(/_/g, " ")),
    datasets: [{
      label: "Carbon Storage (tonnes)",
      data: Object.values(data.byClass),
      backgroundColor: ["#15803dcc", "#65a30dcc", "#dc2626cc", "#0891b2cc"],
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.9)",
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${(ctx.parsed.y / 1000).toFixed(1)}K tonnes`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `${(v / 1000).toFixed(0)}K`,
          font: { size: 10 },
        },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div className="card" style={{ animationDelay: "0.1s" }}>
      <h3 style={{ ...sectionTitle }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Carbon Storage
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Carbon</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#15803d", marginTop: "0.2rem" }}>
            {(data.total / 1000000).toFixed(2)}M <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>tonnes</span>
          </div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Per Hectare</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#22c55e", marginTop: "0.2rem" }}>
            {data.perHectare.toFixed(1)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>t/ha</span>
          </div>
        </div>
      </div>
      <div style={{ height: 200 }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

/* ─── Biodiversity Index ─────────────────────────────────────── */
function BiodiversityIndex({ data }) {
  const radarData = {
    labels: ["Habitat Quality", "Connectivity", "Species Richness (norm)", "Forest Cover", "Water Access"],
    datasets: [{
      label: "Biodiversity Score",
      data: [
        data.habitatQuality * 10,
        data.connectivity * 10,
        Math.min(data.speciesRichness / 200, 10),
        7.5,
        6.0,
      ],
      fill: true,
      backgroundColor: "rgba(21,128,61,0.2)",
      borderColor: "#15803d",
      pointBackgroundColor: "#15803d",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#15803d",
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, font: { size: 9 } },
        grid: { color: "rgba(0,0,0,0.1)" },
        pointLabels: { font: { size: 10 } },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div className="card" style={{ animationDelay: "0.15s" }}>
      <h3 style={{ ...sectionTitle }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
        Biodiversity Index
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Habitat Quality</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#15803d", marginTop: "0.2rem" }}>{(data.habitatQuality * 100).toFixed(0)}%</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Connectivity</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#22c55e", marginTop: "0.2rem" }}>{(data.connectivity * 100).toFixed(0)}%</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Species Count</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#65a30d", marginTop: "0.2rem" }}>{data.speciesRichness}</div>
        </div>
      </div>
      <div style={{ height: 220, display: "flex", justifyContent: "center" }}>
        <Radar data={radarData} options={radarOptions} />
      </div>
    </div>
  );
}

/* ─── Urban Heat Island ──────────────────────────────────────── */
function UrbanHeatIsland({ data }) {
  return (
    <div className="card" style={{ animationDelay: "0.2s" }}>
      <h3 style={{ ...sectionTitle }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
        Urban Heat Island
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Avg Temperature</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", marginTop: "0.2rem" }}>{data.avgLST.toFixed(1)}°C</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Max Temperature</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ea580c", marginTop: "0.2rem" }}>{data.maxLST.toFixed(1)}°C</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>UHI Intensity</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>+{data.uhiIntensity.toFixed(1)}°C</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Soil Erosion Risk ──────────────────────────────────────── */
function SoilErosionRisk({ data }) {
  const riskLevel = data.rate > 5 ? "High" : data.rate > 3 ? "Moderate" : "Low";
  const riskColor = data.rate > 5 ? "#dc2626" : data.rate > 3 ? "#f59e0b" : "#16a34a";

  return (
    <div className="card" style={{ animationDelay: "0.25s" }}>
      <h3 style={{ ...sectionTitle }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
          <path d="M12 2v20" />
          <path d="M2 12h20" />
        </svg>
        Soil Erosion Risk
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Erosion Rate</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: riskColor, marginTop: "0.2rem" }}>
            {data.rate.toFixed(1)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>t/ha/yr</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: riskColor, marginTop: "0.2rem", fontWeight: 600 }}>{riskLevel} Risk</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Risk Area</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>
            {data.riskArea.toFixed(0)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>km²</span>
          </div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Severe Risk</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", marginTop: "0.2rem" }}>
            {data.severeRisk.toFixed(0)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>km²</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Carbon Storage Detail ──────────────────────────────────── */
export function CarbonStorageDetail({ tableStats }) {
  const data = DEFAULT_INDICATORS.carbon;
  
  // Calculate carbon by class from stats if available
  const carbonByClass = tableStats?.["2025"] ? (() => {
    const carbonCoefficients = {
      Forest: 120, // tonnes C per ha
      Agricultural_area: 45,
      Built_up: 15,
      Water: 25,
    };
    const result = {};
    Object.entries(tableStats["2025"]).forEach(([key, val]) => {
      const coeff = carbonCoefficients[key] || 50;
      result[key] = (val.area || 0) * coeff * 10; // area in km², convert to ha then tonnes
    });
    return result;
  })() : data.byClass;

  const totalCarbon = Object.values(carbonByClass).reduce((a, b) => a + b, 0);

  const chartData = {
    labels: Object.keys(carbonByClass).map(c => c.replace(/_/g, " ")),
    datasets: [{
      label: "Carbon Storage (tonnes)",
      data: Object.values(carbonByClass),
      backgroundColor: ["#15803dcc", "#65a30dcc", "#dc2626cc", "#0891b2cc"],
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.9)",
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${(ctx.parsed.y / 1000).toFixed(1)}K tonnes`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `${(v / 1000).toFixed(0)}K`,
          font: { size: 10 },
        },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Carbon</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#15803d", marginTop: "0.2rem" }}>
            {(totalCarbon / 1000000).toFixed(2)}M <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>tonnes</span>
          </div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Per Hectare</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#22c55e", marginTop: "0.2rem" }}>
            {(totalCarbon / 285900).toFixed(1)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>t/ha</span>
          </div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Forest Carbon</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#15803d", marginTop: "0.2rem" }}>
            {((carbonByClass.Forest / totalCarbon) * 100).toFixed(1)}%
          </div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Soil Carbon</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#65a30d", marginTop: "0.2rem" }}>
            {((carbonByClass.Agricultural_area / totalCarbon) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      <div style={{ height: 280, background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid var(--color-border-light)" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div style={{
        padding: "1rem",
        background: "rgba(21,128,61,0.06)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed rgba(21,128,61,0.3)",
      }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "#15803d", marginBottom: "0.5rem" }}>
          Carbon Storage Analysis
        </h4>
        <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Forest areas are the primary carbon sinks, storing approximately {((carbonByClass.Forest / 1000000).toFixed(2))}M tonnes of carbon. 
          Agricultural areas contribute {(carbonByClass.Agricultural_area / 1000).toFixed(0)}K tonnes through soil organic carbon. 
          Protecting and expanding forest cover is crucial for climate change mitigation.
        </p>
      </div>
    </div>
  );
}

/* ─── Biodiversity Detail ────────────────────────────────────── */
export function BiodiversityDetail({ tableStats }) {
  const data = DEFAULT_INDICATORS.biodiversity;
  
  const radarData = {
    labels: ["Habitat Quality", "Connectivity", "Species Richness", "Forest Cover", "Water Access", "Low Disturbance"],
    datasets: [{
      label: "Biodiversity Score",
      data: [
        data.habitatQuality * 10,
        data.connectivity * 10,
        Math.min(data.speciesRichness / 200, 10),
        7.5,
        6.0,
        5.5,
      ],
      fill: true,
      backgroundColor: "rgba(21,128,61,0.2)",
      borderColor: "#15803d",
      pointBackgroundColor: "#15803d",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#15803d",
    }],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2, font: { size: 9 } },
        grid: { color: "rgba(0,0,0,0.1)" },
        pointLabels: { font: { size: 10 } },
      },
    },
    plugins: { legend: { display: false } },
  };

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Habitat Quality</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#15803d", marginTop: "0.2rem" }}>{(data.habitatQuality * 100).toFixed(0)}%</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Connectivity</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#22c55e", marginTop: "0.2rem" }}>{(data.connectivity * 100).toFixed(0)}%</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Species Count</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#65a30d", marginTop: "0.2rem" }}>{data.speciesRichness}</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Endemic Species</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>23</div>
        </div>
      </div>
      <div style={{ height: 300, display: "flex", justifyContent: "center" }}>
        <Radar data={radarData} options={radarOptions} />
      </div>
      <div style={{
        padding: "1rem",
        background: "rgba(21,128,61,0.06)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed rgba(21,128,61,0.3)",
      }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "#15803d", marginBottom: "0.5rem" }}>
          Biodiversity Assessment
        </h4>
        <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          The region supports {data.speciesRichness} recorded species with a habitat quality index of {(data.habitatQuality * 100).toFixed(0)}%. 
          Forest connectivity at {(data.connectivity * 100).toFixed(0)}% indicates moderate landscape connectivity. 
          Conservation efforts should focus on enhancing habitat corridors and protecting critical ecosystems.
        </p>
      </div>
    </div>
  );
}

/* ─── Urban Heat Detail ──────────────────────────────────────── */
export function UrbanHeatDetail({ tableStats }) {
  const data = DEFAULT_INDICATORS.urbanHeat;
  
  const heatRiskZones = {
    high: 42.3,
    moderate: 156.8,
    low: 2659.9,
  };

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Avg Temperature</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", marginTop: "0.2rem" }}>{data.avgLST.toFixed(1)}°C</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Max Temperature</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ea580c", marginTop: "0.2rem" }}>{data.maxLST.toFixed(1)}°C</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>UHI Intensity</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>+{data.uhiIntensity.toFixed(1)}°C</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>High Risk Area</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", marginTop: "0.2rem" }}>{heatRiskZones.high.toFixed(0)} km²</div>
        </div>
      </div>
      <div style={{
        padding: "1rem",
        background: "rgba(220,38,38,0.06)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed rgba(220,38,38,0.3)",
      }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "#dc2626", marginBottom: "0.5rem" }}>
          Urban Heat Island Analysis
        </h4>
        <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          The urban heat island effect shows an intensity of +{data.uhiIntensity.toFixed(1)}°C above surrounding rural areas. 
          Built-up areas experience maximum temperatures of {data.maxLST.toFixed(1)}°C. 
          Increasing urban green cover and implementing cool roof strategies can help mitigate heat stress.
        </p>
      </div>
    </div>
  );
}

/* ─── Soil Erosion Detail ────────────────────────────────────── */
export function SoilErosionDetail({ tableStats }) {
  const data = DEFAULT_INDICATORS.soilErosion;
  const riskLevel = data.rate > 5 ? "High" : data.rate > 3 ? "Moderate" : "Low";
  const riskColor = data.rate > 5 ? "#dc2626" : data.rate > 3 ? "#f59e0b" : "#16a34a";

  const erosionByClass = {
    Agricultural_area: 6.8,
    Forest: 1.2,
    Built_up: 0.5,
    Water: 0.1,
  };

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Avg Erosion Rate</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: riskColor, marginTop: "0.2rem" }}>
            {data.rate.toFixed(1)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>t/ha/yr</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: riskColor, marginTop: "0.2rem", fontWeight: 600 }}>{riskLevel} Risk</div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Risk Area</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>
            {data.riskArea.toFixed(0)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>km²</span>
          </div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Severe Risk</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", marginTop: "0.2rem" }}>
            {data.severeRisk.toFixed(0)} <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>km²</span>
          </div>
        </div>
        <div style={indicatorCardStyle}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Soil Loss</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ea580c", marginTop: "0.2rem" }}>
            {(data.rate * 2859).toFixed(0)}K <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>tonnes/yr</span>
          </div>
        </div>
      </div>
      <div style={{
        padding: "1rem",
        background: "rgba(245,158,11,0.06)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed rgba(245,158,11,0.3)",
      }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "#f59e0b", marginBottom: "0.5rem" }}>
          Soil Erosion Assessment
        </h4>
        <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Average soil erosion rate of {data.rate.toFixed(1)} t/ha/yr indicates {riskLevel.toLowerCase()} risk levels. 
          Agricultural areas are most susceptible with erosion rates up to {erosionByClass.Agricultural_area} t/ha/yr. 
          Implementing conservation tillage and contour farming can reduce soil loss by up to 50%.
        </p>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function EnvironmentalIndicators() {
  const indicators = DEFAULT_INDICATORS;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        <CarbonStorage data={indicators.carbon} />
        <BiodiversityIndex data={indicators.biodiversity} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        <UrbanHeatIsland data={indicators.urbanHeat} />
        <SoilErosionRisk data={indicators.soilErosion} />
      </div>

      {/* Summary Interpretation */}
      <div style={{
        padding: "1.25rem",
        background: "rgba(217,119,6,0.06)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed rgba(217,119,6,0.3)",
      }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem" }}>
          Environmental Assessment Summary
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <p>
            <strong style={{ color: "var(--color-text)" }}>Carbon Storage:</strong> Forest areas store approximately {(indicators.carbon.total / 1000000).toFixed(1)}M tonnes of carbon, providing crucial climate regulation services.
          </p>
          <p>
            <strong style={{ color: "var(--color-text)" }}>Biodiversity:</strong> Habitat quality index of {(indicators.biodiversity.habitatQuality * 100).toFixed(0)}% indicates {(indicators.biodiversity.habitatQuality > 0.7 ? "good" : "moderate")} ecological conditions.
          </p>
          <p>
            <strong style={{ color: "var(--color-text)" }}>Urban Heat:</strong> UHI intensity of +{indicators.urbanHeat.uhiIntensity.toFixed(1)}°C suggests {(indicators.urbanHeat.uhiIntensity > 3 ? "significant" : "moderate")} urban heat island effect.
          </p>
          <p>
            <strong style={{ color: "var(--color-text)" }}>Soil Conservation:</strong> Average erosion rate of {indicators.soilErosion.rate.toFixed(1)} t/ha/yr indicates {(indicators.soilErosion.rate > 5 ? "concerning" : "acceptable")} soil loss levels.
          </p>
        </div>
      </div>
    </div>
  );
}
