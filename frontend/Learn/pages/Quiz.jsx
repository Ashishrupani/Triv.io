import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/Quiz.css';
import { addScore, summarizePlayer } from '../src/leaderboard';
import { getProfile } from '../src/storage/profileStore';

const STORAGE_KEYS = {
  session: 'latest_quiz_v1',
  local: 'generated_quiz_v1',
};

const sampleQuestions = [
  { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HyperText Machine Language', 'HighText Markdown Language', 'None of the above'], answer: 0 },
  { question: 'Which programming language is used for web apps?', options: ['Python', 'JavaScript', 'C++', 'All of the above'], answer: 1 },
  { question: 'What year was JavaScript created?', options: ['1991', '1995', '2000', '1989'], answer: 1 },
  { question: 'CSS is used for?', options: ['Structure', 'Styling', 'Database', 'Logic'], answer: 1 },
  { question: 'React is maintained by?', options: ['Google', 'Facebook (Meta)', 'Microsoft', 'Twitter'], answer: 1 },
  { question: 'Which of these is a JavaScript framework?', options: ['Laravel', 'Django', 'React', 'Flask'], answer: 2 },
  { question: 'Which tag is used for inserting a line break in HTML?', options: ['<lb>', '<break>', '<br>', '<hr>'], answer: 2 },
  { question: 'Which keyword is used to define a constant in JavaScript?', options: ['let', 'var', 'const', 'constant'], answer: 2 },
  { question: 'In CSS, which property is used to change text color?', options: ['font-color', 'color', 'text-color', 'fgcolor'], answer: 1 },
  { question: 'What does API stand for?', options: ['Application Programming Interface', 'Applied Programming Internet', 'App Performance Interface', 'Application Program Input'], answer: 0 }
];

function tryParseJSON(value) {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/```json|```/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      return JSON.parse(cleaned.replace(/'/g, '"'));
    } catch (err2) {
      return null;
    }
  }
}

function parseGeminiString(raw) {
  if (typeof raw !== 'string') return null;

  const firstAttempt = tryParseJSON(raw);
  if (firstAttempt) return firstAttempt;

  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    const arr = tryParseJSON(arrayMatch[0]);
    if (arr) return arr;
  }

  return null;
}

function extractQuestionsPayload(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.questions)) return payload.questions;
  if (payload.message) {
    const parsed = parseGeminiString(payload.message);
    if (parsed) return extractQuestionsPayload(parsed);
  }
  if (typeof payload === 'string') {
    const parsed = parseGeminiString(payload);
    if (parsed) return extractQuestionsPayload(parsed);
  }
  return null;
}

function normalizeQuiz(payload) {
  const raw = extractQuestionsPayload(payload);
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      const question = item.question || item.questionText || item.prompt || `Question ${index + 1}`;
      const rawOptions = item.options || item.answerOptions || item.choices || [];
      if (!Array.isArray(rawOptions) || rawOptions.length === 0) return null;

      let answerIndex = typeof item.answer === 'number' ? item.answer : typeof item.answerIndex === 'number' ? item.answerIndex : null;
      const correctAnswerText = item.correctAnswer || item.correct || item.answerText;

      let detectedCorrect = null;
      const options = rawOptions
        .map((opt, optIndex) => {
          const answerText = typeof opt === 'string' ? opt : opt.answerText || opt.text || opt.label || String(opt).trim();
          if (!answerText) return null;

          const isCorrect =
            typeof opt.isCorrect === 'boolean'
              ? opt.isCorrect
              : opt.correct === true || opt.is_answer === true || opt.isRight === true;

          if (isCorrect && detectedCorrect === null) {
            detectedCorrect = optIndex;
          }

          if (
            detectedCorrect === null &&
            typeof correctAnswerText === 'string' &&
            answerText.toLowerCase() === correctAnswerText.toLowerCase()
          ) {
            detectedCorrect = optIndex;
          }

          return answerText;
        })
        .filter(Boolean);

      if (!options.length) return null;
      const finalAnswerIndex =
        detectedCorrect !== null
          ? detectedCorrect
          : answerIndex !== null && answerIndex >= 0 && answerIndex < options.length
          ? answerIndex
          : 0;

      return {
        question,
        options,
        answer: finalAnswerIndex,
      };
    })
    .filter(Boolean);
}

