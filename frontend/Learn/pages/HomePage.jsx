import React, { useState } from 'react';
import '../styles/HomePage.css';
import { Navigate } from 'react-router-dom';

function HomePage() {
  const [userXP, setUserXP] = useState(70);
  const maxXP = 100;

  return (
    <div className="homepage-wrapper">
      <div className="background-overlay"></div>

      {/* Navigation Bar */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="navbar-logo">triv.io</div>
            <nav className="navbar-nav">
              <a href="#quiz" className="nav-link active">Quiz</a>
              <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
              <a href="#profile" className="nav-link">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-card">
          <h1 className="welcome-heading">Welcome Back!</h1>

          {/* XP Progress Section */}
          <div className="xp-progress-section">
            <span className="xp-label">XP</span>
            <div className="xp-bar-container">
              <div
                className="xp-bar-fill"
                style={{ width: `${(userXP / maxXP) * 100}%` }}
              ></div>
            </div>
            <span className="xp-value">{userXP}/{maxXP}</span>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-grid">
            <button className="action-button">Create quiz</button>
            <button className="action-button">Study Quizzzes</button>
            <button className="action-button">Challenge friends</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;