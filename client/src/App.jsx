// import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import RecruiterChatInterface from "./components/chat/RecruiterChatInterface";

const App = () => {
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
