// import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { PostHogProvider } from 'posthog-js/react';

 const options = {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24",
  };

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
   <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
    <App />
    </PostHogProvider>
  </BrowserRouter>,
  // </StrictMode>,
);
