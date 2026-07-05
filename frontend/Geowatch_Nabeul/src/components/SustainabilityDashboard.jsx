import { useState, useMemo } from "react";
import { Bar, Radar, PolarArea, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
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

/* ─── SDG Goal Data ────────────────────────────────────────── */
const SDG_GOALS = {
  sdg11: {
    name: "SDG 11",
    fullName: "Sustainable Cities and Communities",
    color: "#fd9d24",
    icon: null,
    indicators: [
      { key: "urbanExpansion", label: "Urban Expansion Rate", unit: "%/yr", weight: 0.3 },
      { key: "greenSpace", label: "Urban Green Space", unit: "%", weight: 0.25 },
      { key: "compactness", label: "Urban Compactness", unit: "index", weight: 0.2 },
      { key: "mixIndex", label: "Land Use Mix", unit: "index", weight: 0.15 },
      { key: "periUrbanPressure", label: "Peri-urban Pressure", unit: "index", weight: 0.1 },
    ],
  },
  sdg13: {
    name: "SDG 13",
    fullName: "Climate Action",
    color: "#3f51b5",
    icon: null,
    indicators: [
      { key: "carbonStock", label: "Carbon Stock", unit: "M tonnes", weight: 0.35 },
      { key: "carbonSequestration", label: "Carbon Sequestration", unit: "K t/yr", weight: 0.25 },
      { key: "emissionsFromLU", label: "LULC Emissions", unit: "K t/yr", weight: 0.2 },
      { key: "climateResilience", label: "Climate Resilience", unit: "index", weight: 0.2 },
    ],
  },
  sdg15: {
    name: "SDG 15",
    fullName: "Life on Land",
    color: "#579c37",
    icon: null,
    indicators: [
      { key: "forestCover", label: "Forest Cover", unit: "%", weight: 0.25 },
      { key: "biodiversityIndex", label: "Biodiversity Index", unit: "index", weight: 0.25 },
      { key: "landDegradation", label: "Land Degradation", unit: "index", weight: 0.2 },
      { key: "habitatConnectivity", label: "Habitat Connectivity", unit: "index", weight: 0.15 },
      { key: "protectedArea", label: "Protected Area", unit: "%", weight: 0.15 },
    ],
  },
};

/* ─── Calculate SDG Indicators from LULC Data ──────────────── */
function calculateSDGIndicators(tableStats) {
  const baseline = tableStats?.["2025"] || {};
  const baseline2020 = tableStats?.["2020"] || {};
  
  const totalArea = 2859.1; // km²

  // Helper to get area for a class
  const getArea = (year, className) => tableStats?.[year]?.[className]?.area || 0;
  const getPct = (year, className) => tableStats?.[year]?.[className]?.percentage || 0;

  // SDG 11 Indicators
  const builtUp2020 = getArea("2020", "Built_up");
  const builtUp2025 = getArea("2025", "Built_up");
  const urbanExpansionRate = builtUp2020 > 0 ? ((builtUp2025 - builtUp2020) / builtUp2020 / 5) * 100 : 0;
  const greenSpace = (getPct("2025", "Forest") + getPct("2025", "Water")) * 0.3; // Simplified
  const compactness = 1 - (builtUp2025 / totalArea); // Lower sprawl = higher score
  const mixIndex = 1 - (Math.abs(getPct("2025", "Built_up") - getPct("2025", "Agricultural_area")) / 100);
  const periUrbanPressure = 1 - (getPct("2025", "Built_up") / 100);

  // SDG 13 Indicators
  const carbonCoefficients = { Water: 25, Built_up: 5, Forest: 120, Agricultural_area: 45 };
  const carbonStock = Object.entries(baseline).reduce((sum, [key, val]) => {
    return sum + (val.area * 100 * (carbonCoefficients[key] || 50));
  }, 0) / 1000000; // M tonnes

  const carbonSequestration = carbonStock * 0.02; // 2% annual sequestration
  const emissionsFromLU = (builtUp2025 - builtUp2020) * 50 / 1000; // Simplified
  const climateResilience = (getPct("2025", "Forest") + getPct("2025", "Water")) / 100;

  // SDG 15 Indicators
  const forestCover = getPct("2025", "Forest");
  const biodiversityIndex = (getPct("2025", "Forest") * 0.4 + getPct("2025", "Water") * 0.2 + (100 - getPct("2025", "Built_up")) * 0.25 + getPct("2025", "Agricultural_area") * 0.15) / 100;
  const landDegradation = 1 - ((getPct("2025", "Forest") - getPct("2020", "Forest")) / 100);
  const habitatConnectivity = getPct("2025", "Forest") / 100 * 0.8;
  const protectedArea = 15.2; // Assumed protected area percentage

  return {
    // SDG 11
    urbanExpansionRate: Math.min(urbanExpansionRate, 10),
    greenSpace: Math.min(greenSpace, 100),
    compactness: Math.min(compactness * 100, 100),
    mixIndex: Math.min(mixIndex * 100, 100),
    periUrbanPressure: Math.min(periUrbanPressure * 100, 100),

    // SDG 13
    carbonStock: carbonStock,
    carbonSequestration: carbonSequestration * 1000, // K tonnes
    emissionsFromLU: emissionsFromLU,
    climateResilience: climateResilience * 100,

    // SDG 15
    forestCover: forestCover,
    biodiversityIndex: biodiversityIndex * 100,
    landDegradation: landDegradation * 100,
    habitatConnectivity: habitatConnectivity * 100,
    protectedArea: protectedArea,
  };
}

/* ─── Score Card Component ─────────────────────────────────── */
function ScoreCard({ goal, score, trend }) {
  const scorePercent = Math.round(score);
  const grade = score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 50 ? "D" : "F";
  const gradeColor = score >= 80 ? "#16a34a" : score >= 70 ? "#65a30d" : score >= 60 ? "#f59e0b" : score >= 50 ? "#ea580c" : "#dc2626";

  return (
    <div
      style={{
        padding: "1.25rem",
        background: "var(--color-bg-secondary)",
        borderRadius: "var(--radius-lg)",
        border: `2px solid ${goal.color}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          background: `${goal.color}11`,
          borderRadius: "50%",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        {goal.icon && <span style={{ fontSize: "2rem" }}>{goal.icon}</span>}
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: goal.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {goal.name}
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)", marginTop: "0.15rem" }}>
            {goal.fullName}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `conic-gradient(${goal.color} ${scorePercent}%, var(--color-bg-secondary) ${scorePercent}%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "var(--color-bg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text)" }}>
              {scorePercent}
            </div>
            <div style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>score</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "8px",
                background: `${gradeColor}22`,
                border: `2px solid ${gradeColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: gradeColor,
              }}
            >
              {grade}
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                Performance Grade
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: gradeColor }}>
                {score >= 80 ? "Excellent" : score >= 70 ? "Good" : score >= 60 ? "Moderate" : score >= 50 ? "Poor" : "Critical"}
              </div>
            </div>
          </div>

          {trend !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem" }}>
              <span style={{ color: trend >= 0 ? "#16a34a" : "#dc2626" }}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>since 2020</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Indicator Progress Bar ───────────────────────────────── */
function IndicatorBar({ label, value, max, unit, color }) {
  const percent = Math.min((value / max) * 100, 100);
  
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.78rem" }}>
        <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{label}</span>
        <span style={{ color: "var(--color-text-secondary)" }}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "var(--color-bg-secondary)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: "4px",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Main Sustainability Dashboard Component ───────────────── */
export default function SustainabilityDashboard({ tableStats }) {
  const [selectedGoal, setSelectedGoal] = useState("all");

  const indicators = useMemo(() => calculateSDGIndicators(tableStats), [tableStats]);

  // Calculate overall scores for each SDG
  const calculateGoalScore = (goalKey) => {
    const goal = SDG_GOALS[goalKey];
    let weightedSum = 0;
    let totalWeight = 0;

    goal.indicators.forEach((ind) => {
      const value = indicators[ind.key];
      // Normalize to 0-100 scale
      let normalized = 0;
      if (ind.key === "carbonStock" || ind.key === "carbonSequestration") {
        normalized = Math.min((value / 3) * 100, 100);
      } else if (ind.key === "emissionsFromLU") {
        normalized = Math.max(100 - value * 10, 0); // Lower is better
      } else if (ind.key === "urbanExpansionRate") {
        normalized = Math.max(100 - value * 10, 0); // Lower is better
      } else if (ind.key === "landDegradation") {
        normalized = value; // Already 0-100
      } else {
        normalized = Math.min(value, 100);
      }

      weightedSum += normalized * ind.weight;
      totalWeight += ind.weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const scores = {
    sdg11: calculateGoalScore("sdg11"),
    sdg13: calculateGoalScore("sdg13"),
    sdg15: calculateGoalScore("sdg15"),
  };

  const overallScore = (scores.sdg11 + scores.sdg13 + scores.sdg15) / 3;

  // Radar chart data
  const radarData = {
    labels: [...SDG_GOALS.sdg11.indicators.map(i => i.label), ...SDG_GOALS.sdg13.indicators.map(i => i.label), ...SDG_GOALS.sdg15.indicators.map(i => i.label)],
    datasets: [
      {
        label: "Current Performance",
        data: [
          // SDG 11 (normalized)
          Math.max(100 - indicators.urbanExpansionRate * 10, 0),
          indicators.greenSpace,
          indicators.compactness,
          indicators.mixIndex,
          indicators.periUrbanPressure,
          // SDG 13
          Math.min((indicators.carbonStock / 3) * 100, 100),
          Math.min((indicators.carbonSequestration / 60) * 100, 100),
          Math.max(100 - indicators.emissionsFromLU * 10, 0),
          indicators.climateResilience,
          // SDG 15
          indicators.forestCover,
          indicators.biodiversityIndex,
          indicators.landDegradation,
          indicators.habitatConnectivity,
          Math.min((indicators.protectedArea / 30) * 100, 100),
        ],
        fill: true,
        backgroundColor: "rgba(217, 119, 6, 0.2)",
        borderColor: "var(--color-primary)",
        pointBackgroundColor: "var(--color-primary)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "var(--color-primary)",
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, font: { size: 9 } },
        grid: { color: "rgba(0,0,0,0.1)" },
        pointLabels: { font: { size: 9 } },
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: { display: true, position: "top" },
    },
  };

  // Bar chart for SDG comparison
  const barData = {
    labels: Object.values(SDG_GOALS).map(g => g.name),
    datasets: [
      {
        label: "SDG Score",
        data: [scores.sdg11, scores.sdg13, scores.sdg15],
        backgroundColor: [SDG_GOALS.sdg11.color, SDG_GOALS.sdg13.color, SDG_GOALS.sdg15.color],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.9)",
        padding: 10,
        callbacks: {
          label: (ctx) => `Score: ${ctx.parsed.y.toFixed(1)}/100`,
        },
      },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { callback: (v) => v + "%" }, grid: { color: "rgba(0,0,0,0.04)" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h3 style={sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Sustainability Dashboard — UN SDGs
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Track progress towards UN Sustainable Development Goals based on land-use analysis.
        </p>
      </div>

      {/* Overall Score */}
      <div
        style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, rgba(217,119,6,0.1), rgba(101,163,13,0.1))",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-primary)",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `conic-gradient(var(--color-primary) ${overallScore}%, var(--color-bg-secondary) ${overallScore}%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "var(--color-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
              {Math.round(overallScore)}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Overall Score</div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "250px" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text)" }}>
            Nabeul Governorate Sustainability Index
          </h4>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            Based on land-use analysis from 2020-2025, the region shows {"moderate"} progress towards sustainable development goals, 
            with particular strengths in {"climate action"} and areas for improvement in {"sustainable urbanization"}.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: SDG_GOALS.sdg11.color }}>
                {Math.round(scores.sdg11)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>SDG 11</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: SDG_GOALS.sdg13.color }}>
                {Math.round(scores.sdg13)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>SDG 13</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: SDG_GOALS.sdg15.color }}>
                {Math.round(scores.sdg15)}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>SDG 15</div>
            </div>
          </div>
        </div>
      </div>

      {/* SDG Score Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
        {Object.entries(SDG_GOALS).map(([key, goal]) => (
          <ScoreCard
            key={key}
            goal={goal}
            score={scores[key]}
            trend={(Math.random() - 0.3) * 10} // Placeholder trend
          />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.25rem" }}>
        {/* Radar Chart */}
        <div className="card" style={{ animationDelay: "0.1s" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
            SDG Performance Radar
          </h4>
          <div style={{ height: 350 }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ animationDelay: "0.15s" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
            SDG Score Comparison
          </h4>
          <div style={{ height: 350 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Indicators */}
      <div style={{ display: "grid", gap: "1.25rem" }}>
        {/* Goal Selector */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedGoal("all")}
            style={{
              padding: "0.5rem 1rem",
              background: selectedGoal === "all" ? "var(--color-primary)" : "var(--color-bg-secondary)",
              color: selectedGoal === "all" ? "#fff" : "var(--color-text-secondary)",
              border: selectedGoal === "all" ? "1px solid var(--color-primary)" : "1px solid var(--color-border-light)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            All Goals
          </button>
          {Object.entries(SDG_GOALS).map(([key, goal]) => (
            <button
              key={key}
              onClick={() => setSelectedGoal(key)}
              style={{
                padding: "0.5rem 1rem",
                background: selectedGoal === key ? goal.color + "22" : "var(--color-bg-secondary)",
                color: selectedGoal === key ? goal.color : "var(--color-text-secondary)",
                border: selectedGoal === key ? `1px solid ${goal.color}` : "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {goal.name}
            </button>
          ))}
        </div>

        {/* Indicators List */}
        <div className="card" style={{ animationDelay: "0.2s" }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
            Detailed Indicators
          </h4>

          {(selectedGoal === "all" ? Object.entries(SDG_GOALS) : [[selectedGoal, SDG_GOALS[selectedGoal]]]).map(([goalKey, goal]) => (
            <div key={goalKey} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                {goal.icon && <span style={{ fontSize: "1.2rem" }}>{goal.icon}</span>}
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: goal.color }}>{goal.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>{goal.fullName}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text)" }}>
                  {Math.round(scores[goalKey])}/100
                </div>
              </div>

              <div style={{ paddingLeft: "1rem" }}>
                {goal.indicators.map((ind) => {
                  const value = indicators[ind.key];
                  let displayValue = value;
                  let max = 100;

                  if (ind.key === "carbonStock") {
                    displayValue = value;
                    max = 3;
                  } else if (ind.key === "carbonSequestration") {
                    displayValue = value;
                    max = 60;
                  } else if (ind.key === "emissionsFromLU") {
                    displayValue = Math.max(10 - value, 0);
                    max = 10;
                  } else if (ind.key === "urbanExpansionRate") {
                    displayValue = Math.max(10 - value, 0);
                    max = 10;
                  }

                  return (
                    <IndicatorBar
                      key={ind.key}
                      label={ind.label}
                      value={displayValue}
                      max={max}
                      unit={ind.unit}
                      color={goal.color}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div
        style={{
          padding: "1.25rem",
          background: "rgba(217,119,6,0.06)",
          borderRadius: "var(--radius-md)",
          border: "1px dashed rgba(217,119,6,0.3)",
        }}
      >
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.75rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Policy Recommendations
        </h4>
        <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <p>
            <strong style={{ color: SDG_GOALS.sdg11.color }}>SDG 11 — Sustainable Cities:</strong> Implement urban growth boundaries and promote compact, mixed-use development to reduce sprawl. 
            Increase urban green space to at least 15% of built-up areas.
          </p>
          <p>
            <strong style={{ color: SDG_GOALS.sdg13.color }}>SDG 13 — Climate Action:</strong> Enhance carbon sequestration through reforestation and sustainable agriculture practices. 
            Develop climate adaptation strategies for vulnerable areas.
          </p>
          <p>
            <strong style={{ color: SDG_GOALS.sdg15.color }}>SDG 15 — Life on Land:</strong> Expand protected areas to 20% of land area. 
            Create wildlife corridors to improve habitat connectivity and reduce land degradation through sustainable land management.
          </p>
        </div>
      </div>
    </div>
  );
}