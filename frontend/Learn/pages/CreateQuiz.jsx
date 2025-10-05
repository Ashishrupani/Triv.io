import React from 'react';
import '../styles/CreateQuiz.css';

export default function CreateQuiz() {
  return (
    <div className="create-quiz-page">
      <header className="site-header">
        <div className="site-wrap">
          <a className="brand" href="/">
            Triv<span>.io</span>
          </a>

          <nav className="nav">
            <a href="/leaderboard">Leaderboards</a>
            <a href="/quiz">Practice quiz</a>
            <a href="/profile">Profile</a>
          </nav>
        </div>
      </header>

      <main className="blank-main">
        <section className="blank-card">
          <div className="blank-header">
            <h1>Notes → Quiz (coming soon)</h1>
            <p>
              Drop in your study notes—plain text, markdown, even lecture dumps. Our teammate is wiring the
              AI that turns them into fast feedback quizzes. This screen gives you a safe spot to stage content
              for the hackathon demo.
            </p>
          </div>

          <div className="blank-dropzone" aria-hidden>
            <div className="blank-illustration" />
            <div>
              <strong>Paste text or upload files</strong>
              <p>Support for .txt and .md will light up once the AI endpoint is ready.</p>
            </div>
            <div className="blank-actions">
              <button type="button" disabled>
                Paste notes
              </button>
              <label className="blank-upload" tabIndex={0}>
                <input type="file" disabled style={{ display: 'none' }} />
                Upload files
              </label>
            </div>
          </div>

          <ul className="blank-checklist">
            <li>
              <span className="bullet" />
              <div>
                <strong>Stage your content</strong>
                <p>Copy your class notes or meeting summaries so they are ready when generation is enabled.</p>
              </div>
            </li>
            <li>
              <span className="bullet" />
              <div>
                <strong>Pick a difficulty</strong>
                <p>The AI flow will let you choose review, challenge, or cram modes. Until then, decide what you want here.</p>
              </div>
            </li>
            <li>
              <span className="bullet" />
              <div>
                <strong>Preview & share</strong>
                <p>Once quizzes are generated, you’ll be able to send a link or launch a live challenge.</p>
              </div>
            </li>
          </ul>

          <div className="blank-footer">
            <span className="coming">AI integration underway</span>
            <p>
              Backend endpoint: <code>POST /api/generate-quiz</code>. Expecting payload <code>{`{ notes: [...] }`}</code>
              . Return structured questions and we’ll light up this screen.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
