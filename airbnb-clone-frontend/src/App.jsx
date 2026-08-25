/**
 * App.jsx – Root component.
 * Wraps the whole app in AuthProvider (JWT context) and sets up
 * client-side routing with React Router v6.
 */

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
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/locations" element={<Location />} />
          <Route path="/locations/:id" element={<LocationDetails />} />
          <Route path="/login" element={<Login />} />

          {/* Protected – Reservations redirects internally if unauthenticated */}
          <Route path="/reservations" element={<Reservations />} />

          {/* Catch-all: redirect unknown paths to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
