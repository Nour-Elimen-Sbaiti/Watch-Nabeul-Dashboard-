import { useState, useRef } from "react";
import {
  Bar, Line, Pie, Doughnut,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
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

/* ─── Report Templates ──────────────────────────────────────── */
const REPORT_TEMPLATES = {
  comprehensive: {
    name: "Comprehensive Report",
    description: "Full analysis with all sections, charts, and insights",
    sections: ["executive", "overview", "change", "environmental", "projections", "recommendations"],
  },
  executive: {
    name: "Executive Summary",
    description: "High-level overview with key metrics and recommendations",
    sections: ["executive", "overview", "recommendations"],
  },
  technical: {
    name: "Technical Report",
    description: "Detailed analysis with methodology and statistical data",
    sections: ["overview", "change", "environmental", "accuracy"],
  },
  environmental: {
    name: "Environmental Focus",
    description: "Carbon, biodiversity, and ecosystem services analysis",
    sections: ["executive", "environmental", "projections"],
  },
};

/* ─── AI Insight Generator ──────────────────────────────────── */
function generateAIInsights(tableStats, selectedTemplate) {
  const baseline = tableStats?.["2025"] || {};
  const baseline2020 = tableStats?.["2020"] || {};
  
  const insights = [];

  // Urban expansion analysis
  const builtUp2020 = baseline2020?.Built_up?.area || 0;
  const builtUp2025 = baseline?.Built_up?.area || 0;
  const builtUpChange = ((builtUp2025 - builtUp2020) / builtUp2020 * 100).toFixed(1);
  
  insights.push({
    category: "Urban Development",
    icon: null,
    sentiment: builtUpChange > 50 ? "warning" : "neutral",
    text: `Built-up areas have ${builtUpChange > 0 ? "increased" : "decreased"} by ${Math.abs(builtUpChange)}% since 2020, indicating ${builtUpChange > 50 ? "rapid urbanization that may strain infrastructure" : "moderate urban growth"}.`,
  });

  // Forest analysis
  const forest2020 = baseline2020?.Forest?.area || 0;
  const forest2025 = baseline?.Forest?.area || 0;
  const forestChange = ((forest2025 - forest2020) / forest2020 * 100).toFixed(1);
  
  insights.push({
    category: "Forest Cover",
    icon: null,
    sentiment: forestChange >= 0 ? "positive" : "warning",
    text: `Forest cover has ${forestChange >= 0 ? "increased" : "decreased"} by ${Math.abs(forestChange)}%, ${forestChange >= 0 ? "demonstrating effective conservation efforts" : "raising concerns about deforestation pressure"}.`,
  });

  // Agricultural analysis
  const ag2020 = baseline2020?.Agricultural_area?.area || 0;
  const ag2025 = baseline?.Agricultural_area?.area || 0;
  const agChange = ((ag2025 - ag2020) / ag2020 * 100).toFixed(1);
  
  insights.push({
    category: "Agriculture Area",
    icon: null,
    sentiment: Math.abs(agChange) < 5 ? "positive" : "neutral",
    text: `Agricultural land has ${agChange >= 0 ? "expanded" : "contracted"} by ${Math.abs(agChange)}%, ${Math.abs(agChange) < 5 ? "maintaining stable food production capacity" : "suggesting shifts in land use priorities"}.`,
  });

  // Water analysis
  const water2020 = baseline2020?.Water?.area || 0;
  const water2025 = baseline?.Water?.area || 0;
  const waterChange = ((water2025 - water2020) / water2020 * 100).toFixed(1);
  
  insights.push({
    category: "Water Resources",
    icon: null,
    sentiment: waterChange >= 0 ? "positive" : "warning",
    text: `Water bodies have ${waterChange >= 0 ? "expanded" : "shrunk"} by ${Math.abs(waterChange)}%, ${waterChange < -20 ? "indicating potential drought or water management issues" : "showing relative stability in water resources"}.`,
  });

  // Carbon storage estimate
  const carbonCoefficients = { Water: 25, Built_up: 5, Forest: 120, Agricultural_area: 45 };
  const carbonStock = Object.entries(baseline).reduce((sum, [key, val]) => {
    return sum + (val.area * 100 * (carbonCoefficients[key] || 50));
  }, 0) / 1000000;

  insights.push({
    category: "Carbon Storage",
    icon: null,
    sentiment: "positive",
    text: `Total carbon storage is estimated at ${carbonStock.toFixed(2)} million tonnes, with forest areas contributing approximately ${(carbonStock * 0.7).toFixed(1)} million tonnes (70%).`,
  });

  return insights;
}

/* ─── Generate Recommendations ──────────────────────────────── */
function generateRecommendations(tableStats) {
  const baseline = tableStats?.["2025"] || {};
  const baseline2020 = tableStats?.["2020"] || {};
  
  const recommendations = [];

  const builtUp2020 = baseline2020?.Built_up?.area || 0;
  const builtUp2025 = baseline?.Built_up?.area || 0;
  const builtUpPct = baseline?.Built_up?.percentage || 0;

  if (builtUpPct > 10) {
    recommendations.push({
      priority: "high",
      category: "Urban Planning",
      text: "Implement urban growth boundaries to prevent sprawl and promote compact, sustainable development patterns.",
    });
  }

  const forestPct = baseline?.Forest?.percentage || 0;
  if (forestPct < 30) {
    recommendations.push({
      priority: "high",
      category: "Conservation",
      text: "Launch reforestation initiatives targeting 35% forest cover to enhance biodiversity and carbon sequestration.",
    });
  }

  const agPct = baseline?.Agricultural_area?.percentage || 0;
  if (agPct > 60) {
    recommendations.push({
      priority: "medium",
      category: "Agricultural Area",
      text: "Promote sustainable agricultural practices and precision farming to reduce environmental impact while maintaining productivity.",
    });
  }

  const waterPct = baseline?.Water?.percentage || 0;
  if (waterPct < 2) {
    recommendations.push({
      priority: "medium",
      category: "Water Management",
      text: "Develop integrated water resource management strategies to ensure sustainable water supply for all users.",
    });
  }

  recommendations.push({
    priority: "high",
    category: "Monitoring",
    text: "Establish continuous land-use monitoring systems to track changes and inform evidence-based policy decisions.",
  });

  recommendations.push({
    priority: "medium",
    category: "Climate Action",
    text: "Integrate land-use planning with climate adaptation strategies to build resilience against climate change impacts.",
  });

  return recommendations;
}

/* ─── Main Report Generator Component ───────────────────────── */
export default function ReportGenerator({ tableStats, chartStats, accuracy, changeData }) {
  const [selectedTemplate, setSelectedTemplate] = useState("comprehensive");
  const [reportTitle, setReportTitle] = useState("Nabeul Land Use Analysis Report");
  const [reportSubtitle, setReportSubtitle] = useState("Comprehensive Analysis 2020-2025");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const reportRef = useRef(null);

  const aiInsights = generateAIInsights(tableStats, selectedTemplate);
  const recommendations = generateRecommendations(tableStats);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const report = {
        title: reportTitle,
        subtitle: reportSubtitle,
        template: selectedTemplate,
        generatedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        sections: REPORT_TEMPLATES[selectedTemplate].sections,
        insights: aiInsights,
        recommendations: recommendations,
        stats: tableStats,
      };
      
      setGeneratedReport(report);
      setIsGenerating(false);
    }, 1500);
  };

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll show an alert
    alert("PDF export functionality would be implemented here. In production, this would use libraries like jsPDF or html2pdf to generate a downloadable PDF report.");
  };

  const handleExportHTML = () => {
    if (reportRef.current) {
      const htmlContent = reportRef.current.innerHTML;
      const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; color: #1c1917; }
            h1 { color: #d97706; border-bottom: 3px solid #d97706; padding-bottom: 10px; }
            h2 { color: #15803d; margin-top: 30px; }
            h3 { color: #65a30d; }
            .insight { background: #f5f5f4; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #d97706; }
            .recommendation { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #15803d; }
            .metric { display: inline-block; background: #fef3c7; padding: 10px 20px; border-radius: 8px; margin: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #e7e5e4; padding: 10px; text-align: left; }
            th { background: #f5f5f4; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `], { type: "text/html" });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, "_")}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h3 style={sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          AI-Powered Report Generator
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          Generate comprehensive reports with AI-powered insights and recommendations.
        </p>
      </div>

      {/* Report Configuration */}
      <div className="card" style={{ animationDelay: "0.05s" }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text)" }}>
          Report Configuration
        </h4>

        <div style={{ display: "grid", gap: "1rem" }}>
          {/* Report Title */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
              Report Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9rem",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Report Subtitle */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
              Subtitle
            </label>
            <input
              type="text"
              value={reportSubtitle}
              onChange={(e) => setReportSubtitle(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.85rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9rem",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Template Selection */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
              Report Template
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
              {Object.entries(REPORT_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
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
          </div>

          {/* Generate Button */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "0.5rem" }}>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              style={{
                padding: "0.75rem 2rem",
                background: isGenerating ? "var(--color-text-muted)" : "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: isGenerating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease",
              }}
            >
              {isGenerating ? (
                <>
                  <div style={{
                    width: 18, height: 18,
                    border: "2px solid #fff",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Generating...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* Export Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={handleExportPDF}
              style={{
                padding: "0.6rem 1.25rem",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleExportHTML}
              style={{
                padding: "0.6rem 1.25rem",
                background: "var(--color-bg-secondary)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Export HTML
            </button>
            <button
              onClick={() => {
                if (reportRef.current) {
                  reportRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              style={{
                padding: "0.6rem 1.25rem",
                background: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Preview Report
            </button>
          </div>

          {/* Report Preview */}
          <div
            ref={reportRef}
            style={{
              padding: "2rem",
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border-light)",
              boxShadow: "var(--shadow-md)",
              color: "#1c1917",
            }}
          >
            {/* Report Header */}
            <div style={{ textAlign: "center", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "3px solid #d97706" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#d97706", marginBottom: "0.5rem" }}>
                {generatedReport.title}
              </h1>
              <p style={{ fontSize: "1rem", color: "#78716c", marginBottom: "0.5rem" }}>
                {generatedReport.subtitle}
              </p>
              <p style={{ fontSize: "0.8rem", color: "#a8a29e" }}>
                Generated on {generatedReport.generatedAt}
              </p>
            </div>

            {/* Executive Summary */}
            {generatedReport.sections.includes("executive") && (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#15803d", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Executive Summary
                </h2>
                <div style={{ background: "#f5f5f4", padding: "1.25rem", borderRadius: "8px", borderLeft: "4px solid #d97706" }}>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#44403c" }}>
                    This report provides a comprehensive analysis of land-use changes in Nabeul Governorate from 2020 to 2025. 
                    The analysis reveals significant trends in urbanization, agricultural land use, forest cover, and water resources. 
                    Key findings indicate {"moderate urban expansion"} and {"stable forest coverage"}, with implications for sustainable development planning.
                  </p>
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#15803d", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                AI-Powered Insights
              </h2>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {generatedReport.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="insight"
                    style={{
                      background: insight.sentiment === "positive" ? "#f0fdf4" : insight.sentiment === "warning" ? "#fef3c7" : "#f5f5f4",
                      padding: "1rem 1.25rem",
                      borderRadius: "8px",
                      borderLeft: `4px solid ${insight.sentiment === "positive" ? "#16a34a" : insight.sentiment === "warning" ? "#f59e0b" : "#d97706"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      {insight.icon && <span style={{ fontSize: "1.3rem" }}>{insight.icon}</span>}
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#78716c", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                          {insight.category}
                        </div>
                        <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#44403c" }}>
                          {insight.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#15803d", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Strategic Recommendations
              </h2>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {generatedReport.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="recommendation"
                    style={{
                      background: rec.priority === "high" ? "#fef2f2" : "#f0fdf4",
                      padding: "1rem 1.25rem",
                      borderRadius: "8px",
                      borderLeft: `4px solid ${rec.priority === "high" ? "#dc2626" : "#16a34a"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span style={{
                        padding: "0.2rem 0.5rem",
                        background: rec.priority === "high" ? "#dc2626" : "#16a34a",
                        color: "#fff",
                        borderRadius: "4px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}>
                        {rec.priority} Priority
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#78716c" }}>
                        {rec.category}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#44403c" }}>
                      {rec.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#15803d", marginBottom: "1rem" }}>
                Key Metrics Summary
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {LAND_USE_CLASSES.map((lc) => {
                  const area2025 = tableStats?.["2025"]?.[lc.key]?.area || 0;
                  const pct2025 = tableStats?.["2025"]?.[lc.key]?.percentage || 0;
                  return (
                    <div
                      key={lc.key}
                      className="metric"
                      style={{
                        background: `${lc.color}11`,
                        border: `1px solid ${lc.color}33`,
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, color: lc.color, marginBottom: "0.2rem" }}>
                        {lc.name}
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1c1917" }}>
                        {area2025.toFixed(1)} km²
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                        {pct2025.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}