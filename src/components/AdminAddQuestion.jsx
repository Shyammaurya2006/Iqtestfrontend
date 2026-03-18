import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createQuestion,
  fetchAllQuestions,
  updateQuestion,
  deleteQuestion,
} from '../services/api';

const emptyForm = {
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  correctAnswer: 'A',
  difficulty: 'Medium',
  std: '1',
};

const AdminAddQuestion = ({ user }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadQuestions();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (key, value) => {
    setForm({ ...form, options: { ...form.options, [key]: value } });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateQuestion(editingId, form);
      } else {
        await createQuestion(form);
      }
      resetForm();
      await loadQuestions();
    } catch (err) {
      setError(err.message || 'Failed to save question');
    }
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setForm({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || 'Medium',
      std: q.std || '1',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    setError('');
    try {
      await deleteQuestion(id);
      if (editingId === id) {
        resetForm();
      }
      await loadQuestions();
    } catch (err) {
      setError(err.message || 'Failed to delete question');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="card card-wide">
      <div className="card-header">
        <h2>Question bank</h2>
        <span>Manage IQ questions (admin only)</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question text</label>
          <textarea
            id="question"
            name="question"
            className="form-textarea"
            placeholder="Enter the question..."
            value={form.question}
            onChange={handleInputChange}
            required
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.7rem',
          }}
        >
          {['A', 'B', 'C', 'D'].map((key) => (
            <div className="form-group" key={key}>
              <label>Option {key}</label>
              <input
                type="text"
                className="form-control"
                value={form.options[key]}
                onChange={(e) => handleOptionChange(key, e.target.value)}
                required
              />
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            marginTop: '0.5rem',
          }}
        >
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label htmlFor="correctAnswer">Correct answer</label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              className="form-select"
              value={form.correctAnswer}
              onChange={handleInputChange}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 120px' }}>
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              className="form-select"
              value={form.difficulty}
              onChange={handleInputChange}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 140px' }}>
            <label htmlFor="std">Std / Level</label>
            <select
              id="std"
              name="std"
              className="form-select"
              value={form.std}
              onChange={handleInputChange}
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
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.6rem',
            marginTop: '0.8rem',
          }}
        >
          {editingId && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetForm}
            >
              Cancel edit
            </button>
          )}
          <button className="btn btn-primary" type="submit">
            {editingId ? 'Update question' : 'Add question'}
          </button>
        </div>
      </form>

      <hr style={{ margin: '1.5rem 0', borderColor: 'rgba(148,163,255,.3)' }} />

      <h3 style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>
        Existing questions
      </h3>
      {loading && <p className="muted-text">Loading questions...</p>}
      {questions.length === 0 && !loading && (
        <p className="muted-text">No questions added yet.</p>
      )}

      <div className="question-list">
        {questions.map((q, index) => (
          <div key={q._id} className="question-card">
            <div className="question-header">
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge">
                  #{index + 1}
                  {q.category ? ` · ${q.category}` : ''}
                </span>
                {q.difficulty && (
                  <span className="badge">
                    {q.difficulty} level
                  </span>
                )}
                {q.std && (
                  <span className="badge">
                    Std {q.std}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => handleEdit(q)}
                  style={{ paddingInline: '0.6rem', fontSize: '0.78rem' }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => handleDelete(q._id)}
                  style={{
                    paddingInline: '0.6rem',
                    fontSize: '0.78rem',
                    borderColor: 'rgba(248, 113, 113, 0.7)',
                    color: '#fecaca',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="question-text">{q.question}</div>
            <div className="options-grid" style={{ marginTop: '0.4rem' }}>
              {['A', 'B', 'C', 'D'].map((key) => (
                <div key={key} className="muted-text">
                  <strong>{key}.</strong> {q.options[key]}
                  {q.correctAnswer === key && (
                    <span
                      className="badge"
                      style={{
                        marginLeft: '0.3rem',
                        borderColor: 'rgba(74,222,128,0.7)',
                        color: '#bbf7d0',
                      }}
                    >
                      Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAddQuestion;

