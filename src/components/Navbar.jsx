// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <Link  to="/" className="text-xl font-bold text-blue-600">Bharat Tech League</Link>
      <div className="space-x-4">
        <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link to="/school-registration" className="text-gray-700 hover:text-blue-600">School Registration</Link>
        <Link to="/team-registration" className="text-gray-700 hover:text-blue-600">Team Registration</Link>
      </div>
    </nav>
  );
}
