// import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import RecruiterChatInterface from "./components/chat/RecruiterChatInterface";
import Dashboard from "./pages/Dashboard";
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  if (!localStorage.getItem('user_id')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const App = () => {

  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ProtectedRoute><RecruiterChatInterface /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;
