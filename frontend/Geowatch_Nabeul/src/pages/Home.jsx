import { useNavigate } from "react-router-dom";
import KPICard from "../components/KPICard";

export default function Home() {
  const navigate = useNavigate();

  const handleOpenStudio = () => {
    navigate("/map");
  };

  const handleHowItWorks = () => {
    // Scroll to how it works section
    const section = document.getElementById("how-it-works");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ 
      minHeight: "calc(100vh - 64px)",
      background: "var(--color-bg)",
    }}>
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section style={{
        padding: "4rem 2rem 3rem",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center",
      }}>
        <span style={{
          display: "inline-block",
          padding: "0.35rem 0.85rem",
          background: "rgba(217, 119, 6, 0.1)",
          border: "1px solid rgba(217, 119, 6, 0.2)",
          borderRadius: "99px",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "var(--color-primary)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "1.25rem",
        }}>
          Nabeul Governorate, Tunisia
        </span>
        
        <h1 style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: "clamp(2rem, 5vw, 3.5rem)", 
          fontWeight: 400,
          marginBottom: "1rem",
          background: "linear-gradient(135deg, var(--color-terracotta), var(--color-primary), var(--color-sage))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.2,
        }}>
          Watch Nabeul Dashboard
        </h1>
        
        <p style={{ 
          color: "var(--color-text-secondary)", 
          fontSize: "1.15rem",
          maxWidth: "650px",
          margin: "0 auto 2rem",
          lineHeight: 1.6,
        }}>
          Explore land-use maps, vegetation analysis, and detailed statistics for Nabeul Governorate. 
          Powered by Landsat 8/9 OLI satellite imagery (2020 – 2025).
        </p>

        <div style={{ 
          display: "flex", 
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <button 
            onClick={handleOpenStudio}
            style={{
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
              border: "none",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 4px 20px rgba(217, 119, 6, 0.3)",
              textDecoration: "none",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 28px rgba(217, 119, 6, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(217, 119, 6, 0.3)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Open Analysis Studio
          </button>
          
          <button 
            onClick={handleHowItWorks}
            style={{
              padding: "1rem 2rem",
              background: "var(--color-surface)",
              border: "1.5px solid var(--color-border-light)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none",
              color: "var(--color-text)",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.color = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--color-border-light)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            How it works ↗
          </button>
        </div>
      </section>

      {/* ─── Stats Strip ─────────────────────────────────── */}
      <section style={{
        padding: "0 2rem 3rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}>
          <KPICard 
            value="2,855"
            label="Total Area"
            subLabel="km²"
            color="var(--color-primary)"
            size="medium"
          />
          <KPICard 
            value="80.9%"
            label="CNN Accuracy"
            subLabel="Best model"
            color="#16a34a"
            size="medium"
          />
          <KPICard 
            value="+4.6%"
            label="Urban Growth"
            subLabel="Over 5 years"
            color="#dc2626"
            delta="2020→2025"
            size="medium"
          />
          <KPICard 
            value="4"
            label="Land Classes"
            subLabel="Classified"
            color="#0891b2"
            size="medium"
          />
        </div>
      </section>

      {/* ─── Feature Cards Section ─────────────────────────── */}
      <section style={{
        padding: "3rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <span style={{
          display: "block",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "var(--color-primary)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "0.5rem",
        }}>
          WHAT'S INSIDE
        </span>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 400,
          color: "var(--color-text)",
          marginBottom: "2rem",
        }}>
          Everything inside Analysis Studio
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}>
          {/* Card 1: Year Comparison */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "rgba(217, 119, 6, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-body)" }}>
              Year Comparison
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Interactive slider to compare land use between 2020 and 2025. See changes at a glance.
            </p>
            <a href="/map" style={{ 
              color: "var(--color-primary)", 
              fontWeight: 700, 
              fontSize: "0.85rem", 
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}>
              Open in studio ↗
            </a>
          </div>

          {/* Card 2: ML Models */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "rgba(8, 145, 178, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.92L12 10V2z"/>
                <path d="M8 14c0 3.31 2.69 6 6 6s6-2.69 6-6v-2c0-3.31-2.69-6-6-6"/>
                <path d="M8 10V6a4 4 0 0 1 4-4"/>
                <path d="M4 14c0 3.31 2.69 6 6 6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-body)" }}>
              CNN · RF · SVM Models
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Three machine learning classifiers for land use detection. Compare accuracy and results.
            </p>
            <a href="/map" style={{ 
              color: "var(--color-primary)", 
              fontWeight: 700, 
              fontSize: "0.85rem", 
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}>
              Open in studio ↗
            </a>
          </div>

          {/* Card 3: Rich Statistics */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "rgba(101, 163, 13, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-body)" }}>
              Rich Statistics
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Detailed area calculations, percentage coverage, change detection, and trend analysis.
            </p>
            <a href="/map" style={{ 
              color: "var(--color-primary)", 
              fontWeight: 700, 
              fontSize: "0.85rem", 
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}>
              Open in studio ↗
            </a>
          </div>

          {/* Card 4: Sentinel-2 Imagery */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "rgba(124, 58, 237, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-body)" }}>
              Sentinel-2 Imagery
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Real Google Earth Engine data with cloud masking and 10m spatial resolution.
            </p>
            <a href="/map" style={{ 
              color: "var(--color-primary)", 
              fontWeight: 700, 
              fontSize: "0.85rem", 
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}>
              Open in studio ↗
            </a>
          </div>

          {/* Card 5: Hydrology Overlay */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "rgba(8, 145, 178, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-body)" }}>
              Hydrology Overlay
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Toggle watershed boundaries and river networks for comprehensive geographic context.
            </p>
            <a href="/map" style={{ 
              color: "var(--color-primary)", 
              fontWeight: 700, 
              fontSize: "0.85rem", 
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}>
              Open in studio ↗
            </a>
          </div>

          {/* Card 6: Export & Download */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "rgba(220, 38, 38, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-body)" }}>
              Export & Download
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              Export your analysis as GeoTIFF, CSV spreadsheets, or PDF reports for further use.
            </p>
            <a href="/map" style={{ 
              color: "var(--color-primary)", 
              fontWeight: 700, 
              fontSize: "0.85rem", 
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}>
              Open in studio ↗
            </a>
          </div>
        </div>
      </section>

      {/* ─── Data Preview Section ─────────────────────────── */}
      <section style={{
        padding: "3rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
          <div>
            <span style={{
              display: "block",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
            }}>
              DATA PREVIEW
            </span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 400,
              color: "var(--color-text)",
              margin: 0,
            }}>
              2025 snapshot — Nabeul Governorate
            </h2>
          </div>
          <a href="/map" style={{ 
            color: "var(--color-primary)", 
            fontWeight: 700, 
            fontSize: "0.9rem", 
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}>
            Full analysis ↗
          </a>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}>
          {/* Left Panel: Class Coverage */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
          }}>
            <h3 style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1.25rem",
            }}>
              Class Coverage 2025 (CNN)
            </h3>
            {[
              { name: "Agricultural", pct: 64.6, color: "#65a30d" },
              { name: "Forest", pct: 30.4, color: "#15803d" },
              { name: "Built-up", pct: 4.5, color: "#dc2626" },
              { name: "Water", pct: 0.6, color: "#0891b2" },
            ].map((item) => (
              <div key={item.name} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.85rem",
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  background: item.color,
                  flexShrink: 0,
                }} />
                <span style={{
                  flex: 1,
                  fontSize: "0.9rem",
                  color: "var(--color-text)",
                  fontWeight: 500,
                }}>
                  {item.name}
                </span>
                <div style={{
                  flex: 2,
                  height: "8px",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${item.pct}%`,
                    height: "100%",
                    background: item.color,
                    borderRadius: "4px",
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <span style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: item.color,
                  fontVariantNumeric: "tabular-nums",
                  minWidth: "45px",
                  textAlign: "right",
                }}>
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Right Panel: Model Accuracy */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
          }}>
            <h3 style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1.25rem",
            }}>
              Model Accuracy
            </h3>
            {[
              { name: "CNN", pct: 88.0, label: "best", color: "#16a34a" },
              { name: "Random Forest", pct: 77.2, label: null, color: "#f59e0b" },
              { name: "SVM", pct: 74.8, label: null, color: "#6b7280" },
            ].map((item) => (
              <div key={item.name} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.85rem",
              }}>
                <span style={{
                  width: "110px",
                  fontSize: "0.9rem",
                  color: "var(--color-text)",
                  fontWeight: 500,
                }}>
                  {item.name}
                </span>
                <div style={{
                  flex: 1,
                  height: "8px",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${item.pct}%`,
                    height: "100%",
                    background: item.color,
                    borderRadius: "4px",
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <span style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: item.color,
                  fontVariantNumeric: "tabular-nums",
                  minWidth: "45px",
                  textAlign: "right",
                }}>
                  {item.pct}%
                </span>
                {item.label && (
                  <span style={{
                    padding: "0.15rem 0.5rem",
                    background: `${item.color}15`,
                    color: item.color,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    borderRadius: "99px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─────────────────────────── */}
      <section id="how-it-works" style={{
        padding: "3rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <span style={{
          display: "block",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "var(--color-primary)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "0.5rem",
        }}>
          HOW IT WORKS
        </span>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 400,
          color: "var(--color-text)",
          marginBottom: "2rem",
        }}>
          From satellite to insight in 4 steps
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}>
          {[
            {
              num: "01",
              title: "Acquire Imagery",
              desc: "Sentinel-2 L2A data from Google Earth Engine with automated cloud masking.",
              color: "var(--color-primary)",
            },
            {
              num: "02",
              title: "Classify Pixels",
              desc: "CNN, RF, or SVM assigns each pixel to one of 4 land cover classes.",
              color: "#0891b2",
            },
            {
              num: "03",
              title: "Detect Change",
              desc: "Pixel-level comparison between 2020 and 2025 classifications.",
              color: "#15803d",
            },
            {
              num: "04",
              title: "Explore & Export",
              desc: "Visualize on map, query statistics, and download results in multiple formats.",
              color: "#dc2626",
            },
          ].map((step) => (
            <div key={step.num} style={{
              padding: "1.5rem",
              background: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border-light)",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
              overflow: "hidden",
            }}>
              <span style={{
                position: "absolute",
                top: "-10px",
                right: "10px",
                fontSize: "4rem",
                fontWeight: 900,
                color: `${step.color}08`,
                lineHeight: 1,
              }}>
                {step.num}
              </span>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: `${step.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                position: "relative",
                zIndex: 1,
              }}>
                <span style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: step.color,
                }}>
                  {step.num}
                </span>
              </div>
              <h3 style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                fontFamily: "var(--font-body)",
                position: "relative",
                zIndex: 1,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: "0.88rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                position: "relative",
                zIndex: 1,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Analysis Studio CTA Section ─────────────────────────── */}
      <section style={{
        padding: "4rem 2rem",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(124, 58, 237, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </div>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(217, 119, 6, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          fontWeight: 400,
          color: "var(--color-text)",
          marginBottom: "0.75rem",
        }}>
          Map meets analysis — all in one place
        </h2>
        <p style={{
          fontSize: "1.05rem",
          color: "var(--color-text-secondary)",
          marginBottom: "1.5rem",
          maxWidth: "600px",
          margin: "0 auto",
          lineHeight: 1.6,
        }}>
          The Analysis Studio combines interactive mapping with powerful statistical tools for comprehensive land use analysis.
        </p>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}>
          {["Interactive map", "Live statistics", "3 classifiers", "Year comparison", "Export ready"].map((feature) => (
            <span key={feature} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.85rem",
              background: "rgba(22, 163, 74, 0.08)",
              borderRadius: "99px",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#16a34a",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {feature}
            </span>
          ))}
        </div>

        <button 
          onClick={handleOpenStudio}
          style={{
            padding: "1.1rem 2.5rem",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
            border: "none",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 20px rgba(217, 119, 6, 0.3)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.05rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(217, 119, 6, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(217, 119, 6, 0.3)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          Launch Analysis Studio
        </button>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer style={{
        padding: "2rem",
        borderTop: "1px solid var(--color-border-light)",
        background: "var(--color-surface)",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}>
            <a href="/about" style={{ 
              color: "var(--color-text-secondary)", 
              fontSize: "0.85rem", 
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
            >
              About
            </a>
            <a href="#data" style={{ 
              color: "var(--color-text-secondary)", 
              fontSize: "0.85rem", 
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
            >
              Data sources
            </a>
            <a href="#methodology" style={{ 
              color: "var(--color-text-secondary)", 
              fontSize: "0.85rem", 
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
            >
              Methodology
            </a>
            <a href="#contact" style={{ 
              color: "var(--color-text-secondary)", 
              fontSize: "0.85rem", 
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
            >
              Contact
            </a>
          </div>
          <span style={{
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
          }}>
            Watch Nabeul · Nabeul Governorate, Tunisia · 2025
          </span>
        </div>
      </footer>
    </div>
  );
}