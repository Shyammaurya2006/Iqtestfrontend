import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(form);
      localStorage.setItem('iq_token', data.token);
      localStorage.setItem('iq_user', JSON.stringify(data.user));
      setUser(data.user);
      // After registration, send user to dashboard so
      // the test only starts when they choose to start.
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Create your account</h2>
        <span>It only takes a minute</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-control"
            placeholder="Alex Doe"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-action">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
            <button
              type="button"
              className="btn btn-ghost-small"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              👁
            </button>
          </div>
          <p className="helper-text">
            Your password is securely hashed using bcrypt.
          </p>
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="muted-text" style={{ marginTop: '0.75rem' }}>
        Already have an account?{' '}
        <Link className="link" to="/login">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;

