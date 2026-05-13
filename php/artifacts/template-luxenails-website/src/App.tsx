import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DrinkMenuPage from './pages/DrinkMenuPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/drink-menu" element={<DrinkMenuPage />} />
      </Routes>
    </Router>
  );
}

export default App;
