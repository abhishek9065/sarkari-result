import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './AppRouter';
import './styles.css';
import './v2-enhancements.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
