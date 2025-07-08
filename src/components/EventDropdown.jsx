import  { useEffect, useState } from "react";
import api from "../utils/api";
import { Select } from 'antd';

const eventLabels = {
  ASB: "Astrobot",
  SPL: "Space Pilot",
  CDX: "CodeX",
  TDM: "3D Maker",
  INV: "Innoverse"
};

const EventDropdown = ({ value, onChange, schoolRegId, draftTeams = {}, currentTeamNumber, currentDraftEvent }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendEventCounts, setBackendEventCounts] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      if (!schoolRegId) {
        setError("School Registration ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/events/${schoolRegId}`);

        if (res.data.success) {
          setOptions(res.data.availableEvents || []);
          setBackendEventCounts((res.data.counts && res.data.counts.eventCounts) || {});
        } else {
          setError(res.data.message || "Failed to fetch events");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.response?.data?.message || "Failed to fetch events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [schoolRegId]);

  // Merge backend and draft event counts
  const mergedEventCounts = { ...backendEventCounts };
  Object.entries(draftTeams).forEach(([teamNum, team]) => {
    // Exclude the current draft being edited
    if (String(Number(currentTeamNumber)) === String(Number(teamNum))) return;
    if (team.event) {
      mergedEventCounts[team.event] = (mergedEventCounts[team.event] || 0) + 1;
    }
  });
  // If editing, subtract 1 from the previous event (so you can change it)
  if (currentDraftEvent) {
    mergedEventCounts[currentDraftEvent] = Math.max(0, (mergedEventCounts[currentDraftEvent] || 0) - 1);
  }

  // Compute disabled events
  const computedDisabledEvents = Object.keys(eventLabels).filter(event => {
    // If backend count is 2 or more, always disable, regardless of drafts
    if ((backendEventCounts[event] || 0) >= 2) return true;
    // Otherwise, use merged counts (for drafts in progress)
    return (mergedEventCounts[event] || 0) >= 2;
  });

  return (
    <div className="space-y-2">
      <Select
        placeholder="Select Event"
        value={value}
        onChange={onChange}
        style={{ width: "100%" }}
        loading={loading}
      >
        {Object.keys(eventLabels).map((event) => (
          <Select.Option
            key={event}
            value={event}
            disabled={computedDisabledEvents.includes(event)}
          >
            {eventLabels[event] || event}
          </Select.Option>
        ))}
      </Select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {computedDisabledEvents.length > 0 && (
        <p className="text-sm text-gray-500">
          Some events are disabled as they have reached their maximum team limit
        </p>
      )}
    </div>
  );
};

export default EventDropdown;
