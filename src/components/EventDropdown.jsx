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

const EventDropdown = ({ value, onChange, schoolRegId }) => {
  const [options, setOptions] = useState([]);
  const [disabledEvents, setDisabledEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setDisabledEvents(res.data.disabledEvents || []);
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

  return (
    <div className="space-y-2">
      <Select
        placeholder="Select Event"
        value={value}
        onChange={onChange}
        style={{ width: "100%" }}
        loading={loading}
      >
        {options.map((event) => (
          <Select.Option
            key={event}
            value={event}
            disabled={disabledEvents.includes(event)}
          >
            {eventLabels[event] || event}
          </Select.Option>
        ))}
      </Select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {disabledEvents.length > 0 && (
        <p className="text-sm text-gray-500">
          Some events are disabled as they have reached their maximum team limit
        </p>
      )}
    </div>
  );
};

export default EventDropdown;
