import { Routes, Route } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import MapPage from "./pages/MapPage";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="*" element={<IntroPage />} />
      </Routes>
    </>
  );
}