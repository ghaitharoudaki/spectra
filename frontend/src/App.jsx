import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import CosmosBackground from './components/CosmosBackground.jsx'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <CosmosBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>
    </div>
  )
}