import { createRoot } from 'react-dom/client';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { AuthProvider, useAuth } from './lib/authContext';
import { useEffect } from 'react';

import App from './App';

import './index.css';
function AuthInitializer() {
  const { token } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);
  return null;
}

// Set production API base URL (defaults to Render production backend)
const apiUrl = import.meta.env.VITE_API_URL || "https://homestay-website-1.onrender.com";
setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AuthInitializer />
    <App />
  </AuthProvider>
);
