import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SupabaseApp from './SupabaseApp';
import './index.css';
import reportWebVitals from './reportWebVitals';

// Determine which app version to use based on environment
const useSupabase = !!(
    process.env.REACT_APP_SUPABASE_URL &&
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        {useSupabase ? <SupabaseApp /> : <App />}
    </React.StrictMode>
);

// Enable Web Vitals reporting with enhanced console logging
// This will measure and report Core Web Vitals metrics
reportWebVitals();
