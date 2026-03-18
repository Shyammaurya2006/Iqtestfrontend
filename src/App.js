import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Test from './components/Test';
import Result from './components/Result';
import AdminAddQuestion from './components/AdminAddQuestion';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem('iq_user');
    const storedToken = localStorage.getItem('iq_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('iq_user');
    localStorage.removeItem('iq_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="app-root">
      <header className="navbar">
        <div className="navbar-left">
          <span className="logo" onClick={() => navigate('/')}>
            IQ<span>Test</span>
          </span>
        </div>
        <nav className="navbar-center">
          <Link to="/">Home</Link>
          {user && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/test">Take Test</Link>
              <Link to="/results">My Results</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard">Admin Dashboard</Link>
                  <Link to="/admin/questions">Question Bank</Link>
                </>
              )}
            </>
          )}
        </nav>
        <div className="navbar-right">
          {user ? (
            <>
              <span className="user-badge">
                {user.name}
                {user.role === 'admin' ? ' (admin)' : ''}
              </span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="main-container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="hero">
                <h1>Online IQ Test & Knowledge Assessment</h1>
                <p>
                  Measure your logical reasoning and knowledge with a
                  time-bound, multiple-choice IQ test. Get instant feedback
                  along with a simple IQ level classification.
                </p>
                {!user ? (
                  <div className="hero-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/register')}
                    >
                      Get Started
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate('/login')}
                    >
                      I already have an account
                    </button>
                  </div>
                ) : (
                  <div className="hero-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate('/test')}
                    >
                      Take a New Test
                    </button>
                  </div>
                )}
                <div className="hero-grid">
                  <div className="hero-card">
                    <h3>Timed Assessment</h3>
                    <p>
                      A 10-minute countdown keeps you focused and simulates
                      real test pressure.
                    </p>
                  </div>
                  <div className="hero-card">
                    <h3>Random Questions</h3>
                    <p>
                      Each test pulls a fresh random set of IQ-style multiple
                      choice questions.
                    </p>
                  </div>
                  <div className="hero-card">
                    <h3>Simple IQ Levels</h3>
                    <p>
                      Your score is mapped to Low, Average, or High IQ for easy
                      interpretation.
                    </p>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/dashboard" element={<UserDashboard user={user} />} />
          <Route path="/test" element={<Test user={user} />} />
          <Route path="/results" element={<Result user={user} />} />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard user={user} />}
          />
          <Route
            path="/admin/questions"
            element={<AdminAddQuestion user={user} />}
          />
        </Routes>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} IQTest. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default App;

