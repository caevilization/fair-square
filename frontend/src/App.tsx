import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DetailPage from "./pages/DetailPage";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/detail" element={<DetailPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
