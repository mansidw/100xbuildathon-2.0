// import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import { PostHogProvider } from "posthog-js/react";

const App = () => {
  const options = {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24",
  };
  
  return (
    <div>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={options}
      >
        <Toaster position="bottom-right" richColors />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </PostHogProvider>
    </div>
  );
};

export default App;
