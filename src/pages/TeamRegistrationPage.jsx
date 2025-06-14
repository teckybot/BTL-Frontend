import React from "react";
import { useParams } from "react-router-dom";
import TeamForm from "../components/TeamForm";

const TeamRegistrationPage = () => {
  const { schoolRegId } = useParams();
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Team Registration</h2>
      <TeamForm schoolRegId={schoolRegId} />
    </div>
  );
};

export default TeamRegistrationPage;
