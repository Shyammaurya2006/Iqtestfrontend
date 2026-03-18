import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTestQuestions, submitTest } from '../services/api';

// Total test duration in seconds (10 minutes)
const TEST_DURATION = 10 * 60;

const Test = ({ user }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('Easy');
  const [stdFilter, setStdFilter] = useState('1');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch questions when filters change, but only after user starts the test
  useEffect(() => {
    if (!started) return;

    const loadQuestions = async () => {
      setLoading(true);
      setError('');
      setAnswers({});
      setTimeLeft(TEST_DURATION);
      setHasSubmitted(false);
      try {
        const params = {
          difficulty: difficultyFilter,
          std: stdFilter,
        };

        const data = await fetchTestQuestions(params);
        setQuestions(data);
      } catch (err) {
        setError(err.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [started, difficultyFilter, stdFilter]);

  // Countdown timer effect
  useEffect(() => {
    if (!started || loading || hasSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading, hasSubmitted, started]);

  const handleOptionChange = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const handleSubmit = async (auto = false) => {
    if (submitting || hasSubmitted) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] || null,
      }));
      const result = await submitTest(payload);
      setHasSubmitted(true);
      // Store last result in sessionStorage for Result page
      sessionStorage.setItem('iq_last_result', JSON.stringify(result));
      navigate('/results');
    } catch (err) {
      setError(err.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
  };

  if (!user) return null;

  return (
    <div className="card card-wide">
      <div className="card-header">
        <h2>IQ Test</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {started && (
            <>
              <span className="pill accent">
                <span className="timer">{formatTime(timeLeft)}</span> left
              </span>
              <span className="pill">
                Answered {answeredCount}/{questions.length || '–'}
              </span>
            </>
          )}
          <span className="pill">
            Level:
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="form-select"
              style={{
                padding: '0.1rem 0.4rem',
                fontSize: '0.78rem',
                marginLeft: '0.25rem',
              }}
              disabled={started}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </span>
          <span className="pill">
            Class:
            <select
              value={stdFilter}
              onChange={(e) => setStdFilter(e.target.value)}
              className="form-select"
              style={{
                padding: '0.1rem 0.4rem',
                fontSize: '0.78rem',
                marginLeft: '0.25rem',
              }}
              disabled={started}
            >
              {/* School classes 1–12 */}
              {Array.from({ length: 12 }).map((_, idx) => {
                const val = String(idx + 1);
                return (
                  <option key={val} value={val}>
                    Class {val}
                  </option>
                );
              })}
            </select>
          </span>
        </div>
      </div>
      <p className="muted-text">
        First choose the level and class. The 10 minute timer and
        questions will start only after you click &quot;Start test&quot;.
      </p>

      {loading && <p className="muted-text">Loading questions...</p>}
      {error && <p className="error-text">{error}</p>}

      {started && !loading && questions.length === 0 && !error && (
        <p className="muted-text">
          No questions available yet. Please contact the administrator.
        </p>
      )}

      {started && (
        <>
          <div className="question-list">
            {questions.map((q, index) => (
              <div key={q._id} className="question-card">
                <div className="question-header">
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.4rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className="badge">
                      Q{index + 1}
                    </span>
                    {q.difficulty && (
                      <span className="badge">
                        {q.difficulty}
                      </span>
                    )}
                    {q.std && (
                      <span className="badge">
                        {q.std}
                      </span>
                    )}
                  </div>
                </div>
                <div className="question-text">{q.question}</div>
                <div className="options-grid">
                  {['A', 'B', 'C', 'D'].map((optKey) => (
                    <label key={optKey} className="option-choice">
                      <input
                        type="radio"
                        name={q._id}
                        className="radio-custom"
                        checked={answers[q._id] === optKey}
                        onChange={() => handleOptionChange(q._id, optKey)}
                      />
                      <span>
                        <strong>{optKey}.</strong> {q.options[optKey]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '1.25rem',
              gap: '0.75rem',
            }}
          >
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </>
      )}

      {!started && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '1.25rem',
          }}
        >
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? 'Preparing test...' : 'Start test'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Test;

