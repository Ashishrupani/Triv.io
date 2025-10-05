import React from 'react';
import '..styles/LeaderboardPage.css';
 
function LeaderboardPage() {
  return (
    <div className="home-page-container">
      <header className="home-header">
        <div className="header-logo-text">triv.io</div>
        <nav className="home-nav-links">
          <a href="#" className="home-nav-item">Quiz</a>
          <a href="#" className="home-nav-item active">Leaderboard</a>
          <a href="#" className="home-nav-item">Profile</a>
        </nav>
      </header>
      <div className="home-main-content">
        <div className="home-card leaderboard-card">
          <h1 className="welcome-back-title">Overall Leaderboard</h1>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <div className="rank-column">Rank</div>
              <div className="player-column">Player</div>
              <div className="points-column">Points</div>
              <div className="points-column">Points</div>
            </div>
            <div className="leaderboard-row rank-1">
              <div className="rank-badge gold">1</div>
              <div className="player-name">QuizMasterSam</div>
              <div className="player-team">Trivale</div>
              <div className="player-points">$6.00</div>
              <div className="player-points">41.00</div>
            </div>
            <div className="leaderboard-row rank-2">
              <div className="rank-badge bronze">2</div>
              <div className="player-name">BrainiacBella</div>
              <div className="player-team">Trivale</div>
              <div className="player-points">$3.00</div>
              <div className="player-points">4,700</div>
            </div>
            <div className="leaderboard-row rank-3">
              <div className="rank-badge silver">3</div>
              <div className="player-name">StudyChamp</div>
              <div className="player-team">Trivale</div>
              <div className="player-points">$6.70</div>
              <div className="player-points">$6.00</div>
            </div>
            <div className="leaderboard-row">
              <div className="rank-number">1</div>
              <div className="player-name">KnowledgeSeeker</div>
              <div className="player-team">TrivaWhiz</div>
              <div className="player-points">$2.00</div>
              <div className="player-points">$,100</div>
            </div>
            <div className="leaderboard-row">
              <div className="rank-number">2</div>
              <div className="player-name">TriviaWhiz</div>
              <div className="player-team">TrivaWhiz</div>
              <div className="player-points">$6.00</div>
              <div className="player-points">225.50</div>
            </div>
            <div className="leaderboard-row">
              <div className="rank-number">3</div>
              <div className="player-name">TriviaWhiz</div>
              <div className="player-team">TrivaWhiz</div>
              <div className="player-points">$4.00</div>
              <div className="player-points">$5.70</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default LeaderboardPage;