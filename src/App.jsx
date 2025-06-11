// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import StepperForm from './components/StepperForm';
import RegistrationSuccess from './pages/RegistrationSuccess';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/school-registration" element={<StepperForm />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
      </Routes>
    </>
  );
}

export default App;
