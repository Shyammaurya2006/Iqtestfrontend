import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="card card-wide">
      <div className="card-header">
        <h2>Admin dashboard</h2>
        <span>Manage IQ questions and monitor the system</span>
      </div>
      <p className="muted-text">
        This area is only for administrators. Use it to add, edit, or delete IQ
        questions for all users.
      </p>
      <div className="hero-grid" style={{ marginTop: '1.25rem' }}>
        <div className="hero-card">
          <h3>Add or edit questions</h3>
          <p>
            Manage the central question bank, including options and correct
            answers.
          </p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate('/admin/questions')}
          >
            Open question bank
          </button>
        </div>
        <div className="hero-card">
          <h3>Admin access</h3>
          <p className="muted-text">
            Admin accounts use the same login and registration screens as users
            but are marked with an <strong>admin</strong> role on the server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

