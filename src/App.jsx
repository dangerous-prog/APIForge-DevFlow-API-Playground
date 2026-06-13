import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Playground from './pages/Playground'

// Import the Zustand store to ensure window.__addToHistory is wired up
import './store/useAppStore'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/playground" element={<Playground />} />
    </Routes>
  )
}

export default App
