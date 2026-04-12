import React from 'react'
import ReactDOM from 'react-dom/client'
import CardOptimizer from './CardOptimizer.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CardOptimizer />
  </React.StrictMode>
)

// Registro del Service Worker para PWA (Limpio y sin duplicados)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log("✅ PWA lista"))
      .catch(err => console.log("SW error:", err));
  });
}
