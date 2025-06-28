import React, { useState } from 'react';
import { Card, Input, Button, Alert, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'

const QualifierCheckpointPage = () => {
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/qualifier/check/${teamId}`);
      setResult(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Team not found.');
      } else {
        setError(err.response?.data?.message || 'Error checking team status.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Qualifier Registration Checkpoint" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <Input
        placeholder="Enter Team ID"
        value={teamId}
        onChange={e => setTeamId(e.target.value)}
        onPressEnter={handleCheck}
        disabled={loading}
        style={{ marginBottom: 16 }}
      />
      <Button
        type="primary"
        onClick={handleCheck}
        loading={loading}
        block
        disabled={!teamId}
      >
        Check
      </Button>
      <div style={{ marginTop: 24 }}>
        {error && <Alert type="error" message={error} showIcon />}
        {result && result.qualified === false && (
          <Alert type="warning" message="Sorry, your team is not qualified for the Qualifier round." showIcon />
        )}
        {result && result.qualified && result.paid && (
          <Alert type="info" message="You have already completed Qualifier registration." showIcon />
        )}
        {result && result.qualified && !result.paid && (
          <Alert
            type="success"
            message="Congratulations! Your team is qualified."
            description={
              <Button type="primary" onClick={() => navigate(`/qualifier/${teamId}/register`)} style={{ marginTop: 12 }}>
                Continue Registration
              </Button>
            }
            showIcon
          />
        )}
      </div>
      {loading && <Spin style={{ marginTop: 16 }} />}
    </Card>
  );
};

export default QualifierCheckpointPage; 