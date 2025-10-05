import React from 'react';
import '../styles/HomePage.css';

const HomePage = () => {
  // Placeholder data for a logged-in user
  const userName = "Sarah";
  const userXP = 70; // Current XP
  const xpNeededForNextLevel = 100; // XP needed for the next level
  const xpPercentage = (userXP / xpNeededForNextLevel) * 100;

  return (
    <div className="homepage-container">
      {/* Navigation Bar (as before) */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/trivio-logo.png" alt="Triv.io Logo" className="nav-logo" />
          <span className="app-name">Triv.io</span>
        </div>
        <div className="navbar-right">
          <a href="#" className="nav-link active">Quiz</a> {/* 'active' class for current page */}
          <a href="#" className="nav-link">Leaderboard</a>
          <div className="user-profile">
            <span className="user-icon">👤</span>
            <span className="username">{userName}</span>
          </div>
        </div>
      </nav>

      {/* Main content frame */}
      <div className="main-content-frame">
        <header className="welcome-section">
          <h2>Welcome Back!</h2>

          <div className="xp-display">
            <span className="xp-label">XP</span>
            <div className="xp-bar-container">
              <div className="xp-bar-fill" style={{ width: `${xpPercentage}%` }}></div>
            </div>
            <span className="xp-value">{userXP}/{xpNeededForNextLevel}</span>
          </div>
        </header>

        <section className="action-cards-section">
          <div className="action-card">
            <h3>Create Quiz</h3>
            <p>Upload your notes and let Gemini AI build a custom quiz.</p>
            {/* No button functionality yet */}
          </div>
          <div className="action-card">
            <h3>Study Quizzes</h3>
            <p>Review your past quizzes or explore new topics.</p>
            {/* No button functionality yet */}
          </div>
          <div className="action-card">
            <h3>Challenge Friends</h3>
            <p>Invite friends for a fun and competitive learning session.</p>
            {/* No button functionality yet */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;