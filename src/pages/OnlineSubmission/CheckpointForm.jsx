import React, { useState } from "react";
import { Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const CheckpointForm = () => {
  const [teamId, setTeamId] = useState("");
  const navigate = useNavigate();

  const handleCheck = async () => {
    try {
      const res = await api.get(`/team/details/${teamId}`);
      if (res.data.success) {
        navigate(`/online-submission/${teamId}`);
      } else {
        message.error("Team not found. Please check your Team ID.");
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Team not found. Please check your Team ID."
      );
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h3>Enter Team Registration ID</h3>
      <Input
        placeholder="e.g. APASB001"
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Button type="primary" onClick={handleCheck}>Verify</Button>
    </div>
  );
};

export default CheckpointForm;
