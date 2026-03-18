import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="card card-wide">
      <div className="card-header">
        <h2>User dashboard</h2>
        <span>Welcome back, {user.name}</span>
      </div>
      <p className="muted-text">
        From here you can start a new IQ test or review your previous results.
      </p>
      <div className="hero-grid" style={{ marginTop: '1.25rem' }}>
        <div className="hero-card">
          <h3>Take a test</h3>
          <p>
            Start a new timed IQ test with randomly selected multiple‑choice
            questions.
          </p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate('/test')}
          >
            Start test
          </button>
        </div>
        <div className="hero-card">
          <h3>View results</h3>
          <p>
            See your previous attempts, scores, and IQ level classification over
            time.
          </p>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => navigate('/results')}
          >
            Open results
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

