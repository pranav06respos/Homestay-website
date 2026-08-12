import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Set production API base URL (defaults to Render production backend)
const apiUrl = import.meta.env.VITE_API_URL || "https://homestay-website-1.onrender.com";
setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(<App />);
