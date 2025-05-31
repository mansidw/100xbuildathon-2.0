// import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import RecruiterChatInterface from "./components/chat/RecruiterChatInterface";

const App = () => {
  const options = {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24",
  };
  
  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<RecruiterChatInterface />} />
      </Routes>
    </div>
  );
};

export default App;
