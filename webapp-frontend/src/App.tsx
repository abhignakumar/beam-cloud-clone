import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "@/components/landing-page";
import { NavBar } from "@/components/nav-bar";
import LoginPage from "@/components/login-page";
import SignupPage from "@/components/signup-page";
import { Toaster } from "@/components/ui/sonner";
import DashboardPage from "@/components/dashboard-page";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
        <Toaster richColors theme="light" />
      </BrowserRouter>
    </div>
  );
}

export default App;
