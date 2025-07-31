// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">Bharat Teck League</Link>
      <div className="space-x-4">
        {/* <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link> */}
        {/* <Link to="/school-registration" className="text-gray-700 hover:text-blue-600">School Registration</Link> */}
        {/* <Link to="/team-checkpoint" className="text-gray-700 hover:text-blue-600">Team Registration</Link> */}
        <Link to="/online-submission" className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Online Level Submission</Link>
        <Link to="/ai-workshop-dashboard" className="text-white bg-purple-600 px-3 py-1 rounded hover:bg-purple-700">Workshop Dashboard</Link>
        <Link to="/dashboard" className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">BTL Dashboard</Link>

      </div>
    </nav>
  );
}
