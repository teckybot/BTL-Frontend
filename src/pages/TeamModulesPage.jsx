import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TeamDraftContext } from "../context/TeamDraftContext";
import api from "../utils/api";

const TeamModulesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, filledCount, switchToSchool, updateTeam, removeTeams } = useContext(TeamDraftContext);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupStep, setPopupStep] = useState(0);

  // Handle school switch
  useEffect(() => {
    const schoolRegId = location.state?.schoolRegId;
    if (!schoolRegId) {
      navigate("/team-checkpoint", { replace: true });
      return;
    }

    switchToSchool(schoolRegId);
  }, [location.state?.schoolRegId]);

  // Load teams after switching school
  useEffect(() => {
    console.log('Switching to school:', draft.schoolRegId);
    setRegisteredTeams([]); // Clear previous state immediately on school change
    if (!draft.schoolRegId) return;
    const fetchRegisteredTeams = async () => {
      try {
        const res = await api.get(`/team/list?schoolRegId=${draft.schoolRegId}`);
        console.log('Fetched teams for', draft.schoolRegId, res.data);
        if (Array.isArray(res.data)) {
          setRegisteredTeams(res.data.map(team => ({ teamNumber: team.teamNumber })));
          // Auto-cleanup: remove any draft teams that are now registered
          const registeredNumbers = new Set(res.data.map(team => team.teamNumber));
          removeTeams(Array.from(registeredNumbers));
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchRegisteredTeams();
  }, [draft.schoolRegId]);

  const handleBlockClick = (teamNumber) => {
    if (!submitted) navigate(`/team-form/${teamNumber}`);
  };

  // Compute which blocks are registered and which are draft
  const registeredTeamNumbers = registeredTeams.map(t => t.teamNumber);

  // Only submit draft teams that are not already registered
  const newTeamsToSubmit = Object.entries(draft.teams)
    .filter(([teamNumber, data]) => !registeredTeamNumbers.includes(Number(teamNumber)));

  const newTeamsCount = newTeamsToSubmit.length;
  const registeredCount = registeredTeamNumbers.length;
  const totalAfterSubmit = registeredCount + newTeamsCount;

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError("");

    try {
      const teamsArr = newTeamsToSubmit.map(([teamNumber, teamData]) => ({
        ...teamData,
        teamNumber: Number(teamNumber)
      }));
      const res = await api.post("/team/registerBatch", {
        schoolRegId: draft.schoolRegId,
        teams: teamsArr,
      });

      if (res.data.success) {
        const submittedTeamNumbers = (res.data.teams || []).map(t => t.teamNumber);
        removeTeams(submittedTeamNumbers); // Remove only submitted teams from draft
        setSubmitted(true);
        navigate("/teamRegistration-success", {
          state: {
            registeredTeams: res.data.teams || [],
          },
        });
      } else {
        setError(res.data.message || "Submission failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
      setPopupStep(0);
    }
  };

  const canSubmit = newTeamsCount > 0 && !submitting && !submitted;

  // Map registered teamNumbers for fast lookup
  // const registeredTeamNumbers = registeredTeams.map(t => t.teamNumber); // This line is now redundant

  // Remove loading state and always render blocks
  // Add debug log before rendering
  console.log('Rendering blocks', registeredTeams, draft.teams);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Register Teams</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[...Array(10)].map((_, idx) => {
          const teamNum = idx + 1;
          const registered = registeredTeamNumbers.includes(teamNum);
          const filled = !!draft.teams[teamNum] && !registered;
          return (
            <div
              key={teamNum}
              className={`rounded-lg p-6 cursor-pointer border-2 text-center font-semibold text-lg transition-colors
                ${registered ? 'bg-red-100 border-red-500 text-red-800 cursor-not-allowed opacity-60' : filled ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-500'}
                ${submitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !registered && !submitted && handleBlockClick(teamNum)}
            >
              Team {teamNum}
              <div className="mt-2 text-sm">
                {registered ? 'Registered' : filled ? 'Draft' : 'Empty'}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={`w-full px-4 py-2 text-white rounded transition-colors ${
          canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!canSubmit}
        onClick={() => {
          setShowConfirm(true);
          setPopupStep(0);
        }}
      >
        {submitted ? "Submitted" : "Submit"}
      </button>

      {!canSubmit && !submitted && (
        <div className="text-sm text-gray-500 mt-2 text-center">
          {filledCount === 0
            ? "No new teams to submit."
            : "All teams already registered or submission in progress."}
        </div>
      )}

      {submitted && (
        <div className="p-3 mt-4 bg-green-50 border border-green-200 rounded text-green-700 text-center font-semibold">
          Teams submitted successfully! You can no longer edit or add teams.
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            {popupStep === 0 && (
              <>
                <div className="mb-4 text-lg font-semibold">
                  You have already registered {registeredCount} out of 10 teams.
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowConfirm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setPopupStep(1)}
                    disabled={submitting}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            {popupStep === 1 && (
              <>
                <div className="mb-4 text-lg font-semibold">
                  You are about to submit {newTeamsCount} more team{newTeamsCount !== 1 ? "s" : ""}.
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowConfirm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setPopupStep(2)}
                    disabled={submitting}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
            {popupStep === 2 && (
              <>
                <div className="mb-4 text-lg font-semibold">
                  After submission, your school will have {totalAfterSubmit} out of 10 teams registered.
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowConfirm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Continue"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 mt-4 bg-red-50 border border-red-200 rounded text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default TeamModulesPage;
