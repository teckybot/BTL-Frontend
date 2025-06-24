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
import CheckpointForm from './pages/OnlineSubmission/CheckpointForm';
import StepperFormOnline from './pages/OnlineSubmission/StepperForm';
import VideoConfirmation from './pages/VideoConfirmation';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/school-registration" element={<StepperForm />} />
        <Route path="/team-checkpoint" element={<CheckpointPage />} />
        <Route path="/online-submission" element={<CheckpointForm />} />
        <Route path="/online-submission/:teamId" element={<StepperFormOnline />} />
        <Route path="/register/:schoolRegId" element={<TeamRegistrationPage />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/teamRegistration-success" element={<TeamRegistrationSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/video-confirmation" element={<VideoConfirmation />} />
      </Routes>
    </>
  );
}

export default App;
