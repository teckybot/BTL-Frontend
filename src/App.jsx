// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import StepperForm from './components/StepperForm';
import RegistrationSuccess from './pages/RegistrationSuccess';
import CheckpointPage from './pages/CheckpointPage';
import TeamRegistrationPage from './pages/TeamRegistrationPage';
import TeamRegistrationSuccess from './pages/TeamRegistrationSuccess';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/school-registration" element={<StepperForm />} />
        <Route path="/team-checkpoint" element={<CheckpointPage />} />
        <Route path="/register/:schoolRegId" element={<TeamRegistrationPage />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/teamRegistration-success" element={<TeamRegistrationSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
