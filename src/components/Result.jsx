import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchResults, fetchResultDetailsByPin } from '../services/api';

const Result = ({ user }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [selectedPin, setSelectedPin] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const stored = sessionStorage.getItem('iq_last_result');
    if (stored) {
      try {
        setLastResult(JSON.parse(stored));
      } catch {
        setLastResult(null);
      }
    }
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchResults();
        setHistory(data);
      } catch (err) {
        setError(err.message || 'Failed to load past results');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadResults();
    }
  }, [user]);

  if (!user) return null;

  const scoreMax = history.reduce((max, r) => Math.max(max, r.score || 0), 1);

  const getBadgeClass = (level) => {
    if (level === 'Low') return 'badge low';
    if (level === 'Average') return 'badge avg';
    return 'badge high';
  };

  const openDetails = async (pin) => {
    if (!pin) return;
    setSelectedPin(pin);
    setDetails(null);
    setDetailsError('');
    setDetailsLoading(true);
    try {
      const data = await fetchResultDetailsByPin(pin);
      setDetails(data);
    } catch (err) {
      setDetailsError(err.message || 'Failed to load result details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const getCareerGuidance = (level) => {
    if (level === 'Low') {
      return (
        <>
          Focus on building strong foundations first. Consider:
          <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem' }}>
            <li>Practising simple logic puzzles and brain‑teasers daily.</li>
            <li>Improving basic maths and reasoning skills step by step.</li>
            <li>
              Exploring supportive careers that value consistency, patience, and
              practical skills (e.g. crafts, skilled trades, operations).
            </li>
          </ul>
        </>
      );
    }

    if (level === 'Average') {
      return (
        <>
          You have balanced reasoning skills. You might enjoy:
          <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem' }}>
            <li>
              Roles that mix people skills and analysis (e.g. sales, project
              coordination, customer success).
            </li>
            <li>
              Continuing to train your problem‑solving to move towards
              analytical careers (e.g. business analysis, programming).
            </li>
            <li>
              Taking short courses and certifications in areas you&apos;re
              curious about.
            </li>
          </ul>
        </>
      );
    }

    return (
      <>
        You show strong problem‑solving ability. Consider:
        <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem' }}>
          <li>
            Analytical and technical careers (e.g. software development, data
            analysis, engineering, research).
          </li>
          <li>
            Competitive exams or higher education paths that reward logical
            thinking.
          </li>
          <li>
            Combining your IQ with communication skills for leadership or
            entrepreneurship.
          </li>
        </ul>
      </>
    );
  };

  return (
    <div className="card card-wide">
      <div className="card-header">
        <h2>Your results</h2>
        <span>See your latest IQ level and history</span>
      </div>

      {lastResult ? (
        <div className="results-main">
          <p>
            Latest score:{' '}
            <strong>{lastResult.score}</strong>
          </p>
          {lastResult.pin && (
            <p className="muted-text">
              Result PIN: <strong>{lastResult.pin}</strong>
            </p>
          )}
          <div className="results-highlight">
            <span>IQ Level:</span>
            <strong>{lastResult.iqLevel}</strong>
          </div>
          <p className="muted-text">
            Taken on{' '}
            {lastResult.createdAt
              ? new Date(lastResult.createdAt).toLocaleString()
              : 'just now'}
          </p>
          <div style={{ marginTop: '1rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>
              Career guidance (based on this IQ level)
            </h3>
            <p className="muted-text">
              This is a simple, non‑clinical suggestion to help you think about
              possible directions. Real‑world career choices should also include
              your interests, values, and circumstances.
            </p>
            <div
              style={{
                marginTop: '0.4rem',
                padding: '0.7rem 0.8rem',
                borderRadius: '0.9rem',
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,255,0.4)',
                fontSize: '0.86rem',
              }}
            >
              {getCareerGuidance(lastResult.iqLevel)}
            </div>
          </div>
        </div>
      ) : (
        <p className="muted-text">
          Take a test to see your IQ level. Once you finish, your latest result
          will appear here.
        </p>
      )}

      <hr style={{ margin: '1.5rem 0', borderColor: 'rgba(148,163,255,.3)' }} />

      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
        Score graph
      </h3>
      {history.length > 0 ? (
        <div className="score-graph">
          {history
            .slice()
            .reverse()
            .map((r) => {
              const heightPct = Math.round(((r.score || 0) / scoreMax) * 100);
              return (
                <button
                  key={r._id}
                  type="button"
                  className="score-bar"
                  onClick={() => openDetails(r.pin)}
                  title={`Score ${r.score} • ${new Date(
                    r.createdAt
                  ).toLocaleString()}${r.pin ? ` • PIN ${r.pin}` : ''}`}
                  disabled={!r.pin}
                >
                  <span
                    className="score-bar-fill"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="score-bar-label">{r.score}</span>
                </button>
              );
            })}
        </div>
      ) : (
        <p className="muted-text">No graph yet (take a test first).</p>
      )}

      <hr style={{ margin: '1.5rem 0', borderColor: 'rgba(148,163,255,.3)' }} />

      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
        Test history
      </h3>

      {loading && <p className="muted-text">Loading previous attempts...</p>}
      {error && <p className="error-text">{error}</p>}

      {history.length === 0 && !loading && !error && (
        <p className="muted-text">
          No previous attempts found. Your results will be listed here after you
          complete tests.
        </p>
      )}

      <div className="results-list">
        {history.map((r) => (
          <div key={r._id} className="results-item">
            <div>
              <span>
                Score: <strong>{r.score}</strong>
              </span>
              <br />
              {r.pin && (
                <>
                  <small>PIN: {r.pin}</small>
                  <br />
                </>
              )}
              <small>
                {new Date(r.createdAt).toLocaleString()}
              </small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={getBadgeClass(r.iqLevel)}>{r.iqLevel}</span>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => openDetails(r.pin)}
                disabled={!r.pin}
                style={{ paddingInline: '0.7rem', fontSize: '0.78rem' }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr style={{ margin: '1.5rem 0', borderColor: 'rgba(148,163,255,.3)' }} />

      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
        Full question review
      </h3>
      <p className="muted-text">
        Select an attempt by clicking <strong>View</strong> (or a bar in the graph).
        You will see all questions, your answer, the correct answer, and a conclusion
        explaining why you got Low/Average/High.
      </p>

      {detailsLoading && <p className="muted-text">Loading full review...</p>}
      {detailsError && <p className="error-text">{detailsError}</p>}

      {details && (
        <div style={{ marginTop: '0.8rem' }}>
          <div className="results-item" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.9rem' }}>
                <strong>PIN:</strong> {details.pin} <br />
                <strong>Score:</strong> {details.score} <br />
                <strong>IQ Level:</strong> {details.iqLevel} <br />
                <strong>Date:</strong>{' '}
                {new Date(details.createdAt).toLocaleString()}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Conclusion (why):</strong>
                <div className="muted-text" style={{ marginTop: '0.25rem' }}>
                  {details.conclusion}
                </div>
              </div>
            </div>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                setSelectedPin('');
                setDetails(null);
              }}
              style={{ paddingInline: '0.7rem', fontSize: '0.78rem' }}
            >
              Close
            </button>
          </div>

          <div className="question-list" style={{ marginTop: '0.9rem' }}>
            {(details.answers || []).map((a, idx) => (
              <div key={`${a.questionId}-${idx}`} className="question-card">
                <div className="question-header">
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge">Q{idx + 1}</span>
                    {a.difficulty && <span className="badge">{a.difficulty}</span>}
                    {a.std && <span className="badge">{a.std}</span>}
                    {a.course && <span className="badge">{a.course}</span>}
                    <span className={a.isCorrect ? 'badge high' : 'badge low'}>
                      {a.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                </div>
                <div className="question-text">{a.question}</div>
                <div className="options-grid" style={{ marginTop: '0.5rem' }}>
                  {['A', 'B', 'C', 'D'].map((key) => {
                    const isCorrect = a.correctAnswer === key;
                    const isSelected = a.selectedOption === key;
                    return (
                      <div key={key} className="muted-text">
                        <strong>{key}.</strong> {a.options?.[key]}
                        {isCorrect && (
                          <span
                            className="badge"
                            style={{
                              marginLeft: '0.35rem',
                              borderColor: 'rgba(74,222,128,0.7)',
                              color: '#bbf7d0',
                            }}
                          >
                            Correct
                          </span>
                        )}
                        {isSelected && (
                          <span
                            className="badge"
                            style={{
                              marginLeft: '0.35rem',
                              borderColor: 'rgba(96,165,250,0.7)',
                              color: '#dbeafe',
                            }}
                          >
                            Your answer
                          </span>
                        )}
                        {!a.selectedOption && (
                          <span
                            className="badge"
                            style={{
                              marginLeft: '0.35rem',
                              borderColor: 'rgba(250,204,21,0.7)',
                              color: '#fef9c3',
                            }}
                          >
                            Not attempted
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;

