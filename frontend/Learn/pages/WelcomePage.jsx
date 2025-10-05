import React from 'react';
import './App.css'; // Import the CSS file

function App() {
  // Placeholder functions for Auth0 authentication
  const handleSignUp = () => {
    // In a real application, you'd use Auth0's loginWithRedirect or similar.
    // For now, let's just log a message.
    console.log("Sign Up clicked - initiate Auth0 signup!");
    // Example: auth0Client.loginWithRedirect({ screen_hint: 'signup' });
  };

  const handleLogin = () => {
    // In a real application, you'd use Auth0's loginWithRedirect or similar.
    // For now, let's just log a message.
    console.log("Login clicked - initiate Auth0 login!");
    // Example: auth0Client.loginWithRedirect();
  };

  return (
    <div className="welcome-page">
      <header className="header">
        <div className="logo-container">
          {/* Your logo image */}
          <img src="/Triv.io_logo.png" alt="Triv.io Logo" className="header-logo" />
        </div>
        <nav className="nav-links">
          <a href="#" className="nav-item">Our Story</a>
          <a href="#" className="nav-item">Frameworks Used</a>
          <a href="#" className="nav-item">Welcome</a>
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

        <p className="auth-security">Secured by Auth0 <span role="img" aria-label="lock">🔒</span></p>
      </div>
    </div>
  );
}

export default App;