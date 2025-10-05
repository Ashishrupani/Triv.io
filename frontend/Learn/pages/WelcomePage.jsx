import React from 'react';
import '../styles/WelcomePage.css';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const featureHighlights = [
  {
    title: 'Paste notes, get quizzes',
    body: 'Turn your lecture summaries or study sheets into rapid-fire practice in seconds.',
  },
  {
    title: 'Track your climb',
    body: 'Unlock badges, keep streaks alive, and see your ranking on the live leaderboard.',
  },
  {
    title: 'Study with friends',
    body: 'Share sets or challenge teammates once the AI-generated quizzes go live.',
  },
];

function WelcomePage() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="welcome-wrapper">
      <div className="welcome-backdrop" aria-hidden />

      <header className="welcome-header">
        <div className="welcome-header__inner">
          <a className="welcome-brand" href="/">
            triv<span>.io</span>
          </a>

          <nav className="welcome-nav">
            <a href="#story">Our Story</a>
            <a href="#tech">Frameworks</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/profile">Profile</a>
          </nav>
        </div>
      </header>

      <main className="welcome-main">
        <section className="welcome-hero">
          <div className="hero-copy">
            <span className="hero-pill">Hackathon preview</span>
            <h1>Turn your notes into instant practice.</h1>
            <p>
              Paste or upload study notes, then let Triv.io generate personalised quizzes the moment our AI
              pipeline lands. Vibe with streaks, leaderboards, and shareable challenges.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-button primary"
                onClick={() => loginWithRedirect({ screen_hint: 'signup' })}
              >
                Get started
              </button>
              <button
                type="button"
                className="hero-button ghost"
                onClick={() => loginWithRedirect({ screen_hint: 'login' })}
              >
                I have an account
              </button>
              <a className="hero-button link" href="/leaderboard">
                View leaderboard
              </a>
            </div>

            <div className="hero-secured">
              <span>Secured by Auth0</span>
              <span role="img" aria-label="lock">🔒</span>
            </div>
          </div>

          <aside className="hero-panel">
            <div className="hero-panel__header">
              <div className="avatar-placeholder">AI</div>
              <div>
                <strong>Quiz Builder</strong>
                <p>Powered by your notes</p>
              </div>
            </div>

            <ul className="hero-list">
              {featureHighlights.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>

            <div className="hero-panel__footer">
              <span className="status-dot" aria-hidden />
              <span>Backend AI integration in progress — stay tuned!</span>
            </div>
          </aside>
        </section>

        <section className="welcome-grid" id="story">
          <article className="welcome-card">
            <h2>Built for fast iteration</h2>
            <p>
              Triv.io started as a hackathon sprint: capture messy study notes, run them through an LLM, and
              serve ready-to-play quizzes in a click. We’re polishing the UX first so the AI handoff feels
              effortless when it ships.
            </p>
          </article>

          <article className="welcome-card" id="tech">
            <h2>Stack highlights</h2>
            <ul>
              <li>Vite + React for instant hot reloads</li>
              <li>Auth0 for secure, fast authentication</li>
              <li>Flask backend glued to Gemini for quiz generation</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

export default WelcomePage;
