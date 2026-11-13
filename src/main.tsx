import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app/app'
import './index.css'

// The homepage sends a visitor who uses the app straight to /app/.
try {
  localStorage.setItem('debt-destroyer.uses-app', '1')
} catch {
  // Private mode: the homepage shows each time.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
