import { createRoot } from 'react-dom/client';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { AuthProvider } from './lib/authContext';

import App from './App';

import './index.css';

// Wire auth token getter directly so token is synchronously available on initial render
setAuthTokenGetter(() => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('neel_kamal_admin_jwt');
});

// Set production API base URL (defaults to Render production backend)
const apiUrl = import.meta.env.VITE_API_URL || "https://homestay-website-1.onrender.com";
setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

