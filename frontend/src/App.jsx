import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AddRecord from './pages/AddRecord';
import RecordDetail from './pages/RecordDetail';
import BlockchainView from './pages/BlockchainView';
import ShareView from './pages/ShareView';
// New modules
import MedicinePrices   from './pages/MedicinePrices';
import GenericDrugs     from './pages/GenericDrugs';
import DiagnosisCompare from './pages/DiagnosisCompare';
import ERTriage         from './pages/ERTriage';
import SpecialistFinder from './pages/SpecialistFinder';
import SpecialistProfile from './pages/SpecialistProfile';
import DiagnosticFinder from './pages/DiagnosticFinder';
import HospitalPricing  from './pages/HospitalPricing';
import AiChat           from './components/AiChat';
import MyBookings       from './pages/MyBookings';
import Profile          from './pages/Profile';
import VitalsTracker    from './pages/VitalsTracker';
import HealthTimeline   from './pages/HealthTimeline';
import HealthCalculator from './pages/HealthCalculator';

function PrivateRoute({ children }) {
  return localStorage.getItem('medichain_token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AiChat />
      <Routes>
        {/* Public */}
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/verify-email"  element={<VerifyEmail />} />
        <Route path="/share/:token"  element={<ShareView />} />

        {/* Public modules — accessible without login */}
        <Route path="/medicine-prices"   element={<MedicinePrices />} />
        <Route path="/generic-drugs"     element={<GenericDrugs />} />
        <Route path="/diagnosis-compare" element={<DiagnosisCompare />} />
        <Route path="/specialists"       element={<SpecialistFinder />} />
        <Route path="/specialists/:id"   element={<SpecialistProfile />} />
        <Route path="/diagnostics"       element={<DiagnosticFinder />} />
        <Route path="/hospital-pricing"  element={<HospitalPricing />} />

        {/* Protected — require login */}
        <Route path="/er-triage"    element={<PrivateRoute><ERTriage /></PrivateRoute>} />
        <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add-record"   element={<PrivateRoute><AddRecord /></PrivateRoute>} />
        <Route path="/record/:id"   element={<PrivateRoute><RecordDetail /></PrivateRoute>} />
        <Route path="/blockchain"   element={<PrivateRoute><BlockchainView /></PrivateRoute>} />
        <Route path="/my-bookings"  element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/vitals"       element={<PrivateRoute><VitalsTracker /></PrivateRoute>} />
        <Route path="/timeline"     element={<PrivateRoute><HealthTimeline /></PrivateRoute>} />
        <Route path="/health-calc"  element={<PrivateRoute><HealthCalculator /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
