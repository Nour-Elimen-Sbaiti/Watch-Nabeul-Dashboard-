import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ theme, toggleTheme }) {
  const { pathname, hash } = useLocation();
  const active = (p, h = null) => {
    if (pathname !== p) return "";
    if (h !== null && hash !== h) return "";
    return "active";
  };

  return (
    <nav className="navbar">
      <style>{`
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0); }
          40%       { transform: translateY(-6px); }
          60%       { transform: translateY(-3px); }
        }
        @keyframes pulseRing1 {
          0%   { transform: translate(-50%, -50%) scale(0.7); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(2.1); opacity: 0; }
        }
        @keyframes pulseRing2 {
          0%   { transform: translate(-50%, -50%) scale(0.7); opacity: 0.55; }
          100% { transform: translate(-50%, -50%) scale(2.7); opacity: 0; }
        }
        @keyframes terrainScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes glowBreath {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(249,115,22,0.65)) drop-shadow(0 0 12px rgba(249,115,22,0.3)); }
          50%       { filter: drop-shadow(0 0 14px rgba(249,115,22,1))   drop-shadow(0 0 28px rgba(249,115,22,0.55)); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50%       { opacity: 0.2; transform: scale(0.5); }
        }
        @keyframes innerDotPulse {
          0%, 100% { r: 3.2; opacity: 1; }
          50%       { r: 2;   opacity: 0.6; }
        }
        @keyframes shineMove {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.9; }
        }
        @keyframes pillGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(22, 163, 74, 0.4); }
          50%      { box-shadow: 0 0 16px rgba(22, 163, 74, 0.7); }
        }

        .logo-glow-wrap {
          position: relative;
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          animation: glowBreath 2.6s ease-in-out infinite;
        }
        .logo-pulse-1 {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(251,191,36,0.9);
          top: 57%;
          left: 50%;
          pointer-events: none;
          animation: pulseRing1 1.9s ease-out infinite;
        }
        .logo-pulse-2 {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid rgba(249,115,22,0.65);
          top: 57%;
          left: 50%;
          pointer-events: none;
          animation: pulseRing2 1.9s ease-out 0.55s infinite;
        }
        .pin-group {
          animation: pinBounce 2.3s cubic-bezier(.4,0,.2,1) infinite;
          transform-origin: 23px 27px;
        }
        .terrain-scroll-group {
          animation: terrainScroll 3.2s linear infinite;
        }
        .shine-ellipse {
          animation: shineMove 2.3s ease-in-out infinite;
        }

        .navbar-link {
          position: relative;
          overflow: hidden;
        }
        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--color-primary);
          border-radius: 2px;
          transform: translateX(-50%);
          transition: width 0.25s ease;
        }
        .navbar-link:hover::after,
        .navbar-link.active::after {
          width: 60%;
        }
        
        .updated-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          background: rgba(22, 163, 74, 0.12);
          border: 1px solid rgba(22, 163, 74, 0.25);
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #16a34a;
          animation: pillGlow 2s ease-in-out infinite;
          white-space: nowrap;
        }
        
        .updated-pill::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
          animation: innerDotPulse 1.9s ease-in-out infinite;
        }
      `}</style>

      <div className="navbar-container">

        {/* ── Brand ───────────────────────────────────── */}
        <Link to="/" className="navbar-brand" style={{ textDecoration: "none" }}>

          <div className="logo-glow-wrap">
            {/* Pulse rings */}
            <div className="logo-pulse-1" />
            <div className="logo-pulse-2" />

            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#f97316" />
                  <stop offset="55%"  stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#9a3412" />
                </linearGradient>
                <linearGradient id="pinShine" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"   stopColor="#fff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.75" />
                </linearGradient>
                <clipPath id="logoClip">
                  <rect width="46" height="46" rx="12" />
                </clipPath>
              </defs>

              {/* Background rounded rect */}
              <rect width="46" height="46" rx="12" fill="url(#logoGrad)" />

              {/* Subtle inner highlight top-left */}
              <rect
                x="1" y="1" width="44" height="22" rx="11"
                fill="rgba(255,255,255,0.08)"
                clipPath="url(#logoClip)"
              />

              {/* Scrolling terrain waves — clipped to the icon */}
              <g clipPath="url(#logoClip)">
                {/* Wrapper that doubles the path for seamless loop */}
                <g className="terrain-scroll-group">
                  {/* first copy */}
                  <path
                    d="M0 33 Q5.75 29 11.5 33 Q17.25 37 23 33 Q28.75 29 34.5 33 Q40.25 37 46 33 L46 46 L0 46 Z"
                    fill="rgba(0,0,0,0.20)"
                  />
                  <path
                    d="M0 37 Q5.75 33.5 11.5 37 Q17.25 40.5 23 37 Q28.75 33.5 34.5 37 Q40.25 40.5 46 37 L46 46 L0 46 Z"
                    fill="rgba(0,0,0,0.14)"
                  />
                  {/* second copy (offset by 46px = icon width) */}
                  <path
                    d="M46 33 Q51.75 29 57.5 33 Q63.25 37 69 33 Q74.75 29 80.5 33 Q86.25 37 92 33 L92 46 L46 46 Z"
                    fill="rgba(0,0,0,0.20)"
                  />
                  <path
                    d="M46 37 Q51.75 33.5 57.5 37 Q63.25 40.5 69 37 Q74.75 33.5 80.5 37 Q86.25 40.5 92 37 L92 46 L46 46 Z"
                    fill="rgba(0,0,0,0.14)"
                  />
                </g>
              </g>

              {/* Map pin — bounces */}
              <g className="pin-group">
                {/* Pin drop shadow */}
                <ellipse cx="23" cy="27.5" rx="4" ry="1.5" fill="rgba(0,0,0,0.25)" />
                {/* Pin body */}
                <path
                  d="M23 6.5C18.86 6.5 15.5 9.86 15.5 14C15.5 19.75 23 28 23 28C23 28 30.5 19.75 30.5 14C30.5 9.86 27.14 6.5 23 6.5Z"
                  fill="url(#pinShine)"
                />
                {/* Inner dot */}
                <circle cx="23" cy="14" r="3.2" fill="#ea580c">
                  <animate attributeName="r" values="3.2;2.2;3.2" dur="1.9s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.55;1" dur="1.9s" repeatCount="indefinite" />
                </circle>
                {/* Shine highlight */}
                <ellipse
                  cx="20.2" cy="11.2" rx="1.5" ry="0.9"
                  fill="white" opacity="0.55"
                  transform="rotate(-20 20.2 11.2)"
                  className="shine-ellipse"
                />
              </g>

              {/* Dot grid — left side */}
              {[[8,25],[11,23],[8,29],[11,27],[8,33]].map(([cx,cy],i) => (
                <circle
                  key={`l${i}`}
                  cx={cx} cy={cy} r="1.3"
                  fill="rgba(255,255,255,0.5)"
                  style={{
                    animation: `dotBlink ${1.3 + i * 0.18}s ease-in-out ${i * 0.13}s infinite`
                  }}
                />
              ))}

              {/* Dot grid — right side */}
              {[[37,25],[40,23],[37,29],[40,27],[37,33]].map(([cx,cy],i) => (
                <circle
                  key={`r${i}`}
                  cx={cx} cy={cy} r="1.3"
                  fill="rgba(255,255,255,0.5)"
                  style={{
                    animation: `dotBlink ${1.5 + i * 0.18}s ease-in-out ${0.25 + i * 0.13}s infinite`
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Text */}
          <div>
            <h1 className="navbar-title">Watch Nabeul</h1>
            <p className="navbar-subtitle">DASHBOARD</p>
          </div>
        </Link>

        {/* ── Nav links ────────────────────────────────── */}
        <div className="navbar-links">

          <Link to="/" className={`navbar-link ${active("/")}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Home
          </Link>

          <Link to="/map" className={`navbar-link ${active("/map", "")}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
            Analysis Studio
          </Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
            {theme === "light"
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1"  x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1"  y1="12" x2="3"  y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                  <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
                </svg>
            }
          </button>
        </div>
      </div>
    </nav>
  );
}