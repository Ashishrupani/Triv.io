import React, { useEffect } from 'react';
import '../styles/WelcomePage.css'; // Import the CSS file
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from 'react-router-dom';

function WelcomePage() {
    const {isAuthenticated, loginWithRedirect } = useAuth0();
  // Placeholder functions for Auth0 authentication
  const handleSignUp = () => {
    loginWithRedirect({ screen_hint: 'signup' });
    // In a real application, you'd use Auth0's loginWithRedirect or similar.
    // For now, let's just log a message.
    console.log("Sign Up clicked - initiate Auth0 signup!");
    // Example: auth0Client.loginWithRedirect({ screen_hint: 'signup' });
  };

  const handleLogin = () => {
    loginWithRedirect({ screen_hint: 'login' });
    // In a real application, you'd use Auth0's loginWithRedirect or similar.
    // For now, let's just log a message.
    console.log("Login clicked - initiate Auth0 login!");
    // Example: auth0Client.loginWithRedirect();
  };

  useEffect(() => {
    if (isAuthenticated) {
        <Navigate to="/home" replace />
    }
  }, []);

  return (
    isAuthenticated ? <Navigate to="/home" replace /> : <>
    <div className="welcome-page">
      <header className="header">
        <div className="logo-container">
          {/* Your logo image */}
          <img src="/Triv.io_logo.png" alt="Triv.io Logo" className="header-logo" />
        </div>
        <nav className="nav-links">
          <a href="#" className="nav-item">Our Story</a>
          <a href="#" className="nav-item">Frameworks Used</a>
          <a href="/leaderboard" className="nav-item">Leaderboard</a>
          <a href="/profile" className="nav-item">Profile</a>
        </nav>
      </header>

      <div className="main-content">
        <div className="logo-card">
          {/* Your logo image within the card */}
          <img src="/Triv.io_logo.png" alt="Triv.io Logo" className="card-logo" />
        </div>

        <p className="welcome-statement">
          Welcome to Triv.io! Get ready to transform your study notes into engaging quizzes and
          climb to the top of the leaderboard.
        </p>

        <div className="auth-buttons">
          <button className="sign-up-btn" onClick={handleSignUp}>SIGN UP</button>
          <button className="login-btn" onClick={handleLogin}>LOGIN</button>
        </div>

        <div className="quick-links">
          <a href="/leaderboard" className="link-pill">View Leaderboard</a>
          <a href="/profile" className="link-pill">View Profile</a>
        </div>

        <p className="auth-security">Secured by Auth0 <span role="img" aria-label="lock">🔒</span></p>
      </div>
    </div>
    </>
  );
}

export default WelcomePage;
