import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export const TeamDraftContext = createContext();

const getStorageKey = (schoolRegId) => `teamDraftData_${schoolRegId}`;

export const TeamDraftProvider = ({ children }) => {
  const [draft, setDraft] = useState({ schoolRegId: "", teams: {} });
  const [filledCount, setFilledCount] = useState(0);

  // Load draft for a specific school
  const loadDraft = useCallback((schoolRegId) => {
    if (!schoolRegId) return { schoolRegId: "", teams: {} };
    const saved = localStorage.getItem(getStorageKey(schoolRegId));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {}
    }
    return { schoolRegId, teams: {} };
  }, []);

  // Switch to a new school (called at checkpoint)
  const switchToSchool = (schoolRegId) => {
    setDraft(loadDraft(schoolRegId));
  };

  // Save draft to localStorage whenever it changes
  useEffect(() => {
    if (draft.schoolRegId) {
      localStorage.setItem(getStorageKey(draft.schoolRegId), JSON.stringify(draft));
      setFilledCount(Object.keys(draft.teams || {}).length);
    }
  }, [draft]);

  // Update a single team in the draft
  const updateTeam = (teamNumber, teamData) => {
    setDraft((prev) => ({
      ...prev,
      teams: { ...prev.teams, [teamNumber]: teamData },
    }));
  };

  // Remove a team from the draft
  const removeTeam = (teamNumber) => {
    setDraft((prev) => {
      const newTeams = { ...prev.teams };
      delete newTeams[teamNumber];
      return { ...prev, teams: newTeams };
    });
  };

  // Remove multiple teams from the draft
  const removeTeams = (teamNumbers) => {
    setDraft((prev) => {
      const newTeams = { ...prev.teams };
      teamNumbers.forEach(num => delete newTeams[num]);
      return { ...prev, teams: newTeams };
    });
  };

  // Set schoolRegId (for backward compatibility)
  const setSchoolRegId = (schoolRegId) => {
    setDraft((prev) => ({ ...prev, schoolRegId }));
  };

  // Clear all draft data for the current school
  const clearDraft = () => {
    if (draft.schoolRegId) {
      localStorage.removeItem(getStorageKey(draft.schoolRegId));
    }
    setDraft({ schoolRegId: "", teams: {} });
  };

  return (
    <TeamDraftContext.Provider
      value={{ draft, filledCount, updateTeam, removeTeam, setSchoolRegId, clearDraft, switchToSchool, removeTeams }}
    >
      {children}
    </TeamDraftContext.Provider>
  );
};

export const useTeamDraft = () => useContext(TeamDraftContext);