function storeQuiz(questions, meta) {
  try {
    const packaged = { questions, meta };
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(packaged));
    localStorage.setItem(STORAGE_KEYS.local, JSON.stringify(packaged));
  } catch (err) {
    console.warn('Failed to persist quiz', err);
  }
}

function loadQuiz(location) {
  const meta = location.state?.meta || {};
  const candidate =
    location.state?.quiz ||
    location.state?.questions ||
    location.state?.payload ||
    location.state?.data;

  const resolved = normalizeQuiz(candidate);
  if (resolved.length) {
    storeQuiz(resolved, meta);
    return { questions: resolved, meta };
  }

  const readStored = (key) => {
    try {
      const raw = key === 'session' ? sessionStorage.getItem(STORAGE_KEYS.session) : localStorage.getItem(STORAGE_KEYS.local);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length) {
        return { questions: parsed.questions, meta: parsed.meta || {} };
      }
    } catch (err) {
      console.warn('Failed to read stored quiz', err);
    }
    return null;
  };

  return readStored('session') || readStored('local') || { questions: [], meta: {} };
}

function readStoredQuiz() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.session) || localStorage.getItem(STORAGE_KEYS.local);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to read stored quiz', err);
  }
  return null;
}

export default function Quiz() {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  const loadingFlag = Boolean(
    location.state?.loading ||
      location.state?.isGenerating ||
      location.state?.meta?.loading
  );
  const loadingMessage =
    location.state?.loadingMessage ||
    location.state?.meta?.loadingMessage ||
    'Asking the AI to craft your quiz...';

  const [{ questions: initialQuestions, meta: initialMeta }, setInitialData] = useState(() => loadQuiz(location));
  const [questions, setQuestions] = useState(() =>
    initialQuestions.length ? initialQuestions : loadingFlag ? [] : sampleQuestions
  );
  const [meta, setMeta] = useState(initialMeta);
  const [usingSample, setUsingSample] = useState(!loadingFlag && !initialQuestions.length);
  const [isGenerating, setIsGenerating] = useState(loadingFlag && !initialQuestions.length);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [leaderboardStatus, setLeaderboardStatus] = useState('');
  const [rankSummary, setRankSummary] = useState(null);

  useEffect(() => {
    const freshLoadingFlag = Boolean(
      location.state?.loading ||
        location.state?.isGenerating ||
        location.state?.meta?.loading
    );

    const data = loadQuiz(location);
    setInitialData(data);
    if (data.questions.length) {
      setQuestions(data.questions);
      setUsingSample(false);
      setIsGenerating(false);
    } else if (freshLoadingFlag) {
      setQuestions([]);
      setUsingSample(false);
      setIsGenerating(true);
    } else {
      setQuestions(sampleQuestions);
      setUsingSample(true);
      setIsGenerating(false);
    }
    setMeta(data.meta || {});
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setLeaderboardStatus('');
    setRankSummary(null);
  }, [location.key]);

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      const stored = readStoredQuiz();
      if (stored && Array.isArray(stored.questions) && stored.questions.length) {
        setQuestions(stored.questions);
        setMeta(stored.meta || {});
        setIsGenerating(false);
        setUsingSample(false);
        setCurrent(0);
        setScore(0);
        setSelected(null);
        setFinished(false);
        setLeaderboardStatus('');
        setRankSummary(null);
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const profile = useMemo(() => getProfile(user), [user, finished]);
  const playerName = profile.displayName || user?.name || 'You';

  const totalQuestions = questions.length;
  const progressPercentage = ((current + 1) / totalQuestions) * 100;
  const scorePercentage = (score / totalQuestions) * 100;

  const quizTitle = meta.title || (usingSample ? 'Sample Quiz' : 'Generated Quiz');
  const quizDifficulty = meta.difficulty || 'Practice';

  const handleNext = () => {
    if (selected === null) return;
    if (selected === questions[current].answer) {
      setScore((prev) => prev + 1);
    }

    if (current + 1 < totalQuestions) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setLeaderboardStatus('');
    setRankSummary(null);
  };

  const handleGoBack = () => {
    navigate('/create-quiz');
  };

  const handleSaveScore = () => {
    const payload = {
      score,
      total: totalQuestions,
      difficulty: quizDifficulty,
      durationSeconds: meta.durationSeconds,
    };

    try {
      addScore(payload, isAuthenticated ? user : undefined);
      const summary = summarizePlayer(playerName);
      setRankSummary(summary);
      setLeaderboardStatus('Saved to leaderboard');
    } catch (err) {
      console.warn('Failed to save score', err);
      setLeaderboardStatus('Could not save score');
    }

    if (!isAuthenticated) {
      const shouldLogin = confirm('Score saved locally. Log in to sync across devices?');
      if (shouldLogin) {
        loginWithRedirect({ screen_hint: 'login' }).catch(() => {});
      }
    }
  };

  if (isGenerating && !questions.length) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-loading">
            <div className="quiz-spinner" aria-hidden />
            <h2>Generating quiz</h2>
            <p>{loadingMessage}</p>
            <p style={{ marginTop: '1.2rem', fontSize: '0.95rem', color: '#cbd5f5' }}>
              This can take a few seconds depending on your notes. We’ll start automatically once the
              questions arrive.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div style={{ marginBottom: '1.2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.9rem' }}>{quizTitle}</h1>
          <p style={{ margin: '0.35rem 0', opacity: 0.85 }}>Mode: {quizDifficulty}</p>
          {usingSample && (
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#fcd34d' }}>
              No generated quiz detected — showing a sample set.
            </p>
          )}
        </div>

        {finished ? (
          <div className="quiz-complete">
            <h2>Quiz Complete 🎉</h2>
            <p className="score-text">Your Score: {score} / {totalQuestions}</p>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${scorePercentage}%` }}></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="next-btn" onClick={handleRetake}>
                Retake Quiz
              </button>
              <button className="next-btn" style={{ background: '#3b82f6' }} onClick={handleGoBack}>
                Stage more notes
              </button>
              <button className="next-btn" style={{ background: '#ec4899' }} onClick={handleSaveScore}>
                Save to leaderboard
              </button>
            </div>
            {leaderboardStatus && (
              <p
                style={{
                  marginTop: '1rem',
                  fontSize: '0.95rem',
                  color: leaderboardStatus.includes('Saved') ? '#4ade80' : '#facc15',
                }}
              >
                {leaderboardStatus}
              </p>
            )}
            {rankSummary && (
              <div style={{ marginTop: '1.1rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <div>Total games: {rankSummary.totalGames}</div>
                <div>Best score: {rankSummary.bestScore}</div>
                <div>Average accuracy: {rankSummary.averageScore}%</div>
                <button
                  className="next-btn"
                  style={{ background: '#6366f1', marginTop: '0.8rem' }}
                  onClick={() => navigate('/leaderboard')}
                >
                  View leaderboard
                </button>
              </div>
            )}
          </div>
        ) : (
          <div key={current}>
            <h2>
              Question {current + 1} / {totalQuestions}
            </h2>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <h3 className="quiz-question">{questions[current].question}</h3>
            <div className="quiz-options">
              {questions[current].options.map((opt, i) => (
                <button
                  key={i}
                  className={`quiz-option ${selected === i ? 'selected' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button className="next-btn" onClick={handleNext} disabled={selected === null}>
              {current + 1 === totalQuestions ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
