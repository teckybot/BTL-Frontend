import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { TeamDraftContext } from "../context/TeamDraftContext";

const CheckpointPage = () => {
  const [schoolRegId, setSchoolRegId] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [teamCount, setTeamCount] = useState(null);
  const [maxTeams, setMaxTeams] = useState(10);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { switchToSchool  } = useContext(TeamDraftContext);

  const handleIdNext = async () => {
    if (!schoolRegId.trim()) {
      setError("Please enter a School Registration ID");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/team/validateSchool", { schoolRegId });
      if (res.data.valid && res.data.teamCount < (res.data.maxTeams || 10)) {
        setTeamCount(res.data.teamCount);
        setMaxTeams(res.data.maxTeams || 10);
        setStep(2);
      } else {
        setError(res.data.message || "Validation failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!schoolRegId.trim() || !email.trim()) {
      setError("Please enter both School Registration ID and Email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/team/validateSchool", { schoolRegId, email });
      if (res.data.valid) {
        setTeamCount(res.data.teamCount);
        setMaxTeams(res.data.maxTeams || 10);
        setValidated(true);
      } else {
        setError(res.data.message || "Validation failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    switchToSchool(schoolRegId);
    navigate("/modules", { state: { schoolRegId, email } });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Team Registration Checkpoint</h2>
      <div className="space-y-4">
        {step === 1 && (
          <>
        <input
          type="text"
          placeholder="Enter School Registration ID"
          value={schoolRegId}
          onChange={(e) => setSchoolRegId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleIdNext(); }}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
        />
        <button
              onClick={handleIdNext}
              disabled={loading || !schoolRegId.trim()}
              className={`w-full px-4 py-2 text-white rounded ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            >
              Next
            </button>
          </>
        )}
        {step === 2 && !validated && (
          <>
            <input
              type="email"
              placeholder="Enter School Registration Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleValidate(); }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
            />
            <button
              onClick={handleValidate}
              disabled={loading || !email.trim()}
              className={`w-full px-4 py-2 text-white rounded ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
        >
              {loading ? 'Validating...' : 'Verify'}
            </button>
            <button
              onClick={() => { setStep(1); setEmail(""); setError(""); }}
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200"
            >
              Back
            </button>
          </>
        )}
        {validated && (
          <>
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
              Total teams registered for your school: {teamCount}/{maxTeams}
            </div>
            <button
              onClick={handleContinue}
              className="w-full px-4 py-2 text-white rounded bg-green-600 hover:bg-green-700 transition-colors mt-2"
            >
              Continue
        </button>
          </>
        )}
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