import { useState, useMemo } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

import { LAND_USE_CLASSES } from "../services/rasterConfig";

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

const cardStyle = {
  padding: "1rem",
  background: "var(--color-bg-secondary)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-light)",
};

/* ─── Default baseline data (2025) ─────────────────────────── */
const BASELINE_2025 = {
  Water: { area: 16.6, percentage: 0.58 },
  Built_up: { area: 128.6, percentage: 4.50 },
  Forest: { area: 867.7, percentage: 30.35 },
  Agricultural_area: { area: 1846.2, percentage: 64.57 },
};

const TOTAL_AREA_KM2 = 2859.1;

/* ─── Carbon coefficients (tonnes C per ha) ────────────────── */
const CARBON_COEFFICIENTS = {
  Water: 25,
  Built_up: 5,
  Forest: 120,
  Agricultural_area: 45,
};

/* ─── Scenario Templates ───────────────────────────────────── */
const SCENARIO_TEMPLATES = {
  reforestation: {
    name: "Reforestation Program",
    description: "Convert 50 km² of agricultural land to forest",
    changes: {
      Agricultural_area: -50,
      Forest: +50,
    },
  },
  urbanExpansion: {
    name: "Urban Growth",
    description: "Project 30 km² urban expansion from agricultural land",
    changes: {
      Agricultural_area: -30,
      Built_up: +30,
    },
  },
  greenCity: {
    name: "Green City Initiative",
    description: "Add 20 km² urban green spaces, reduce built-up density",
    changes: {
      Built_up: -10,
      Forest: +15,
      Agricultural_area: -5,
    },
  },
  agriculturalIntensification: {
    name: "Agricultural Intensification",
    description: "Convert 40 km² forest to high-yield agriculture",
    changes: {
      Forest: -40,
      Agricultural_area: +40,
    },
  },
  wetlandRestoration: {
    name: "Wetland Restoration",
    description: "Restore 15 km² of wetlands from agricultural land",
    changes: {
      Agricultural_area: -15,
      Water: +15,
    },
  },
  custom: {
    name: "Custom Scenario",
    description: "Define your own land use changes",
    changes: {},
  },
};

/* ─── KPI Card Component ───────────────────────────────────── */
function KPICard({ label, value, sublabel, color, trend }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 800, color: color || "var(--color-text)", marginTop: "0.2rem" }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          {sublabel}
        </div>
      )}
      {trend !== undefined && (
        <div style={{ 
          fontSize: "0.75rem", 
          fontWeight: 600, 
          color: trend >= 0 ? "#16a34a" : "#dc2626", 
          marginTop: "0.2rem" 
        }}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/* ─── Main Scenario Planner Component ──────────────────────── */
export default function ScenarioPlanner({ tableStats }) {
  const [selectedTemplate, setSelectedTemplate] = useState("reforestation");
  const [customChanges, setCustomChanges] = useState({
    Water: 0,
    Built_up: 0,
    Forest: 0,
    Agricultural_area: 0,
  });
  const [showResults, setShowResults] = useState(false);

  // Get baseline stats
  const baseline = tableStats?.["2025"] || BASELINE_2025;

  // Calculate scenario results
  const scenarioResults = useMemo(() => {
    const template = SCENARIO_TEMPLATES[selectedTemplate];
    const changes = selectedTemplate === "custom" ? customChanges : template.changes;

    // Apply changes to baseline
    const projected = {};
    Object.entries(baseline).forEach(([key, value]) => {
      const change = changes[key] || 0;
      const newArea = Math.max(0, value.area + change);
      projected[key] = {
        area: newArea,
        percentage: (newArea / TOTAL_AREA_KM2) * 100,
        change: change,
        changePercent: value.area > 0 ? (change / value.area) * 100 : 0,
      };
    });

    // Calculate environmental impacts
    const baselineCarbon = Object.entries(baseline).reduce((sum, [key, val]) => {
      return sum + (val.area * 100 * CARBON_COEFFICIENTS[key]); // km² to ha
    }, 0);

    const projectedCarbon = Object.entries(projected).reduce((sum, [key, val]) => {
      return sum + (val.area * 100 * CARBON_COEFFICIENTS[key]);
    }, 0);

    const carbonChange = projectedCarbon - baselineCarbon;
    const carbonChangePercent = baselineCarbon > 0 ? (carbonChange / baselineCarbon) * 100 : 0;

    // Calculate biodiversity impact (simplified index)
    const biodiversityScore = (
      (projected.Forest.area / TOTAL_AREA_KM2) * 40 +
      (projected.Water.area / TOTAL_AREA_KM2) * 20 +
      (projected.Agricultural_area.area / TOTAL_AREA_KM2) * 15 +
      (1 - projected.Built_up.area / TOTAL_AREA_KM2) * 25
    );

    const baselineBiodiversity = (
      (baseline.Forest.area / TOTAL_AREA_KM2) * 40 +
      (baseline.Water.area / TOTAL_AREA_KM2) * 20 +
      (baseline.Agricultural_area.area / TOTAL_AREA_KM2) * 15 +
      (1 - baseline.Built_up.area / TOTAL_AREA_KM2) * 25
    );

    const biodiversityChange = biodiversityScore - baselineBiodiversity;

    // Urban heat impact (simplified)
    const heatScore = (projected.Built_up.area / TOTAL_AREA_KM2) * 100;
    const baselineHeat = (baseline.Built_up.area / TOTAL_AREA_KM2) * 100;
    const heatChange = heatScore - baselineHeat;

    return {
      projected,
      carbon: {
        baseline: baselineCarbon,
        projected: projectedCarbon,
        change: carbonChange,
        changePercent: carbonChangePercent,
      },
      biodiversity: {
        baseline: baselineBiodiversity,
        projected: biodiversityScore,
        change: biodiversityChange,
      },
      urbanHeat: {
        baseline: baselineHeat,
        projected: heatScore,
        change: heatChange,
      },
    };
  }, [baseline, selectedTemplate, customChanges]);

  // Chart data for comparison
  const comparisonChartData = {
    labels: Object.keys(baseline).map(k => k.replace(/_/g, " ")),
    datasets: [
      {
        label: "Baseline (2025)",
        data: Object.values(baseline).map(v => v.percentage),
        backgroundColor: LAND_USE_CLASSES.map(lc => lc.color + "88"),
        borderRadius: 4,
      },
      {
        label: "Projected",
        data: Object.values(scenarioResults.projected).map(v => v.percentage),
        backgroundColor: LAND_USE_CLASSES.map(lc => lc.color),
        borderRadius: 4,
      },
    ],
  };

  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
      tooltip: { 
        backgroundColor: "rgba(15,23,42,0.9)", 
        padding: 10, 
        callbacks: { 
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%` 
        } 
      },
    },
    scales: {
      y: { 
        min: 0, 
        max: 100, 
        ticks: { callback: (v) => v + "%", font: { size: 10 } }, 
        grid: { color: "rgba(0,0,0,0.04)" } 
      },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  // Pie chart for projected distribution
  const pieChartData = {
    labels: Object.keys(scenarioResults.projected).map(k => k.replace(/_/g, " ")),
    datasets: [{
      data: Object.values(scenarioResults.projected).map(v => v.percentage),
      backgroundColor: LAND_USE_CLASSES.map(lc => lc.color),
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { usePointStyle: true, padding: 8, font: { size: 10 } } },
      tooltip: { 
        backgroundColor: "rgba(15,23,42,0.9)", 
        padding: 10, 
        callbacks: { 
          label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(1)}%` 
        } 
      },
    },
  };

  const handleCustomChange = (key, value) => {
    setCustomChanges(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h3 style={sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Interactive Scenario Planner
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Simulate land-use changes and analyze their environmental impacts. Select a template or create a custom scenario.
        </p>
      </div>

      {/* Scenario Selection */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
        {Object.entries(SCENARIO_TEMPLATES).map(([key, template]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedTemplate(key);
              setShowResults(false);
            }}
            style={{
              padding: "0.85rem 1rem",
              background: selectedTemplate === key ? "rgba(217,119,6,0.12)" : "var(--color-bg-secondary)",
              border: `2px solid ${selectedTemplate === key ? "var(--color-primary)" : "var(--color-border-light)"}`,
              borderRadius: "var(--radius-md)",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: selectedTemplate === key ? "var(--color-primary)" : "var(--color-text)", marginBottom: "0.25rem" }}>
              {template.name}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
              {template.description}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Scenario Editor */}
      {selectedTemplate === "custom" && (
        <div className="card" style={{ animationDelay: "0.1s" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
            Define Custom Changes (km²)
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {Object.keys(baseline).map((key) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                  {key.replace(/_/g, " ")}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="number"
                    value={customChanges[key]}
                    onChange={(e) => handleCustomChange(key, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border-light)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.9rem",
                      color: "var(--color-text)",
                    }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>km²</span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                  Current: {baseline[key]?.area.toFixed(1)} km²
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run Scenario Button */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button
          onClick={() => setShowResults(true)}
          style={{
            padding: "0.75rem 2rem",
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Run Scenario
        </button>
        <button
          onClick={() => {
            setSelectedTemplate("reforestation");
            setCustomChanges({ Water: 0, Built_up: 0, Forest: 0, Agricultural_area: 0 });
            setShowResults(false);
          }}
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border-light)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <div style={{ display: "grid", gap: "1.5rem", animation: "fadeIn 0.3s ease" }}>
          {/* KPI Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
            <KPICard
              label="Carbon Storage"
              value={`${(scenarioResults.carbon.projected / 1000000).toFixed(2)}M t`}
              sublabel={`Change: ${(scenarioResults.carbon.change / 1000).toFixed(0)}K tonnes`}
              color={scenarioResults.carbon.change >= 0 ? "#15803d" : "#dc2626"}
              trend={scenarioResults.carbon.changePercent}
            />
            <KPICard
              label="Biodiversity Score"
              value={scenarioResults.biodiversity.projected.toFixed(1)}
              sublabel={`Baseline: ${scenarioResults.biodiversity.baseline.toFixed(1)}`}
              color={scenarioResults.biodiversity.change >= 0 ? "#15803d" : "#dc2626"}
              trend={((scenarioResults.biodiversity.change / scenarioResults.biodiversity.baseline) * 100)}
            />
            <KPICard
              label="Urban Heat Index"
              value={scenarioResults.urbanHeat.projected.toFixed(1)}
              sublabel="Lower is better"
              color={scenarioResults.urbanHeat.change <= 0 ? "#15803d" : "#dc2626"}
              trend={-((scenarioResults.urbanHeat.change / scenarioResults.urbanHeat.baseline) * 100)}
            />
            <KPICard
              label="Forest Cover"
              value={`${scenarioResults.projected.Forest.percentage.toFixed(1)}%`}
              sublabel={`${scenarioResults.projected.Forest.area.toFixed(1)} km²`}
              color="#15803d"
              trend={scenarioResults.projected.Forest.changePercent}
            />
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.25rem" }}>
            {/* Comparison Bar Chart */}
            <div className="card" style={{ animationDelay: "0.1s" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
                Land Use Comparison
              </h4>
              <div style={{ height: 280 }}>
                <Bar data={comparisonChartData} options={comparisonChartOptions} />
              </div>
            </div>

            {/* Projected Distribution Pie */}
            <div className="card" style={{ animationDelay: "0.15s" }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
                Projected Distribution
              </h4>
              <div style={{ height: 280, display: "flex", justifyContent: "center" }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          </div>

          {/* Detailed Changes Table */}
          <div className="card" style={{ animationDelay: "0.2s" }}>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
              Detailed Changes
            </h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Class</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Baseline (km²)</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Projected (km²)</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Change (km²)</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right", background: "var(--color-bg-secondary)", borderBottom: "2px solid var(--color-border-light)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Change (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scenarioResults.projected).map(([key, value]) => {
                    const color = LAND_USE_CLASSES.find(lc => lc.key === key)?.color || "#666";
                    return (
                      <tr key={key}>
                        <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border-light)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{key.replace(/_/g, " ")}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums" }}>
                          {baseline[key]?.area.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {value.area.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums", color: value.change >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                          {value.change >= 0 ? "+" : ""}{value.change.toFixed(1)}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", borderBottom: "1px solid var(--color-border-light)", fontVariantNumeric: "tabular-nums", color: value.changePercent >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                          {value.changePercent >= 0 ? "+" : ""}{value.changePercent.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights */}
          <div style={{
            padding: "1.25rem",
            background: "rgba(217,119,6,0.06)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed rgba(217,119,6,0.3)",
          }}>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              AI-Powered Insights
            </h4>
            <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              {scenarioResults.carbon.change >= 0 ? (
                <p style={{ marginBottom: "0.5rem" }}>
                  ✅ <strong>Positive Carbon Impact:</strong> This scenario increases carbon storage by {(scenarioResults.carbon.change / 1000).toFixed(1)}K tonnes, 
                  equivalent to removing approximately {Math.abs(scenarioResults.carbon.change / 4.6).toFixed(0)} cars from the road annually.
                </p>
              ) : (
                <p style={{ marginBottom: "0.5rem" }}>
                  ⚠️ <strong>Carbon Alert:</strong> This scenario reduces carbon storage by {Math.abs(scenarioResults.carbon.change / 1000).toFixed(1)}K tonnes. 
                  Consider mitigation strategies such as urban forestry or soil carbon enhancement.
                </p>
              )}
              
              {scenarioResults.biodiversity.change >= 0 ? (
                <p style={{ marginBottom: "0.5rem" }}>
                  ✅ <strong>Biodiversity Gain:</strong> The biodiversity score improves by {Math.abs(scenarioResults.biodiversity.change).toFixed(1)} points, 
                  indicating better habitat connectivity and ecosystem health.
                </p>
              ) : (
                <p style={{ marginBottom: "0.5rem" }}>
                  ⚠️ <strong>Biodiversity Concern:</strong> The biodiversity score decreases by {Math.abs(scenarioResults.biodiversity.change).toFixed(1)} points. 
                  Consider creating wildlife corridors or protecting critical habitats.
                </p>
              )}

              {scenarioResults.urbanHeat.change <= 0 ? (
                <p>
                  ✅ <strong>Urban Heat Reduction:</strong> The urban heat index decreases by {Math.abs(scenarioResults.urbanHeat.change).toFixed(1)} points, 
                  potentially reducing cooling energy demand and improving urban livability.
                </p>
              ) : (
                <p>
                  ⚠️ <strong>Urban Heat Increase:</strong> The urban heat index increases by {scenarioResults.urbanHeat.change.toFixed(1)} points. 
                  Consider incorporating green roofs, urban parks, or cool pavement materials.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}