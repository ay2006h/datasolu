import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './locales/i18nContext';
import './index.css';
import { applyPalette, getPalette } from './theme/palette';

// Apply the saved visual identity before first paint
applyPalette(getPalette());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
