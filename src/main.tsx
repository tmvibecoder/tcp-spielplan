import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ScoreEntryPage from './components/ScoreEntryPage.tsx'

const isScorePage = new URLSearchParams(window.location.search).has("score");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isScorePage ? <ScoreEntryPage /> : <App />}
  </StrictMode>,
)
