import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import Toolbar from "./components/Toolbar";
import AIPage from "./pages/AIPage";
import SiteGeneratorPage from "./pages/SiteGeneratorPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AgentsChatPage from "./pages/AgentsChatPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import ScrapPage from "./pages/ScrapPage";
import PuppeteerPage from "./pages/PuppeteerPage";

// ⬇️ Nauja: AI Game puslapis
import AIGamePage from "./pages/AIGamePage";

import "./index.css";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toolbar />
                <main className="page">
                    <div className="container">
                        <Routes>
                            <Route path="/" element={<AIPage />} />
                            <Route path="/ai" element={<AIPage />} />
                            <Route path="/generator" element={<SiteGeneratorPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/agents" element={<AgentsChatPage />} />
                            <Route path="/admin/users" element={<AdminUsersPage />} />
                            <Route path="/scrap" element={<ScrapPage />} />
                            <Route path="/puppeteer" element={<PuppeteerPage />} />

                            {/* ⬇️ Nauja: AI Game maršrutas */}
                            <Route path="/ai-game" element={<AIGamePage />} />

                            {/* Pasirenkama: seną „Gemini“ kelią nukreipiam į /ai-game */}
                            <Route path="/gemini" element={<Navigate to="/ai-game" replace />} />
                        </Routes>
                    </div>
                </main>
            </AuthProvider>
        </BrowserRouter>
    );
}
