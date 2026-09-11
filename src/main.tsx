import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const container = document.getElementById('root');

// Thrown rather than optional-chained away. A silent no-op here renders a
// blank page with a clean console, which is the hardest kind of failure to
// diagnose - and the browser suite would report it as "element not found"
// somewhere unrelated.
if (!container) {
  throw new Error('No #root element in index.html, so the app has nowhere to mount.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
