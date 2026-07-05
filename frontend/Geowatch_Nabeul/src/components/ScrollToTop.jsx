import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top every time the route changes.
 * React Router does NOT do this automatically — without this,
 * navigating to a new page keeps whatever scroll position you
 * had on the previous page.
 *
 * Usage: render this once, right inside <BrowserRouter>, above
 * your <Routes>. It renders nothing visible.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}