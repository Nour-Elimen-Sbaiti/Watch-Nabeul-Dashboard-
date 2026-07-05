import { useEffect, useState } from "react";
import { Bar, Radar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { LAND_USE_CLASSES } from "../services/rasterConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const DEFAULT = {
  "2020": { Water: { area: 820.0, percentage: 7.9 }, Built_up: { area: 1560.0, percentage: 15.0 }, Forest: { area: 2100.0, percentage: 20.2 }, Agricultural_area: { area: 5910.0, percentage: 56.9 } },
  "2025": { Water: { area: 760.0, percentage: 7.3 }, Built_up: { area: 2200.0, percentage: 21.2 }, Forest: { area: 1900.0, percentage: 18.3 }, Agricultural_area: { area: 5530.0, percentage: 53.2 } }
};

export default function AdvancedCharts({ stats }) {
  const data = stats || DEFAULT;
  const COLORS = Object.fromEntries(LAND_USE_CLASSES.map((c) => [c.key, c.color]));

  const barData = {
    labels: ["2020", "2025"],
    datasets: LAND_USE_CLASSES.map((cls) => ({
      label: cls.key.replace("_", " "),
      data: ["2020", "2025"].map((y) => data[y]?.[cls.key]?.area || 0),
      backgroundColor: cls.color, borderColor: cls.color, borderWidth: 1, borderRadius: 5
    }))
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "rect", padding: 16, font: { size: 11 } } }, tooltip: { backgroundColor: "rgba(28,25,23,.9)", padding: 12, cornerRadius: 8, callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y.toFixed(1)} km²` } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => `${v}`, font: { size: 11 } }, grid: { color: "rgba(217,119,6,0.07)" } }, x: { grid: { display: false } } },
    animation: { duration: 1400, easing: "easeOutQuart" }
  };

  const radarData = {
    labels: LAND_USE_CLASSES.map((c) => c.key.replace("_", " ")),
    datasets: [
      { label: "2020", data: LAND_USE_CLASSES.map((c) => data["2020"]?.[c.key]?.percentage || 0), borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.15)", pointBackgroundColor: "#f59e0b", pointBorderColor: "#fff", borderWidth: 3, pointRadius: 5 },
      { label: "2025", data: LAND_USE_CLASSES.map((c) => data["2025"]?.[c.key]?.percentage || 0), borderColor: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.15)", pointBackgroundColor: "#8b5cf6", pointBorderColor: "#fff", borderWidth: 3, pointRadius: 5 }
    ]
  };
  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 16, font: { size: 11 } } }, tooltip: { backgroundColor: "rgba(28,25,23,.9)", padding: 12, cornerRadius: 8 } },
    scales: { r: { beginAtZero: true, max: 65, ticks: { stepSize: 15, callback: (v) => `${v}%`, font: { size: 10 } }, grid: { color: "rgba(156,163,175,0.2)" }, angleLines: { color: "rgba(156,163,175,0.2)" } } },
    animation: { duration: 1400 }
  };

  const cardStyle = {
    background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)",
    padding: "1.25rem", border: "1px solid var(--color-border-light)",
    transition: "all 0.3s ease"
  };

  const titleStyle = {
    fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text)",
    marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem",
    paddingBottom: "0.65rem", borderBottom: "1px solid var(--color-border-light)"
  };

  return (
    <div style={{ padding: "0.25rem 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
      <div style={cardStyle}>
        <div style={titleStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>
          Area Comparison (km²)
        </div>
        <div style={{ height: "260px" }}><Bar data={barData} options={barOpts} /></div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg>
          Distribution Profile
        </div>
        <div style={{ height: "260px" }}><Radar data={radarData} options={radarOpts} /></div>
      </div>
    </div>
  );
}