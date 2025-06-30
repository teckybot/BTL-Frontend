import React from "react";
import { Card, Descriptions, Button } from "antd";

const TeamPreview = ({ team, onNext }) => {
  return (
    <Card title="Team Details Preview" bordered={true}>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Team ID">{team.teamRegId}</Descriptions.Item>
        <Descriptions.Item label="Event">{team.event}</Descriptions.Item>
        <Descriptions.Item label="Team Size">{team.teamSize}</Descriptions.Item>
        <Descriptions.Item label="State">{team.state}</Descriptions.Item>
        <Descriptions.Item label="School ID">{team.schoolRegId}</Descriptions.Item>
        {team.members.map((member, index) => (
          <Descriptions.Item
            label={`Member ${index + 1}`}
            key={index}
          >{`${member.name} | ${member.classGrade} | ${member.gender}`}</Descriptions.Item>
        ))}
      </Descriptions>

      <div style={{ textAlign: "right", marginTop: 24 }}>
        <Button type="primary" onClick={onNext}>
          Next: Upload Video
        </Button>
      </div>
    </Card>
  );
};

export default TeamPreview;
