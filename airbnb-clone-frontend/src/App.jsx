import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Location from './pages/Location';
import LocationDetails from './pages/LocationDetails';
import Login from './pages/Login';
import Reservations from './pages/Reservations';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locations" element={<Location />} />
          <Route path="/locations/:id" element={<LocationDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reservations" element={<Reservations />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
