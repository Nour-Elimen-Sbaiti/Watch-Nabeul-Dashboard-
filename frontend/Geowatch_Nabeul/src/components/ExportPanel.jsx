import { useState } from "react";
import {
  exportToCSV,
  exportToJSON,
  captureMapAsImage,
  generatePrintableReport,
  formatStatsForExport,
  formatChangeForExport,
} from "../utils/exportUtils";

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

const exportBtnStyle = (primary = false) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  padding: "0.7rem 1rem",
  borderRadius: "var(--radius-md)",
  border: primary
    ? "1.5px solid var(--color-primary)"
    : "1.5px solid var(--color-border-light)",
  background: primary ? "rgba(217,119,6,0.1)" : "var(--color-surface)",
  color: primary ? "var(--color-primary)" : "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
  marginBottom: "0.5rem",
});

const dropdownStyle = {
  width: "100%",
  padding: "0.65rem 1rem",
  paddingRight: "2.5rem",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--color-border-light)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d97706' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1rem center",
};

const notificationStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  padding: "12px 20px",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border-light)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "0.85rem",
  fontWeight: 600,
  animation: "slideIn 0.3s ease",
};

/* ─── Notification Component ─────────────────────────────────── */
function Notification({ message, type = "success", onClose }) {
  const bgColor = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#d97706";

  return (
    <div
      style={{
        ...notificationStyle,
        borderLeft: `4px solid ${bgColor}`,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={bgColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === "success" ? (
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        ) : (
          <circle cx="12" cy="12" r="10" />
        )}
        {type === "success" ? (
          <polyline points="22 4 12 14.01 9 11.01" />
        ) : (
          <line x1="12" y1="8" x2="12.01" y2="8" />
        )}
      </svg>
      <span style={{ color: "var(--color-text)" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Main Export Panel Component ────────────────────────────── */
export default function ExportPanel({
  tableStats,
  selectedYear,
  modelVariant,
  layerType,
  mapContainerId = "map-container",
}) {
  const [notification, setNotification] = useState(null);
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ── Export statistics data ────────────────────────────────── */
  const handleExportStats = () => {
    if (!tableStats) {
      showNotification("No statistics data available to export", "error");
      return;
    }

    setIsExporting(true);

    try {
      if (layerType === "change") {
        const changeData = formatChangeForExport(tableStats);
        const filename = `change_detection_2020_2025`;
        if (exportFormat === "csv") {
          exportToCSV(changeData, filename);
        } else {
          exportToJSON(changeData, filename);
        }
      } else {
        const statsData = formatStatsForExport(tableStats, selectedYear);
        const filename = `lulc_stats_${selectedYear}_${modelVariant}`;
        if (exportFormat === "csv") {
          exportToCSV(statsData, filename);
        } else {
          exportToJSON(statsData, filename);
        }
      }
      showNotification("Statistics exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      showNotification("Failed to export data", "error");
    }

    setIsExporting(false);
  };

  /* ── Export map as image ───────────────────────────────────── */
  const handleExportMap = () => {
    setIsExporting(true);
    const filename = `map_${layerType}_${selectedYear}_${modelVariant}`;

    captureMapAsImage(
      mapContainerId,
      filename,
      (dataUrl) => {
        showNotification("Map exported as image!");
        setIsExporting(false);
      }
    );
  };

  /* ── Generate printable report ─────────────────────────────── */
  const handleGenerateReport = () => {
    if (!tableStats) {
      showNotification("No data available for report", "error");
      return;
    }

    setIsExporting(true);

    try {
      const years = Object.keys(tableStats);
      
      // Build comprehensive KPIs for all years
      const kpis = [];
      years.forEach(year => {
        const yearData = tableStats[year] || {};
        const totalArea = Object.values(yearData).reduce((s, v) => s + (v.area || 0), 0);
        kpis.push({
          label: `Total Area (${year})`,
          value: `${totalArea.toFixed(1)} km²`,
          sub: `${Object.keys(yearData).length} land use classes`,
        });
      });

      // Add built-up and forest cover for selected year
      const selectedYearData = tableStats[selectedYear] || {};
      kpis.push(
        {
          label: `Built-up Cover (${selectedYear})`,
          value: `${(selectedYearData.Built_up?.percentage || 0).toFixed(1)}%`,
          sub: `${selectedYearData.Built_up?.area?.toFixed(0) || "—"} km²`,
        },
        {
          label: `Forest Cover (${selectedYear})`,
          value: `${(selectedYearData.Forest?.percentage || 0).toFixed(1)}%`,
          sub: `${selectedYearData.Forest?.area?.toFixed(0) || "—"} km²`,
        }
      );

      // Build comprehensive table with all years
      const allClasses = new Set();
      years.forEach(year => {
        Object.keys(tableStats[year] || {}).forEach(cls => allClasses.add(cls));
      });

      // Headers for multi-year comparison
      const headers = ["Land Use Class", ...years.flatMap(y => [`Area ${y} (km²)`, `% ${y}`])];
      
      const rows = Array.from(allClasses).map(className => {
        const row = { "Land Use Class": className.replace(/_/g, " ") };
        years.forEach(year => {
          const yearData = tableStats[year]?.[className];
          row[`Area ${year} (km²)`] = yearData?.area?.toFixed(2) || "0.00";
          row[`% ${year}`] = `${(yearData?.percentage || 0).toFixed(2)}%`;
        });
        return row;
      });

      // Calculate change statistics if multiple years available
      let changeSection = "";
      if (years.length >= 2) {
        const firstYear = years[0];
        const lastYear = years[years.length - 1];
        const changeRows = Array.from(allClasses).map(className => {
          const firstData = tableStats[firstYear]?.[className];
          const lastData = tableStats[lastYear]?.[className];
          const areaChange = (lastData?.area || 0) - (firstData?.area || 0);
          const pctChange = firstData?.area > 0 
            ? ((areaChange / firstData.area) * 100).toFixed(1)
            : "N/A";
          return {
            "Land Use Class": className.replace(/_/g, " "),
            "Area Change (km²)": areaChange.toFixed(2),
            "Percentage Change": `${pctChange > 0 ? "+" : ""}${pctChange}%`,
          };
        });

        changeSection = `
          <h2>Change Detection (${firstYear} → ${lastYear})</h2>
          <table>
            <thead>
              <tr>
                <th>Land Use Class</th>
                <th>Area Change (km²)</th>
                <th>Percentage Change</th>
              </tr>
            </thead>
            <tbody>
              ${changeRows.map(row => `
                <tr>
                  <td>${row["Land Use Class"]}</td>
                  <td style="color: ${parseFloat(row["Area Change (km²)"]) >= 0 ? '#16a34a' : '#dc2626'}">${row["Area Change (km²)"]}</td>
                  <td style="color: ${parseFloat(row["Percentage Change"]) >= 0 ? '#16a34a' : '#dc2626'}">${row["Percentage Change"]}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
      }

      generatePrintableReport({
        title: `Land Use Land Cover Analysis Report — ${years.join(" & ")}`,
        date: new Date().toLocaleString(),
        summary: `Comprehensive land use analysis for Nabeul region covering ${years.join(" and ")}. Total of ${allClasses.size} land use classes analyzed using ${modelVariant.toUpperCase()} classifier.`,
        stats: { kpis, headers, rows },
        charts: [],
        customSections: changeSection,
      });

      showNotification("Report generated — check your print dialog");
    } catch (err) {
      console.error("Report generation error:", err);
      showNotification("Failed to generate report", "error");
    }

    setIsExporting(false);
  };

  /* ── Export all data ───────────────────────────────────────── */
  const handleExportAll = () => {
    if (!tableStats) {
      showNotification("No data available to export", "error");
      return;
    }

    setIsExporting(true);

    try {
      const allData = {
        metadata: {
          generatedAt: new Date().toISOString(),
          region: "Nabeul Governorate, Tunisia",
          modelVariant,
          layerType,
          years: Object.keys(tableStats),
        },
        statistics: tableStats,
        exportFormat: "comprehensive",
      };

      exportToJSON(allData, `geowatch_full_export_${selectedYear}`);
      showNotification("All data exported successfully!");
    } catch (err) {
      console.error("Export all error:", err);
      showNotification("Failed to export data", "error");
    }

    setIsExporting(false);
  };

  return (
    <div>
      <h3 style={sectionTitle}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export & Share
      </h3>

      {/* Export format selector */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "0.4rem",
            fontFamily: "var(--font-body)",
          }}
        >
          Export Format
        </label>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          style={dropdownStyle}
        >
          <option value="csv">CSV (Spreadsheet)</option>
          <option value="json">JSON (Data interchange)</option>
        </select>
      </div>

      {/* Export buttons */}
      <button
        onClick={handleExportStats}
        disabled={isExporting}
        style={exportBtnStyle(true)}
        title={`Export current statistics as ${exportFormat.toUpperCase()}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Export Statistics
        {isExporting && (
          <span style={{ marginLeft: "auto" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="4" x2="12" y2="8" />
            </svg>
          </span>
        )}
      </button>

      <button
        onClick={handleExportMap}
        disabled={isExporting}
        style={exportBtnStyle(false)}
        title="Capture current map view as PNG image"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Export Map as Image
      </button>

      <button
        onClick={handleGenerateReport}
        disabled={isExporting}
        style={exportBtnStyle(false)}
        title="Generate a printable PDF report"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Generate Printable Report
      </button>

      <button
        onClick={handleExportAll}
        disabled={isExporting}
        style={exportBtnStyle(false)}
        title="Export all available data as JSON"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
        Export All Data (JSON)
      </button>

      {/* Help text */}
      <div
        style={{
          marginTop: "0.75rem",
          padding: "0.6rem 0.8rem",
          background: "rgba(217,119,6,0.06)",
          borderRadius: "var(--radius-sm)",
          border: "1px dashed rgba(217,119,6,0.3)",
          fontSize: "0.72rem",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "var(--color-primary)" }}>Tip:</strong> Use CSV for spreadsheet analysis,
        JSON for programmatic access, and the printable report for presentations.
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}