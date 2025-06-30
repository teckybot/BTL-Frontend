import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const CheckpointPage = () => {
  const [schoolRegId, setSchoolRegId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!schoolRegId.trim()) {
      setError("Please enter a School Registration ID");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await api.get(`/checkpoint/${schoolRegId}`);
      if (res.data.success) {
        navigate(`/register/${schoolRegId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // No logging or action for keydown except what is handled in input
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Team Registration Checkpoint</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter School Registration ID"
          value={schoolRegId}
          onChange={(e) => setSchoolRegId(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className={`w-full px-4 py-2 text-white rounded ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {loading ? 'Checking...' : 'Proceed'}
        </button>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckpointPage;