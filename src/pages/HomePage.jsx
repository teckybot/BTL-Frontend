// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';


export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto text-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">BTL Admin Dashboard</h1>
      <p className="mb-8 text-lg text-gray-700">
Monitor school registrations, review team submissions, and manage participation data for the Bharat Teck League.      </p>
      {/* <img 
        src="/event-poster.png" 
        alt="Bharat Tech League Event Poster" 
        className="mx-auto mb-8 rounded-lg shadow-lg max-w-full h-auto"
      /> */}
      <div className="flex justify-center gap-6">
        {/* <Link to="/school-registration" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
          Register Your School
        </Link> */}
        {/* <Link to="/team-checkpoint" className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
          Register Your Team
        </Link> */}
        {/* <Link to="/qualifier" className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition">
          Qualifier Registration
        </Link> */}
        
        {/* <Link to="/ai-workshop-dashboard" className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition">
          AI Workshop Dashboard
        </Link> */}
        
        <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
           BTL Registration Dashboard
        </Link>
        
      </div>
    </div>
    
  );
}
