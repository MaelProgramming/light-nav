import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './components/Map';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './index.css'
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}


export default App;
